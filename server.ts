import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
const PORT = Number(process.env.PORT) || 3000;

interface ExampleSentence {
  en: string;
  az: string;
}

interface Collocation {
  phrase: string;
  az: string;
}

interface GeneratedVocabPayload {
  word: string;
  ipa: string;
  partOfSpeech: string;
  level: string;
  meaningAz: string;
  explanationAz: string;
  mnemonicBridgeAz: string;
  mnemonicHookPhrase: string;
  mnemonicStoryAz: string;
  visualSceneTitle: string;
  visualSceneAz: string;
  visualTheme: string;
  retentionScore: number;
  examples: ExampleSentence[];
  collocations: Collocation[];
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const vocabCardSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The English target word in standard capitalization." },
    ipa: { type: Type.STRING, description: "IPA phonetic transcription enclosed in slashes, e.g. /ˈbɒrəʊ/." },
    partOfSpeech: {
      type: Type.STRING,
      description: "Part of speech in Azerbaijani, e.g. 'Sifət', 'Fel', 'İsim', 'Zərf'.",
    },
    level: { type: Type.STRING, description: "CEFR level: A1, A2, B1, B2, C1, or C2." },
    meaningAz: {
      type: Type.STRING,
      description: "Concise primary Azerbaijani meanings separated by commas.",
    },
    explanationAz: {
      type: Type.STRING,
      description: "Clear short Azerbaijani explanation of how and when the word is used.",
    },
    mnemonicBridgeAz: {
      type: Type.STRING,
      description:
        "Phonetic bridge in Azerbaijani explaining how the English pronunciation sounds like a familiar Azerbaijani word or expression.",
    },
    mnemonicHookPhrase: {
      type: Type.STRING,
      description: "The short Azerbaijani sound-alike keyword or phrase, e.g. 'Borc' or 'Rul qatdan'.",
    },
    mnemonicStoryAz: {
      type: Type.STRING,
      description:
        "A short, unusual, vivid, memorable one-sentence story in Azerbaijani linking the sound-alike hook to the meaning.",
    },
    visualSceneTitle: {
      type: Type.STRING,
      description: "Short 2-4 word Azerbaijani title for the mnemonic visual scene.",
    },
    visualSceneAz: {
      type: Type.STRING,
      description: "One vivid sentence in Azerbaijani describing the visual mental image of the mnemonic.",
    },
    visualTheme: {
      type: Type.STRING,
      description:
        "One icon category key from: notebook, steering, bird, statue, candle, spring, book, compass, key, clock, bridge, lightning.",
    },
    retentionScore: {
      type: Type.INTEGER,
      description: "Estimated mnemonic memorability score from 88 to 99.",
    },
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          en: { type: Type.STRING, description: "Simple natural English sentence using the target word." },
          az: { type: Type.STRING, description: "Natural Azerbaijani translation of the English sentence." },
        },
        required: ["en", "az"],
      },
    },
    collocations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phrase: { type: Type.STRING, description: "Common English collocation or phrase." },
          az: { type: Type.STRING, description: "Azerbaijani meaning of the collocation." },
        },
        required: ["phrase", "az"],
      },
    },
  },
  required: [
    "word",
    "ipa",
    "partOfSpeech",
    "level",
    "meaningAz",
    "explanationAz",
    "mnemonicBridgeAz",
    "mnemonicHookPhrase",
    "mnemonicStoryAz",
    "visualSceneTitle",
    "visualSceneAz",
    "visualTheme",
    "retentionScore",
    "examples",
    "collocations",
  ],
};

