"use client";

import { PLANS, PlanCode, BillingCycle } from "@/lib/checkout/catalog";
import { formatBRL } from "@/lib/checkout/format";

interface Props {
  selected: PlanCode;
  cycle: BillingCycle;
  onSelect: (code: PlanCode) => void;
}

export default function PlanSelector({ selected, cycle, onSelect }: Props) {
  return (
    <fieldset>
      <legend className="section-label mb-4" style={{ color: "var(--color-pedra)" }}>
        1 — Escolha o plano
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLANS.map((plan) => {
          const active = plan.code === selected;
          const annual = cycle === "annual";
          const price = annual ? plan.annualCents : plan.monthlyCents;
          const suffix = annual ? "/ano" : "/mês";
          // Ancoragem: preço cheio = 12× o mensal; comparado ao anual com desconto.
          const anchorCents = plan.monthlyCents * 12;
          const savingsCents = anchorCents - plan.annualCents;

          return (
            <button
              key={plan.code}
              type="button"
              onClick={() => onSelect(plan.code)}
              aria-pressed={active}
              className={`text-left rounded-card p-5 border transition-all duration-200 ${
                active ? "shadow-card" : "hover:shadow-card"
              }`}
              style={{
                backgroundColor: "#ffffff",
                borderColor: active
                  ? "var(--color-floresta)"
                  : "var(--color-linho)",
                borderWidth: active ? 2 : 1,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="font-display text-card text-carvao"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {plan.name}
                </span>
                {plan.popular && (
                  <span
                    className="text-fine font-medium tracking-aura px-2 py-0.5 rounded-button"
                    style={{
                      backgroundColor: "var(--color-floresta-100)",
                      color: "var(--color-floresta-700)",
                    }}
                  >
                    Mais escolhido
                  </span>
                )}
              </div>

              {annual && (
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span
                    className="font-mono text-pedra line-through"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}
                  >
                    {formatBRL(anchorCents)}
                  </span>
                  <span className="text-fine text-pedra">/ano</span>
                </div>
              )}

              <div className="flex items-baseline gap-1 mb-2">
                <span
                  className="font-mono text-carvao font-medium"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem" }}
                >
                  {formatBRL(price)}
                </span>
                <span className="text-fine text-pedra">{suffix}</span>
              </div>

              {annual && (
                <p
                  className="text-fine font-medium mb-2"
                  style={{ color: "var(--color-sucesso)" }}
                >
                  Economize {formatBRL(savingsCents)} no ano
                </p>
              )}

              <p className="text-fine text-pedra">{plan.tagline}</p>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
