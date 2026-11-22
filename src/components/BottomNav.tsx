import React from 'react';
import { Sparkles, Shirt, Users, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { t } = useTranslation();

  const navItems = [
    {
      id: 'home' as const,
      label: t('navStylist'),
      icon: Sparkles,
    },
    {
      id: 'wardrobe' as const,
      label: t('navWardrobe'),
      icon: Shirt,
    },
    {
      id: 'profiles' as const,
      label: t('navProfiles'),
      icon: Users,
    },
    {
      id: 'lookbook' as const,
      label: t('navLookbook'),
      icon: BookOpen,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[480px] mx-auto bg-white/95 backdrop-blur-md border-t border-stone-200/60 px-4 py-2 safe-bottom shadow-nav">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-pastel-coral scale-105'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-pastel-coral-light' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span
                className={`text-[11px] mt-0.5 tracking-tight font-medium ${
                  isActive ? 'font-bold text-pastel-coral' : 'text-stone-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
