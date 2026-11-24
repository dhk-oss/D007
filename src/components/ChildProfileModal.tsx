import React, { useState, useEffect, useRef } from 'react';
import { Camera, Sparkles, RefreshCw, X, Check, UserPlus, UserCog, Upload } from 'lucide-react';
import { ChildProfile, GenderType, BodyProportionAnalysis, MAX_CHILDREN } from '../types';
import { GuidedCameraModal } from './GuidedCameraModal';
import {
  estimateBodyProportions,
  getLocalizedSilhouetteLabel,
  getLocalizedBodySummary,
} from '../services/bodyProportionService';
import { useTranslation } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { getLocalizedChildName, isDefaultChildName } from '../utils/localeHelpers';
import { compressImageToDataUrl } from '../services/dataService';

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  childToEdit?: ChildProfile | null;
  onSuccess?: (childId: string) => void;
}

export const ChildProfileModal: React.FC<ChildProfileModalProps> = ({
  isOpen,
  onClose,
  childToEdit,
  onSuccess,
}) => {
  const { t, locale } = useTranslation();
  const { childrenList, addChildProfile, updateChildProfile } = useApp();

  const isValidPhoto = (url?: string | null): boolean =>
    Boolean(
      url &&
        url.trim() !== '' &&
        !url.includes('unsplash.com') &&
        (url.startsWith('data:image/') || url.startsWith('blob:') || url.includes('firebasestorage.googleapis.com'))
    );

  const isEditMode = !!childToEdit;

  // Form states
  const [name, setName] = useState('');
  const [gender, setGender] = useState<GenderType>('female');
  const [age, setAge] = useState(6);
  const [heightCm, setHeightCm] = useState(115);
  const [weightKg, setWeightKg] = useState(20);
  const [waistCm, setWaistCm] = useState(52);
  const [photoUrl, setPhotoUrl] = useState('');
  const [previewAnalysis, setPreviewAnalysis] = useState<BodyProportionAnalysis | null>(null);

  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when opening modal
  useEffect(() => {
    if (isOpen) {
      if (childToEdit) {
        const initialName = isDefaultChildName(childToEdit.name)
          ? getLocalizedChildName(childToEdit.name, locale)
          : childToEdit.name;
        setName(initialName);
        setGender(childToEdit.gender);
        setAge(childToEdit.age);
        setHeightCm(childToEdit.heightCm);
        setWeightKg(childToEdit.weightKg);
        setWaistCm(childToEdit.waistCm);
        setPhotoUrl(childToEdit.fullBodyPhotoUrl);
        setPreviewAnalysis(childToEdit.bodyProportionAnalysis);
      } else {
        setName('');
        setGender('female');
        setAge(6);
        setHeightCm(115);
        setWeightKg(20);
        setWaistCm(52);
        setPhotoUrl('');
        setPreviewAnalysis(null);
      }
    }
  }, [isOpen, childToEdit, locale]);

  if (!isOpen) return null;

  const currentCount = childrenList?.length || 0;
  const isMaxReached = !isEditMode && currentCount >= MAX_CHILDREN;

  // Camera capture handler
  const handleCameraCapture = async (capturedDataUrl: string) => {
    setPhotoUrl(capturedDataUrl);
    setIsCameraModalOpen(false);
    setIsAnalyzing(true);

    try {
      const analysis = await estimateBodyProportions({
        imageDataUrlOrUrl: capturedDataUrl,
        age: Number(age),
        gender,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        waistCm: Number(waistCm),
      });
      setPreviewAnalysis(analysis);
    } catch (err) {
      console.warn('Proportion estimation error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Saved image file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 800, 800, 0.8);
      setPhotoUrl(compressedDataUrl);

      const analysis = await estimateBodyProportions({
        imageDataUrlOrUrl: compressedDataUrl,
        age: Number(age),
        gender,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        waistCm: Number(waistCm),
      });
      setPreviewAnalysis(analysis);
    } catch (err) {
      console.warn('Failed to compress/analyze uploaded image:', err);
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Manual recalculation of proportion
  const handleRecalculateProportion = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await estimateBodyProportions({
        imageDataUrlOrUrl: photoUrl,
        age: Number(age),
        gender,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        waistCm: Number(waistCm),
      });
      setPreviewAnalysis(analysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit profile save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (age < 3 || age > 11) {
      alert(t('ageGroup') + ': 3 - 11');
      return;
    }

    if (isMaxReached) {
      alert(t('maxLimitReached'));
      return;
    }

    // Ensure analysis exists
    let finalAnalysis = previewAnalysis;
    if (!finalAnalysis) {
      finalAnalysis = await estimateBodyProportions({
        imageDataUrlOrUrl: photoUrl,
        age: Number(age),
        gender,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        waistCm: Number(waistCm),
      });
    }

    if (isEditMode && childToEdit) {
      const updatedChild: ChildProfile = {
        ...childToEdit,
        name: name.trim() || childToEdit.name,
        gender,
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        waistCm: Number(waistCm),
        fullBodyPhotoUrl: photoUrl,
        bodyProportionAnalysis: finalAnalysis,
      };
      updateChildProfile(updatedChild);
      onSuccess?.(updatedChild.id);
    } else {
      const newChildData: Omit<ChildProfile, 'id'> = {
        parentId: 'parent-1',
        name: name.trim() || 'My Child',
        gender,
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        waistCm: Number(waistCm),
        fullBodyPhotoUrl: photoUrl,
        bodyProportionAnalysis: finalAnalysis,
      };
      addChildProfile(newChildData);
      onSuccess?.(childrenList[childrenList.length - 1]?.id || 'child-new');
    }

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pastel-coral-light text-pastel-coral">
                {isEditMode ? <UserCog className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] font-bold text-pastel-coral uppercase tracking-wider">
                  {isEditMode ? t('updateChildTitle') : t('registerChildTitle')}
                </span>
                <h3 className="font-extrabold text-base text-stone-800 leading-tight">
                  {isEditMode ? getLocalizedChildName(childToEdit.name, locale) : t('addChildBtn')}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Limit Notice if Max Reached */}
          {isMaxReached && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold text-center">
              {t('maxLimitReached')} ({MAX_CHILDREN} / {MAX_CHILDREN})
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Child's Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t('childName')}</label>
              <input
                type="text"
                required
                placeholder={locale === 'ko' ? '예: 하은 / 민우' : 'e.g. Min-woo (Leo) / Chloe'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-pastel-coral/50"
              />
            </div>

            {/* Gender & Age (3-11) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t('gender')}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as GenderType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                >
                  <option value="female">{t('girl')}</option>
                  <option value="male">{t('boy')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('ageGroup')}
                </label>
                <input
                  type="number"
                  min={3}
                  max={11}
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-pastel-coral/50"
                />
              </div>
            </div>

            {/* Height, Weight, Waist */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('heightCm')}</label>
                <input
                  type="number"
                  required
                  min={60}
                  max={180}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-2 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('weightKg')}</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={80}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-2 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('waistCm')}</label>
                <input
                  type="number"
                  required
                  min={35}
                  max={100}
                  value={waistCm}
                  onChange={(e) => setWaistCm(Number(e.target.value))}
                  className="w-full px-2 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>
            </div>

            {/* Standing Photo & Camera Trigger */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t('standingPhoto')}</label>
              <div className="flex gap-2.5 items-center">
                <div className="w-14 h-18 rounded-xl overflow-hidden border border-stone-200 bg-[#FAF7F2] shrink-0 flex items-center justify-center">
                  {isValidPhoto(photoUrl) ? (
                    <img src={photoUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-pastel-coral-light border border-pastel-coral/30 flex items-center justify-center text-xs font-black text-pastel-coral">
                      {getLocalizedChildName(name || childToEdit?.name || '아이', locale).slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="w-full py-2 px-2 rounded-xl bg-pastel-coral text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs hover:bg-rose-500 transition active:scale-98"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span className="truncate">{t('launchCameraBtn')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold flex items-center justify-center gap-1 border border-stone-200 transition active:scale-98"
                    >
                      <Upload className="w-3.5 h-3.5 text-stone-600" />
                      <span className="truncate">{t('uploadSavedPhotoBtn') || '저장된 사진 업로드'}</span>
                    </button>
                  </div>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder={t('enterUrlOrUpload')}
                    className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-stone-200 text-stone-500 truncate"
                  />
                </div>
              </div>
            </div>

            {/* Proportion Estimate Preview */}
            <div className="p-3 bg-pastel-warm/70 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pastel-coral" />
                  {t('proportionEstimate')}
                </span>
                <button
                  type="button"
                  onClick={handleRecalculateProportion}
                  disabled={isAnalyzing}
                  className="text-[10px] font-bold text-pastel-coral hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{t('recalculate')}</span>
                </button>
              </div>

              {isAnalyzing ? (
                <div className="text-center py-2 text-xs text-pastel-coral font-bold flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('analyzingProportion')}</span>
                </div>
              ) : previewAnalysis ? (
                <div className="space-y-1 text-xs text-stone-600">
                  <div className="flex justify-between font-bold">
                    <span>{t('ratio')}: {previewAnalysis.upperToLowerRatio}</span>
                    <span className="capitalize text-amber-700">
                      {getLocalizedSilhouetteLabel(previewAnalysis.silhouetteType, locale)}
                    </span>
                  </div>
                  <p className="text-[11px] line-clamp-2">
                    {getLocalizedBodySummary(previewAnalysis.silhouetteType, previewAnalysis.upperToLowerRatio, locale)}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-stone-400">
                  {t('takePhotoHint')}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-stone-100 text-stone-600 font-bold text-xs hover:bg-stone-200 transition"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isAnalyzing || isMaxReached}
                className="flex-2 py-3 rounded-2xl bg-pastel-coral text-white font-extrabold text-xs shadow-soft hover:bg-rose-500 transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {isEditMode ? t('updateProfileSubmit') : t('registerProfileSubmit')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Guided Camera Modal */}
      <GuidedCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        childName={name}
      />
    </>
  );
};
