import React, { useState } from 'react';
import { MapPin, X, Check, Globe } from 'lucide-react';
import { LocationInfo } from '../types';
import { PRESET_LOCATIONS, LocationOption } from '../services/weatherService';
import { useTranslation } from '../context/LanguageContext';
import { getLocalizedLocation } from '../utils/localeHelpers';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationInfo;
  onSelectLocation: (location: LocationInfo) => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const { t, locale } = useTranslation();
  const [selectedPreset, setSelectedPreset] = useState<LocationOption | null>(null);
  const [country, setCountry] = useState(currentLocation.country || 'South Korea');
  const [province, setProvince] = useState(currentLocation.province || 'Seoul');
  const [city, setCity] = useState(currentLocation.city || 'Gangnam-gu');

  if (!isOpen) return null;

  const handlePickPreset = (preset: LocationOption) => {
    setSelectedPreset(preset);
    setCountry(preset.country);
    setProvince(preset.province);
    setCity(preset.city);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectLocation({
      country: country.trim() || 'South Korea',
      province: province.trim() || 'Seoul',
      city: city.trim() || 'Gangnam-gu',
      displayName: `${city.trim()}, ${province.trim()} (${country.trim()})`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pastel-coral-light text-pastel-coral">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-800">{t('setLocationTitle')}</h3>
              <p className="text-[11px] text-stone-400">{t('setLocationSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Preset Pills */}
        <div>
          <span className="text-xs font-bold text-stone-700 block mb-2 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-pastel-coral" />
            {t('quickSelectLocations')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_LOCATIONS.map((preset) => {
              const isSelected =
                (selectedPreset && selectedPreset.label === preset.label) ||
                (currentLocation.city === preset.city && currentLocation.province === preset.province);
              const localizedLabel = getLocalizedLocation(preset, locale);
              return (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => handlePickPreset(preset)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                    isSelected
                      ? 'bg-pastel-coral text-white border-pastel-coral shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {localizedLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Location Form */}
        <form onSubmit={handleApply} className="space-y-3 pt-2 border-t border-stone-100">
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('country')}</label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. South Korea"
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-pastel-coral/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('provinceState')}</label>
              <input
                type="text"
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="e.g. Gyeonggi-do / Seoul"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-pastel-coral/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">{t('cityDistrict')}</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Goyang-si / Gangnam-gu"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-pastel-coral/50"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-pastel-coral text-white font-extrabold text-xs shadow-soft hover:bg-rose-500 transition flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t('updateForecast')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
