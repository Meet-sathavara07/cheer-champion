import EnglishFlag from "@/assets/flags/english.svg";
import SpanishFlag from "@/assets/flags/spanish.svg";
import HindiFlag from "@/assets/flags/hindi.svg";

export type Language = {
  value: string;
  label: string;
};

export const languages: Language[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "hi", label: "हिन्दी" },
];

export const flags: any = {
  en: EnglishFlag,
  es: SpanishFlag,
  hi: HindiFlag,
};
