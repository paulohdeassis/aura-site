"use client";

import { useState } from "react";
import { PLANS, PlanCode, BillingCycle } from "@/lib/checkout/catalog";
import { formatBRL } from "@/lib/checkout/format";

interface Props {
  selected: PlanCode;
  cycle: BillingCycle;
  onSelect: (code: PlanCode) => void;
}

export default function PlanSelector({ selected, cycle, onSelect }: Props) {
  // No mobile (coluna única), só o plano escolhido aparece; os demais ficam atrás
  // de "Trocar plano" para o usuário chegar ao pagamento sem rolar planos que não quer.
  // Em sm+ (grade de 3 colunas) todos aparecem sempre.
  const [showAll, setShowAll] = useState(false);

  return (
    <fieldset>
      <legend className="section-label mb-4" style={{ color: "rgba(245,241,236,0.7)" }}>
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

          // Selecionado = card verde preenchido + texto claro. Não-selecionado = branco.
          const nameColor = active ? "var(--color-nevoa)" : "var(--color-carvao)";
          const priceColor = active ? "var(--color-nevoa)" : "var(--color-carvao)";
          const mutedColor = active ? "rgba(245,241,236,0.6)" : "var(--color-pedra)";

          // Esconde planos não-escolhidos no mobile até o usuário pedir pra trocar.
          const collapsedOnMobile = !active && !showAll;

          return (
            <button
              key={plan.code}
              type="button"
              onClick={() => {
                onSelect(plan.code);
                setShowAll(false);
              }}
              aria-pressed={active}
              className={`relative text-left rounded-card p-5 border transition-all duration-200 ${
                active ? "shadow-elevated" : "hover:shadow-card"
              } ${collapsedOnMobile ? "hidden sm:block" : ""}`}
              style={{
                backgroundColor: active ? "var(--color-floresta)" : "#ffffff",
                borderColor: active
                  ? "var(--color-floresta)"
                  : "var(--color-linho)",
                borderWidth: active ? 2 : 1,
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="flex items-center gap-2 min-w-0">
                  {active && <CheckBadge />}
                  <span
                    className="font-display text-card truncate"
                    style={{ fontFamily: "var(--font-display)", color: nameColor }}
                  >
                    {plan.name}
                  </span>
                </span>
                {plan.popular && (
                  <span
                    className="text-fine font-medium tracking-aura px-2 py-0.5 rounded-button shrink-0"
                    style={{
                      backgroundColor: active
                        ? "rgba(245,241,236,0.18)"
                        : "var(--color-floresta-100)",
                      color: active
                        ? "var(--color-nevoa)"
                        : "var(--color-floresta-700)",
                    }}
                  >
                    Mais escolhido
                  </span>
                )}
              </div>

              {annual && (
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span
                    className="font-mono line-through"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.875rem",
                      color: mutedColor,
                    }}
                  >
                    {formatBRL(anchorCents)}
                  </span>
                  <span className="text-fine" style={{ color: mutedColor }}>
                    /ano
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-1 mb-2">
                <span
                  className="font-mono font-medium"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.5rem",
                    color: priceColor,
                  }}
                >
                  {formatBRL(price)}
                </span>
                <span className="text-fine" style={{ color: mutedColor }}>
                  {suffix}
                </span>
              </div>

              {annual && (
                <p
                  className="text-fine font-medium mb-2"
                  style={{
                    color: active ? "var(--color-salvia)" : "var(--color-sucesso)",
                  }}
                >
                  Economize {formatBRL(savingsCents)} no ano
                </p>
              )}

              <p className="text-fine" style={{ color: mutedColor }}>
                {plan.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Trocar plano — só no mobile (coluna única). Em sm+ todos já aparecem. */}
      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        aria-expanded={showAll}
        className="sm:hidden mt-3 w-full flex items-center justify-center gap-1.5 rounded-button py-3 text-caption font-medium transition-colors"
        style={{
          color: "rgba(245,241,236,0.85)",
          border: "1px solid rgba(245,241,236,0.25)",
        }}
      >
        {showAll ? "Ver menos" : "Trocar plano"}
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          style={{
            transform: showAll ? "rotate(180deg)" : "none",
            transition: "transform 200ms var(--ease-out-quint)",
          }}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </fieldset>
  );
}

function CheckBadge() {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{
        width: 18,
        height: 18,
        backgroundColor: "var(--color-nevoa)",
        color: "var(--color-floresta)",
      }}
      aria-hidden="true"
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.5 6.2l2.2 2.3L9.5 3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
