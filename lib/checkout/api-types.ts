// Contrato da rota POST /api/checkout — compartilhado entre o client e o route handler.
// Client-safe (sem dependências de servidor).

import { PlanCode, AddonCode, BillingCycle } from "./catalog";

export type PaymentMethod = "PIX" | "CREDIT_CARD";

/** Dados do cartão como digitados no formulário (mascarados); o servidor normaliza. */
export interface CardInput {
  number: string;
  holderName: string;
  expiry: string; // "MM/AA"
  ccv: string;
  postalCode: string; // CEP
  addressNumber: string;
}

export interface CheckoutRequest {
  selection: {
    planCode: PlanCode;
    cycle: BillingCycle;
    addonCodes: AddonCode[];
    onboarding: boolean;
  };
  customer: {
    /** nome da empresa/organização → vira org_name no intent da Aura */
    companyName: string;
    /** nome do responsável → vira owner_name no intent da Aura */
    name: string;
    email: string;
    phone: string;
    /** CPF (11 dígitos) ou CNPJ (14) — validado no client e no servidor */
    cpfCnpj: string;
  };
  payment: {
    method: PaymentMethod;
    card?: CardInput;
  };
}

export interface PixData {
  encodedImage: string; // base64 (PNG do QR)
  payload: string; // copia-e-cola
  expirationDate: string;
}

export interface ChargeResult {
  /** espelha o kind do manifesto do intent da Aura */
  kind: "plan" | "addon" | "fee";
  /** código do item (na nomenclatura da Aura, ex.: ZEE_LU, ONBOARDING) */
  code: string;
  /** rótulo amigável para exibição */
  label: string;
  paymentId: string | null;
  /** presente em plano/addon (assinaturas); ausente em taxa avulsa */
  subscriptionId?: string | null;
  /** valor em reais (Asaas trabalha em reais, não centavos) */
  value: number;
  status: string;
  billingType: PaymentMethod;
  pix?: PixData | null;
}

export interface CheckoutResponse {
  /** intent que amarra todas as cobranças deste checkout */
  intentId: string;
  /** true = e-mail já tem conta na Aura; a org será adicionada à conta existente */
  ownerIsExistingUser: boolean;
  customerId: string;
  cycle: BillingCycle;
  method: PaymentMethod;
  charges: ChargeResult[];
}

export interface CheckoutErrorResponse {
  error: string;
}
