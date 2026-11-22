import { getGeminiClient, sendJson, type VercelRequest, type VercelResponse } from "./_lib/gemini";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method && req.method !== "GET") {
    sendJson(res, 405, { error: "Metod dəstəklənmir." });
    return;
  }

  const client = getGeminiClient();
  sendJson(res, 200, {
    ok: true,
    geminiConfigured: Boolean(client),
  });
}
