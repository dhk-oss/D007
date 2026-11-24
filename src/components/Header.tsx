import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

export const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8FC]/90 backdrop-blur-md px-3.5 py-2.5 border-b border-[#EAE2F3] flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#8B68BD] to-[#B493DB] flex items-center justify-center text-white shadow-soft shrink-0">
          <Sparkles className="w-5 h-5"/>
        </div>
        <h1 className="font-['Playfair_Display',Georgia,serif] text-[22px] sm:text-[24px] font-extrabold tracking-wide text-[#231B2E] leading-none">
          {t('appTitle')}
        </h1>
      </div>

      <div className="shrink-0 whitespace-nowrap">
        <LanguageSelector/>
      </div>
    </header>
  );
};
