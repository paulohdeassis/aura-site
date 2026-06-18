// Cliente HTTP da API pública de billing da Aura. SERVER-ONLY: só pode ser
// importado por route handlers / código de servidor.
//
// Os endpoints de billing (catalog + intent) são PÚBLICOS — não levam auth de
// aplicação. Porém o deploy de sandbox na Vercel tem Deployment Protection
// ligada; por isso enviamos o secret de bypass no header x-vercel-protection-bypass
// quando AURA_VERCEL_BYPASS_SECRET está configurado. Em produção, essa env some
// e o header simplesmente não é enviado.

const BASE_URL = process.env.AURA_API_BASE_URL;
const VERCEL_BYPASS = process.env.AURA_VERCEL_BYPASS_SECRET;

export class AuraError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "AuraError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestInitLite {
  method?: string;
  body?: unknown;
}

export async function auraFetch<T>(
  path: string,
  init: RequestInitLite = {}
): Promise<T> {
  if (!BASE_URL) {
    throw new AuraError(500, "AURA_API_BASE_URL não configurada.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (VERCEL_BYPASS) {
    headers["x-vercel-protection-bypass"] = VERCEL_BYPASS;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // A Aura usa o envelope padrão { error: { code, message } }.
    const message =
      data?.error?.message ?? `Falha na requisição à Aura (${res.status}).`;
    throw new AuraError(res.status, message, data?.error?.code, data);
  }

  return data as T;
}
