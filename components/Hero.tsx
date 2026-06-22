"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();
  const h = t.hero;

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden grain">
      {/* Background image */}
      <Image
        src="/images/capa-site.webp"
        alt={h.heroAlt}
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(30,45,37,0.42) 0%, rgba(30,45,37,0.30) 40%, rgba(30,45,37,0.80) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-5 md:px-8 lg:px-12 pb-16 md:pb-20 lg:pb-24 w-full">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6 anim-fade">
          <span className="text-nevoa text-fine tracking-aura font-medium uppercase">
            {h.eyebrow}
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-display text-hero text-nevoa max-w-3xl mb-6 anim-fade-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {h.headlineLine1}
          <br />
          {h.headlineLine2}{" "}
          <em className="italic text-dourado" style={{ fontStyle: "italic" }}>
            {h.headlineAccent}
          </em>
        </h1>

        {/* Subheadline */}
        <p
          className="text-nevoa/75 text-body max-w-lg mb-10 anim-fade-2"
          style={{ lineHeight: "1.7" }}
        >
          {h.sub}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-14 anim-fade-3 flex-wrap">
          <a
            href="#planos"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-nevoa text-carvao text-body font-medium rounded-button hover:bg-linho transition-colors duration-200"
          >
            {h.ctaPrimary}
          </a>
          <a
            href="#funcionalidades"
            className="inline-flex items-center justify-center px-7 py-3.5 border border-nevoa/30 text-nevoa text-body font-medium rounded-button hover:border-nevoa/60 hover:bg-nevoa/10 transition-all duration-200"
          >
            {h.ctaSecondary}
          </a>
        </div>

        {/* Tagline bar */}
        <div
          className="pt-8 border-t anim-fade-4"
          style={{ borderColor: "rgba(245,241,236,0.15)" }}
        >
          <p
            className="font-display italic text-nevoa/80 text-body"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            {h.statsTagline}
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center anim-fade-4">
        <div className="scroll-track">
          <div className="scroll-dot" />
        </div>
      </div>
    </section>
  );
}
