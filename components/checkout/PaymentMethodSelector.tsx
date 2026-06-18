"use client";

import { BillingCycle } from "@/lib/checkout/catalog";
import { PaymentMethod } from "@/lib/checkout/api-types";

interface Props {
  method: PaymentMethod;
  cycle: BillingCycle;
  onChange: (m: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ method, cycle, onChange }: Props) {
  // Pix só é aceito em planos anuais.
  const pixAvailable = cycle === "annual";

  return (
    <fieldset>
      <legend className="section-label mb-3" style={{ color: "var(--color-pedra)" }}>
        Forma de pagamento
      </legend>

      <div className="grid grid-cols-2 gap-3">
        <MethodCard
          active={method === "CREDIT_CARD"}
          onClick={() => onChange("CREDIT_CARD")}
          icon={<CardIcon />}
          label="Cartão de crédito"
          hint="Cobrança recorrente automática"
        />
        <MethodCard
          active={method === "PIX"}
          disabled={!pixAvailable}
          onClick={() => pixAvailable && onChange("PIX")}
          icon={<PixIcon />}
          label="Pix"
          hint={pixAvailable ? "Pagamento à vista do ano" : "Só no plano anual"}
        />
      </div>
    </fieldset>
  );
}

function MethodCard({
  active,
  disabled,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className="text-left rounded-card p-4 border transition-all duration-200 disabled:cursor-not-allowed"
      style={{
        backgroundColor: "#ffffff",
        borderColor: active ? "var(--color-floresta)" : "var(--color-linho)",
        borderWidth: active ? 2 : 1,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span className="flex items-center gap-2 mb-1" style={{ color: "var(--color-carvao)" }}>
        {icon}
        <span className="text-caption font-medium">{label}</span>
      </span>
      <span className="block text-fine text-pedra">{hint}</span>
    </button>
  );
}

function CardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 8h16" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function PixIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5 17.5 10 10 17.5 2.5 10 10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
