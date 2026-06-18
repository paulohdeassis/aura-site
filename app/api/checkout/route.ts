import type { NextRequest } from "next/server";
import {
  parsePlanCode,
  getPlan,
  getAddon,
  isAddonAvailable,
  ADDONS,
  AddonCode,
  BillingCycle,
  AURA_ADDON_CODE,
  LOCAL_ADDON_CODE,
} from "@/lib/checkout/catalog";
import {
  isValidName,
  isValidEmail,
  isValidPhone,
  isValidCpfCnpj,
  isValidCardNumber,
  isValidExpiry,
  isValidCVV,
  isValidCEP,
  parseExpiry,
  stripDigits,
} from "@/lib/checkout/format";
import {
  findOrCreateCustomer,
  createSubscription,
  getSubscriptionPayments,
  createPayment,
  getPixQrCode,
  AsaasCreditCard,
  AsaasCreditCardHolderInfo,
} from "@/lib/asaas/api";
import { AsaasError } from "@/lib/asaas/client";
import {
  createIntent,
  buildExternalReference,
  ManifestItem,
  AuraCycle,
} from "@/lib/aura/billing";
import { AuraError } from "@/lib/aura/client";
import type {
  CheckoutRequest,
  CheckoutResponse,
  ChargeResult,
} from "@/lib/checkout/api-types";

const ADDON_CODES = new Set(ADDONS.map((a) => a.code));

/** Centavos (inteiro) → reais com 2 casas, no formato que o Asaas espera. */
const centsToReais = (cents: number) => Number((cents / 100).toFixed(2));

