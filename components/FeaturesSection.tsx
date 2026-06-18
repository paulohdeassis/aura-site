"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type FeatureImage = {
  number: string;
  image: string;
  imageAlt: string;
  objectPosition?: string;
  aspectRatio?: string;
  bgColor?: string;
};

const featureImages: FeatureImage[] = [
  {
    number: "01",
    image: "/images/financeiro-aura.png",
    imageAlt: "Módulo financeiro no sistema Aura",
    objectPosition: "left center",
    aspectRatio: "16/9",
    bgColor: "#ffffff",
  },
  {
    number: "02",
    image: "/images/glamping-walkway.jpg",
    imageAlt: "Passarela de glamping entre as cabines",
    aspectRatio: "16/9",
  },
  {
    number: "03",
    image: "/images/servicos-aura-v2.png",
    imageAlt: "Módulo de serviços no sistema Aura",
    objectPosition: "left center",
    aspectRatio: "16/9",
    bgColor: "#ffffff",
  },
  {
    number: "04",
    image: "/images/cabin-interior.png",
    imageAlt: "Interior aconchegante de uma hospedagem",
    aspectRatio: "16/9",
  },
];

export default function FeaturesSection() {
  const { t } = useLanguage();

  return (
    <section id="funcionalidades" className="bg-floresta">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">

          {/* ── Esquerda: fixa (sticky) ── */}
          <div
            className="
              lg:sticky lg:top-0 lg:h-screen
              lg:w-[38%] xl:w-[36%] shrink-0
              flex flex-col justify-center
              px-5 md:px-8 lg:pl-12 xl:pl-16 lg:pr-10
              py-20 lg:py-0
            "
          >
            <p
              className="section-label mb-6"
              style={{ color: "rgba(245,241,236,0.5)" }}
            >
              {t.features.sectionLabel}
            </p>
            <h2
              className="font-display text-title mb-5"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-dourado)" }}
            >
              {t.features.headline}
            </h2>
            <p
              className="text-body"
              style={{ color: "rgba(245,241,236,0.65)" }}
            >
              {t.features.sub}
            </p>

            {/* Indicador de scroll — só desktop */}
            <div className="hidden lg:flex items-center gap-3 mt-14">
              <div className="flex flex-col items-center gap-1">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "rgba(245,241,236,0.5)" }} />
                <div className="w-px h-8 rounded-full" style={{ backgroundColor: "rgba(245,241,236,0.15)" }} />
              </div>
              <span
                className="text-fine tracking-aura"
                style={{ color: "rgba(245,241,236,0.35)" }}
              >
                {t.features.scrollHint}
              </span>
            </div>
          </div>

          {/* ── Direita: rolável ── */}
          <div
            className="lg:w-[62%] xl:w-[64%] border-t lg:border-t-0 lg:border-l"
            style={{ borderColor: "rgba(245,241,236,0.12)" }}
          >
            {/* Itens de funcionalidade */}
            {t.features.items.map((f, idx) => {
              const layout = featureImages[idx];
              return (
                <div
                  key={layout.number}
                  className="px-5 md:px-8 lg:px-12 xl:px-16 py-16 md:py-20 border-b"
                  style={{ borderColor: "rgba(245,241,236,0.12)" }}
                >
                  {/* Número + tag */}
                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className="font-mono text-fine font-medium tabular-nums"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "rgba(245,241,236,0.3)",
                      }}
                    >
                      {layout.number}
                    </span>
                    <span
                      className="section-label"
                      style={{ color: "rgba(245,241,236,0.5)" }}
                    >
                      {f.tag}
                    </span>
                  </div>

                  {/* Título */}
                  <h3
                    className="font-display text-section mb-4"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-dourado)" }}
                  >
                    {f.title}
                  </h3>

                  {/* Descrição */}
                  <p
                    className="text-body mb-5 max-w-lg"
                    style={{ color: "rgba(245,241,236,0.7)" }}
                  >
                    {f.desc}
                  </p>

                  {/* Detalhe (chips) */}
                  <p
                    className="text-fine font-medium tracking-aura"
                    style={{ color: "rgba(245,241,236,0.4)" }}
                  >
                    {f.detail}
                  </p>

                  {/* Imagem */}
                  <div
                    className="mt-8 rounded-card overflow-hidden shadow-elevated"
                    style={{ backgroundColor: layout.bgColor ?? "transparent" }}
                  >
                    <div
                      className="relative"
                      style={{ aspectRatio: layout.aspectRatio ?? "4/3" }}
                    >
                      <Image
                        src={layout.image}
                        alt={layout.imageAlt}
                        fill
                        className="object-cover"
                        style={{ objectPosition: layout.objectPosition ?? "center" }}
                        sizes="(max-width: 1024px) 100vw, 62vw"
                      />
                      {!layout.bgColor && (
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(61,90,76,0.08) 0%, transparent 60%)",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Extranet callout */}
            <div className="px-5 md:px-8 lg:px-12 xl:px-16 py-16 md:py-20">
              <div
                className="p-8 md:p-10 rounded-card"
                style={{
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 32px rgba(30,45,37,0.12)",
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
                      {t.features.extranet.detail}
                    </span>
                  </div>
                  <h3
                    className="font-display text-card md:text-section text-carvao"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {t.features.extranet.title}
                  </h3>
                  <p className="text-body text-pedra max-w-lg">
                    {t.features.extranet.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
