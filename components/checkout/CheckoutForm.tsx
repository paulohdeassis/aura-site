"use client";

import { useState } from "react";
import {
  maskPhone,
  maskCpfCnpj,
  maskCardNumber,
  maskExpiry,
  maskCVV,
  maskCEP,
  isValidName,
  isValidEmail,
  isValidPhone,
  isValidCpfCnpj,
  isValidCardNumber,
  isValidExpiry,
  isValidCVV,
  isValidCEP,
} from "@/lib/checkout/format";
import { BillingCycle } from "@/lib/checkout/catalog";
import { PaymentMethod, CardInput } from "@/lib/checkout/api-types";
import PaymentMethodSelector from "./PaymentMethodSelector";
import CreditCardForm, { CardFieldKey } from "./CreditCardForm";

export interface CustomerData {
  companyName: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
}

export interface CheckoutSubmitData {
  customer: CustomerData;
  payment: { method: PaymentMethod; card?: CardInput };
}

interface Props {
  cycle: BillingCycle;
  submitting: boolean;
  serverError: string | null;
  onSubmit: (data: CheckoutSubmitData) => void;
}

type FieldKey = "companyName" | "name" | "email" | "phone" | "cpfCnpj";

const fieldValidators: Record<FieldKey, (v: string) => boolean> = {
  companyName: isValidName,
  name: isValidName,
  email: isValidEmail,
  phone: isValidPhone,
  cpfCnpj: isValidCpfCnpj,
};

const fieldErrors: Record<FieldKey, string> = {
  companyName: "Informe o nome da empresa",
  name: "Informe seu nome",
  email: "Informe um email válido",
  phone: "Informe um telefone válido",
  cpfCnpj: "Informe um CPF ou CNPJ válido",
};

const cardValidators: Record<CardFieldKey, (v: string) => boolean> = {
  number: isValidCardNumber,
  holderName: isValidName,
  expiry: isValidExpiry,
  ccv: isValidCVV,
  postalCode: isValidCEP,
  addressNumber: (v) => v.trim().length > 0,
};

const cardErrors: Record<CardFieldKey, string> = {
  number: "Número de cartão inválido",
  holderName: "Informe o nome do titular",
  expiry: "Validade inválida",
  ccv: "CVV inválido",
  postalCode: "CEP inválido",
  addressNumber: "Informe o número",
};

const cardMasks: Partial<Record<CardFieldKey, (v: string) => string>> = {
  number: maskCardNumber,
  expiry: maskExpiry,
  ccv: maskCVV,
  postalCode: maskCEP,
};

const emptyCard: Record<CardFieldKey, string> = {
  number: "",
  holderName: "",
  expiry: "",
  ccv: "",
  postalCode: "",
  addressNumber: "",
};

