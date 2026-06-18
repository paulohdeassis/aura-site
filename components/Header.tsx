"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Lang } from "@/lib/i18n/translations";

const flags: { lang: Lang; code: string; label: string }[] = [
  { lang: "pt", code: "br", label: "Português" },
  { lang: "en", code: "us", label: "English" },
  { lang: "es", code: "es", label: "Español" },
];

function FlagSwitcher({ size = "1.2em", gap = "gap-2" }: { size?: string; gap?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <div className={`flex items-center ${gap}`} role="group" aria-label="Idioma / Language / Idioma">
      {flags.map(({ lang: l, code, label }) => {
        const isActive = lang === l;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-label={label}
            aria-pressed={isActive}
            title={label}
            className="flex items-center justify-center rounded-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
            style={{
              opacity: isActive ? 1 : 0.4,
              boxShadow: isActive ? "0 0 0 1.5px var(--color-floresta)" : "none",
              transform: isActive ? "scale(1.08)" : "scale(1)",
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.opacity = "0.7";
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.opacity = "0.4";
            }}
          >
            <span
              className={`fi fi-${code}`}
              style={{ width: size, borderRadius: "2px", display: "block" }}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

export default function Header() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const firstFocusable = menuRef.current?.querySelector<HTMLElement>("a, button");
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        hamburgerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const navLinks = [
    { href: "#funcionalidades", label: t.nav.features },
    { href: "#planos", label: t.nav.plans },
    { href: "#para-quem", label: t.nav.forWho },
    { href: "#depoimentos", label: t.nav.testimonials },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-nevoa/95 backdrop-blur-md border-b border-linho"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 md:h-18">

            {/* Logo — sem tagline */}
            <Link href="/" className="flex items-center group">
              <span
                className={`font-display text-lg font-light logo-tracking transition-colors duration-300 ${
                  scrolled ? "text-carvao" : "text-nevoa"
                }`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                AURA<em style={{ fontStyle: "italic", letterSpacing: "0.06em" }}> for </em>STAY
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`link-under text-caption font-medium transition-colors duration-200 ${
                    scrolled ? "text-pedra hover:text-carvao" : "text-nevoa/80 hover:text-nevoa"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop right: talk link + flags + CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="#falar"
                className={`text-caption font-medium transition-colors duration-200 ${
                  scrolled ? "text-pedra hover:text-carvao" : "text-nevoa/80 hover:text-nevoa"
                }`}
              >
                {t.nav.talkTeam}
              </a>

              {/* Language flags */}
              <FlagSwitcher size="1.1em" gap="gap-2" />

              <a
                href="#comecar"
                className={`px-4 py-2 text-caption font-medium rounded-button transition-all duration-200 ${
                  scrolled
                    ? "bg-floresta text-nevoa hover:bg-musgo"
                    : "bg-nevoa/15 text-nevoa border border-nevoa/30 hover:bg-nevoa/25"
                }`}
              >
                {t.nav.startNow}
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              ref={hamburgerRef}
              className={`lg:hidden flex flex-col gap-1.5 p-2 -mr-2 transition-colors duration-200 ${
                scrolled ? "text-carvao" : "text-nevoa"
              }`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span
                className={`block w-5 h-px bg-current transition-transform duration-300 origin-center ${
                  menuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`block w-5 h-px bg-current transition-opacity duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-px bg-current transition-transform duration-300 origin-center ${
                  menuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`fixed inset-0 z-40 bg-floresta-900 flex flex-col duration-400 ${
          menuOpen
            ? "opacity-100 pointer-events-auto transition-opacity"
            : "opacity-0 pointer-events-none transition-opacity"
        }`}
      >
        <div className="flex-1 flex flex-col justify-center px-8 gap-8 pt-20">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`menu-link font-display text-title text-nevoa/90 hover:text-nevoa transition-colors duration-200 ${
                menuOpen ? "" : "opacity-0"
              }`}
              style={{ animationDelay: menuOpen ? `${i * 70}ms` : "0ms" }}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="px-8 pb-12 flex flex-col gap-4">
          <a
            href="#comecar"
            onClick={() => setMenuOpen(false)}
            className="menu-link w-full py-4 text-center bg-nevoa text-carvao rounded-button text-body font-medium"
            style={{ animationDelay: menuOpen ? `${navLinks.length * 70}ms` : "0ms" }}
          >
            {t.nav.startNow}
          </a>
          <a
            href="#falar"
            onClick={() => setMenuOpen(false)}
            className="menu-link w-full py-4 text-center border border-nevoa/30 text-nevoa rounded-button text-body font-medium"
            style={{ animationDelay: menuOpen ? `${(navLinks.length + 1) * 70}ms` : "0ms" }}
          >
            {t.nav.talkTeam}
          </a>
          {/* Language flags in mobile menu */}
          <div
            className="menu-link flex justify-center pt-2"
            style={{ animationDelay: menuOpen ? `${(navLinks.length + 2) * 70}ms` : "0ms" }}
          >
            <FlagSwitcher size="1.4em" gap="gap-4" />
          </div>
        </div>
      </div>
    </>
  );
}
