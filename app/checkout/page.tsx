import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { parsePlanCode } from "@/lib/checkout/catalog";

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
