"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{ backgroundColor: "var(--color-carvao)" }}>
      <style>{`
        .footer-link { color: rgba(212,200,184,0.72); transition: color 200ms ease; }
        .footer-link:hover { color: rgba(245,241,236,0.95); }
        .footer-legal { color: rgba(212,200,184,0.7); transition: color 200ms ease; }
        .footer-legal:hover { color: rgba(245,241,236,0.9); }
      `}</style>

      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12 pt-14 md:pt-16 pb-8">
        {/* Top row */}
        <div
          className="flex flex-col lg:flex-row gap-12 lg:gap-20 pb-12 border-b"
          style={{ borderColor: "rgba(212,200,184,0.1)" }}
        >
          {/* Brand */}
          <div className="lg:w-64 shrink-0">
            <div className="mb-4">
              <p
                className="font-display text-lg font-light logo-tracking"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-nevoa)" }}
              >
                AURA<em style={{ fontStyle: "italic" }}> for </em>STAY
              </p>
              <p className="text-fine tracking-aura mt-1" style={{ color: "rgba(212,200,184,0.7)" }}>
                {t.footer.tagline}
              </p>
            </div>
            <p className="text-caption" style={{ color: "rgba(212,200,184,0.72)", lineHeight: 1.7 }}>
              {t.footer.desc}
            </p>
          </div>

          {/* Links */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
            {t.footer.categories.map((category, idx) => (
              <div key={category}>
                <p
                  className="text-fine font-medium tracking-aura uppercase mb-5"
                  style={{ color: "rgba(212,200,184,0.7)" }}
                >
                  {category}
                </p>
                <ul className="flex flex-col gap-3">
                  {t.footer.links[idx].map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="footer-link text-caption">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-7">
          <p className="text-fine footer-legal">
            {t.footer.legal}
          </p>
        </div>
      </div>
    </footer>
  );
}
