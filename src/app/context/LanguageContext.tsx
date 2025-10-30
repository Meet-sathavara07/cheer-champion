"use client";
import { languages } from "@/helpers/constants";
import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { initI18n } from "@/i18n";
initI18n();

export type Language = {
  value: string;
  label: string;
};

type LanguageContextType = {
  selectedLanguage: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const defaultLang = languages.find((l) => l.value === i18n.language) || languages[0];
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(defaultLang);

  useEffect(() => {
    const storedLang = localStorage.getItem("language");
    if (storedLang) {
      const lang = languages.find((l) => l.value === storedLang);
      if (lang) {
        setSelectedLanguage(lang);
        i18n.changeLanguage(lang.value);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang.value);
    localStorage.setItem("language", lang.value);
  };

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};