function sanitizeCard(raw: unknown, fallbackLevel = "B1"): GeneratedVocabPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const word = typeof obj.word === "string" ? obj.word.trim() : "";
  const meaningAz = typeof obj.meaningAz === "string" ? obj.meaningAz.trim() : "";
  const mnemonicStoryAz = typeof obj.mnemonicStoryAz === "string" ? obj.mnemonicStoryAz.trim() : "";
  const mnemonicBridgeAz = typeof obj.mnemonicBridgeAz === "string" ? obj.mnemonicBridgeAz.trim() : "";

  if (!word || !meaningAz || !mnemonicStoryAz || !mnemonicBridgeAz) {
    return null;
  }

  const rawLevel = typeof obj.level === "string" ? obj.level.trim().toUpperCase() : fallbackLevel;
  const level = ALLOWED_LEVELS.has(rawLevel) ? rawLevel : fallbackLevel;

  const examples = Array.isArray(obj.examples)
    ? obj.examples
        .filter(
          (ex): ex is ExampleSentence =>
            Boolean(ex) &&
            typeof ex === "object" &&
            typeof (ex as ExampleSentence).en === "string" &&
            typeof (ex as ExampleSentence).az === "string" &&
            (ex as ExampleSentence).en.trim().length > 0 &&
            (ex as ExampleSentence).az.trim().length > 0,
        )
        .slice(0, 3)
    : [];

  const collocations = Array.isArray(obj.collocations)
    ? obj.collocations
        .filter(
          (col): col is Collocation =>
            Boolean(col) &&
            typeof col === "object" &&
            typeof (col as Collocation).phrase === "string" &&
            typeof (col as Collocation).az === "string" &&
            (col as Collocation).phrase.trim().length > 0 &&
            (col as Collocation).az.trim().length > 0,
        )
        .slice(0, 4)
    : [];

  const allowedThemes = new Set([
    "notebook",
    "steering",
    "bird",
    "statue",
    "candle",
    "spring",
    "book",
    "compass",
    "key",
    "clock",
    "bridge",
    "lightning",
  ]);
  const rawTheme = typeof obj.visualTheme === "string" ? obj.visualTheme.trim().toLowerCase() : "book";
  const visualTheme = allowedThemes.has(rawTheme) ? rawTheme : "book";

  const rawScore = typeof obj.retentionScore === "number" ? Math.round(obj.retentionScore) : 94;
  const retentionScore = Math.min(99, Math.max(85, rawScore));

  return {
    word: word.charAt(0).toUpperCase() + word.slice(1),
    ipa: typeof obj.ipa === "string" && obj.ipa.trim() ? obj.ipa.trim() : `/${word.toLowerCase()}/`,
    partOfSpeech: typeof obj.partOfSpeech === "string" && obj.partOfSpeech.trim() ? obj.partOfSpeech.trim() : "Söz",
    level,
    meaningAz,
    explanationAz:
      typeof obj.explanationAz === "string" && obj.explanationAz.trim()
        ? obj.explanationAz.trim()
        : meaningAz,
    mnemonicBridgeAz,
    mnemonicHookPhrase:
      typeof obj.mnemonicHookPhrase === "string" && obj.mnemonicHookPhrase.trim()
        ? obj.mnemonicHookPhrase.trim()
        : word,
    mnemonicStoryAz,
    visualSceneTitle:
      typeof obj.visualSceneTitle === "string" && obj.visualSceneTitle.trim()
        ? obj.visualSceneTitle.trim()
        : "Vizual Mental Səhnə",
    visualSceneAz:
      typeof obj.visualSceneAz === "string" && obj.visualSceneAz.trim()
        ? obj.visualSceneAz.trim()
        : mnemonicStoryAz,
    visualTheme,
    retentionScore,
    examples:
      examples.length > 0
        ? examples
        : [{ en: `We learned the word "${word}" today.`, az: `Bu gün "${word}" sözünü öyrəndik.` }],
    collocations:
      collocations.length > 0 ? collocations : [{ phrase: `use ${word.toLowerCase()}`, az: `${meaningAz} işlətmək` }],
  };
}

function isTransientGeminiError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : "";
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? Number((err as { status?: unknown }).status)
      : undefined;
  return status === 503 || message.includes("UNAVAILABLE") || message.includes("\"code\":503");
}

