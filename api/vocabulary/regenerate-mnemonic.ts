import {
  generateContentWithRetry,
  getGeminiClient,
  handleGeminiError,
  parseJsonBody,
  sendJson,
  ThinkingLevel,
  Type,
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
    const word = typeof body.word === "string" ? body.word.trim() : "";
    const meaningAz = typeof body.meaningAz === "string" ? body.meaningAz.trim() : "";
    const previousBridge = typeof body.previousBridge === "string" ? body.previousBridge.trim() : "";

    if (!word || !meaningAz) {
      sendJson(res, 400, { error: "Söz və məna tələb olunur." });
      return;
    }

    const prompt = `Create a BRAND NEW, different, and even more memorable Azerbaijani mnemonic association for the English word "${word}" (Azerbaijani meaning: "${meaningAz}").
Previous association was: "${previousBridge}". Make this new one completely fresh and creative!
Return JSON with: mnemonicBridgeAz, mnemonicHookPhrase, mnemonicStoryAz (1 strange vivid sentence), visualSceneTitle, visualSceneAz.`;

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
      sendJson(res, 502, { error: "Yeni assosiasiya yaradıla bilmədi." });
      return;
    }

    sendJson(res, 200, { mnemonic: parsed });
  } catch (err) {
    handleGeminiError(res, err);
  }
}