export default function CheckoutForm({ cycle, submitting, serverError, onSubmit }: Props) {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    cpfCnpj: "",
  });
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    companyName: false,
    name: false,
    email: false,
    phone: false,
    cpfCnpj: false,
  });

  const [methodPref, setMethodPref] = useState<PaymentMethod>("PIX");
  // Pix só vale no anual; fora dele, o método efetivo é sempre cartão.
  const method: PaymentMethod = cycle === "annual" ? methodPref : "CREDIT_CARD";
  const [card, setCard] = useState<Record<CardFieldKey, string>>(emptyCard);
  const [cardTouched, setCardTouched] = useState<Record<CardFieldKey, boolean>>({
    number: false,
    holderName: false,
    expiry: false,
    ccv: false,
    postalCode: false,
    addressNumber: false,
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsTouched, setTermsTouched] = useState(false);

  const isCard = method === "CREDIT_CARD";

  const setField = (key: FieldKey, raw: string) => {
    const value =
      key === "phone"
        ? maskPhone(raw)
        : key === "cpfCnpj"
        ? maskCpfCnpj(raw)
        : raw;
    setValues((v) => ({ ...v, [key]: value }));
  };

  const setCardField = (key: CardFieldKey, raw: string) => {
    const value = cardMasks[key] ? cardMasks[key]!(raw) : raw;
    setCard((c) => ({ ...c, [key]: value }));
  };

  const errorFor = (key: FieldKey): string | null =>
    touched[key] && !fieldValidators[key](values[key]) ? fieldErrors[key] : null;

  const cardErrorFor = (key: CardFieldKey): string | null =>
    cardTouched[key] && !cardValidators[key](card[key]) ? cardErrors[key] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      companyName: true,
      name: true,
      email: true,
      phone: true,
      cpfCnpj: true,
    });
    setTermsTouched(true);

    const customerValid = (Object.keys(fieldValidators) as FieldKey[]).every((k) =>
      fieldValidators[k](values[k])
    );

    let cardValid = true;
    if (isCard) {
      setCardTouched({
        number: true,
        holderName: true,
        expiry: true,
        ccv: true,
        postalCode: true,
        addressNumber: true,
      });
      cardValid = (Object.keys(cardValidators) as CardFieldKey[]).every((k) =>
        cardValidators[k](card[k])
      );
    }

    if (!customerValid || !cardValid || !acceptTerms) return;

    onSubmit({
      customer: {
        companyName: values.companyName.trim(),
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone,
        cpfCnpj: values.cpfCnpj,
      },
      payment: {
        method,
        card: isCard
          ? {
              number: card.number,
              holderName: card.holderName.trim(),
              expiry: card.expiry,
              ccv: card.ccv,
              postalCode: card.postalCode,
              addressNumber: card.addressNumber,
            }
          : undefined,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <p className="section-label mb-4" style={{ color: "var(--color-pedra)" }}>
          2 — Seus dados
        </p>

        <div className="flex flex-col gap-4">
          <Field
            label="Nome da empresa"
            placeholder="Ex.: Pousada do Vale"
            value={values.companyName}
            error={errorFor("companyName")}
            onChange={(v) => setField("companyName", v)}
            onBlur={() => setTouched((t) => ({ ...t, companyName: true }))}
          />
          <Field
            label="Nome do responsável"
            placeholder="Seu nome"
            value={values.name}
            error={errorFor("name")}
            onChange={(v) => setField("name", v)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />
          <Field
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={values.email}
            error={errorFor("email")}
            onChange={(v) => setField("email", v)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />
          <Field
            label="Telefone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={values.phone}
            error={errorFor("phone")}
            onChange={(v) => setField("phone", v)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          />
          <Field
            label="CPF ou CNPJ"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            value={values.cpfCnpj}
            error={errorFor("cpfCnpj")}
            onChange={(v) => setField("cpfCnpj", v)}
            onBlur={() => setTouched((t) => ({ ...t, cpfCnpj: true }))}
          />
        </div>
      </div>

      <div>
        <p className="section-label mb-4" style={{ color: "var(--color-pedra)" }}>
          3 — Pagamento
        </p>
        <div className="flex flex-col gap-4">
          <PaymentMethodSelector method={method} cycle={cycle} onChange={setMethodPref} />
          {isCard ? (
            <CreditCardForm
              values={card}
              errorFor={cardErrorFor}
              onChange={setCardField}
              onBlur={(k) => setCardTouched((t) => ({ ...t, [k]: true }))}
            />
          ) : (
            <p
              className="text-fine text-pedra rounded-card p-3"
              style={{ backgroundColor: "var(--color-terra-50)" }}
            >
              Geramos um QR Code Pix com o valor anual após você finalizar. A
              assinatura é renovada anualmente com um novo Pix.
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 shrink-0 accent-[var(--color-floresta)]"
            checked={acceptTerms}
            onChange={(e) => {
              setAcceptTerms(e.target.checked);
              setTermsTouched(true);
            }}
          />
          <span className="text-caption text-carvao">
            Li e aceito os{" "}
            <a href="/termos" className="link-under" style={{ color: "var(--color-floresta)" }}>
              Termos de Uso
            </a>{" "}
            e a{" "}
            <a href="/privacidade" className="link-under" style={{ color: "var(--color-floresta)" }}>
              Política de Privacidade
            </a>
          </span>
        </label>
        {termsTouched && !acceptTerms && (
          <p className="text-fine mt-1" style={{ color: "var(--color-erro)" }}>
            Você precisa aceitar os termos para continuar
          </p>
        )}
      </div>

      {serverError && (
        <p
          className="text-caption rounded-card p-3"
          style={{ color: "var(--color-erro)", backgroundColor: "var(--color-terra-50)" }}
        >
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 text-center rounded-button text-body font-medium text-nevoa transition-colors duration-200 disabled:opacity-60"
        style={{ backgroundColor: "var(--color-floresta)" }}
      >
        {submitting
          ? "Processando…"
          : isCard
          ? "Pagar e assinar"
          : "Gerar Pix e finalizar"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  error,
  onChange,
  onBlur,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  error: string | null;
  onChange: (v: string) => void;
  onBlur: () => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-caption text-carvao mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        className="w-full px-4 py-3 rounded-input border bg-white text-body text-carvao outline-none transition-colors"
        style={{
          borderColor: error ? "var(--color-erro)" : "var(--color-linho)",
        }}
      />
      {error && (
        <p className="text-fine mt-1" style={{ color: "var(--color-erro)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
