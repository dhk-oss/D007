import React, { createContext, useContext, useState } from 'react';
import { SupportedLocale, TranslationKey, translations, LOCALE_OPTIONS, LocaleOption } from '../i18n/translations';

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  currentLocaleOption: LocaleOption;
  allLocaleOptions: LocaleOption[];
}

const STORAGE_KEY = 'kids_ai_locale_v1';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale;
      if (saved && translations[saved]) {
        return saved;
      }
    } catch (e) {
      console.warn('Failed reading locale from localStorage:', e);
    }
    return 'ko'; // Default to Korean
  });

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch (e) {
      console.warn('Failed saving locale to localStorage:', e);
    }
  };

  const currentLocaleOption = LOCALE_OPTIONS.find((opt) => opt.code === locale) || LOCALE_OPTIONS[0];

  const t = (key: TranslationKey, fallback?: string): string => {
    const activeDict = translations[locale];
    if (activeDict && (key in activeDict)) {
      return (activeDict as Record<string, string>)[key];
    }
    // Fallback to English
    if (translations.en && (key in translations.en)) {
      return (translations.en as Record<string, string>)[key];
    }
    // Fallback to Korean
    if (translations.ko && (key in translations.ko)) {
      return (translations.ko as Record<string, string>)[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        currentLocaleOption,
        allLocaleOptions: LOCALE_OPTIONS,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
