import React, { useState } from 'react';
import { Calendar, Sun, CloudRain, Sparkles, X, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { StylingLookbook } from '../types';
import { ChildSelector } from '../components/ChildSelector';
import {
  getLocalizedItemName,
  getLocalizedCategory,
  getLocalizedColor,
} from '../utils/wardrobeLocalization';
import { getLocalizedChildName } from '../utils/localeHelpers';

export const LookbookPage: React.FC = () => {
  const { lookbooks, activeChild, wardrobe, deleteLookbook } = useApp();
  const { t, locale } = useTranslation();
  const [selectedLook, setSelectedLook] = useState<StylingLookbook | null>(null);
  const [filterByCurrentChild, setFilterByCurrentChild] = useState<boolean>(true);

  const safeChildName = activeChild?.name ? getLocalizedChildName(activeChild.name, locale) : 'Child';

  // Filter lookbooks defensively
  const displayLookbooks = (lookbooks || []).filter((look) => {
    if (!filterByCurrentChild) return true;
    return activeChild ? look.childId === activeChild.id : true;
  });

  const getWardrobeItem = (id: string) => {
    return (wardrobe || []).find((item) => item.id === id);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm(t('deleteLookbookConfirm'))) {
      deleteLookbook(id);
      if (selectedLook?.id === id) {
        setSelectedLook(null);
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-stone-800 tracking-tight">{t('lookbookTitle')}</h2>
          <p className="text-xs text-stone-500">{t('lookbookSubtitle')}</p>
        </div>
        <button
          onClick={() => setFilterByCurrentChild(!filterByCurrentChild)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
            filterByCurrentChild
              ? 'bg-pastel-coral text-white border-pastel-coral'
              : 'bg-white text-stone-600 border-stone-200'
          }`}
        >
          {filterByCurrentChild ? `${safeChildName} (${t('currentChildOnly')})` : t('allChildren')}
        </button>
      </div>

      <ChildSelector />

      {/* Lookbooks Gallery */}
      {displayLookbooks.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-pastel-coral-light flex items-center justify-center text-pastel-coral">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-700">{t('emptyLookbookTitle')}</h4>
            <p className="text-xs text-stone-400 mt-1">{t('emptyLookbookDesc')}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayLookbooks.map((look) => {
            const dateStr = new Date(Number(look.createdAt) || Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            const weather =
              typeof look.weatherSnapshot === 'string'
                ? { temp: 20, condition: look.weatherSnapshot }
                : look.weatherSnapshot || { temp: 18, condition: 'Sunny' };

            const selectedItems = Array.isArray(look.selectedItemIds) ? look.selectedItemIds : [];

            return (
              <div
                key={look.id}
                onClick={() => setSelectedLook(look)}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-soft hover:shadow-soft-lg transition cursor-pointer group"
              >
                <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                  <img
                    src={look.generatedImageUrl}
                    alt={look.occasion}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="bg-pastel-coral text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                      {look.occasion}
                    </span>
                    <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      {weather.condition?.toLowerCase().includes('rain') ? (
                        <CloudRain className="w-3 h-3 text-sky-300" />
                      ) : (
                        <Sun className="w-3 h-3 text-amber-300" />
                      )}
                      {weather.temp ?? 18}°C
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDelete(look.id, e)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white/80 hover:text-rose-400 hover:bg-black/80 flex items-center justify-center transition"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{dateStr}</span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  {look.aiAdvice && (
                    <p className="text-xs text-stone-700 line-clamp-2 font-medium leading-relaxed">
                      {look.aiAdvice}
                    </p>
                  )}

                  {selectedItems.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                      <span className="text-[10px] font-bold text-stone-400 shrink-0">Items:</span>
                      {selectedItems.map((itemId) => {
                        const item = getWardrobeItem(itemId);
                        if (!item) return null;
                        return (
                          <div
                            key={itemId}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600 text-[10px] font-semibold shrink-0"
                          >
                            <img
                              src={item.imageUrl}
                              alt={getLocalizedItemName(item, locale)}
                              className="w-3.5 h-3.5 rounded object-cover"
                            />
                            <span className="truncate max-w-[80px]">{getLocalizedItemName(item, locale)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lookbook Detail Modal */}
      {selectedLook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-pastel-coral uppercase tracking-wider">
                  {t('lookbookRecordBadge')}
                </span>
                <h3 className="font-extrabold text-base text-stone-800">{selectedLook.occasion}</h3>
              </div>
              <button
                onClick={() => setSelectedLook(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-stone-100 border border-stone-200">
              <img
                src={selectedLook.generatedImageUrl}
                alt={selectedLook.occasion}
                className="w-full h-full object-cover"
              />
            </div>

            {selectedLook.aiAdvice && (
              <div className="p-3.5 bg-pastel-coral-light/60 rounded-2xl border border-pastel-coral/20">
                <span className="text-[11px] font-bold text-pastel-coral block mb-1">
                  {t('stylingRationaleTitle')}
                </span>
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  {selectedLook.aiAdvice}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-stone-700 mb-2">{t('fittedPiecesTitle')}</h4>
              <div className="space-y-1.5">
                {(Array.isArray(selectedLook.selectedItemIds) ? selectedLook.selectedItemIds : []).map((itemId) => {
                  const item = getWardrobeItem(itemId);
                  if (!item) return null;
                  return (
                    <div
                      key={itemId}
                      className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/60"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={item.imageUrl}
                          alt={getLocalizedItemName(item, locale)}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-stone-800">{getLocalizedItemName(item, locale)}</p>
                          <p className="text-[10px] text-stone-400 capitalize">{getLocalizedCategory(item.category, locale)}</p>
                        </div>
                      </div>
                      {item.color && (
                        <span className="text-[10px] font-medium text-stone-500 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                          {getLocalizedColor(item.color, locale)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => handleDelete(selectedLook.id)}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('deleteLookbookBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
