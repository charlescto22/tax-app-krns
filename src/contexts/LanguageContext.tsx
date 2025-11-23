import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "../translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English, or load from localStorage if saved
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("appLanguage");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("appLanguage", language);
  }, [language]);

  // The translation function 't'
  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook for easy usage
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}