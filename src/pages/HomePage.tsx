import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Bookmark,
  RefreshCw,
  Shirt,
  ExternalLink,
  MapPin,
  ArrowRightLeft,
  AlertTriangle,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { OccasionKey, WardrobeItem, ClothingCategory } from '../types';
import { ChildSelector } from '../components/ChildSelector';
import { LocationSelectorModal } from '../components/LocationSelectorModal';
import { WardrobePickerModal } from '../components/WardrobePickerModal';
import { AdBanner } from '../components/AdBanner';
import { CORE_OCCASIONS, recommendOutfitFromWardrobe, OutfitRecommendation } from '../services/stylingEngine';
import { generateVirtualTryOn } from '../services/virtualTryOnService';
import { getLocalizedItemName } from '../utils/wardrobeLocalization';
import {
  getLocalizedLocation,
  getLocalizedWeatherBadge,
  formatHighLowTemps,
  getLocalizedChildName,
} from '../utils/localeHelpers';

const isValidCustomPhoto = (url?: string | null): boolean =>
  Boolean(
    url &&
    (url.startsWith('data:image/') ||
      url.startsWith('blob:') ||
      url.includes('firebasestorage.googleapis.com'))
  );

const KidAvatarIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 320 440" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="studioBg" x1="0" y1="0" x2="0" y2="440" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDFBF7" />
        <stop offset="100%" stopColor="#F2ECE1" />
      </linearGradient>
      <linearGradient id="avatarSkin" x1="160" y1="55" x2="160" y2="405" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D8C7B4" />
        <stop offset="100%" stopColor="#BFA992" />
      </linearGradient>
      <linearGradient id="avatarOutfit" x1="160" y1="130" x2="160" y2="335" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E89E84" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#D4846A" stopOpacity="0.45" />
      </linearGradient>
    </defs>
    <rect width="320" height="440" fill="url(#studioBg)" />
    {/* Studio Floor Shadow */}
    <ellipse cx="160" cy="406" rx="68" ry="11" fill="#DDD2C2" />
    {/* Head & Hair Silhouette */}
    <circle cx="160" cy="86" r="32" fill="url(#avatarSkin)" />
    <path d="M128 82 C128 52, 192 52, 192 82 C188 66, 132 66, 128 82 Z" fill="#A68E76" />
    {/* Neck */}
    <rect x="151" y="116" width="18" height="16" rx="6" fill="url(#avatarSkin)" />
    {/* Arms */}
    <path d="M118 140 L92 232 C90 239, 100 242, 104 235 L125 162 Z" fill="url(#avatarSkin)" />
    <path d="M202 140 L228 232 C230 239, 220 242, 216 235 L195 162 Z" fill="url(#avatarSkin)" />
    {/* Legs */}
    <path d="M132 252 L126 392 C126 399, 146 399, 147 392 L155 256 Z" fill="url(#avatarSkin)" />
    <path d="M188 252 L194 392 C194 399, 174 399, 173 392 L165 256 Z" fill="url(#avatarSkin)" />
    {/* Torso & Minimalist Base Silhouette */}
    <path d="M120 138 C120 129, 200 129, 200 138 L195 252 C195 260, 125 260, 125 252 Z" fill="url(#avatarSkin)" />
    <path d="M120 138 C120 129, 200 129, 200 138 L195 252 C195 260, 125 260, 125 252 Z" fill="url(#avatarOutfit)" stroke="#C99B84" strokeWidth="1.5" strokeDasharray="4 3" />
  </svg>
);

