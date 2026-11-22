export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: string;
  status: number;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

async function parseResponse<T>(
  response: Response,
  fallbackError: string,
): Promise<ApiResult<T>> {
  const rawText = await response.text();
  let parsed: Record<string, unknown> | null = null;

  if (rawText.trim()) {
    try {
      const json = JSON.parse(rawText);
      if (json && typeof json === "object") {
        parsed = json as Record<string, unknown>;
      }
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    if (parsed && typeof parsed.error === "string" && parsed.error.trim()) {
      return { ok: false, error: parsed.error.trim(), status: response.status };
    }

    if (response.status === 404) {
      return {
        ok: false,
        status: 404,
        error:
          "API marşrutu tapılmadı (404). Layihənin son versiyasının Vercel-ə deploy edildiyindən əmin olun.",
      };
    }

    if (response.status === 504) {
      return {
        ok: false,
        status: 504,
        error:
          "AI sorğusu vaxt limitini aşdı (504). Zəhmət olmasa bir neçə saniyə sonra yenidən cəhd edin.",
      };
    }

    if (response.status === 502 || response.status === 503) {
      return {
        ok: false,
        status: response.status,
        error: `Server və ya AI xidməti müvəqqəti əlçatan deyil (${response.status}). GEMINI_API_KEY təyin edildiyini yoxlayın.`,
      };
    }

    return {
      ok: false,
      status: response.status,
      error: `${fallbackError} (HTTP ${response.status})`,
    };
  }

  if (!parsed) {
    return {
      ok: false,
      status: response.status,
      error:
        "Server JSON əvəzinə fərqli cavab qaytardı. API funksiyalarının (/api/*) aktiv olduğunu yoxlayın.",
    };
  }

  return { ok: true, data: parsed as T };
}

export async function getJson<T>(url: string, fallbackError: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return await parseResponse<T>(response, fallbackError);
  } catch {
    return {
      ok: false,
      status: 0,
      error: "İnternet və ya server bağlantısı qurula bilmədi. Yenidən cəhd edin.",
    };
  }
}

export async function postJson<T>(
  url: string,
  payload: unknown,
  fallbackError: string,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    return await parseResponse<T>(response, fallbackError);
  } catch {
    return {
      ok: false,
      status: 0,
      error: "Serverlə şəbəkə bağlantısı qurula bilmədi. İnterneti yoxlayıb yenidən cəhd edin.",
    };
  }
}
