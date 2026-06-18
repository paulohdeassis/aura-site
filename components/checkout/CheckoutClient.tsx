"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PlanCode,
  AddonCode,
  BillingCycle,
  Selection,
  computeTotals,
  getAddon,
  isAddonAvailable,
} from "@/lib/checkout/catalog";
import { formatBRL } from "@/lib/checkout/format";
import { CheckoutRequest, CheckoutResponse } from "@/lib/checkout/api-types";
import PlanSelector from "./PlanSelector";
import AddonSelector from "./AddonSelector";
import OrderSummary from "./OrderSummary";
import CheckoutForm, { CheckoutSubmitData } from "./CheckoutForm";
import PaymentResult from "./PaymentResult";

export default function CheckoutClient({
  initialPlan = "CORE",
}: {
  initialPlan?: PlanCode;
}) {
  const [planCode, setPlanCode] = useState<PlanCode>(initialPlan);
  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const [addonCodes, setAddonCodes] = useState<AddonCode[]>([]);
  const [onboarding, setOnboarding] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResponse | null>(null);

  const selection: Selection = { planCode, cycle, addonCodes, onboarding };
  const totals = computeTotals(selection);

  const selectPlan = (code: PlanCode) => {
    setPlanCode(code);
    // Remove adicionais que não existem no novo plano (ex.: Channel Manager no Start).
    setAddonCodes((prev) =>
      prev.filter((c) => isAddonAvailable(getAddon(c), code))
    );
  };

  const toggleAddon = (code: AddonCode) => {
    setAddonCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const submitOrder = async (data: CheckoutSubmitData) => {
    setSubmitting(true);
    setServerError(null);

    const payload: CheckoutRequest = {
      selection: { planCode, cycle, addonCodes, onboarding },
      customer: data.customer,
      payment: data.payment,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json?.error ?? "Não foi possível processar o pagamento.");
        return;
      }
      setResult(json as CheckoutResponse);
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    } catch {
      setServerError("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-nevoa)" }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{
          backgroundColor: "rgba(245,241,236,0.85)",
          borderColor: "var(--color-linho)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link
            href="/#planos"
            className="text-caption text-pedra link-under inline-flex items-center gap-2"
          >
            ← Voltar aos planos
          </Link>
          <span
            className="text-fine font-medium tracking-aura inline-flex items-center gap-2"
            style={{ color: "var(--color-musgo)" }}
          >
            <LockIcon /> Pagamento seguro
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
        {result ? (
          <PaymentResult result={result} onEdit={() => setResult(null)} />
        ) : (
          <>
            <div className="mb-10">
              <h1
                className="font-display text-title text-carvao"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Monte sua assinatura
              </h1>
              <p className="text-body text-pedra mt-2 max-w-lg">
                Escolha o plano, os adicionais e a forma de cobrança. O resumo
                atualiza em tempo real.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
              {/* Coluna de configuração */}
              <div className="flex flex-col gap-10">
                <CycleToggle cycle={cycle} onChange={setCycle} />

                <PlanSelector
                  selected={planCode}
                  cycle={cycle}
                  onSelect={selectPlan}
                />

                <AddonSelector
                  plan={planCode}
                  cycle={cycle}
                  selected={addonCodes}
                  onToggle={toggleAddon}
                />

                <OnboardingToggle
                  checked={onboarding}
                  onChange={setOnboarding}
                />
              </div>

              {/* Coluna de resumo + formulário (sticky) */}
              <div className="lg:sticky lg:top-24 flex flex-col gap-6">
                <div
                  className="rounded-card p-6 shadow-card"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--color-linho)",
                  }}
                >
                  <OrderSummary totals={totals} />
                </div>
                <div
                  className="rounded-card p-6 shadow-card"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--color-linho)",
                  }}
                >
                  <CheckoutForm
                    cycle={cycle}
                    submitting={submitting}
                    serverError={serverError}
                    onSubmit={submitOrder}
                  />
                  <p className="text-fine text-pedra text-center mt-4">
                    Sem contrato de fidelidade. Cancele quando quiser.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Toggle de ciclo de cobrança ────────────────────────────────────

function CycleToggle({
  cycle,
  onChange,
}: {
  cycle: BillingCycle;
  onChange: (c: BillingCycle) => void;
}) {
  const options: { value: BillingCycle; label: string }[] = [
    { value: "monthly", label: "Mensal" },
    { value: "annual", label: "Anual" },
  ];
  return (
    <fieldset>
      <legend className="section-label mb-4" style={{ color: "var(--color-pedra)" }}>
        Forma de cobrança
      </legend>
      <div
        className="inline-flex p-1 rounded-button"
        style={{ backgroundColor: "var(--color-terra-100)" }}
      >
        {options.map((o) => {
          const active = o.value === cycle;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={active}
              className="px-5 py-2 rounded-button text-caption font-medium transition-colors"
              style={{
                backgroundColor: active ? "#ffffff" : "transparent",
                color: active ? "var(--color-carvao)" : "var(--color-pedra)",
                boxShadow: active ? "0 1px 3px rgba(44,42,37,0.1)" : "none",
              }}
            >
              {o.label}
              {o.value === "annual" && (
                <span
                  className="ml-1.5 text-fine"
                  style={{ color: "var(--color-sucesso)" }}
                >
                  economize
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

// ─── Onboarding (taxa única) ────────────────────────────────────────

function OnboardingToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className="flex items-start gap-3 rounded-card p-4 border cursor-pointer"
      style={{
        backgroundColor: "#ffffff",
        borderColor: checked ? "var(--color-floresta)" : "var(--color-linho)",
        borderWidth: checked ? 2 : 1,
      }}
    >
      <input
        type="checkbox"
        className="mt-1 shrink-0 accent-[var(--color-floresta)]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-body font-medium text-carvao">
            Onboarding assistido
          </span>
          <span
            className="font-mono text-caption font-medium shrink-0"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-madeira)",
            }}
          >
            {formatBRL(19700)} · taxa única
          </span>
        </span>
        <span className="block text-fine text-pedra mt-1">
          Configuração completa com suporte dedicado: importação de dados,
          configuração de canais e treinamento da equipe.
        </span>
      </span>
    </label>
  );
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 7V5a2.5 2.5 0 1 1 5 0v2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
