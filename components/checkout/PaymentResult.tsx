"use client";

import { useState } from "react";
import { CheckoutResponse, ChargeResult } from "@/lib/checkout/api-types";

interface Props {
  result: CheckoutResponse;
  onEdit: () => void;
}

const PAID_STATUSES = new Set(["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"]);

const formatReais = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function PaymentResult({ result, onEdit }: Props) {
  const isPix = result.method === "PIX";
  const planCharge = result.charges.find((c) => c.kind === "plan");
  const cardApproved =
    !isPix && planCharge && PAID_STATUSES.has(planCharge.status);

  return (
    <div className="max-w-xl mx-auto">
      <div
        className="rounded-card p-8 shadow-card"
        style={{ backgroundColor: "#ffffff", border: "1px solid var(--color-linho)" }}
      >
        <p className="section-label mb-2" style={{ color: "var(--color-sucesso)" }}>
          {isPix ? "Pix gerado" : cardApproved ? "Pagamento aprovado" : "Pagamento em processamento"}
        </p>
        <h1
          className="font-display text-section text-carvao mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {isPix
            ? "Quase lá — pague o Pix para ativar"
            : cardApproved
            ? "Assinatura ativada!"
            : "Recebemos seu pedido"}
        </h1>
        <p className="text-caption text-pedra mb-6">
          {isPix
            ? "Escaneie o QR Code ou copie o código abaixo. A assinatura é ativada assim que o pagamento for confirmado."
            : "Você receberá a confirmação no email cadastrado."}
        </p>

        <div className="flex flex-col gap-5">
          {result.charges.map((charge) => (
            <ChargeBlock key={charge.code} charge={charge} isPix={isPix} />
          ))}
        </div>

        {result.ownerIsExistingUser && (
          <p
            className="text-fine rounded-card p-3 mt-5"
            style={{ color: "var(--color-carvao)", backgroundColor: "var(--color-terra-50)" }}
          >
            Este email já tem uma conta na Aura — esta organização será adicionada
            à sua conta existente.
          </p>
        )}

        <div
          className="rounded-card p-4 mt-6 text-fine text-pedra"
          style={{ backgroundColor: "var(--color-terra-50)" }}
        >
          <div className="flex justify-between gap-3">
            <span>Pedido</span>
            <span className="font-mono" style={{ fontFamily: "var(--font-mono)" }}>
              {result.intentId}
            </span>
          </div>
          <div className="flex justify-between gap-3 mt-1">
            <span>Cliente</span>
            <span className="font-mono" style={{ fontFamily: "var(--font-mono)" }}>
              {result.customerId}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="w-full py-3 rounded-button border text-body font-medium text-carvao transition-colors hover:bg-[var(--color-terra-50)] mt-6"
          style={{ borderColor: "var(--color-linho)" }}
        >
          Voltar e editar pedido
        </button>
      </div>
    </div>
  );
}

function ChargeBlock({ charge, isPix }: { charge: ChargeResult; isPix: boolean }) {
  const title = charge.kind === "fee" ? `${charge.label} (taxa única)` : charge.label;

  return (
    <div
      className="rounded-card p-5"
      style={{ border: "1px solid var(--color-linho)" }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <span className="text-body font-medium text-carvao">{title}</span>
        <span
          className="font-mono text-body font-medium text-carvao"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatReais(charge.value)}
        </span>
      </div>

      {isPix && charge.pix ? (
        <PixBlock
          encodedImage={charge.pix.encodedImage}
          payload={charge.pix.payload}
        />
      ) : (
        <p className="text-fine text-pedra">
          Status: <span className="font-medium text-carvao">{charge.status}</span>
        </p>
      )}
    </div>
  );
}

function PixBlock({ encodedImage, payload }: { encodedImage: string; payload: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível — o usuário pode copiar manualmente do campo.
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {encodedImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`data:image/png;base64,${encodedImage}`}
          alt="QR Code Pix"
          width={180}
          height={180}
          className="rounded-card"
          style={{ border: "1px solid var(--color-linho)" }}
        />
      )}
      <div className="w-full">
        <p className="text-fine text-pedra mb-1.5">Pix copia e cola</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={payload}
            className="flex-1 px-3 py-2 rounded-input border bg-white text-fine text-carvao font-mono outline-none"
            style={{ fontFamily: "var(--font-mono)", borderColor: "var(--color-linho)" }}
          />
          <button
            type="button"
            onClick={copy}
            className="px-4 py-2 rounded-button text-caption font-medium text-nevoa shrink-0"
            style={{ backgroundColor: "var(--color-floresta)" }}
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}
