"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TestimonialsSection() {
  const { t } = useLanguage();

  return (
    <section
      className="py-20 md:py-28 lg:py-36 grain"
      style={{ backgroundColor: "var(--color-carvao)" }}
      id="depoimentos"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <p className="section-label mb-6" style={{ color: "rgba(245,241,236,0.4)" }}>
            {t.testimonials.sectionLabel}
          </p>
          <h2
            className="font-display text-title max-w-xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-nevoa)" }}
          >
            {t.testimonials.headline}{" "}
            <span style={{ color: "rgba(212,200,184,0.7)" }}>{t.testimonials.headlineAccent}</span>
          </h2>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.testimonials.items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col rounded-card p-7 md:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated cursor-default"
              style={{ backgroundColor: "#ffffff" }}
            >
              {/* Quote mark */}
              <span
                className="font-display text-[3.5rem] leading-none mb-4 select-none"
                style={{ color: "var(--color-dourado)", fontFamily: "var(--font-display)" }}
                aria-hidden="true"
              >
                &ldquo;
              </span>

              {/* Quote */}
              <blockquote
                className="font-display italic flex-1 mb-6"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  color: "var(--color-carvao)",
                  fontSize: "1.05rem",
                  lineHeight: 1.55,
                }}
              >
                {item.quote}
              </blockquote>

              {/* Author */}
              <div className="border-t pt-5" style={{ borderColor: "var(--color-linho)" }}>
                <p className="text-body font-medium" style={{ color: "var(--color-carvao)" }}>
                  {item.name}
                </p>
                <p className="text-caption" style={{ color: "var(--color-pedra)" }}>
                  {item.role} · {item.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
