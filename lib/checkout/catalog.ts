// Catálogo de planos e adicionais — fonte única de verdade do checkout.
//
// Preços em CENTAVOS (inteiro), nunca float. `monthly` é o valor por mês;
// `annual` é o valor cheio cobrado por ano (já com o desconto do plano embutido).
// Esta estrutura é deliberadamente independente do gateway: quando a integração
// com o Asaas entrar, basta mapear `code` → produto/assinatura e somar `amountCents`.

export type PlanCode = "START" | "CORE" | "MAX";
export type AddonCode = "CHANNEL_MANAGER" | "ZEELU" | "HOMIO_CRM";
export type BillingCycle = "monthly" | "annual";

export interface Plan {
  code: PlanCode;
  tier: string;
  name: string;
  tagline: string;
  /** valor por mês, em centavos */
  monthlyCents: number;
  /** valor cheio por ano, em centavos */
  annualCents: number;
  features: string[];
  popular?: boolean;
}

export interface Addon {
  code: AddonCode;
  name: string;
  /** valor por mês, em centavos */
  monthlyCents: number;
  description: string;
  /** planos em que o adicional pode ser contratado */
  availableIn: PlanCode[];
  /** oculto do checkout e da home por enquanto (não removido). */
  hidden?: boolean;
}

export const PLANS: Plan[] = [
  {
    code: "START",
    tier: "AURA",
    name: "Start",
    tagline:
      "Para quem está saindo do improviso e precisa de um sistema completo — sem complexidade.",
    monthlyCents: 14700,
    annualCents: 157000,
    features: [
      "PMS completo",
      "Calendário multi-visualização",
      "Gestão de unidades",
      "Gestão de hóspedes e histórico de estadias",
      "Gestão de produtos e serviços",
      "Gestão Financeira — Receitas e previsibilidade",
      "Gestão de Housekeeping e manutenção",
    ],
  },
  {
    code: "CORE",
    tier: "AURA",
    name: "Core",
    tagline:
      "Para quem já tem volume e quer multipropriedade e visibilidade total para o proprietário.",
    monthlyCents: 24700,
    annualCents: 267000,
    popular: true,
    features: [
      "Tudo do plano Start",
      "Adm de diferentes propriedades",
      "Extranet do proprietário e investidores",
    ],
  },
  {
    code: "MAX",
    tier: "AURA",
    name: "Max",
    tagline:
      "Para quem quer reservas diretas sem comissão de OTA e gestão completa do portfólio.",
    monthlyCents: 39700,
    annualCents: 437000,
    features: [
      "Tudo do plano Core",
      "Site personalizado integrado ao PMS",
      "Motor de reservas diretas no site",
      "Implantação de domínio existente",
      "Comunicação automatizada com hóspedes",
      "Respostas automáticas com IA",
    ],
  },
];

export const ADDONS: Addon[] = [
  {
    code: "CHANNEL_MANAGER",
    hidden: true,
    name: "Channel Manager",
    monthlyCents: 9700,
    description:
      "Calendário e tarifas sincronizados automaticamente em todos os canais (Airbnb, Booking e outros). Sem atualização manual, sem risco de overbooking.",
    availableIn: ["CORE", "MAX"],
  },
  {
    code: "ZEELU",
    hidden: true,
    name: "Zee.lu",
    monthlyCents: 4990,
    description:
      "Nota fiscal emitida automaticamente a cada reserva confirmada. Sem acessar outro sistema, sem acúmulo no fim do mês.",
    availableIn: ["START", "CORE", "MAX"],
  },
  {
    code: "HOMIO_CRM",
    hidden: true,
    name: "Homio CRM",
    monthlyCents: 7990,
    description:
      "Centraliza interações e dados dos consumidores, automatiza o funil de vendas e permite atendimento hiper-personalizado.",
    availableIn: ["START", "CORE", "MAX"],
  },
];

/** Onboarding assistido — taxa única, opcional (não recorrente). */
export const ONBOARDING_FEE_CENTS = 19700;

