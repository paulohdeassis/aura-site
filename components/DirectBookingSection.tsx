"use client";

import Image from "next/image";
import { useRef, useState, useEffect, type CSSProperties } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Reveal from "./Reveal";

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useCounterAnimation(
  target: number,
  duration: number,
  active: boolean,
  startDelay = 0
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf: number;
    let start: number | null = null;

    function tick(now: number) {
      if (start === null) start = now + startDelay;
      const elapsed = now - start;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(easeOut(progress) * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration, startDelay]);

  return value;
}

export default function DirectBookingSection() {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // OTA breakdown reveals first; the Aura comparison lands a beat later.
  const DURATION = 1300;
  const AURA_DELAY = 380;
  const otaValue    = useCounterAnimation(425, DURATION, animated);
  const feeValue    = useCounterAnimation(75,  DURATION, animated);
  const directValue = useCounterAnimation(500, DURATION, animated, AURA_DELAY);

  // Fee share is constant across the animation (both values share one easing),
  // so derive it from the targets to avoid a flickering 0% at the start.
  const feePercent = Math.round((75 / 500) * 100);

  // Bars grow via scaleX (GPU-composited, no layout) matching the counters.
  const barEase = "cubic-bezier(0.33, 1, 0.68, 1)";
  const otaFill: CSSProperties = {
    transformOrigin: "left",
    transform: animated ? "scaleX(0.85)" : "scaleX(0)",
    transition: animated ? `transform ${DURATION}ms ${barEase}` : "none",
  };
  const directFill: CSSProperties = {
    transformOrigin: "left",
    transform: animated ? "scaleX(1)" : "scaleX(0)",
    transition: animated
      ? `transform ${DURATION}ms ${barEase} ${AURA_DELAY}ms`
      : "none",
  };

  return (
    <section
      className="relative overflow-hidden grain py-20 md:py-28 lg:py-36"
      style={{ backgroundColor: "var(--color-carvao)" }}
    >
      {/* Background image subtle */}
      <Image
        src="/images/countryside.jpg"
        alt=""
        fill
        className="object-cover object-center opacity-20"
        style={{ filter: "brightness(0.7)" }}
        sizes="100vw"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-20">

          {/* Left: Headline + copy */}
          <div className="flex-1 max-w-xl">
            <p className="section-label mb-6" style={{ color: "rgba(245,241,236,0.74)" }}>
              {t.directBooking.sectionLabel}
            </p>
            <h2
              className="font-display text-title text-nevoa mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.directBooking.headline}{" "}
              <em className="italic" style={{ color: "var(--color-dourado)" }}>
                {t.directBooking.headlineAccent}
              </em>
            </h2>
            <p className="text-body mb-8" style={{ color: "rgba(245,241,236,0.75)" }}>
              {t.directBooking.sub}
            </p>
            <a
              href="#planos"
              className="inline-flex items-center gap-2 text-body font-medium link-under"
              style={{ color: "var(--color-dourado)" }}
            >
              {t.directBooking.pill}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          {/* Right: Financial breakdown */}
          <div className="flex-1 max-w-md">
            {/* Calculation card */}
            <div
              ref={cardRef}
              className="rounded-card p-7 md:p-8"
              style={{ backgroundColor: "#ffffff", boxShadow: "0 4px 32px rgba(0,0,0,0.18)" }}
            >
              <p className="text-fine tracking-aura mb-6" style={{ color: "var(--color-pedra)" }}>
                {t.directBooking.cardHeader}
              </p>

              {/* Via OTA */}
              <div className="mb-6">
                <p className="text-caption font-medium mb-3" style={{ color: "var(--color-pedra)" }}>
                  {t.directBooking.otaLabel}
                </p>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-caption" style={{ color: "var(--color-pedra)" }}>{t.directBooking.forYou}</span>
                  <span
                    className="font-mono text-card font-medium"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-carvao)" }}
                  >
                    R$ {otaValue}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-caption" style={{ color: "var(--color-pedra)" }}>{t.directBooking.forOta}</span>
                  <span
                    className="font-mono text-caption font-medium"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-pedra)" }}
                  >
                    R$ {feeValue} ({feePercent}%)
                  </span>
                </div>
                <div
                  className="mt-4 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--color-linho)" }}
                >
                  <div
                    className="h-full w-full rounded-full"
                    style={{
                      ...otaFill,
                      background:
                        "linear-gradient(90deg, var(--color-musgo), var(--color-floresta-400))",
                    }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t mb-6" style={{ borderColor: "var(--color-linho)" }} />

              {/* Via Aura */}
              <div>
                <p className="text-caption font-medium mb-3" style={{ color: "var(--color-pedra)" }}>
                  {t.directBooking.directLabel}
                </p>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-caption" style={{ color: "var(--color-pedra)" }}>{t.directBooking.forYou}</span>
                  <span
                    className="font-mono text-card font-medium"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-floresta)" }}
                  >
                    R$ {directValue}
                  </span>
                </div>
                <div
                  className="mt-4 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--color-linho)" }}
                >
                  <div
                    className="h-full w-full rounded-full"
                    style={{
                      ...directFill,
                      background:
                        "linear-gradient(90deg, var(--color-dourado), var(--color-madeira))",
                    }}
                  />
                </div>
              </div>

              {/* Insight */}
              <div
                className="mt-8 p-4 rounded-button"
                style={{ backgroundColor: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.25)" }}
              >
                <p className="text-caption font-medium" style={{ color: "var(--color-floresta)" }}>
                  {t.directBooking.insight}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Extranet callout */}
        <Reveal
          className="mt-12 lg:mt-16 p-8 md:p-10 rounded-card"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="section-label">Exclusivo Aura</span>
              <span
                className="inline-block px-3 py-1 rounded-full text-fine font-medium"
                style={{
                  backgroundColor: "var(--color-floresta)",
                  color: "#ffffff",
                }}
              >
                {t.directBooking.extranet.detail}
              </span>
            </div>
            <h3
              className="font-display text-card md:text-section text-carvao"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.directBooking.extranet.title}
            </h3>
            <p className="text-body text-pedra max-w-lg">
              {t.directBooking.extranet.desc}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
