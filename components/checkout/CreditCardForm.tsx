"use client";

export type CardFieldKey =
  | "number"
  | "holderName"
  | "expiry"
  | "ccv"
  | "postalCode"
  | "addressNumber";

interface Props {
  values: Record<CardFieldKey, string>;
  errorFor: (key: CardFieldKey) => string | null;
  onChange: (key: CardFieldKey, value: string) => void;
  onBlur: (key: CardFieldKey) => void;
}

export default function CreditCardForm({ values, errorFor, onChange, onBlur }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <CardField
        keyName="number"
        label="Número do cartão"
        placeholder="0000 0000 0000 0000"
        inputMode="numeric"
        autoComplete="cc-number"
        values={values}
        errorFor={errorFor}
        onChange={onChange}
        onBlur={onBlur}
      />
      <CardField
        keyName="holderName"
        label="Nome impresso no cartão"
        placeholder="Como está no cartão"
        autoComplete="cc-name"
        values={values}
        errorFor={errorFor}
        onChange={onChange}
        onBlur={onBlur}
      />
      <div className="grid grid-cols-2 gap-3">
        <CardField
          keyName="expiry"
          label="Validade"
          placeholder="MM/AA"
          inputMode="numeric"
          autoComplete="cc-exp"
          values={values}
          errorFor={errorFor}
          onChange={onChange}
          onBlur={onBlur}
        />
        <CardField
          keyName="ccv"
          label="CVV"
          placeholder="000"
          inputMode="numeric"
          autoComplete="cc-csc"
          values={values}
          errorFor={errorFor}
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <CardField
          keyName="postalCode"
          label="CEP do titular"
          placeholder="00000-000"
          inputMode="numeric"
          autoComplete="postal-code"
          values={values}
          errorFor={errorFor}
          onChange={onChange}
          onBlur={onBlur}
        />
        <CardField
          keyName="addressNumber"
          label="Número"
          placeholder="123"
          inputMode="numeric"
          values={values}
          errorFor={errorFor}
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>
    </div>
  );
}

function CardField({
  keyName,
  label,
  placeholder,
  inputMode,
  autoComplete,
  values,
  errorFor,
  onChange,
  onBlur,
}: {
  keyName: CardFieldKey;
  label: string;
  placeholder?: string;
  inputMode?: "numeric" | "text";
  autoComplete?: string;
  values: Record<CardFieldKey, string>;
  errorFor: (key: CardFieldKey) => string | null;
  onChange: (key: CardFieldKey, value: string) => void;
  onBlur: (key: CardFieldKey) => void;
}) {
  const error = errorFor(keyName);
  return (
    <div>
      <label className="block text-caption text-carvao mb-1.5">{label}</label>
      <input
        type="text"
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={values[keyName]}
        placeholder={placeholder}
        onChange={(e) => onChange(keyName, e.target.value)}
        onBlur={() => onBlur(keyName)}
        aria-invalid={!!error}
        className="w-full px-4 py-3 rounded-input border bg-white text-body text-carvao outline-none transition-colors"
        style={{ borderColor: error ? "var(--color-erro)" : "var(--color-linho)" }}
      />
      {error && (
        <p className="text-fine mt-1" style={{ color: "var(--color-erro)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
