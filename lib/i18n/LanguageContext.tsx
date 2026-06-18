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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("aura-lang") as Lang | null;
    if (saved && ["pt", "en", "es"].includes(saved)) {
      setLangState(saved);
    }
  }, []);

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
