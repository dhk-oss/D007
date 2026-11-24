import React, { useState } from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { ClothingCategory, SeasonType, WardrobeItem } from '../types';
import { ChildSelector } from '../components/ChildSelector';
import { AddWardrobeItemModal } from '../components/AddWardrobeItemModal';
import {
  getLocalizedItemName,
  getLocalizedCategory,
  getLocalizedColor,
  getLocalizedSeason,
} from '../utils/wardrobeLocalization';
import { getLocalizedChildName } from '../utils/localeHelpers';

export const WardrobePage: React.FC = () => {
  const { activeChild, childrenList, wardrobe, addWardrobeItem, deleteWardrobeItem } = useApp();
  const { t, locale } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<'all' | ClothingCategory>('all');
  const [selectedSeason, setSelectedSeason] = useState<'all' | SeasonType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories: { label: string; value: 'all' | ClothingCategory }[] = [
    { label: t('catAll'), value: 'all' },
    { label: t('catTops'), value: 'tops' },
    { label: t('catBottoms'), value: 'bottoms' },
    { label: t('catOuterwear'), value: 'outerwear' },
    { label: t('catOnepiece'), value: 'onepiece' },
    { label: t('catShoes'), value: 'shoes' },
    { label: t('catAccessories'), value: 'accessories' },
  ];

  const seasons: { label: string; value: 'all' | SeasonType }[] = [
    { label: t('seasonAll'), value: 'all' },
    { label: t('seasonSpring'), value: 'spring' },
    { label: t('seasonSummer'), value: 'summer' },
    { label: t('seasonAutumn'), value: 'autumn' },
    { label: t('seasonWinter'), value: 'winter' },
  ];

  // Guard active child
  const childItems = (wardrobe || []).filter((item) => activeChild && item.childId === activeChild.id);

  const filteredItems = childItems.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;

    if (item.category === 'shoes' || item.category === 'accessories') {
      return matchCategory;
    }

    const matchSeason =
      selectedSeason === 'all' ||
      !item.seasons ||
      item.seasons.length === 0 ||
      item.seasons.includes(selectedSeason as SeasonType);

    return matchCategory && matchSeason;
  });

  const handleItemAdded = (itemData: {
    childId: string;
    category: ClothingCategory;
    name: string;
    imageUrl: string;
    color: string;
    seasons?: SeasonType[];
  }) => {
    addWardrobeItem(itemData);
  };

  const childName = activeChild?.name ? getLocalizedChildName(activeChild.name, locale) : 'Child';

  return (
    <div className="p-4 space-y-4">
      {/* Header section with Child Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-stone-800 tracking-tight">{t('wardrobeTitle')}</h2>
          <p className="text-xs text-stone-500">
            {locale === 'es' || locale === 'ru' || locale === 'pt' || locale === 'fr'
              ? `${t('closetCollection')}${childName}`
              : `${childName}${t('closetCollection')}`
            } ({childItems.length} {t('itemsRegistered')})
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8B68BD] text-white rounded-2xl text-xs font-bold shadow-soft hover:bg-[#7A56AE] transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addItem')}</span>
        </button>
      </div>

      <ChildSelector />

      {/* Category Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const active = selectedCategory === cat.value;
          const count =
            cat.value === 'all'
              ? childItems.length
              : childItems.filter((i) => i.category === cat.value).length;

          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                active
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  active ? 'bg-stone-700 text-white' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Season Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {seasons.map((season) => {
          const active = selectedSeason === season.value;
          return (
            <button
              key={season.value}
              onClick={() => setSelectedSeason(season.value)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                active
                  ? 'bg-[#F4EFFA] text-[#7A56AE] border border-[#EAE2F3] font-bold'
                  : 'bg-stone-100 text-stone-500 hover:bg-[#F4EFFA]/60 hover:text-[#5A4F6B]'
              }`}
            >
              {season.label}
            </button>
          );
        })}
      </div>

      {/* Wardrobe Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-[#EAE2F3] text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F4EFFA] flex items-center justify-center text-[#8B68BD]">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#231B2E]">{t('emptyWardrobeTitle')}</h4>
            <p className="text-xs text-[#5A4F6B] mt-1">{t('emptyWardrobeDesc')}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#F4EFFA] text-[#8B68BD] text-xs font-bold rounded-xl hover:bg-[#8B68BD] hover:text-white transition"
          >
            {t('addItem')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item: WardrobeItem) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200/70 shadow-xs hover:shadow-soft transition group relative"
            >
              <div className="relative aspect-square bg-stone-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={getLocalizedItemName(item, locale)}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                  {getLocalizedCategory(item.category, locale)}
                </span>
                <button
                  onClick={() => deleteWardrobeItem(item.id)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white/80 hover:text-rose-400 hover:bg-black/80 transition opacity-0 group-hover:opacity-100"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {item.color && (
                  <span className="absolute bottom-2 left-2 bg-white/90 text-stone-700 text-[10px] font-semibold px-1.5 py-0.2 rounded-md">
                    {getLocalizedColor(item.color, locale)}
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <h4 className="text-xs font-bold text-stone-800 truncate">{getLocalizedItemName(item, locale)}</h4>
                {item.category === 'shoes' || item.category === 'accessories' ? (
                  <span className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200/50">
                    {t('allSeasonBadge')}
                  </span>
                ) : item.seasons && item.seasons.length > 0 ? (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {item.seasons.map((s) => (
                      <span
                        key={s}
                        className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-stone-100 text-stone-500 capitalize"
                      >
                        {getLocalizedSeason(s, locale)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.2 rounded bg-stone-100 text-stone-400">
                    {t('multiSeasonBadge')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      <AddWardrobeItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        childrenList={childrenList}
        activeChildId={activeChild?.id || 'child-1'}
        onItemAdded={handleItemAdded}
      />
    </div>
  );
};
