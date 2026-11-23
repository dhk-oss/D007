import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Shirt, Sparkles } from 'lucide-react';
import { WardrobeItem, ClothingCategory } from '../types';
import { useTranslation } from '../context/LanguageContext';
import {
  getLocalizedItemName,
  getLocalizedCategory,
  getLocalizedColor,
} from '../utils/wardrobeLocalization';

interface WardrobePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  categoryFilter?: ClothingCategory | 'all';
  wardrobeItems: WardrobeItem[];
  currentlySelectedItemId?: string;
  onSelectItem: (item: WardrobeItem | null) => void;
}

export const WardrobePickerModal: React.FC<WardrobePickerModalProps> = ({
  isOpen,
  onClose,
  childName,
  categoryFilter = 'all',
  wardrobeItems,
  currentlySelectedItemId,
  onSelectItem,
}) => {
  const { t, locale } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>(categoryFilter);

  useEffect(() => {
    if (isOpen) {
      setActiveCategory(categoryFilter);
    }
  }, [isOpen, categoryFilter]);

  if (!isOpen) return null;

  const categoryTabs: { label: string; value: ClothingCategory | 'all' }[] = [
    { label: t('catAll'), value: 'all' },
    { label: t('catTops'), value: 'tops' },
    { label: t('catBottoms'), value: 'bottoms' },
    { label: t('catOuterwear'), value: 'outerwear' },
    { label: t('catOnepiece'), value: 'onepiece' },
    { label: t('catShoes'), value: 'shoes' },
    { label: t('catAccessories'), value: 'accessories' },
  ];

  const filteredItems = wardrobeItems.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleSelect = (item: WardrobeItem) => {
    onSelectItem(item);
    onClose();
  };

  const handleRemoveSlot = () => {
    onSelectItem(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-coral">
              {t('manualSwapTitle')}
            </span>
            <h3 className="font-extrabold text-base text-stone-800">
              {t('swapModalTitle')} ({childName})
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {categoryTabs.map((tab) => {
            const active = activeCategory === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  active
                    ? 'bg-stone-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Remove item from this slot action */}
        {currentlySelectedItemId && (
          <div className="flex justify-end">
            <button
              onClick={handleRemoveSlot}
              className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('removeSlot')}</span>
            </button>
          </div>
        )}

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto min-h-[220px]">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-stone-400">
              <Shirt className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-xs">{t('noItemsInCat')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredItems.map((item) => {
                const isSelected = item.id === currentlySelectedItemId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`relative rounded-2xl overflow-hidden border-2 text-left p-1 transition group bg-white shadow-xs hover:shadow-soft ${
                      isSelected
                        ? 'border-pastel-coral ring-2 ring-pastel-coral/30'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                      <img src={item.imageUrl} alt={getLocalizedItemName(item, locale)} className="w-full h-full object-cover" />
                      <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize">
                        {getLocalizedCategory(item.category, locale)}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-pastel-coral text-white flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="p-1.5">
                      <p className="text-xs font-bold text-stone-800 truncate">{getLocalizedItemName(item, locale)}</p>
                      <p className="text-[10px] text-stone-400 truncate">{getLocalizedColor(item.color, locale) || 'Neutral'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-stone-100 text-center">
          <p className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-pastel-coral" />
            {t('swapNotice')}
          </p>
        </div>
      </div>
    </div>
  );
};
