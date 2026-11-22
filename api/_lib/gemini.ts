import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import type { IncomingMessage, ServerResponse } from "http";

export const ALLOWED_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

export interface VercelRequest extends IncomingMessage {
  body?: unknown;
  query?: Record<string, string | string[]>;
}

export interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => void;
}

export interface ExampleSentence {
  en: string;
  az: string;
}

export interface Collocation {
  phrase: string;
  az: string;
}

export interface GeneratedVocabPayload {
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

export function getGeminiClient(): GoogleGenAI | null {
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

export async function parseJsonBody(req: VercelRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === "string") {
    try {
      const parsed = JSON.parse(req.body);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      const parsed = JSON.parse(req.body.toString("utf-8"));
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (req.readableEnded) {
    return {};
  }
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const raw = Buffer.concat(chunks).toString("utf-8").trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function sendJson(res: VercelResponse, statusCode: number, payload: unknown): void {
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(statusCode).json(payload);
    return;
  }
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export const vocabCardSchema = {
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

export function sanitizeCard(raw: unknown, fallbackLevel = "B1"): GeneratedVocabPayload | null {
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
  return status === 503 || message.includes("UNAVAILABLE") || message.includes('"code":503');
}

export async function generateContentWithRetry(
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

export function handleGeminiError(res: VercelResponse, err: unknown): void {
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
    sendJson(res, 400, {
      error:
        "Gemini API açarı etibarsızdır. Zəhmət olmasa Vercel Environment Variables (və ya Settings > Secrets) bölməsində GEMINI_API_KEY dəyərini yoxlayın.",
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
    sendJson(res, 403, {
      error:
        "Gemini API açarı etibarsızdır və ya icazəsi yoxdur. Zəhmət olmasa Vercel Environment Variables (və ya Settings > Secrets) bölməsini yoxlayın.",
      code: "API_KEY_INVALID",
    });
    return;
  }

  if (status === 404 || message.includes("NOT_FOUND")) {
    sendJson(res, 502, {
      error: "Seçilmiş AI modeli mövcud deyil və ya dəstəklənmir.",
      code: "MODEL_NOT_FOUND",
    });
    return;
  }

  if (status === 429 || message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
    sendJson(res, 429, {
      error: "AI sorğu limiti müvəqqəti dolub. Zəhmət olmasa bir neçə saniyə sonra yenidən cəhd edin.",
      code: "RATE_LIMITED",
    });
    return;
  }

  if (isTransientGeminiError(err)) {
    sendJson(res, 503, {
      error: "AI xidmətində hazırda yüksək sıxlıq var. Zəhmət olmasa bir neçə saniyə sonra yenidən cəhd edin.",
      code: "GEMINI_UNAVAILABLE",
    });
    return;
  }

  sendJson(res, 502, {
    error: "Süni intellekt xidməti ilə əlaqə zamanı xəta baş verdi. Yenidən cəhd edin.",
    code: "GEMINI_UPSTREAM_ERROR",
  });
}

export { ThinkingLevel, Type };
