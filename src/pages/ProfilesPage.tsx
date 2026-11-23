import React, { useState } from 'react';
import { Plus, Activity, CheckCircle2, Camera, Edit2, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { ChildProfile, GenderType, BodyProportionAnalysis } from '../types';
import { GuidedCameraModal } from '../components/GuidedCameraModal';
import {
  estimateBodyProportions,
  getLocalizedSilhouetteLabel,
  getLocalizedBodySummary,
  getLocalizedStylingNotes,
} from '../services/bodyProportionService';
import { getLocalizedChildName } from '../utils/localeHelpers';

export const ProfilesPage: React.FC = () => {
  const {
    childrenList,
    activeChildId,
    setActiveChildId,
    addChildProfile,
    updateChildProfile,
    deleteChildProfile,
  } = useApp();
  const { t, locale } = useTranslation();

  const isValidPhoto = (url?: string | null): boolean =>
    Boolean(
      url &&
        url.trim() !== '' &&
        !url.includes('unsplash.com') &&
        (url.startsWith('data:image/') || url.startsWith('blob:') || url.includes('firebasestorage.googleapis.com'))
    );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [gender, setGender] = useState<GenderType>('female');
  const [age, setAge] = useState(6);
  const [heightCm, setHeightCm] = useState(115);
  const [weightKg, setWeightKg] = useState(20);
  const [waistCm, setWaistCm] = useState(52);
  const [photoUrl, setPhotoUrl] = useState('');
  const [previewAnalysis, setPreviewAnalysis] = useState<BodyProportionAnalysis | null>(null);

  const activeChild = (childrenList && childrenList.find((c) => c.id === activeChildId)) ||
    (childrenList && childrenList[0]) || {
      id: 'child-1',
      name: 'Ha-eun (Chloe)',
      gender: 'female' as const,
      age: 6,
      heightCm: 115,
      weightKg: 20.5,
      waistCm: 53,
      fullBodyPhotoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=400&q=80',
      bodyProportionAnalysis: {
        torsoRatio: 0.41,
        legRatio: 0.59,
        upperToLowerRatio: '41:59',
        silhouetteType: 'tall-lean' as const,
        bodyTypeSummary: 'Long-limbed slender profile with elongated lower body proportions.',
        stylingNotes: ['High-waisted A-line cuts accentuate natural leg line.'],
        analyzedAt: new Date().toISOString(),
      },
      parentId: 'parent-1',
    };

  const listCount = childrenList?.length || 0;
  const maxLimitReached = listCount >= 5;
  const remainingSlots = Math.max(0, 5 - listCount);

  const handleOpenAddModal = () => {
    if (maxLimitReached) {
      alert(t('maxLimitReached'));
      return;
    }
    setEditingChild(null);
    setName('');
    setGender('female');
    setAge(6);
    setHeightCm(115);
    setWeightKg(20);
    setWaistCm(52);
    setPhotoUrl('');
    setPreviewAnalysis(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (child: ChildProfile) => {
    setEditingChild(child);
    setName(child.name);
    setGender(child.gender);
    setAge(child.age);
    setHeightCm(child.heightCm);
    setWeightKg(child.weightKg);
    setWaistCm(child.waistCm);
    setPhotoUrl(child.fullBodyPhotoUrl);
    setPreviewAnalysis(child.bodyProportionAnalysis);
    setIsModalOpen(true);
  };

  const handleCameraCapture = async (dataUrl: string) => {
    setPhotoUrl(dataUrl);
    setIsCameraModalOpen(false);
    setIsAnalyzing(true);

    try {
      const analysis = await estimateBodyProportions({
        imageDataUrlOrUrl: dataUrl,
        age: Number(age),
        gender,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        waistCm: Number(waistCm),
      });
      setPreviewAnalysis(analysis);
    } catch (err) {
      console.error('Proportion estimation failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunEstimation = async () => {
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (age < 3 || age > 11) {
      alert('Age must be between 3 and 11.');
      return;
    }

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

    if (editingChild) {
      updateChildProfile({
        ...editingChild,
        name: name.trim() || editingChild.name,
        gender,
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        waistCm: Number(waistCm),
        fullBodyPhotoUrl: photoUrl,
        bodyProportionAnalysis: finalAnalysis,
      });
    } else {
      addChildProfile({
        parentId: 'parent-1',
        name: name.trim() || 'My Child',
        gender,
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        waistCm: Number(waistCm),
        fullBodyPhotoUrl: photoUrl,
        bodyProportionAnalysis: finalAnalysis,
      });
    }

    setIsModalOpen(false);
  };

  const ratioBadge = activeChild?.bodyProportionAnalysis?.upperToLowerRatio || '44:56';
  const rawSilhouetteType = activeChild?.bodyProportionAnalysis?.silhouetteType || 'balanced';
  const silhouetteLabel = getLocalizedSilhouetteLabel(rawSilhouetteType, locale);
  const torsoPercent = Math.round((activeChild?.bodyProportionAnalysis?.torsoRatio ?? 0.44) * 100);
  const legPercent = Math.round((activeChild?.bodyProportionAnalysis?.legRatio ?? 0.56) * 100);
  const localizedSummary = getLocalizedBodySummary(rawSilhouetteType, ratioBadge, locale);
  const localizedNotes = getLocalizedStylingNotes(rawSilhouetteType, locale);

  return (
    <div className="p-4 space-y-4">
      {/* Header with Max 5 Limit Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-stone-800 tracking-tight">{t('profilesTitle')}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold text-stone-600">
              {t('managedCount')}: {listCount} / 5
            </span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                maxLimitReached
                  ? 'bg-rose-100 text-rose-600 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}
            >
              {maxLimitReached ? t('maxLimitReached') : `${remainingSlots} ${t('slotsAvailable')}`}
            </span>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          disabled={maxLimitReached}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-pastel-coral text-white rounded-2xl text-xs font-bold shadow-soft hover:bg-rose-500 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addChildBtn')}</span>
        </button>
      </div>

      {/* Profiles Carousel */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {(childrenList || []).map((child: ChildProfile) => {
          const isSelected = child.id === activeChild.id;
          const childDisplayName = getLocalizedChildName(child.name, locale);
          const hasPhoto = isValidPhoto(child.fullBodyPhotoUrl);

          return (
            <button
              key={child.id}
              onClick={() => setActiveChildId(child.id)}
              className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all shrink-0 ${
                isSelected
                  ? 'bg-white border-pastel-coral shadow-soft ring-2 ring-pastel-coral/20 scale-102'
                  : 'bg-stone-50 border-stone-200 opacity-75 hover:opacity-100'
              }`}
            >
              {hasPhoto ? (
                <img
                  src={child.fullBodyPhotoUrl}
                  alt={childDisplayName}
                  className="w-10 h-10 rounded-xl object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-pastel-coral-light border border-pastel-coral/30 flex items-center justify-center text-sm font-black text-pastel-coral">
                  {childDisplayName.slice(0, 1)}
                </div>
              )}
              <div className="text-left">
                <div className="font-extrabold text-xs text-stone-800 flex items-center gap-1">
                  <span>{childDisplayName}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-pastel-coral" />}
                </div>
                <div className="text-[10px] text-stone-500">
                  {child.gender === 'male' ? t('boy') : t('girl')} • {child.age}세
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Child Full Profile & Proportion Analysis */}
      {activeChild && (
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft space-y-4">
          <div className="flex gap-4">
            <div className="relative w-28 h-36 rounded-2xl overflow-hidden bg-[#FAF7F2] shrink-0 border border-stone-200 shadow-xs flex items-center justify-center">
              {isValidPhoto(activeChild.fullBodyPhotoUrl) ? (
                <img
                  src={activeChild.fullBodyPhotoUrl}
                  alt={getLocalizedChildName(activeChild.name, locale)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-28 opacity-90">
                  <ellipse cx="50" cy="120" rx="25" ry="5" fill="#E6DDD0" />
                  <circle cx="50" cy="28" r="11" fill="#C99B84" />
                  <rect x="47" y="38" width="6" height="5" rx="2" fill="#C99B84" />
                  <path d="M38 43 C38 40, 62 40, 62 43 L60 76 C60 78, 40 78, 40 76 Z" fill="#D4846A" />
                  <path d="M41 77 L40 115 C40 118, 47 118, 47 115 L50 78 Z" fill="#BFA992" />
                  <path d="M59 77 L60 115 C60 118, 53 118, 53 115 L50 78 Z" fill="#BFA992" />
                  <path d="M37 44 L28 72 C27 75, 31 76, 32 73 L39 52 Z" fill="#C99B84" />
                  <path d="M63 44 L72 72 C73 75, 69 76, 68 73 L61 52 Z" fill="#C99B84" />
                </svg>
              )}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {ratioBadge}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-coral bg-pastel-coral-light px-2 py-0.5 rounded-full">
                    {t('proportionAnalysisTitle')}
                  </span>
                  <h3 className="text-base font-black text-stone-800 mt-1">{getLocalizedChildName(activeChild.name, locale)}</h3>
                </div>
                <button
                  onClick={() => handleOpenEditModal(activeChild)}
                  className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition"
                  title={t('editChildBtn')}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-pastel-warm/60 p-2 rounded-xl">
                  <span className="text-stone-400 text-[10px] block font-medium">{t('heightCm')}</span>
                  <span className="font-extrabold text-stone-800">{activeChild.heightCm} cm</span>
                </div>
                <div className="bg-pastel-warm/60 p-2 rounded-xl">
                  <span className="text-stone-400 text-[10px] block font-medium">{t('weightKg')}</span>
                  <span className="font-extrabold text-stone-800">{activeChild.weightKg} kg</span>
                </div>
                <div className="bg-pastel-warm/60 p-2 rounded-xl">
                  <span className="text-stone-400 text-[10px] block font-medium">{t('waistCm')}</span>
                  <span className="font-extrabold text-stone-800">{activeChild.waistCm} cm</span>
                </div>
                <div className="bg-pastel-warm/60 p-2 rounded-xl">
                  <span className="text-stone-400 text-[10px] block font-medium">{t('ageGroup')}</span>
                  <span className="font-extrabold text-stone-800">{activeChild.age}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Proportion View */}
          <div className="pt-3 border-t border-stone-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                <Activity className="w-4 h-4 text-pastel-coral" />
                <span>{t('proportionAnalysisTitle')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {silhouetteLabel}
                </span>
                <span className="text-[10px] font-bold text-pastel-coral bg-pastel-coral-light px-2 py-0.5 rounded-full">
                  {t('ratio')} {ratioBadge}
                </span>
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-stone-600">
                <span>{t('upperBody')}: {torsoPercent}%</span>
                <span>{t('lowerBody')}: {legPercent}%</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{ width: `${torsoPercent}%` }}
                  title="Torso Ratio"
                />
                <div
                  className="bg-pastel-coral h-full transition-all duration-500"
                  style={{ width: `${legPercent}%` }}
                  title="Leg Ratio"
                />
              </div>
              <div className="flex justify-between text-[9px] text-stone-400">
                <span>{t('headToHip')}</span>
                <span>{t('hipToFeet')}</span>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-1.5">
              <p className="text-xs text-stone-800 leading-relaxed font-semibold">
                {localizedSummary}
              </p>
              {localizedNotes.length > 0 && (
                <div className="pt-1.5 border-t border-amber-200/50 space-y-1">
                  <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block">
                    {t('tailoredTipsTitle')}
                  </span>
                  <ul className="space-y-1 text-xs text-stone-700">
                    {localizedNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-pastel-coral font-bold">•</span>
                        <span className="leading-snug">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quick Action to Launch Camera Guide */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setEditingChild(activeChild);
                  setName(activeChild.name);
                  setGender(activeChild.gender);
                  setAge(activeChild.age);
                  setHeightCm(activeChild.heightCm);
                  setWeightKg(activeChild.weightKg);
                  setWaistCm(activeChild.waistCm);
                  setPhotoUrl(activeChild.fullBodyPhotoUrl);
                  setIsCameraModalOpen(true);
                }}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-pastel-warm hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-pastel-coral" />
                <span>{t('retakeStandingPhoto')}</span>
              </button>
              {(childrenList?.length || 0) > 1 && (
                <button
                  onClick={() => {
                    if (confirm(t('deleteChildConfirm'))) {
                      deleteChildProfile(activeChild.id);
                    }
                  }}
                  className="p-2.5 rounded-2xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition"
                  title="Delete child profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guided Camera Modal */}
      <GuidedCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        childName={name || activeChild?.name}
      />

      {/* Add / Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold text-pastel-coral uppercase tracking-wider">
                  {editingChild ? t('updateChildTitle') : t('registerChildTitle')}
                </span>
                <h3 className="font-extrabold text-base text-stone-800">
                  {editingChild ? `${editingChild.name}` : t('addChildBtn')}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                {t('cancel')}
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t('childName')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Si-woo (Sean)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-pastel-coral/50"
                />
              </div>

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
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t('ageGroup')}</label>
                  <input
                    type="number"
                    min={3}
                    max={11}
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('heightCm')}</label>
                  <input
                    type="number"
                    required
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('weightKg')}</label>
                  <input
                    type="number"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('waistCm')}</label>
                  <input
                    type="number"
                    required
                    value={waistCm}
                    onChange={(e) => setWaistCm(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              {/* Full-Body Photo with Guided Camera Button */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t('standingPhoto')}</label>
                <div className="flex gap-2.5 items-center">
                  <div className="w-14 h-18 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 flex items-center justify-center">
                    {isValidPhoto(photoUrl) ? (
                      <img src={photoUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-pastel-coral-light border border-pastel-coral/30 flex items-center justify-center text-xs font-black text-pastel-coral">
                        {getLocalizedChildName(name || activeChild?.name || '아이', locale).slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="w-full py-2 px-3 rounded-xl bg-pastel-coral text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-rose-500 transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{t('launchCameraBtn')}</span>
                    </button>
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

              {/* Estimation Preview & Rerun */}
              <div className="p-3 bg-pastel-warm/70 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-pastel-coral" />
                    {t('proportionEstimate')}
                  </span>
                  <button
                    type="button"
                    onClick={handleRunEstimation}
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
                      <span className="capitalize text-amber-700">{previewAnalysis.silhouetteType}</span>
                    </div>
                    <p className="text-[11px] line-clamp-2">{previewAnalysis.bodyTypeSummary}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-400">
                    {t('takePhotoHint')}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full py-3 rounded-2xl bg-pastel-coral text-white font-extrabold text-xs shadow-soft hover:bg-rose-500 transition active:scale-98 disabled:opacity-50"
                >
                  {editingChild ? t('updateProfileSubmit') : t('registerProfileSubmit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
