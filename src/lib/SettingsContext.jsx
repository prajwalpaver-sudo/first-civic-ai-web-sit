import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translate } from "@/lib/i18n";

const SettingsCtx = createContext(null);

const LS = {
  lang: "js_lang",
  theme: "js_theme",
  big: "js_big",
};

export function SettingsProvider({ children }) {
  const [lang, setLangState] = useState("en");
  const [theme, setTheme] = useState("light");
  const [big, setBig] = useState(false);
  const [ready, setReady] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  useEffect(() => {
    const storedLang = localStorage.getItem(LS.lang);
    const storedTheme = localStorage.getItem(LS.theme);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const storedBig = localStorage.getItem(LS.big) === "1";

    if (storedLang) setLangState(storedLang);
    else setShowLangPicker(true);
    setTheme(storedTheme || (prefersDark ? "dark" : "light"));
    setBig(storedBig);
    setReady(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    if (ready) localStorage.setItem(LS.theme, theme);
  }, [theme, ready]);

  useEffect(() => {
    document.documentElement.style.fontSize = big ? "18.5px" : "16px";
    if (ready) localStorage.setItem(LS.big, big ? "1" : "0");
  }, [big, ready]);

  const setLang = useCallback((code) => {
    setLangState(code);
    localStorage.setItem(LS.lang, code);
    setShowLangPicker(false);
  }, []);

  // Closing the picker keeps the current language and stops it reappearing.
  const closeLangPicker = useCallback(() => {
    setLangState((current) => {
      localStorage.setItem(LS.lang, current);
      return current;
    });
    setShowLangPicker(false);
  }, []);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      theme,
      setTheme,
      toggleTheme: () => setTheme((v) => (v === "dark" ? "light" : "dark")),
      big,
      toggleBig: () => setBig((v) => !v),
      ready,
      showLangPicker,
      openLangPicker: () => setShowLangPicker(true),
      closeLangPicker,
    }),
    [lang, setLang, closeLangPicker, t, theme, big, ready, showLangPicker]
  );

  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}