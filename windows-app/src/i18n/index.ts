import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import de from "./locales/de.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import pt from "./locales/pt.json";
import zh from "./locales/zh.json";

export const languages = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "pt", name: "Português" },
  { code: "zh", name: "简体中文" },
] as const;

const savedLanguage = localStorage.getItem("app-language") ?? "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
    es: { translation: es },
    fr: { translation: fr },
    it: { translation: it },
    ja: { translation: ja },
    ko: { translation: ko },
    pt: { translation: pt },
    zh: { translation: zh },
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function changeLanguage(code: string) {
  localStorage.setItem("app-language", code);
  i18n.changeLanguage(code);
}

export default i18n;
