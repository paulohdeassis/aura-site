"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PainSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-nevoa py-20 md:py-28 lg:py-36" id="problema">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        {/* Label */}
        <p className="section-label mb-10 md:mb-14">{t.pain.sectionLabel}</p>

        {/* Headline */}
        <h2
          className="font-display text-title text-carvao max-w-2xl mb-14 md:mb-20"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t.pain.headline}
          <span className="text-pedra"> {t.pain.sub}</span>
        </h2>

        {/* Pain list */}
        <div className="flex flex-col divide-y divide-linho">
          {t.pain.items.map((pain, i) => (
            <div
              key={i}
              className="group py-7 md:py-8 flex items-start gap-5 md:gap-8"
            >
              {/* Number */}
              <span
                className="shrink-0 mt-1 text-fine text-linho font-mono font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                0{i + 1}
              </span>
              {/* Text */}
              <p
                className="font-display text-card md:text-section text-carvao/80 group-hover:text-carvao transition-colors duration-300 italic"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                {pain}
              </p>
            </div>
          ))}
        </div>

        {/* Bridge to solution */}
        <div className="mt-16 md:mt-20 max-w-xl">
          <p className="text-body text-pedra">
            {t.pain.closing1}
          </p>
          <p className="text-body text-pedra mt-4">
            {t.pain.closing2}
          </p>
        </div>
      </div>
    </section>
  );
}
