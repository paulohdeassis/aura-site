// Cliente HTTP de baixo nível do Asaas. SERVER-ONLY: só pode ser importado por
// route handlers / código de servidor — nunca por componentes client (vazaria a chave).
//
// Auth via header `access_token`. Base URL configurável por env para permitir
// apontar pra sandbox sem trocar código. A chave é escolhida automaticamente
// pela base: sandbox usa ASAAS_API_KEY_SANDBOX (aact_hmlg_); produção usa
// ASAAS_PARENT_ACCOUNT_API (aact_prod_). Assim, trocar de ambiente = trocar
// só a ASAAS_BASE_URL.
//
// A chave do Asaas começa com "$" ("$aact_..."), mas o dotenv do Next expande
// "$..." como referência de variável e zera o valor. Por isso as chaves ficam
// no .env SEM o "$" e nós o reconstruímos aqui. Idempotente: se a chave já vier
// com "$" (ex.: env var setada direto na Vercel), não duplica.

const BASE_URL = process.env.ASAAS_BASE_URL ?? "https://api.asaas.com/v3";
const IS_SANDBOX = BASE_URL.includes("sandbox");

const ensureKeyPrefix = (key?: string): string | undefined =>
  key && !key.startsWith("$") ? `$${key}` : key;

const API_KEY = ensureKeyPrefix(
  IS_SANDBOX
    ? process.env.ASAAS_API_KEY_SANDBOX ?? process.env.ASAAS_PARENT_ACCOUNT_API
    : process.env.ASAAS_PARENT_ACCOUNT_API
);

export class AsaasError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "AsaasError";
    this.status = status;
    this.details = details;
  }
}

interface RequestInitLite {
  method?: string;
  body?: unknown;
}

export async function asaasFetch<T>(
  path: string,
  init: RequestInitLite = {}
): Promise<T> {
  if (!API_KEY) {
    throw new AsaasError(
      500,
      IS_SANDBOX
        ? "ASAAS_API_KEY_SANDBOX não configurada."
        : "ASAAS_PARENT_ACCOUNT_API não configurada."
    );
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      access_token: API_KEY,
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // Asaas retorna { errors: [{ code, description }] } em falhas de validação.
    const description =
      data?.errors?.[0]?.description ?? `Falha na requisição ao Asaas (${res.status}).`;
    throw new AsaasError(res.status, description, data);
  }

  return data as T;
}
