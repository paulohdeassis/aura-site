import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { parsePlanCode } from "@/lib/checkout/catalog";

// A página lê searchParams (?plano=...), logo é dinâmica por request. Sem isto,
// o Next tenta prerenderizá-la estaticamente e o worker de build crasha no
// Windows/Turbopack — deploy sem output → 404 em todas as rotas na Vercel.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Montar assinatura — Aura for Stay",
  description:
    "Escolha o plano e os adicionais e monte sua assinatura da Aura for Stay.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { plano } = await searchParams;
  const initialPlan =
    parsePlanCode(typeof plano === "string" ? plano : undefined) ?? "CORE";

  return <CheckoutClient initialPlan={initialPlan} />;
}
