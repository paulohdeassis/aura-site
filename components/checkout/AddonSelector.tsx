"use client";

import {
  ADDONS,
  AddonCode,
  PlanCode,
  BillingCycle,
  isAddonAvailable,
  getPlan,
} from "@/lib/checkout/catalog";
import { formatBRL } from "@/lib/checkout/format";

interface Props {
  plan: PlanCode;
  cycle: BillingCycle;
  selected: AddonCode[];
  onToggle: (code: AddonCode) => void;
}

export default function AddonSelector({
  plan,
  cycle,
  selected,
  onToggle,
}: Props) {
  const visibleAddons = ADDONS.filter((a) => !a.hidden);
  // Sem adicionais visíveis: não renderiza a seção inteira.
  if (visibleAddons.length === 0) return null;

  return (
    <fieldset>
      <legend className="section-label mb-4" style={{ color: "rgba(245,241,236,0.7)" }}>
        2 — Adicionais
      </legend>

      <div className="flex flex-col gap-3">
        {visibleAddons.map((addon) => {
          const available = isAddonAvailable(addon, plan);
          const checked = available && selected.includes(addon.code);
          const amount =
            cycle === "annual" ? addon.monthlyCents * 12 : addon.monthlyCents;
          const suffix = cycle === "annual" ? "/ano" : "/mês";

          return (
            <label
              key={addon.code}
              className={`flex items-start gap-3 rounded-card p-4 border transition-colors ${
                available ? "cursor-pointer" : "cursor-not-allowed opacity-55"
              }`}
              style={{
                backgroundColor: "#ffffff",
                borderColor: checked
                  ? "var(--color-floresta)"
                  : "var(--color-linho)",
                borderWidth: checked ? 2 : 1,
              }}
            >
              <input
                type="checkbox"
                className="mt-1 shrink-0 accent-[var(--color-floresta)]"
                checked={checked}
                disabled={!available}
                onChange={() => onToggle(addon.code)}
              />
              <span className="flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-body font-medium text-carvao">
                    {addon.name}
                  </span>
                  <span
                    className="font-mono text-caption font-medium shrink-0"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-madeira)",
                    }}
                  >
                    + {formatBRL(amount)}
                    {suffix}
                  </span>
                </span>
                <span className="block text-fine text-pedra mt-1">
                  {addon.description}
                </span>
                {!available && (
                  <span
                    className="block text-fine font-medium tracking-aura mt-2"
                    style={{ color: "var(--color-aviso)" }}
                  >
                    Disponível nos planos{" "}
                    {addon.availableIn.map((c) => getPlan(c).name).join(" e ")}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
