"use client";

import { OrderTotals } from "@/lib/checkout/catalog";
import { formatBRL } from "@/lib/checkout/format";

interface Props {
  totals: OrderTotals;
}

export default function OrderSummary({ totals }: Props) {
  const annual = totals.cycle === "annual";
  const cadence = annual ? "/ano" : "/mês";

  return (
    <div>
      <p className="section-label mb-4" style={{ color: "var(--color-pedra)" }}>
        Resumo
      </p>

      <div className="flex flex-col gap-3">
        {/* Plano */}
        <Line name={totals.planLine.name} value={formatBRL(totals.planLine.amountCents) + cadence} />

        {/* Adicionais */}
        {totals.addonLines.map((line) => (
          <Line
            key={line.code}
            name={line.name}
            value={"+ " + formatBRL(line.amountCents) + cadence}
            muted
          />
        ))}
      </div>

      <div className="border-t my-4" style={{ borderColor: "var(--color-linho)" }} />

      {/* Recorrente */}
      <div className="flex items-baseline justify-between">
        <span className="text-caption text-pedra">
          Assinatura {annual ? "anual" : "mensal"}
        </span>
        <span
          className="font-mono text-card font-medium text-carvao"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatBRL(totals.recurringCents)}
          {cadence}
        </span>
      </div>

      {annual && (
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-fine text-pedra">Equivalente por mês</span>
          <span
            className="font-mono text-fine"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-musgo)" }}
          >
            {formatBRL(totals.monthlyEquivalentCents)}/mês
          </span>
        </div>
      )}

      {totals.annualSavingsCents > 0 && (
        <p
          className="text-fine font-medium tracking-aura mt-2"
          style={{ color: "var(--color-sucesso)" }}
        >
          Você economiza {formatBRL(totals.annualSavingsCents)} no ano
        </p>
      )}

      {/* Taxa única */}
      {totals.oneTimeCents > 0 && (
        <div className="flex items-baseline justify-between mt-3">
          <span className="text-caption text-pedra">
            Onboarding{" "}
            <span className="text-fine">(taxa única)</span>
          </span>
          <span
            className="font-mono text-caption font-medium text-carvao"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatBRL(totals.oneTimeCents)}
          </span>
        </div>
      )}

      <div className="border-t my-4" style={{ borderColor: "var(--color-linho)" }} />

      {/* Primeira cobrança */}
      <div className="flex items-baseline justify-between">
        <span className="text-body font-medium text-carvao">
          Total na 1ª cobrança
        </span>
        <span
          className="font-mono font-medium text-carvao"
          style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem" }}
        >
          {formatBRL(totals.firstChargeCents)}
        </span>
      </div>
      {totals.oneTimeCents > 0 && (
        <p className="text-fine text-pedra mt-1">
          Depois, {formatBRL(totals.recurringCents)}
          {cadence}.
        </p>
      )}
    </div>
  );
}

function Line({
  name,
  value,
  muted,
}: {
  name: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={`text-caption ${muted ? "text-pedra" : "text-carvao"}`}>
        {name}
      </span>
      <span
        className="font-mono text-caption shrink-0"
        style={{ fontFamily: "var(--font-mono)", color: "var(--color-carvao)" }}
      >
        {value}
      </span>
    </div>
  );
}
