import { getGeminiClient, sendJson, type VercelRequest, type VercelResponse } from "./_lib/gemini.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method && req.method !== "GET") {
      sendJson(res, 405, { error: "Metod dəstəklənmir." });
      return;
    }

    const client = getGeminiClient();
    sendJson(res, 200, {
      ok: true,
      geminiConfigured: Boolean(client),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Naməlum xəta";
    sendJson(res, 500, { ok: false, error: message });
  }
}
