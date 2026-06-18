"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

const rowData: { aura: boolean | string; hospedin: boolean | string; stays: boolean | string }[] = [
  { aura: true,           hospedin: true,             stays: true },
  { aura: "+ R$ 97/mês",  hospedin: "módulo extra",   stays: "cobrado por reserva" },
  { aura: true,           hospedin: false,             stays: false },
  { aura: true,           hospedin: false,             stays: false },
  { aura: true,           hospedin: true,              stays: true },
  { aura: true,           hospedin: true,              stays: true },
  { aura: true,           hospedin: false,             stays: true },
  { aura: true,           hospedin: true,              stays: true },
  { aura: "Não",          hospedin: "Consultar",       stays: "Consultar" },
];

function Cell({ value, isAura = false }: { value: boolean | string; isAura?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Sim">
          <path d="M4 10l4 4 8-8" stroke="var(--color-sucesso)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    ) : (
      <span className="inline-flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Não">
          <path d="M6 6l8 8M14 6l-8 8" stroke="var(--color-linho)" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </span>
    );
  }
  return (
    <span
      className="text-caption font-medium"
      style={{
        fontFamily: value.startsWith("+") ? "var(--font-mono)" : undefined,
        color: isAura ? "var(--color-floresta)" : "var(--color-pedra)",
      }}
    >
      {value}
    </span>
  );
}

export default function ComparisonSection() {
  const { t } = useLanguage();
  const isLast = (i: number) => i === rowData.length - 1;

  return (
    <section className="bg-nevoa py-20 md:py-28 lg:py-36" id="comparativo">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <p className="section-label mb-6">{t.comparison.sectionLabel}</p>
          <h2
            className="font-display text-title text-carvao max-w-2xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.comparison.headline}{" "}
            <span className="text-pedra">
              {t.comparison.headlineSub}
            </span>
          </h2>
        </div>

        {/* Table wrapper — horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
          <table className="w-full min-w-[580px] border-collapse">
            <thead>
              <tr>
                {/* Feature column header — sticky */}
                <th
                  className="sticky left-0 z-10 text-left pb-4 pr-4 text-fine text-pedra font-medium tracking-aura uppercase w-[220px]"
                  style={{ backgroundColor: "var(--color-nevoa)" }}
                >
                  {t.comparison.colFeature}
                </th>
                {/* Aura column — highlighted */}
                <th
                  className="text-center pb-4 px-4 text-caption font-medium rounded-t-card w-[140px]"
                  style={{
                    backgroundColor: "var(--color-floresta-50)",
                    color: "var(--color-floresta)",
                  }}
                >
                  Aura
                </th>
                <th className="text-center pb-4 px-4 text-caption text-pedra font-medium w-[140px]">
                  Hospedin
                </th>
                <th className="text-center pb-4 px-4 text-caption text-pedra font-medium w-[140px]">
                  Stays.net
                </th>
              </tr>
            </thead>
            <tbody>
              {rowData.map((row, i) => (
                <tr
                  key={i}
                  className="border-t"
                  style={{ borderColor: "var(--color-linho)" }}
                >
                  {/* Feature label — sticky */}
                  <td
                    className="sticky left-0 z-10 py-4 pr-4 text-caption text-carvao"
                    style={{ backgroundColor: "var(--color-nevoa)" }}
                  >
                    {t.comparison.features[i]}
                  </td>
                  {/* Aura column — highlighted, rounded bottom on last row */}
                  <td
                    className={`py-4 px-4 text-center ${isLast(i) ? "rounded-b-card" : ""}`}
                    style={{ backgroundColor: "var(--color-floresta-50)" }}
                  >
                    <Cell value={row.aura} isAura />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Cell value={row.hospedin} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Cell value={row.stays} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footnote */}
        <p className="text-fine text-pedra mt-6">
          {t.comparison.footnote}
        </p>
      </div>
    </section>
  );
}
