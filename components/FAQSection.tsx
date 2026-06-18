"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function FAQItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div className="border-t" style={{ borderColor: "var(--color-linho)" }}>
      <button
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        onClick={onClick}
        aria-expanded={open}
      >
        <span className="text-body font-medium text-carvao group-hover:text-floresta transition-colors duration-200">
          {q}
        </span>
        <span
          className="shrink-0 mt-1 flex items-center justify-center w-5 h-5 text-pedra group-hover:text-floresta transition-all duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
      </button>

      <div
        className="overflow-hidden"
        style={{
          maxHeight: open ? "2000px" : "0px",
          opacity: open ? 1 : 0,
          transition: "max-height 350ms ease-out, opacity 220ms ease",
        }}
      >
        <p className="text-body text-pedra pb-6 max-w-2xl">{a}</p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-nevoa py-20 md:py-28 lg:py-36" id="faq">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left: header */}
          <div className="lg:w-1/3 shrink-0">
            <p className="section-label mb-6">{t.faq.sectionLabel}</p>
            <h2
              className="font-display text-section text-carvao mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.faq.headline}
              <span className="text-pedra"> {t.faq.headlineAccent}</span>
            </h2>
            <p className="text-body text-pedra mb-6">
              {t.faq.teamNote}
            </p>
            <a
              href="#falar"
              className="inline-flex items-center gap-2 text-body font-medium text-floresta link-under"
            >
              {t.faq.teamLink}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          {/* Right: FAQ items */}
          <div className="flex-1">
            {t.faq.items.map((faq, i) => (
              <FAQItem
                key={i}
                q={faq.q}
                a={faq.a}
                open={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
            <div className="border-t" style={{ borderColor: "var(--color-linho)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
