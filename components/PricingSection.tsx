"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PLANS } from "@/lib/checkout/catalog";

// Os nomes dos planos ("Start"/"Core"/"Max") são fixos nas 3 línguas, então
// mapeamos nome → code para montar o link de checkout com o plano certo.
const planCodeByName = Object.fromEntries(
  PLANS.map((p) => [p.name, p.code])
) as Record<string, string>;

// "Módulos adicionais" ocultos por enquanto (não vamos oferecer Channel Manager,
// Zee.lu e Homio CRM). Trocar para true quando voltarem a ser vendidos.
const SHOW_ADDON_MODULES = false;

export default function PricingSection() {
  const { t } = useLanguage();

  return (
    <section
      className="bg-floresta py-20 md:py-28 lg:py-36"
      id="planos"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-6">
          <p className="section-label mb-6" style={{ color: "rgba(245,241,236,0.55)" }}>{t.pricing.sectionLabel}</p>
          <h2
            className="font-display text-title text-nevoa"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.pricing.headline}
            <span className="text-nevoa/60"> {t.pricing.headlineSub}</span>
          </h2>
        </div>
        <p className="text-body mb-14 md:mb-16 max-w-lg" style={{ color: "rgba(245,241,236,0.7)" }}>
          {t.pricing.sub}
        </p>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch mb-10 md:mb-14">
          {t.pricing.plans.map((plan) => {
            const highlighted = "popular" in plan && plan.popular === true;
            return (
              <div
                key={plan.name}
                className={`flex flex-col rounded-card overflow-hidden transition-shadow duration-300 ${
                  highlighted
                    ? "shadow-elevated animated-border-card"
                    : "shadow-card hover:shadow-card-hover border"
                }`}
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: highlighted ? undefined : "rgba(245,241,236,0.15)",
                }}
              >
                {/* Badge */}
                {highlighted && (
                  <div
                    className="px-6 py-2.5 text-center text-fine font-medium tracking-aura"
                    style={{
                      backgroundColor: "var(--color-carvao)",
                      color: "var(--color-nevoa)",
                    }}
                  >
                    {t.pricing.badgePopular}
                  </div>
                )}

                <div className="p-7 md:p-8 flex flex-col flex-1">
                  {/* Plan name */}
                  <p className="section-label mb-1" style={{ color: "var(--color-pedra)" }}>{plan.tier}</p>
                  <h3
                    className="font-display text-section text-carvao mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mt-5 mb-1">
                    <span className="text-caption text-pedra">R$</span>
                    <span
                      className="font-mono text-carvao font-medium"
                      style={{ fontFamily: "var(--font-mono)", fontSize: "2.5rem", lineHeight: 1 }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-caption text-pedra">{t.pricing.perMonth}</span>
                  </div>

                  {/* Annual price */}
                  {"annualPrice" in plan && plan.annualPrice && (
                    <p className="text-fine mb-4" style={{ color: "var(--color-musgo)", fontFamily: "var(--font-mono)" }}>
                      {plan.annualPrice}
                    </p>
                  )}

                  {/* Tagline */}
                  <p className="text-caption text-pedra mb-6">{plan.desc}</p>

                  {/* Divider */}
                  <div className="border-t mb-6" style={{ borderColor: "var(--color-linho)" }} />

                  {/* Features */}
                  <p className="text-fine text-pedra font-medium tracking-aura mb-3">{t.pricing.included}</p>
                  <ul className="flex flex-col gap-3 flex-1 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-caption text-carvao">
                        <svg
                          className="shrink-0 mt-0.5"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 8l3.5 3.5L13 4"
                            stroke="var(--color-sucesso)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={`/checkout?plano=${(planCodeByName[plan.name] ?? "").toLowerCase()}`}
                    className={`w-full py-3 text-center rounded-button text-body font-medium transition-colors duration-200 ${
                      highlighted
                        ? "text-nevoa"
                        : "border text-carvao hover:bg-linho"
                    }`}
                    style={
                      highlighted
                        ? { backgroundColor: "var(--color-carvao)" }
                        : { borderColor: "var(--color-linho)" }
                    }
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modules — ocultos por enquanto (ver SHOW_ADDON_MODULES) */}
        {SHOW_ADDON_MODULES && (
        <div>
          <p className="section-label mb-6" style={{ color: "rgba(245,241,236,0.55)" }}>{t.pricing.modulesTitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {t.pricing.modules.map((m) => (
              <div
                key={m.name}
                className="rounded-card p-6"
                style={{
                  backgroundColor: "rgba(245,241,236,0.08)",
                  border: "1px solid rgba(245,241,236,0.15)",
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h4 className="text-body font-medium text-nevoa">{m.name}</h4>
                  <span
                    className="font-mono text-caption font-medium shrink-0"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-dourado)" }}
                  >
                    + {m.price}
                  </span>
                </div>
                <p className="text-caption mb-3" style={{ color: "rgba(245,241,236,0.6)" }}>{m.desc}</p>
                <p className="text-fine font-medium tracking-aura" style={{ color: "rgba(245,241,236,0.4)" }}>
                  {t.pricing.availablePlans}{m.available}
                </p>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Onboarding */}
        <div
          className="mt-8 p-6 rounded-card flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ backgroundColor: "rgba(245,241,236,0.08)", border: "1px solid rgba(245,241,236,0.15)" }}
        >
          <div className="flex-1">
            <h4 className="text-body font-medium text-nevoa mb-1">
              {t.pricing.onboardingTitle} <span className="font-normal" style={{ color: "rgba(245,241,236,0.5)" }}>({t.pricing.onboardingNote})</span>
            </h4>
            <p className="text-caption" style={{ color: "rgba(245,241,236,0.6)" }}>
              {t.pricing.onboardingDesc}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span
              className="font-mono text-card font-medium text-nevoa"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {t.pricing.onboardingPrice}
            </span>
            <p className="text-fine" style={{ color: "rgba(245,241,236,0.5)" }}>{t.pricing.onboardingNote}</p>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-caption text-center mt-10" style={{ color: "rgba(245,241,236,0.5)" }}>
          {t.pricing.noCreditCard}
        </p>
      </div>
    </section>
  );
}
