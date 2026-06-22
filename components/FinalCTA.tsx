"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function FinalCTA() {
  const { t } = useLanguage();

  return (
    <section
      className="relative overflow-hidden grain py-24 md:py-32 lg:py-40"
      style={{ backgroundColor: "var(--color-carvao)" }}
      id="comecar"
    >
      {/* Background image */}
      <Image
        src="/images/countryside.jpg"
        alt=""
        fill
        className="object-cover opacity-20"
        style={{ filter: "brightness(0.7)" }}
        sizes="100vw"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 lg:px-12 text-center">
        <p
          className="section-label mb-8"
          style={{ color: "rgba(245,241,236,0.74)" }}
        >
          {t.finalCta.sectionLabel}
        </p>

        <h2
          className="font-display text-hero max-w-3xl mx-auto mb-6"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-nevoa)",
          }}
        >
          {t.finalCta.headline}
        </h2>

        <p
          className="text-section font-display italic max-w-xl mx-auto mb-12"
          style={{
            fontFamily: "var(--font-display)",
            color: "rgba(201,169,110,0.9)",
            fontStyle: "italic",
          }}
        >
          {t.finalCta.sub}
        </p>

        {/* CTA group */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
          <a
            href="#planos"
            className="px-8 py-4 rounded-button text-body font-medium transition-colors duration-200"
            style={{
              backgroundColor: "var(--color-nevoa)",
              color: "var(--color-carvao)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                "var(--color-linho)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                "var(--color-nevoa)";
            }}
          >
            {t.finalCta.ctaPrimary}
          </a>
          <a
            href="#falar"
            className="px-8 py-4 rounded-button text-body font-medium transition-all duration-200"
            style={{
              border: "1px solid rgba(245,241,236,0.2)",
              color: "var(--color-nevoa)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "rgba(245,241,236,0.4)";
              el.style.backgroundColor = "rgba(245,241,236,0.07)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "rgba(245,241,236,0.2)";
              el.style.backgroundColor = "transparent";
            }}
          >
            {t.finalCta.ctaSecondary}
          </a>
        </div>

        <p className="text-fine mb-24" style={{ color: "rgba(212,200,184,0.75)" }}>
          {t.finalCta.noCreditCard}
        </p>

        {/* Bloco de contato — âncora #falar */}
        <div
          id="falar"
          className="max-w-lg mx-auto pt-12 border-t"
          style={{ borderColor: "rgba(212,200,184,0.12)" }}
        >
          <p
            className="text-fine tracking-aura uppercase mb-6"
            style={{ color: "rgba(245,241,236,0.72)" }}
          >
            {t.finalCta.contactTitle}
          </p>
          <p
            className="text-body mb-8"
            style={{ color: "rgba(245,241,236,0.82)", lineHeight: 1.7 }}
          >
            {t.finalCta.contactDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:aurastay.pms@gmail.com"
              className="flex items-center gap-2 px-6 py-3 rounded-button text-caption font-medium transition-all duration-200"
              style={{
                border: "1px solid rgba(245,241,236,0.18)",
                color: "var(--color-nevoa)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "rgba(245,241,236,0.35)";
                el.style.backgroundColor = "rgba(245,241,236,0.06)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "rgba(245,241,236,0.18)";
                el.style.backgroundColor = "transparent";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="2" y="3.5" width="12" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M2 5l6 4.5L14 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              aurastay.pms@gmail.com
            </a>
            <a
              href="https://wa.me/5527988217702"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-button text-caption font-medium transition-all duration-200"
              style={{
                border: "1px solid rgba(245,241,236,0.18)",
                color: "var(--color-nevoa)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "rgba(245,241,236,0.35)";
                el.style.backgroundColor = "rgba(245,241,236,0.06)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "rgba(245,241,236,0.18)";
                el.style.backgroundColor = "transparent";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1.5A6.5 6.5 0 0 0 2.1 11.2L1.5 14.5l3.4-.6A6.5 6.5 0 1 0 8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M5.5 6c.2.4.5.8.8 1.2.4.5.9 1 1.5 1.3.3.1.6 0 .8-.2l.4-.5c.1-.2.4-.2.6-.1l1.3.7c.2.1.3.4.2.6-.3.8-1 1.5-1.8 1.4-1.2-.2-2.7-1.2-3.6-2.5-.6-.8-.7-1.8-.2-2.5.2-.3.5-.4.7-.3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
