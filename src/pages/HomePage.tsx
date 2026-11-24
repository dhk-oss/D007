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
        <stop offset="0%" stopColor="#FAF8FC" />
        <stop offset="100%" stopColor="#F1EDF6" />
      </linearGradient>
      <linearGradient id="avatarSkin" x1="160" y1="55" x2="160" y2="405" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D8C7B4" />
        <stop offset="100%" stopColor="#BFA992" />
      </linearGradient>
      <linearGradient id="avatarOutfit" x1="160" y1="130" x2="160" y2="335" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8B68BD" stopOpacity="0.30" />
        <stop offset="100%" stopColor="#7A56AE" stopOpacity="0.45" />
      </linearGradient>
    </defs>
    <rect width="320" height="440" fill="url(#studioBg)" />
    {/* Studio Floor Shadow */}
    <ellipse cx="160" cy="406" rx="68" ry="11" fill="#DDD5E8" />
    {/* Head & Hair Silhouette */}
    <circle cx="160" cy="86" r="32" fill="url(#avatarSkin)" />
    <path d="M128 82 C128 52, 192 52, 192 82 C188 66, 132 66, 128 82 Z" fill="#755E88" />
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
    <path d="M120 138 C120 129, 200 129, 200 138 L195 252 C195 260, 125 260, 125 252 Z" fill="url(#avatarOutfit)" stroke="#8B68BD" strokeWidth="1.5" strokeDasharray="4 3" />
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
  const [tryOnMode, setTryOnMode] = useState<{ isAi: boolean; provider?: string }>({ isAi: false });
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
      const result = await generateVirtualTryOn({
        child: safeChild,
        items,
        occasionLabel: currentOccasionLabels.label,
        weather: currentWeather,
        locale,
      });
      setTryOnImageUrl(result.imageUrl);
      setTryOnMode({ isAi: result.isAiGenerated, provider: result.providerName });
    } catch (e) {
      console.warn('Canvas rendering error:', e);
      setTryOnImageUrl(safeChild.fullBodyPhotoUrl);
      setTryOnMode({ isAi: false });
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
      <div className="bg-gradient-to-br from-[#FAF8FC] to-[#F4EFFA] border border-[#EAE2F3] rounded-3xl p-4 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold text-[#231B2E]">
            <MapPin className="w-3.5 h-3.5 text-[#8B68BD] shrink-0" />
            <span>{getLocalizedLocation(currentLocation, locale)}</span>
            {currentWeather?.isLive && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            )}
            {currentWeather?.updatedAt && (
              <span className="text-[10px] text-[#5A4F6B]/70 font-medium">
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
              className="p-1.5 rounded-full bg-white text-[#5A4F6B] hover:text-[#8B68BD] border border-[#EAE2F3] shadow-2xs transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isWeatherLoading ? 'animate-spin text-[#8B68BD]' : ''}`} />
            </button>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="text-[11px] font-bold text-[#7A56AE] bg-white px-2.5 py-1 rounded-full border border-[#8B68BD]/30 hover:bg-[#F4EFFA] transition shadow-2xs"
            >
              {t('changeLocation')}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE2F3] shadow-xs flex items-center justify-center">
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
                <span className="text-3xl font-black text-[#231B2E]">
                  {currentWeather?.temp ?? 18}°C
                </span>
                <span className="text-xs font-bold text-[#7A56AE] bg-[#F4EFFA] border border-[#EAE2F3] px-2.5 py-0.5 rounded-full">
                  {getLocalizedWeatherBadge(currentWeather?.condition, locale)}
                </span>
              </div>
              <p className="text-[11px] text-[#5A4F6B] mt-0.5">
                {formatHighLowTemps(currentWeather?.highTemp ?? 21, currentWeather?.lowTemp ?? 12, locale)} • {t('humidity')} {currentWeather?.humidity ?? 50}%
              </p>
            </div>
          </div>

          <a
            href={currentWeather?.attributionLink || 'https://open-meteo.com/'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-end text-[10px] text-[#5A4F6B] hover:text-[#7A56AE] transition"
          >
            <span className="font-bold flex items-center gap-0.5">
              {currentWeather?.source || 'Open-Meteo Live'} <ExternalLink className="w-2.5 h-2.5" />
            </span>
            <span className="text-[9px] text-[#8B68BD] font-medium">
              {currentWeather?.isLive ? 'Real-Time Live' : t('regionalForecast')}
            </span>
          </a>
        </div>

        <div className="pt-2.5 border-t border-[#EAE2F3] flex items-center gap-2 text-xs text-[#231B2E] font-medium">
          <span className="shrink-0 bg-[#8B68BD] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs">
            {t('weatherTip')}
          </span>
          <p className="truncate text-[11px] text-[#5A4F6B]">
            {recommendation?.weatherTip || `Mild weather: ideal for breathable layering.`}
          </p>
        </div>
      </div>

      {/* 5 Core Occasions Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[#231B2E]">{t('selectOccasion')}</h2>
          <span className="text-xs text-[#5A4F6B]">{t('whereHeading')}</span>
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
                    ? 'bg-[#8B68BD] text-white border-[#7A56AE] shadow-soft scale-101'
                    : 'bg-white text-[#231B2E] border-[#EAE2F3] hover:border-[#8B68BD]/40 hover:bg-[#FAF8FC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{occ.emoji}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
                </div>
                <div className="font-extrabold text-xs mt-1 leading-snug">{labels.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Virtual Try-On Canvas & Interactive Outfit Fitting */}
      <div className="bg-white rounded-3xl p-4 border border-[#EAE2F3] shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#F4EFFA] text-[#8B68BD]">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#231B2E] text-sm">{t('tryOnTitle')}</h3>
              <p className="text-[10px] text-[#5A4F6B]">{t('tryOnSubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 shadow-2xs"
              style={{
                backgroundColor: tryOnMode.isAi ? '#F4EFFA' : '#FAF8FC',
                color: tryOnMode.isAi ? '#7A56AE' : '#5A4F6B',
                borderColor: '#EAE2F3',
              }}
              title={tryOnMode.provider || 'Smart Fitting'}
            >
              <Sparkles className="w-3 h-3 text-[#8B68BD]" />
              {tryOnMode.isAi
                ? (tryOnMode.provider?.includes('Google Cloud') ? 'GCloud VTO' : 'Gemini AI Vision')
                : 'HD Smart Fitting'}
            </span>
            <span className="text-[11px] font-bold text-[#7A56AE] bg-[#F4EFFA] border border-[#EAE2F3] px-2.5 py-0.5 rounded-full">
              {activeItems.length} {t('piecesFitted')}
            </span>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="relative rounded-2xl overflow-hidden bg-[#FAF8FC] border border-[#EAE2F3] aspect-[3/4] flex items-center justify-center shadow-inner">
          {tryOnImageUrl ? (
            <img
              key={tryOnImageUrl.slice(-40)}
              src={tryOnImageUrl}
              alt="Virtual Try-On Fitting"
              className="w-full h-full object-contain animate-fade-in"
            />
          ) : isValidCustomPhoto(activeChild?.fullBodyPhotoUrl) ? (
            <img
              src={activeChild!.fullBodyPhotoUrl}
              alt={getLocalizedChildName(activeChild!.name, locale)}
              className="w-full h-full object-contain object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#FAF8FC]">
              <KidAvatarIllustration className="w-full h-full"/>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-[#231B2E]/65 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-10">
              <RefreshCw className="w-8 h-8 animate-spin text-[#B493DB]" />
              <span className="text-xs font-extrabold">{t('stylingInProgress')}</span>
            </div>
          )}
        </div>

        {/* Generate / Refresh AI Outfit Action */}
        <button
          onClick={handleGenerateAIStyling}
          disabled={isGenerating}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#8B68BD] to-[#7A56AE] text-white font-extrabold text-xs shadow-soft hover:shadow-soft-lg active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>{isGenerating ? t('stylingInProgress') : t('generateBtn')}</span>
        </button>

        {/* Manual Outfit Swap Slots */}
        <div className="pt-2 border-t border-[#EAE2F3] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#231B2E] flex items-center gap-1">
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#8B68BD]" />
              {t('manualSwapTitle')}
            </span>
            <span className="text-[10px] text-[#5A4F6B]">{t('manualSwapDesc')}</span>
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
                className="p-2 rounded-xl bg-[#FAF8FC] border border-[#EAE2F3] flex items-center justify-between gap-1.5"
              >
                <div className="flex items-center gap-1.5 truncate">
                  {item ? (
                    <img src={item.imageUrl} alt={getLocalizedItemName(item, locale)} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-[#EAE2F3] flex items-center justify-center text-[10px] text-[#5A4F6B] shrink-0">
                      -
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-[10px] font-bold text-[#5A4F6B] uppercase">{label}</p>
                    <p className="text-xs font-semibold text-[#231B2E] truncate">
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
                      className="p-1 rounded-lg bg-white hover:bg-[#F4EFFA] border border-[#EAE2F3] text-[#5A4F6B] hover:text-[#7A56AE] transition"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenSwap(cat)}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-[#F4EFFA] border border-[#EAE2F3] text-[#7A56AE] text-[10px] font-bold transition"
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
          <div className="p-3 bg-[#FAF5FD] border border-[#EAE2F3] rounded-2xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#8B68BD] shrink-0 mt-0.5" />
            <div className="text-xs text-[#231B2E] leading-snug">
              <strong className="block font-bold">{t('missingCategoriesNotice')}</strong>
              {t('missingCategoriesDesc')}
            </div>
          </div>
        )}

        {/* AI Rationale & Save to Lookbook Action */}
        {recommendation && (
          <div className="p-3.5 rounded-2xl bg-[#F4EFFA] border border-[#EAE2F3] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7A56AE]">
                {recommendation.selectedItems && recommendation.selectedItems.length > 0
                  ? `${t('fitScore')}: ${recommendation.weatherMatchScore ?? 95}% (${t('optimalHarmony')})`
                  : ''}
              </span>
              <button
                onClick={handleSaveToLookbook}
                disabled={savedSuccess || activeItems.length === 0}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#8B68BD] text-white shadow-soft hover:bg-[#7A56AE] transition active:scale-95 disabled:bg-stone-300 disabled:opacity-60"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedSuccess ? t('savedToLookbook') : t('saveToLookbook')}</span>
              </button>
            </div>

            <p className="text-xs text-[#231B2E] font-medium leading-relaxed">
              {recommendation.stylingRationale}
            </p>

            {recommendation.proportionAdvice && (
              <p className="text-[11px] text-[#5A4F6B] pt-1 border-t border-[#EAE2F3]">
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
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white border border-[#EAE2F3] text-[#7A56AE] text-xs font-bold hover:bg-[#FAF8FC] transition active:scale-[0.99] shadow-xs"
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
