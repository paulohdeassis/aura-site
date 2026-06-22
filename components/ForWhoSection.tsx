"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

const profileIcons = [
  (
    <svg key="profile-icon-0" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 3C10.5 3 7.5 6 7.5 9.5C7.5 13 10.5 16 14 16C17.5 16 20.5 13 20.5 9.5C20.5 6 17.5 3 14 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M4 25C4 20.5 8.5 17 14 17C19.5 17 24 20.5 24 25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  (
    <svg key="profile-icon-1" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3 12h22" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9 3v4M19 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  (
    <svg key="profile-icon-2" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M5 22V10L14 4L23 10V22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="10" y="15" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10 8h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
];

export default function ForWhoSection() {
  const { t } = useLanguage();

  return (
    <section
      className="bg-nevoa py-20 md:py-28 lg:py-36"
      id="para-quem"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <p className="section-label mb-6">{t.forWho.sectionLabel}</p>
          <h2
            className="font-display text-title text-carvao max-w-xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.forWho.headline}
          </h2>
        </div>

        {/* Profile cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {t.forWho.profiles.map((p, i) => (
            <div
              key={i}
              className="flex flex-col rounded-card p-7 md:p-8 border border-linho bg-terra-50 shadow-card hover:shadow-elevated hover:-translate-y-2 hover:bg-carvao hover:border-carvao transition-all duration-300 group cursor-default"
            >
              {/* Icon */}
              <div className="mb-6 text-floresta group-hover:text-nevoa transition-colors duration-300">
                {profileIcons[i]}
              </div>

              {/* Text */}
              <h3
                className="font-display text-card text-carvao group-hover:text-nevoa mb-1 transition-colors duration-300"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {p.title}
              </h3>
              <p className="text-caption text-pedra group-hover:text-nevoa/70 mb-4 transition-colors duration-300">{p.sub}</p>
              <p className="text-body text-pedra group-hover:text-nevoa/70 flex-1 transition-colors duration-300">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-caption text-pedra mt-10 text-center">
          {t.forWho.bottomNote}
        </p>
      </div>
    </section>
  );
}
