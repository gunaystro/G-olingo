import {
  ALLOWED_LEVELS,
  generateContentWithRetry,
  getGeminiClient,
  handleGeminiError,
  parseJsonBody,
  sanitizeCard,
  sendJson,
  ThinkingLevel,
  vocabCardSchema,
  type VercelRequest,
  type VercelResponse,
} from "../_lib/gemini.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Yalnız POST sorğusu qəbul edilir." });
      return;
    }

    const client = getGeminiClient();
    if (!client) {
      sendJson(res, 503, {
        error:
          "GEMINI_API_KEY təyin edilməyib. Vercel layihənizin Settings > Environments > Production bölməsindən GEMINI_API_KEY əlavə edib Redeploy edin.",
        code: "API_KEY_MISSING",
      });
      return;
    }

    const body = await parseJsonBody(req);
    const rawWord = typeof body.word === "string" ? body.word.trim() : "";
    const requestedLevel = typeof body.level === "string" ? body.level.trim().toUpperCase() : "";
    const strategy = body.strategy === "visual" ? "visual" : "sound";

    if (!rawWord || rawWord.length > 60 || !/^[a-zA-Z\s'-]+$/.test(rawWord)) {
      sendJson(res, 400, {
        error: "Zəhmət olmasa yalnız ingilis hərflərindən ibarət düzgün söz daxil edin.",
        code: "INVALID_WORD",
      });
      return;
    }

    const levelInstruction = ALLOWED_LEVELS.has(requestedLevel)
      ? `Target CEFR level hint: ${requestedLevel} (verify actual CEFR level and keep ${requestedLevel} if appropriate).`
      : "Determine the accurate CEFR level (A1, A2, B1, B2, C1, or C2) for this word.";

    const strategyNote =
      strategy === "visual"
        ? "Focus strongly on an unusual, surreal visual metaphor paired with an Azerbaijani sound-alike hook."
        : "Focus strongly on phonetic similarity between the English word's pronunciation and a familiar Azerbaijani word or expression.";

    const prompt = `Create a complete English-to-Azerbaijani mnemonic vocabulary learning card for the English word: "${rawWord}".
${levelInstruction}
${strategyNote}

Requirements:
- All explanations, meanings, mnemonic bridges, stories, and visual scene descriptions MUST be in natural, idiomatic Azerbaijani.
- English is only for the target word, IPA, English example sentences, and English collocations.
- For the mnemonic: connect the English word's pronunciation to a familiar Azerbaijani word/expression (example style: "Borrow" sounds like "borc" -> someone writing BORC on a giant notebook; "Reluctant" sounds like "rul qatdan" -> driver folding the steering wheel).
- Keep the mnemonic story to ONE unusual, vivid, funny, memorable sentence in Azerbaijani.
- Provide 2 simple, practical English example sentences with accurate Azerbaijani translations.
- Provide 3 useful English collocations with Azerbaijani explanations.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert Azerbaijani-English linguist and memory coach for Güolingo. Always respond with valid JSON matching the requested schema.",
        responseMimeType: "application/json",
        responseSchema: vocabCardSchema,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const text = (response.text ?? "").trim();
    if (!text) {
      sendJson(res, 502, { error: "AI boş cavab qaytardı. Yenidən cəhd edin." });
      return;
    }

    const parsed = JSON.parse(text);
    const card = sanitizeCard(parsed, ALLOWED_LEVELS.has(requestedLevel) ? requestedLevel : "B1");
    if (!card) {
      sendJson(res, 502, { error: "AI cavabı gözlənilən formatda deyil. Yenidən cəhd edin." });
      return;
    }

    sendJson(res, 200, { card });
  } catch (err) {
    handleGeminiError(res, err);
  }
}