async function generateContentWithRetry(
  client: GoogleGenAI,
  params: Parameters<GoogleGenAI["models"]["generateContent"]>[0],
  maxAttempts = 3,
) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await client.models.generateContent(params);
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts && isTransientGeminiError(err)) {
        const delayMs = 700 * attempt;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function handleGeminiError(res: Response, err: unknown): void {
  const message = err instanceof Error ? err.message : "Naməlum server xətası";
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? Number((err as { status?: unknown }).status)
      : undefined;
  console.error("[Gemini API Error]", status, message);

  if (
    status === 400 &&
    (message.includes("API_KEY_INVALID") || message.includes("API key not valid"))
  ) {
    res.status(400).json({
      error:
        "Gemini API açarı etibarsızdır. Zəhmət olmasa Settings > Secrets bölməsindən GEMINI_API_KEY dəyərini yoxlayın.",
      code: "API_KEY_INVALID",
    });
    return;
  }

  if (
    status === 403 ||
    message.includes("API_KEY_INVALID") ||
    message.includes("PERMISSION_DENIED") ||
    message.includes("403")
  ) {
    res.status(403).json({
      error:
        "Gemini API açarı etibarsızdır və ya icazəsi yoxdur. Zəhmət olmasa Settings > Secrets bölməsini yoxlayın.",
      code: "API_KEY_INVALID",
    });
    return;
  }

  if (status === 404 || message.includes("NOT_FOUND")) {
    res.status(502).json({
      error: "Seçilmiş AI modeli mövcud deyil və ya dəstəklənmir.",
      code: "MODEL_NOT_FOUND",
    });
    return;
  }

  if (status === 429 || message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
    res.status(429).json({
      error: "AI sorğu limiti müvəqqəti dolub. Zəhmət olmasa bir neçə saniyə sonra yenidən cəhd edin.",
      code: "RATE_LIMITED",
    });
    return;
  }

  if (isTransientGeminiError(err)) {
    res.status(503).json({
      error: "AI xidmətində hazırda yüksək sıxlıq var. Zəhmət olmasa bir neçə saniyə sonra yenidən cəhd edin.",
      code: "GEMINI_UNAVAILABLE",
    });
    return;
  }

  res.status(502).json({
    error: "Süni intellekt xidməti ilə əlaqə zamanı xəta baş verdi. Yenidən cəhd edin.",
    code: "GEMINI_UPSTREAM_ERROR",
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    const client = getGeminiClient();
    res.json({
      ok: true,
      geminiConfigured: Boolean(client),
    });
  });

  app.post("/api/vocabulary/generate-card", async (req: Request, res: Response) => {
    const client = getGeminiClient();
    if (!client) {
      res.status(503).json({
        error:
          "GEMINI_API_KEY təyin edilməyib. AI ilə söz yaratmaq üçün Settings > Secrets bölməsindən GEMINI_API_KEY əlavə edin.",
        code: "API_KEY_MISSING",
      });
      return;
    }

    const rawWord = typeof req.body?.word === "string" ? req.body.word.trim() : "";
    const requestedLevel = typeof req.body?.level === "string" ? req.body.level.trim().toUpperCase() : "";
    const strategy = req.body?.strategy === "visual" ? "visual" : "sound";

    if (!rawWord || rawWord.length > 60 || !/^[a-zA-Z\s'-]+$/.test(rawWord)) {
      res.status(400).json({
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

    try {
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
        res.status(502).json({ error: "AI boş cavab qaytardı. Yenidən cəhd edin." });
        return;
      }

      const parsed = JSON.parse(text);
      const card = sanitizeCard(parsed, ALLOWED_LEVELS.has(requestedLevel) ? requestedLevel : "B1");
      if (!card) {
        res.status(502).json({ error: "AI cavabı gözlənilən formatda deyil. Yenidən cəhd edin." });
        return;
      }

      res.json({ card });
    } catch (err) {
      handleGeminiError(res, err);
    }
  });

  app.post("/api/vocabulary/generate-level", async (req: Request, res: Response) => {
    const client = getGeminiClient();
    if (!client) {
      res.status(503).json({
        error:
          "GEMINI_API_KEY təyin edilməyib. Səviyyə üzrə yeni AI sözləri yaratmaq üçün Settings > Secrets bölməsindən GEMINI_API_KEY əlavə edin.",
        code: "API_KEY_MISSING",
      });
      return;
    }

    const level = typeof req.body?.level === "string" ? req.body.level.trim().toUpperCase() : "";
    if (!ALLOWED_LEVELS.has(level)) {
      res.status(400).json({ error: "Düzgün CEFR səviyyəsi seçin (A1–C2)." });
      return;
    }

    const excludeWordsRaw = Array.isArray(req.body?.excludeWords) ? req.body.excludeWords : [];
    const excludeSet = new Set<string>(
      excludeWordsRaw
        .filter((w: unknown): w is string => typeof w === "string")
        .map((w: string) => w.trim().toLowerCase())
        .slice(0, 200),
    );
    const count = Math.min(5, Math.max(1, Number(req.body?.count) || 4));

    const excludeList = Array.from(excludeSet).slice(0, 60).join(", ");
    const prompt = `Generate ${count} distinct, high-utility English vocabulary cards strictly appropriate for CEFR level ${level} for Azerbaijani learners.
Do NOT include any of these already-existing words: [${excludeList || "none"}].

For each word:
- Provide accurate IPA, Azerbaijani part of speech, Azerbaijani meaning & explanation.
- Create a clever, unusual Azerbaijani phonetic sound-alike mnemonic bridge and a vivid one-sentence memorable story.
- Provide 2 English example sentences with Azerbaijani translations and 3 common collocations with Azerbaijani explanations.`;

    try {
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
        res.status(502).json({ error: "AI cavabı siyahı formatında deyil." });
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

      res.json({ cards });
    } catch (err) {
      handleGeminiError(res, err);
    }
  });

  app.post("/api/vocabulary/regenerate-mnemonic", async (req: Request, res: Response) => {
    const client = getGeminiClient();
    if (!client) {
      res.status(503).json({
        error:
          "GEMINI_API_KEY təyin edilməyib. Yeni assosiasiya yaratmaq üçün Settings > Secrets bölməsindən GEMINI_API_KEY əlavə edin.",
        code: "API_KEY_MISSING",
      });
      return;
    }

    const word = typeof req.body?.word === "string" ? req.body.word.trim() : "";
    const meaningAz = typeof req.body?.meaningAz === "string" ? req.body.meaningAz.trim() : "";
    const previousBridge = typeof req.body?.previousBridge === "string" ? req.body.previousBridge.trim() : "";

    if (!word || !meaningAz) {
      res.status(400).json({ error: "Söz və məna tələb olunur." });
      return;
    }

    const prompt = `Create a BRAND NEW, different, and even more memorable Azerbaijani mnemonic association for the English word "${word}" (Azerbaijani meaning: "${meaningAz}").
Previous association was: "${previousBridge}". Make this new one completely fresh and creative!
Return JSON with: mnemonicBridgeAz, mnemonicHookPhrase, mnemonicStoryAz (1 strange vivid sentence), visualSceneTitle, visualSceneAz.`;

    try {
      const response = await generateContentWithRetry(client, {
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a creative Azerbaijani mnemonic memory coach. Respond only with valid JSON matching the schema.",
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mnemonicBridgeAz: { type: Type.STRING },
              mnemonicHookPhrase: { type: Type.STRING },
              mnemonicStoryAz: { type: Type.STRING },
              visualSceneTitle: { type: Type.STRING },
              visualSceneAz: { type: Type.STRING },
            },
            required: [
              "mnemonicBridgeAz",
              "mnemonicHookPhrase",
              "mnemonicStoryAz",
              "visualSceneTitle",
              "visualSceneAz",
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      if (
        typeof parsed?.mnemonicBridgeAz !== "string" ||
        typeof parsed?.mnemonicStoryAz !== "string"
      ) {
        res.status(502).json({ error: "Yeni assosiasiya yaradıla bilmədi." });
        return;
      }

      res.json({ mnemonic: parsed });
    } catch (err) {
      handleGeminiError(res, err);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Güolingo server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
