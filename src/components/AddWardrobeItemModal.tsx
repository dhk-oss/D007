import React, { useState, useRef, useEffect } from 'react';
import { GarmentCameraModal } from './GarmentCameraModal';
import { X, Check, Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { ClothingCategory, SeasonType, ChildProfile } from '../types';
import { DataService } from '../services/dataService';
import { useTranslation } from '../context/LanguageContext';
import { getLocalizedChildName } from '../utils/localeHelpers';

interface AddWardrobeItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: ChildProfile[];
  activeChildId: string;
  onItemAdded: (item: {
    childId: string;
    category: ClothingCategory;
    name: string;
    imageUrl: string;
    color: string;
    seasons?: SeasonType[];
  }) => void;
}

const samplePresets: { [key in ClothingCategory]: string } = {
  tops: '',
  bottoms: '',
  outerwear: '',
  onepiece: '',
  shoes: '',
  accessories: '',
};











export const AddWardrobeItemModal: React.FC<AddWardrobeItemModalProps> = ({
  isOpen,
  onClose,
  childrenList,
  activeChildId,
  onItemAdded,
}) => {
  const { t, locale } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedChildId, setSelectedChildId] = useState<string>(activeChildId);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [selectedSeasons, setSelectedSeasons] = useState<SeasonType[]>(['spring', 'autumn']);
  const [color, setColor] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Initialize or update localized default color and child
  useEffect(() => {
    if (isOpen) {
      setColor(t('defaultColorMood'));
      setSelectedChildId(activeChildId);
    }
  }, [isOpen, activeChildId, locale]);


  const handleCameraCapture = (dataUrl: string) => {
    setImageUrl(dataUrl);
  };


  if (!isOpen) return null;

  const categoryOptions: { label: string; value: ClothingCategory }[] = [
    { label: t('catTops'), value: 'tops' },
    { label: t('catBottoms'), value: 'bottoms' },
    { label: t('catOuterwear'), value: 'outerwear' },
    { label: t('catOnepiece'), value: 'onepiece' },
    { label: t('catShoes'), value: 'shoes' },
    { label: t('catAccessories'), value: 'accessories' },
  ];

  const seasonOptions: { label: string; value: SeasonType }[] = [
    { label: t('seasonSpring'), value: 'spring' },
    { label: t('seasonSummer'), value: 'summer' },
    { label: t('seasonAutumn'), value: 'autumn' },
    { label: t('seasonWinter'), value: 'winter' },
  ];

  const isSeasonApplicable = category !== 'shoes' && category !== 'accessories';

  const handleCategoryChange = (cat: ClothingCategory) => {
    setCategory(cat);
    if (Object.values(samplePresets).includes(imageUrl)) {
      setImageUrl(samplePresets[cat]);
    }
  };

  const handleToggleSeason = (season: SeasonType) => {
    if (selectedSeasons.includes(season)) {
      setSelectedSeasons(selectedSeasons.filter((s) => s !== season));
    } else {
      setSelectedSeasons([...selectedSeasons, season]);
    }
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await DataService.uploadImage(file, 'wardrobe');
      setImageUrl(uploadedUrl);
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onItemAdded({
      childId: selectedChildId,
      category,
      name: itemName.trim() || `${category.charAt(0).toUpperCase() + category.slice(1)} Item`,
      imageUrl,
      color: color.trim() || 'Neutral',
      seasons: isSeasonApplicable ? selectedSeasons : [],
    });

    onClose();
  };

  const selectedChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-coral">
              {t('wardrobeTitle')}
            </span>
            <h3 className="font-extrabold text-base text-stone-800">{t('modalAddWardrobe')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Child Assignment */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">{t('targetChild')}</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {childrenList.map((child) => {
                const isSelected = child.id === selectedChildId;
                return (
                  <button
                    type="button"
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition shrink-0 ${
                      isSelected
                        ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                  >
                    <img
                      src={child.fullBodyPhotoUrl}
                      alt={getLocalizedChildName(child.name, locale)}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>{getLocalizedChildName(child.name, locale)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">{t('itemName')}</label>
            <input
              type="text"
              required
              placeholder={t('itemNamePlaceholder')}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-pastel-coral/50"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">{t('itemCategory')}</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as ClothingCategory)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-pastel-coral/50 bg-white"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload & Preview */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">{t('itemPhoto')}</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 relative flex items-center justify-center">
                {imageUrl && imageUrl.trim() !== '' ? (
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-stone-400 p-1">
                    <ImageIcon className="w-6 h-6 stroke-[1.5] text-stone-300" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px]">
                    ...
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-pastel-warm border border-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-stone-100 transition"
                >
                  <Upload className="w-3.5 h-3.5 text-pastel-coral" />
                  <span>{t('uploadPhotoBtn')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-pastel-coral text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-pastel-coral-light transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {t('captureGarmentBtn')}
                </button>
                {/* Garment Camera Modal */}
                <GarmentCameraModal
                  isOpen={isCameraModalOpen}
                  onClose={() => setIsCameraModalOpen(false)}
                  onCapture={handleCameraCapture}
                  childName={selectedChild ? getLocalizedChildName(selectedChild.name, locale) : undefined}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFilePicked}
                  className="hidden"
                />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder={t('pasteImageUrlPlaceholder')}
                  className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-stone-200 text-stone-600 truncate focus:outline-none focus:ring-1 focus:ring-pastel-coral/50"
                />
              </div>
            </div>
          </div>

          {/* Color & Mood */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">{t('colorMood')}</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder={t('colorMoodPlaceholder')}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-pastel-coral/50"
            />
          </div>

          {/* Season Rules */}
          {isSeasonApplicable ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700">{t('targetSeasons')}</label>
                <span className="text-[10px] text-stone-400">{t('multiSelectNote')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {seasonOptions.map((s) => {
                  const isChecked = selectedSeasons.includes(s.value);
                  return (
                    <button
                      type="button"
                      key={s.value}
                      onClick={() => handleToggleSeason(s.value)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        isChecked
                          ? 'bg-pastel-coral text-white border-pastel-coral shadow-xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <span>{s.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] text-stone-500 flex items-center gap-1.5">
              <span>👟 {t('seasonOmittedNote')}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 rounded-2xl bg-pastel-coral hover:bg-rose-500 text-white font-extrabold text-xs shadow-soft transition active:scale-98 disabled:opacity-50"
            >
              {(() => {
                const childFirstName = selectedChild?.name ? getLocalizedChildName(selectedChild.name, locale) : '';
                if (locale === 'ko') {
                  return `${childFirstName} 옷장에 저장하기`;
                }
                if (locale === 'ja') {
                  return `${childFirstName}のクローゼットに保存`;
                }
                if (locale === 'zh') {
                  return `保存到 ${childFirstName} 的衣橱`;
                }
                return `Save to ${childFirstName}'s Wardrobe`;
              })()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
