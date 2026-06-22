"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { translations, Lang, Translations } from "./translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "pt",
  setLang: () => {},
  t: translations["pt"],
});

const SUPPORTED: Lang[] = ["pt", "en", "es"];

// Maps a browser language tag (e.g. "en-US", "es-419") to a supported Lang.
function detectBrowserLang(): Lang | null {
  if (typeof navigator === "undefined") return null;
  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean);
  for (const tag of candidates) {
    const base = tag.toLowerCase().split("-")[0] as Lang;
    if (SUPPORTED.includes(base)) return base;
  }
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  // Resolve initial language on mount: a forced choice wins, otherwise we
  // fall back to the browser's preferred language, then to pt. Reading
  // localStorage/navigator must happen client-side, so an effect is correct.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = localStorage.getItem("aura-lang") as Lang | null;
    if (saved && SUPPORTED.includes(saved)) {
      setLangState(saved);
      return;
    }
    const detected = detectBrowserLang();
    if (detected) {
      setLangState(detected);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Sync html[lang] attribute for accessibility
  useEffect(() => {
    const langMap: Record<Lang, string> = {
      pt: "pt-BR",
      en: "en",
      es: "es",
    };
    document.documentElement.lang = langMap[lang];
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("aura-lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] as Translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
