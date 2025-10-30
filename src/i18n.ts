"use client";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./languages/english";
import { es } from "./languages/spanish";
// import { zh } from "./languages/chinese";
import { hi } from "./languages/hindi";

export const initI18n = () => {
i18n
//   .use(i18nBackend)
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en:en,
      es:es,
      // zh:zh,
      hi:hi,
    },
  });

  return i18n;
};