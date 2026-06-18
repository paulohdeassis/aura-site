// Funções de alto nível da API pública de billing da Aura. SERVER-ONLY.
// Contrato: docs/aura-billing-signup-integration.md
//
// Fluxo: GET /catalog (preços/metadados) → POST /intent (intent_id + manifest)
// → o site cobra no Asaas amarrando cada cobrança pelo externalReference com o
// intent_id. A Aura provisiona a org via webhook do Asaas.

import { auraFetch } from "./client";

const PREFIX = "/api/v1/public/billing";

// Na API da Aura o ciclo é em MAIÚSCULAS (o catálogo local usa "monthly"/"annual").
export type AuraCycle = "MONTHLY" | "YEARLY";

// ─── GET /catalog ───────────────────────────────────────────────────

export interface CatalogPlan {
  code: string;
  name: string;
  max_units: number;
  monthly_cents: number;
  yearly_cents: number;
}

export interface CatalogAddon {
  code: string;
  name: string;
  /** UNIT_QUOTA: preço por unidade (quantity = nº de unidades, múltiplo de 10).
   *  INTEGRATION: quantity = 1. */
  kind: "UNIT_QUOTA" | "INTEGRATION";
  /** planos elegíveis; null = vale para todos */
  available_plan_codes: string[] | null;
  monthly_cents: number;
  yearly_cents: number;
}

export interface CatalogFee {
  code: string;
  name: string;
  amount_cents: number;
}

export interface BillingCatalog {
  plans: CatalogPlan[];
  addons: CatalogAddon[];
  fees: CatalogFee[];
}

// A API da Aura envelopa as respostas em { data: ... }; desembrulhamos aqui
// (e toleramos o formato cru, caso algum endpoint não use o envelope).
function unwrap<T>(res: { data?: T } & Partial<T>): T {
  return (res.data ?? res) as T;
}

/** Preços + metadados para montar a tela. Nunca hardcode preço a partir daqui. */
export async function getCatalog(): Promise<BillingCatalog> {
  return unwrap(
    await auraFetch<{ data?: BillingCatalog } & Partial<BillingCatalog>>(
      `${PREFIX}/catalog`
    )
  );
}

// ─── POST /intent ───────────────────────────────────────────────────

export interface IntentRequest {
  org_name: string;
  owner_name: string;
  owner_email: string;
  plan_code: string;
  cycle: AuraCycle;
  /** UNIT_QUOTA: quantity = nº de unidades (múltiplo de 10). INTEGRATION: 1. */
  addons: { code: string; quantity: number }[];
  include_onboarding: boolean;
}

export interface ManifestItem {
  kind: "plan" | "addon" | "fee";
  code: string;
  cycle?: AuraCycle;
  quantity?: number;
  /** fonte da verdade do valor de cada cobrança — o webhook recusa divergência */
  amount_cents: number;
}

export interface IntentResponse {
  intent_id: string;
  /** true = o e-mail já tem conta na Aura; a org será adicionada à conta existente */
  owner_is_existing_user: boolean;
  expected_total_cents: number;
  manifest: ManifestItem[];
}

/** Registra o pedido na Aura (sem cartão) e devolve o intent_id que amarra as cobranças. */
export async function createIntent(input: IntentRequest): Promise<IntentResponse> {
  return unwrap(
    await auraFetch<{ data?: IntentResponse } & Partial<IntentResponse>>(
      `${PREFIX}/intent`,
      { method: "POST", body: input }
    )
  );
}

/** externalReference exato exigido pelo webhook: aura-billing;kind=...;code=...;intent=... */
export function buildExternalReference(
  kind: ManifestItem["kind"],
  code: string,
  intentId: string
): string {
  return `aura-billing;kind=${kind};code=${code};intent=${intentId}`;
}