/** Data de hoje em America/Sao_Paulo no formato YYYY-MM-DD. */
function todayISO(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

function bad(error: string, status = 400) {
  return Response.json({ error }, { status });
}

/** Ordem de cobrança exigida pelo contrato: plano → addons → taxa. */
const KIND_ORDER: Record<ManifestItem["kind"], number> = {
  plan: 0,
  addon: 1,
  fee: 2,
};

/** Rótulo amigável para um item do manifesto (códigos vêm na nomenclatura da Aura). */
function manifestLabel(item: ManifestItem): string {
  if (item.kind === "plan") {
    const plan = parsePlanCode(item.code);
    return plan ? `Plano ${getPlan(plan).name}` : item.code;
  }
  if (item.kind === "fee") {
    return item.code === "ONBOARDING" ? "Onboarding assistido" : item.code;
  }
  const local = LOCAL_ADDON_CODE[item.code];
  return local ? getAddon(local).name : item.code;
}

export async function POST(req: NextRequest) {
  let body: CheckoutRequest;
  try {
    body = (await req.json()) as CheckoutRequest;
  } catch {
    return bad("Corpo da requisição inválido.");
  }

  // ── Valida seleção (nunca confiar nos valores do client) ──
  const planCode = parsePlanCode(body?.selection?.planCode);
  if (!planCode) return bad("Plano inválido.");

  const cycle: BillingCycle =
    body.selection.cycle === "annual" ? "annual" : "monthly";

  const addonCodes: AddonCode[] = Array.isArray(body.selection.addonCodes)
    ? body.selection.addonCodes.filter(
        (c): c is AddonCode =>
          ADDON_CODES.has(c as AddonCode) &&
          !getAddon(c as AddonCode).hidden &&
          isAddonAvailable(getAddon(c as AddonCode), planCode)
      )
    : [];

  const onboarding = Boolean(body.selection.onboarding);

  // ── Valida cliente ──
  const customer = body.customer ?? ({} as CheckoutRequest["customer"]);
  if (!isValidName(customer.companyName ?? "")) return bad("Nome da empresa inválido.");
  if (!isValidName(customer.name ?? "")) return bad("Nome inválido.");
  if (!isValidEmail(customer.email ?? "")) return bad("Email inválido.");
  if (!isValidPhone(customer.phone ?? "")) return bad("Telefone inválido.");
  if (!isValidCpfCnpj(customer.cpfCnpj ?? "")) return bad("CPF ou CNPJ inválido.");

  // ── Valida pagamento ──
  const method = body.payment?.method;
  if (method !== "PIX" && method !== "CREDIT_CARD") {
    return bad("Forma de pagamento inválida.");
  }
  // Regra de negócio: Pix só nos planos anuais.
  if (method === "PIX" && cycle !== "annual") {
    return bad("Pix disponível apenas para planos anuais.");
  }

  let creditCard: AsaasCreditCard | undefined;
  let holderInfo: AsaasCreditCardHolderInfo | undefined;

  if (method === "CREDIT_CARD") {
    const card = body.payment.card;
    if (!card) return bad("Dados do cartão ausentes.");
    if (!isValidCardNumber(card.number)) return bad("Número de cartão inválido.");
    if (!isValidName(card.holderName ?? "")) return bad("Nome no cartão inválido.");
    if (!isValidExpiry(card.expiry)) return bad("Validade do cartão inválida.");
    if (!isValidCVV(card.ccv)) return bad("CVV inválido.");
    if (!isValidCEP(card.postalCode)) return bad("CEP inválido.");
    if (!card.addressNumber?.trim()) return bad("Número do endereço obrigatório.");

    const { month, year } = parseExpiry(card.expiry);
    creditCard = {
      holderName: card.holderName.trim(),
      number: stripDigits(card.number),
      expiryMonth: month,
      expiryYear: year,
      ccv: stripDigits(card.ccv),
    };
    holderInfo = {
      name: customer.name.trim(),
      email: customer.email.trim(),
      cpfCnpj: stripDigits(customer.cpfCnpj),
      postalCode: stripDigits(card.postalCode),
      addressNumber: card.addressNumber.trim(),
      phone: stripDigits(customer.phone),
    };
  }

  const cpfCnpj = stripDigits(customer.cpfCnpj);
  const remoteIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined;
  const dueDate = todayISO();
  const auraCycle: AuraCycle = cycle === "annual" ? "YEARLY" : "MONTHLY";

  try {
    // 1. Intent na Aura (sem cartão): registra o pedido e devolve o manifesto,
    //    que é a FONTE DA VERDADE dos valores de cada cobrança (anti-adulteração).
    const intent = await createIntent({
      org_name: customer.companyName.trim(),
      owner_name: customer.name.trim(),
      owner_email: customer.email.trim(),
      plan_code: planCode,
      cycle: auraCycle,
      addons: addonCodes.map((c) => ({ code: AURA_ADDON_CODE[c], quantity: 1 })),
      include_onboarding: onboarding,
    });

    // 2. Cliente no Asaas (reusa por CNPJ ou cria no grupo "SaaS")
    const asaasCustomer = await findOrCreateCustomer({
      name: customer.name.trim(),
      cpfCnpj,
      email: customer.email.trim(),
      mobilePhone: stripDigits(customer.phone),
    });

    // 3. Uma cobrança por item do manifesto, na ordem plano → addons → taxa.
    //    O cartão é digitado uma vez: a 1ª cobrança com cartão captura o token,
    //    as demais reusam (creditCardToken).
    const manifest = [...intent.manifest].sort(
      (a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]
    );

    let cardToken: string | undefined;
    const charges: ChargeResult[] = [];

    for (const item of manifest) {
      const value = centsToReais(item.amount_cents);
      const label = manifestLabel(item);
      const externalReference = buildExternalReference(
        item.kind,
        item.code,
        intent.intent_id
      );
      // A 1ª cobrança no cartão leva os dados do cartão; as seguintes, o token.
      const useCardFields = method === "CREDIT_CARD" && !cardToken;
      const cardFields =
        method !== "CREDIT_CARD"
          ? {}
          : useCardFields
          ? { creditCard, creditCardHolderInfo: holderInfo }
          : { creditCardToken: cardToken };

      if (item.kind === "fee") {
        const payment = await createPayment({
          customer: asaasCustomer.id,
          billingType: method,
          value,
          dueDate,
          description: `Aura · ${label}`,
          externalReference,
          ...cardFields,
          remoteIp,
        });
        charges.push({
          kind: "fee",
          code: item.code,
          label,
          paymentId: payment.id,
          value,
          status: payment.status,
          billingType: method,
          pix:
            method === "PIX"
              ? await getPixQrCode(payment.id).catch(() => null)
              : null,
        });
        continue;
      }

      // plano ou addon → assinatura recorrente
      const subscription = await createSubscription({
        customer: asaasCustomer.id,
        billingType: method,
        value,
        nextDueDate: dueDate,
        cycle: item.cycle ?? auraCycle,
        description: `Aura · ${label}`,
        externalReference,
        ...cardFields,
        remoteIp,
      });
      if (useCardFields) {
        cardToken = subscription.creditCard?.creditCardToken ?? cardToken;
      }

      // 1ª cobrança da assinatura (status / QR do Pix)
      const firstPayment = (await getSubscriptionPayments(subscription.id))[0] ?? null;
      charges.push({
        kind: item.kind,
        code: item.code,
        label,
        paymentId: firstPayment?.id ?? null,
        subscriptionId: subscription.id,
        value,
        status: firstPayment?.status ?? subscription.status,
        billingType: method,
        pix:
          method === "PIX" && firstPayment
            ? await getPixQrCode(firstPayment.id).catch(() => null)
            : null,
      });
    }

    const response: CheckoutResponse = {
      intentId: intent.intent_id,
      ownerIsExistingUser: intent.owner_is_existing_user,
      customerId: asaasCustomer.id,
      cycle,
      method,
      charges,
    };
    return Response.json(response);
  } catch (err) {
    if (err instanceof AuraError) {
      // 4xx da Aura = pedido inválido (plano/addon desconhecido, payload) → repassa.
      const status = err.status >= 400 && err.status < 500 ? err.status : 502;
      return bad(err.message, status);
    }
    if (err instanceof AsaasError) {
      // 4xx do Asaas = erro do cliente (cartão recusado, dado inválido) → repassa.
      const status = err.status >= 400 && err.status < 500 ? err.status : 502;
      return bad(err.message, status);
    }
    console.error("[checkout] erro inesperado:", err);
    return bad("Não foi possível processar o pagamento. Tente novamente.", 500);
  }
}
