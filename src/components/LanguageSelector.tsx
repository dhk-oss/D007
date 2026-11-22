import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Globe, Check, X } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { SupportedLocale } from '../i18n/translations';

export const LanguageSelector: React.FC = () => {
  const { locale, setLocale, currentLocaleOption, allLocaleOptions } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (code: SupportedLocale) => {
    setLocale(code);
    setIsOpen(false);
  };

  const priorityCodes: SupportedLocale[] = ['ko', 'en', 'ja'];
  const orderedOptions = [
    ...priorityCodes
      .map((code) => allLocaleOptions.find((opt) => opt.code === code))
      .filter((opt): opt is NonNullable<typeof opt> => Boolean(opt)),
    ...allLocaleOptions.filter((opt) => !priorityCodes.includes(opt.code)),
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 border border-pastel-peach text-stone-700 text-xs font-bold shadow-xs hover:border-pastel-coral/60 transition active:scale-95"
        title="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-pastel-coral"/>
        <span className="text-[11px] font-extrabold">{currentLocaleOption.nativeLabel}</span>
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/50 flex flex-col items-center justify-start pt-4 px-4"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: 'calc(100dvh - 32px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 p-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-pastel-coral-light text-pastel-coral">
                    <Globe className="w-4 h-4"/>
                  </div>
                  <h3 className="font-extrabold text-sm text-stone-800">
                    Select Language
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-2"
              >
                {orderedOptions.map((opt) => {
                  const isSelected = opt.code === locale;
                  return (
                    <button
                      type="button"
                      key={opt.code}
                      onClick={() => handleSelect(opt.code)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition ${
                        isSelected
                          ? 'bg-pastel-coral-light/60 border-pastel-coral text-pastel-coral font-extrabold shadow-xs'
                          : 'bg-stone-50 border-stone-200/80 text-stone-700 hover:bg-stone-100 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{opt.flag}</span>
                        <div>
                          <span className="text-xs block leading-tight">{opt.nativeLabel}</span>
                          <span className="text-[10px] text-stone-400 block">{opt.englishName}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-pastel-coral stroke-[3]"/>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
