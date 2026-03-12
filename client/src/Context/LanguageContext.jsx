// src/context/LanguageContext.jsx
// Wrap your <App /> with <LanguageProvider> in main.jsx or App.jsx
// Then in ANY component: const { lang } = useLanguage();

import { createContext, useContext, useState } from "react";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(
    () => localStorage.getItem("appLang") || "en"
  );

  const changeLang = (code) => {
    setLang(code);
    localStorage.setItem("appLang", code);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("Wrap your app with <LanguageProvider>");
  return ctx;
};
