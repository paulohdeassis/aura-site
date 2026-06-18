// Funções de alto nível do Asaas usadas pelo checkout. SERVER-ONLY.
// Confira nomes de campos contra a doc atual do Asaas (API v3) antes de produção.

import { asaasFetch } from "./client";

export interface AsaasCustomer {
  id: string;
  name: string;
}

export interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  billingType: string;
}

export interface AsaasCreditCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface AsaasCreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
}

// ─── Clientes ───────────────────────────────────────────────────────

export async function findCustomerByCpfCnpj(
  cpfCnpj: string
): Promise<AsaasCustomer | null> {
  const res = await asaasFetch<{ data: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}&limit=1`
  );
  return res.data?.[0] ?? null;
}

export async function createCustomer(input: {
  name: string;
  cpfCnpj: string;
  email: string;
  mobilePhone?: string;
  groupName?: string;
}): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: input,
  });
}

/** Reaproveita o cliente existente (mesmo CNPJ) ou cria um novo no grupo "SaaS". */
export async function findOrCreateCustomer(input: {
  name: string;
  cpfCnpj: string;
  email: string;
  mobilePhone?: string;
}): Promise<AsaasCustomer> {
  const existing = await findCustomerByCpfCnpj(input.cpfCnpj);
  if (existing) return existing;
  return createCustomer({ ...input, groupName: "SaaS" });
}

// ─── Assinaturas (recorrente) ───────────────────────────────────────

export async function createSubscription(input: {
  customer: string;
  billingType: "PIX" | "CREDIT_CARD";
  value: number;
  nextDueDate: string;
  cycle: "MONTHLY" | "YEARLY";
  description: string;
  externalReference: string;
  /** 1ª cobrança com cartão: enviar creditCard + creditCardHolderInfo. */
  creditCard?: AsaasCreditCard;
  creditCardHolderInfo?: AsaasCreditCardHolderInfo;
  /** Cobranças seguintes: reusar o token devolvido na 1ª (cartão digitado uma vez). */
  creditCardToken?: string;
  remoteIp?: string;
}): Promise<{
  id: string;
  status: string;
  creditCard?: { creditCardToken?: string };
}> {
  return asaasFetch("/subscriptions", { method: "POST", body: input });
}

export async function getSubscriptionPayments(
  subscriptionId: string
): Promise<AsaasPayment[]> {
  const res = await asaasFetch<{ data: AsaasPayment[] }>(
    `/subscriptions/${subscriptionId}/payments?limit=1&order=asc`
  );
  return res.data ?? [];
}

// ─── Cobranças avulsas (onboarding) ─────────────────────────────────

export async function createPayment(input: {
  customer: string;
  billingType: "PIX" | "CREDIT_CARD";
  value: number;
  dueDate: string;
  description: string;
  externalReference: string;
  creditCard?: AsaasCreditCard;
  creditCardHolderInfo?: AsaasCreditCardHolderInfo;
  /** Reusa o token capturado na 1ª cobrança (onboarding não pede cartão de novo). */
  creditCardToken?: string;
  remoteIp?: string;
}): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>("/payments", { method: "POST", body: input });
}

// ─── Pix ────────────────────────────────────────────────────────────

export async function getPixQrCode(paymentId: string): Promise<{
  encodedImage: string;
  payload: string;
  expirationDate: string;
}> {
  return asaasFetch(`/payments/${paymentId}/pixQrCode`);
}