export const HomePage: React.FC = () => {
  const {
    activeChild,
    wardrobe,
    currentLocation,
    setCurrentLocation,
    currentWeather,
    isWeatherLoading,
    refreshWeather,
    saveLookbook,
  } = useApp();
  const { t, locale } = useTranslation();

  const [selectedOccasionKey, setSelectedOccasionKey] = useState<OccasionKey>('daycare_school');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tryOnImageUrl, setTryOnImageUrl] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null);
  const [activeItems, setActiveItems] = useState<WardrobeItem[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Manual Swap State
  const [swapCategory, setSwapCategory] = useState<ClothingCategory | 'all'>('tops');
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  // Guard active child
  const safeChild = activeChild || {
    id: 'child-1',
    name: 'Ha-eun (Chloe)',
    gender: 'female' as const,
    age: 6,
    heightCm: 115,
    weightKg: 20.5,
    waistCm: 53,
    fullBodyPhotoUrl: '',
    bodyProportionAnalysis: {
      torsoRatio: 0.41,
      legRatio: 0.59,
      upperToLowerRatio: '41:59',
      silhouetteType: 'tall-lean' as const,
      bodyTypeSummary: 'Long-limbed slender profile with active mobility.',
      stylingNotes: ['High-waisted cuts accentuate natural leg line.'],
      analyzedAt: new Date().toISOString(),
    },
    parentId: 'parent-1',
  };

  const childWardrobe = (wardrobe || []).filter((w) => w.childId === safeChild.id);

  const getOccasionLabels = (key: OccasionKey) => {
    switch (key) {
      case 'daycare_school':
        return { label: t('occDaycare'), sub: t('occDaycareSub') };
      case 'birthday_party':
        return { label: t('occBirthday'), sub: t('occBirthdaySub') };
      case 'outing_event':
        return { label: t('occOuting'), sub: t('occOutingSub') };
      case 'visiting_relatives':
        return { label: t('occRelatives'), sub: t('occRelativesSub') };
      case 'ceremonial':
        return { label: t('occCeremonial'), sub: t('occCeremonialSub') };
      default:
        return { label: key, sub: '' };
    }
  };

  const currentOccasionLabels = getOccasionLabels(selectedOccasionKey);

  // Helper to re-render Virtual Try-On canvas with current items
  const renderCanvasWithItems = async (items: WardrobeItem[]) => {
    try {
      const renderedUrl = await generateVirtualTryOn({
        child: safeChild,
        items,
        occasionLabel: currentOccasionLabels.label,
        weather: currentWeather,
        locale,
      });
      setTryOnImageUrl(renderedUrl);
    } catch (e) {
      console.warn('Canvas rendering error:', e);
      setTryOnImageUrl(safeChild.fullBodyPhotoUrl);
    }
  };

  // Run AI Outfit Recommendation & Try-On
  const handleGenerateAIStyling = async () => {
    setIsGenerating(true);
    setSavedSuccess(false);

    try {
      const rec = recommendOutfitFromWardrobe({
        child: safeChild,
        wardrobeItems: wardrobe || [],
        weather: currentWeather,
        occasionKey: selectedOccasionKey,
        language: locale,
      });

      setRecommendation(rec);
      setActiveItems(rec.selectedItems || []);

      await renderCanvasWithItems(rec.selectedItems || []);
    } catch (err) {
      console.error('Styling generation error:', err);
      setTryOnImageUrl(safeChild.fullBodyPhotoUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (safeChild && safeChild.id) {
      handleGenerateAIStyling();
    }
  }, [safeChild.id, selectedOccasionKey, currentWeather?.temp, locale]);

  const handleOpenSwap = (category: ClothingCategory) => {
    setSwapCategory(category);
    setIsSwapModalOpen(true);
  };

  const handleItemSwapped = async (newItem: WardrobeItem | null) => {
    let nextItems: WardrobeItem[];

    if (!newItem) {
      nextItems = activeItems.filter((i) => i.category !== swapCategory);
    } else {
      const filtered = activeItems.filter((i) => i.category !== newItem.category);
      nextItems = [...filtered, newItem];
    }

    setActiveItems(nextItems);
    await renderCanvasWithItems(nextItems);
  };

  const handleSaveToLookbook = () => {
    if (!tryOnImageUrl) return;

    saveLookbook({
      childId: safeChild.id,
      occasion: currentOccasionLabels.label,
      weatherSnapshot: currentWeather,
      selectedItemIds: activeItems.map((i) => i.id),
      generatedImageUrl: tryOnImageUrl,
      aiAdvice: recommendation?.stylingRationale || `Virtual fitting for ${currentOccasionLabels.label}`,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // const ratioText = safeChild.bodyProportionAnalysis?.upperToLowerRatio || '44:56'; // ratioText currently unused

  return (
    <div className="p-4 space-y-4">
      {/* Target Child Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          {t('targetChild')}
        </span>
        <ChildSelector />
      </div>

      {/* Location & Real-Time Weather Card */}
      <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/80 border border-amber-200/70 rounded-3xl p-4 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold text-stone-700">
            <MapPin className="w-3.5 h-3.5 text-pastel-coral shrink-0" />
            <span>{getLocalizedLocation(currentLocation, locale)}</span>
            {currentWeather?.isLive && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            )}
            {currentWeather?.updatedAt && (
              <span className="text-[10px] text-stone-400 font-medium">
                ({currentWeather.updatedAt})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => refreshWeather()}
              disabled={isWeatherLoading}
              title={t('updateForecast')}
              className="p-1.5 rounded-full bg-white text-stone-600 hover:text-pastel-coral border border-stone-200/90 shadow-2xs transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isWeatherLoading ? 'animate-spin text-pastel-coral' : ''}`} />
            </button>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="text-[11px] font-bold text-pastel-coral bg-white px-2.5 py-1 rounded-full border border-pastel-coral/30 hover:bg-pastel-coral-light transition shadow-2xs"
            >
              {t('changeLocation')}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center">
              {(() => {
                const c = (currentWeather?.condition || '').toLowerCase();
                if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
                  return <CloudRain className="w-7 h-7 text-sky-500" />;
                }
                if (c.includes('snow')) {
                  return <CloudSnow className="w-7 h-7 text-indigo-400" />;
                }
                if (c.includes('cloud') || c.includes('overcast')) {
                  return <Cloud className="w-7 h-7 text-stone-400" />;
                }
                if (c.includes('wind') || c.includes('fog')) {
                  return <Wind className="w-7 h-7 text-teal-600" />;
                }
                return <Sun className="w-7 h-7 text-amber-500" />;
              })()}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-800">
                  {currentWeather?.temp ?? 18}°C
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full">
                  {getLocalizedWeatherBadge(currentWeather?.condition, locale)}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {formatHighLowTemps(currentWeather?.highTemp ?? 21, currentWeather?.lowTemp ?? 12, locale)} • {t('humidity')} {currentWeather?.humidity ?? 50}%
              </p>
            </div>
          </div>

          <a
            href={currentWeather?.attributionLink || 'https://open-meteo.com/'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-end text-[10px] text-stone-400 hover:text-amber-700 transition"
          >
            <span className="font-bold flex items-center gap-0.5">
              {currentWeather?.source || 'Open-Meteo Live'} <ExternalLink className="w-2.5 h-2.5" />
            </span>
            <span className="text-[9px] text-amber-600/80 font-medium">
              {currentWeather?.isLive ? 'Real-Time Live' : t('regionalForecast')}
            </span>
          </a>
        </div>

        <div className="pt-2.5 border-t border-amber-200/50 flex items-center gap-2 text-xs text-amber-900 font-medium">
          <span className="shrink-0 bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-md">
            {t('weatherTip')}
          </span>
          <p className="truncate text-[11px]">
            {recommendation?.weatherTip || `Mild weather: ideal for breathable layering.`}
          </p>
        </div>
      </div>

      {/* 5 Core Occasions Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-stone-800">{t('selectOccasion')}</h2>
          <span className="text-xs text-stone-400">{t('whereHeading')}</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {CORE_OCCASIONS.map((occ) => {
            const isSelected = selectedOccasionKey === occ.key;
            const labels = getOccasionLabels(occ.key);
            return (
              <button
                key={occ.key}
                onClick={() => setSelectedOccasionKey(occ.key)}
                className={`p-2.5 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-pastel-coral text-white border-pastel-coral shadow-soft scale-101'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-pastel-coral/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{occ.emoji}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
                </div>
                <div className="font-extrabold text-xs mt-1 leading-snug">{labels.label}</div>
                {/* Removed subtitle */}
                              </button>
            );
          })}
        </div>
      </div>

      {/* Virtual Try-On Canvas & Interactive Outfit Fitting */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-pastel-coral-light text-pastel-coral">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-800 text-sm">{t('tryOnTitle')}</h3>
              <p className="text-[10px] text-stone-400">{t('tryOnSubtitle')}</p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-pastel-coral bg-pastel-coral-light px-2.5 py-0.5 rounded-full">
            {activeItems.length} {t('piecesFitted')}
          </span>
        </div>

        {/* Canvas Display */}
        <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-pastel-peach/50 aspect-[3/4] flex items-center justify-center">
          {isValidCustomPhoto(tryOnImageUrl) ? (
            <img
              src={tryOnImageUrl!}
              alt="Virtual Try-On Fitting"
              className="w-full h-full object-cover animate-fade-in"
            />
          ) : isValidCustomPhoto(activeChild?.fullBodyPhotoUrl) ? (
            <img
              src={activeChild!.fullBodyPhotoUrl}
              alt={getLocalizedChildName(activeChild!.name, locale)}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F6F2EC]">
              <KidAvatarIllustration className="w-full h-full"/>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
              <RefreshCw className="w-8 h-8 animate-spin text-pastel-coral" />
              <span className="text-xs font-extrabold">{t('stylingInProgress')}</span>
            </div>
          )}
        </div>

        {/* Generate / Refresh AI Outfit Action */}
        <button
          onClick={handleGenerateAIStyling}
          disabled={isGenerating}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pastel-coral to-rose-400 text-white font-extrabold text-xs shadow-soft hover:shadow-soft-lg active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>{isGenerating ? t('stylingInProgress') : t('generateBtn')}</span>
        </button>

        {/* Manual Outfit Swap Slots */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-700 flex items-center gap-1">
              <ArrowRightLeft className="w-3.5 h-3.5 text-pastel-coral" />
              {t('manualSwapTitle')}
            </span>
            <span className="text-[10px] text-stone-400">{t('manualSwapDesc')}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: `${t('catTops')} / ${t('catOnepiece')}`, cat: ('tops' as ClothingCategory), item: activeItems.find((i) => i.category === 'tops' || i.category === 'onepiece') },
              { label: t('catBottoms'), cat: ('bottoms' as ClothingCategory), item: activeItems.find((i) => i.category === 'bottoms') },
              { label: t('catOuterwear'), cat: ('outerwear' as ClothingCategory), item: activeItems.find((i) => i.category === 'outerwear') },
              { label: t('catShoes'), cat: ('shoes' as ClothingCategory), item: activeItems.find((i) => i.category === 'shoes') },
              { label: t('catAccessories'), cat: ('accessories' as ClothingCategory), item: activeItems.find((i) => i.category === 'accessories') },
            ].map(({ label, cat, item }) => (
              <div
                key={label}
                className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-1.5"
              >
                <div className="flex items-center gap-1.5 truncate">
                  {item ? (
                    <img src={item.imageUrl} alt={getLocalizedItemName(item, locale)} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-stone-200 flex items-center justify-center text-[10px] text-stone-400 shrink-0">
                      -
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-[10px] font-bold text-stone-500 uppercase">{label}</p>
                    <p className="text-xs font-semibold text-stone-800 truncate">
                      {item ? getLocalizedItemName(item, locale) : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {item && (
                    <a
                      href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(
                        `아동 ${getLocalizedItemName(item, locale)}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={locale === 'ko' ? '유사 아이템 쇼핑' : 'Shop Similar'}
                      className="p-1 rounded-lg bg-white hover:bg-pastel-peach/30 border border-stone-200 text-stone-600 hover:text-pastel-coral transition"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenSwap(cat)}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-pastel-coral text-[10px] font-bold transition"
                  >
                    {t('swapBtn')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Wardrobe Categories Notice */}
        {recommendation && recommendation.missingCategories && recommendation.missingCategories.length > 0 && (
          <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-2xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-snug">
              <strong className="block font-bold">{t('missingCategoriesNotice')}</strong>
              {t('missingCategoriesDesc')}
            </div>
          </div>
        )}

        {/* AI Rationale & Save to Lookbook Action */}
        {recommendation && (
          <div className="p-3.5 rounded-2xl bg-pastel-coral-light/70 border border-pastel-coral/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pastel-coral">
                {recommendation.selectedItems && recommendation.selectedItems.length > 0
                  ? `${t('fitScore')}: ${recommendation.weatherMatchScore ?? 95}% (${t('optimalHarmony')})`
                  : ''}
              </span>
              <button
                onClick={handleSaveToLookbook}
                disabled={savedSuccess || activeItems.length === 0}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-pastel-coral text-white shadow-soft hover:bg-rose-500 transition active:scale-95 disabled:bg-stone-300 disabled:opacity-60"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedSuccess ? t('savedToLookbook') : t('saveToLookbook')}</span>
              </button>
            </div>

            <p className="text-xs text-stone-800 font-medium leading-relaxed">
              {recommendation.stylingRationale}
            </p>

            {recommendation.proportionAdvice && (
              <p className="text-[11px] text-stone-600 pt-1 border-t border-pastel-coral/20">
                💡 {recommendation.proportionAdvice}
              </p>
            )}

            {/* Affiliate CTA: Shop Similar Look */}
            <a
              href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(
                `키즈 아동복 ${activeItems.map((i) => getLocalizedItemName(i, locale)).slice(0, 2).join(' ')} 코디`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/90 border border-pastel-coral/30 text-pastel-coral text-xs font-bold hover:bg-white transition active:scale-[0.99] shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {locale === 'ko'
                  ? '유사 아이템 쇼핑하기'
                  : locale === 'ja'
                  ? '類似アイテムをショッピング'
                  : locale === 'zh'
                  ? '选购同款穿搭'
                  : 'Shop Similar Look'}
              </span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        )}

        {/* Commercial Monetization Ad Banner */}
        <AdBanner className="mt-1" />
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={setCurrentLocation}
      />

      {/* Wardrobe Manual Swap Modal */}
      <WardrobePickerModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        childName={getLocalizedChildName(safeChild.name, locale)}
        categoryFilter={swapCategory}
        wardrobeItems={childWardrobe}
        currentlySelectedItemId={activeItems.find((i) => i.category === swapCategory)?.id}
        onSelectItem={handleItemSwapped}
      />
    </div>
  );
};
