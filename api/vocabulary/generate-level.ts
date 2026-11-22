import {
  ALLOWED_LEVELS,
  generateContentWithRetry,
  getGeminiClient,
  handleGeminiError,
  parseJsonBody,
  sanitizeCard,
  sendJson,
  ThinkingLevel,
  Type,
  vocabCardSchema,
  type GeneratedVocabPayload,
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
    const level = typeof body.level === "string" ? body.level.trim().toUpperCase() : "";
    if (!ALLOWED_LEVELS.has(level)) {
      sendJson(res, 400, { error: "Düzgün CEFR səviyyəsi seçin (A1–C2)." });
      return;
    }

    const excludeWordsRaw = Array.isArray(body.excludeWords) ? body.excludeWords : [];
    const excludeSet = new Set<string>(
      excludeWordsRaw
        .filter((w: unknown): w is string => typeof w === "string")
        .map((w: string) => w.trim().toLowerCase())
        .slice(0, 200),
    );
    const count = Math.min(5, Math.max(1, Number(body.count) || 4));
    const excludeList = Array.from(excludeSet).slice(0, 60).join(", ");

    const prompt = `Generate ${count} distinct, high-utility English vocabulary cards strictly appropriate for CEFR level ${level} for Azerbaijani learners.
Do NOT include any of these already-existing words: [${excludeList || "none"}].

For each word:
- Provide accurate IPA, Azerbaijani part of speech, Azerbaijani meaning & explanation.
- Create a clever, unusual Azerbaijani phonetic sound-alike mnemonic bridge and a vivid one-sentence memorable story.
- Provide 2 English example sentences with Azerbaijani translations and 3 common collocations with Azerbaijani explanations.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert Azerbaijani-English linguist and memory coach for Güolingo. Return a JSON array of vocabulary cards matching the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: vocabCardSchema,
        },
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const text = (response.text ?? "[]").trim();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      sendJson(res, 502, { error: "AI cavabı siyahı formatında deyil." });
      return;
    }

    const cards: GeneratedVocabPayload[] = [];
    const seen = new Set(excludeSet);

    for (const item of parsed) {
      const sanitized = sanitizeCard(item, level);
      if (sanitized && !seen.has(sanitized.word.toLowerCase())) {
        seen.add(sanitized.word.toLowerCase());
        cards.push({ ...sanitized, level });
      }
    }

    sendJson(res, 200, { cards });
  } catch (err) {
    handleGeminiError(res, err);
  }
}