// ─── Mapeamento de códigos: catálogo local ↔ API de billing da Aura ──
// Os planos têm o mesmo código nos dois lados; os adicionais divergem.
// A fonte da verdade dos PREÇOS é o manifesto do intent da Aura, não daqui.
export const AURA_ADDON_CODE: Record<AddonCode, string> = {
  CHANNEL_MANAGER: "CHANNEL_MANAGER",
  ZEELU: "ZEE_LU",
  HOMIO_CRM: "HOMIO",
};

/** Código da Aura → código local (para rotular itens do manifesto). */
export const LOCAL_ADDON_CODE: Record<string, AddonCode> = {
  CHANNEL_MANAGER: "CHANNEL_MANAGER",
  ZEE_LU: "ZEELU",
  HOMIO: "HOMIO_CRM",
};

// ─── Helpers de lookup ──────────────────────────────────────────────

export const getPlan = (code: PlanCode): Plan =>
  PLANS.find((p) => p.code === code)!;

/** Converte um valor de querystring (ex.: "core") em PlanCode, ou null se inválido. */
export const parsePlanCode = (value: string | null | undefined): PlanCode | null => {
  if (!value) return null;
  const upper = value.toUpperCase();
  return PLANS.some((p) => p.code === upper) ? (upper as PlanCode) : null;
};

export const getAddon = (code: AddonCode): Addon =>
  ADDONS.find((a) => a.code === code)!;

export const isAddonAvailable = (addon: Addon, plan: PlanCode): boolean =>
  addon.availableIn.includes(plan);

// ─── Cálculo de totais ──────────────────────────────────────────────

export interface OrderLine {
  code: string;
  name: string;
  /** valor na cadência escolhida (mês ou ano), em centavos */
  amountCents: number;
}

export interface OrderTotals {
  cycle: BillingCycle;
  planLine: OrderLine;
  addonLines: OrderLine[];
  /** assinatura recorrente na cadência escolhida, em centavos */
  recurringCents: number;
  /** equivalente mensal da assinatura recorrente, em centavos */
  monthlyEquivalentCents: number;
  /** taxa única (onboarding), em centavos */
  oneTimeCents: number;
  /** primeira cobrança = recorrente do 1º período + taxa única */
  firstChargeCents: number;
  /** economia vs. pagar o plano mensal por 12 meses (só no ciclo anual), em centavos */
  annualSavingsCents: number;
}

export interface Selection {
  planCode: PlanCode;
  cycle: BillingCycle;
  addonCodes: AddonCode[];
  onboarding: boolean;
}

export function computeTotals(selection: Selection): OrderTotals {
  const plan = getPlan(selection.planCode);
  const annual = selection.cycle === "annual";

  const planAmount = annual ? plan.annualCents : plan.monthlyCents;
  const planLine: OrderLine = {
    code: plan.code,
    name: `Plano ${plan.name}`,
    amountCents: planAmount,
  };

  // Add-ons só têm preço mensal definido; no ciclo anual cobramos 12×.
  const addonLines: OrderLine[] = selection.addonCodes
    .map(getAddon)
    .filter((a) => isAddonAvailable(a, selection.planCode))
    .map((a) => ({
      code: a.code,
      name: a.name,
      amountCents: annual ? a.monthlyCents * 12 : a.monthlyCents,
    }));

  const recurringCents =
    planLine.amountCents + addonLines.reduce((s, l) => s + l.amountCents, 0);

  const monthlyEquivalentCents = annual
    ? Math.round(recurringCents / 12)
    : recurringCents;

  const oneTimeCents = selection.onboarding ? ONBOARDING_FEE_CENTS : 0;

  // Economia anual = (mensal do plano × 12) − anual do plano.
  const annualSavingsCents = annual
    ? plan.monthlyCents * 12 - plan.annualCents
    : 0;

  return {
    cycle: selection.cycle,
    planLine,
    addonLines,
    recurringCents,
    monthlyEquivalentCents,
    oneTimeCents,
    firstChargeCents: recurringCents + oneTimeCents,
    annualSavingsCents,
  };
}
