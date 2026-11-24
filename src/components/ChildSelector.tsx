import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Settings, Check, X, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { MAX_CHILDREN, ChildProfile } from '../types';
import { ChildProfileModal } from './ChildProfileModal';
import { getLocalizedChildName, formatChildAge } from '../utils/localeHelpers';

interface ChildSelectorProps {
  onAddChildClick?: () => void;
  onEditChildClick?: (child: ChildProfile) => void;
  showManageButtons?: boolean;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  onAddChildClick,
  onEditChildClick,
  showManageButtons = true,
}) => {
  const { childrenList, activeChildId, setActiveChildId, activeChild } = useApp();
  const { t, locale } = useTranslation();

  const isValidPhoto = (url?: string | null): boolean =>
    Boolean(
      url &&
        url.trim() !== '' &&
        !url.includes('unsplash.com') &&
        (url.startsWith('data:image/') || url.startsWith('blob:') || url.startsWith('http'))
    );

  // State for the profile edit/add modal (fallback for manual add/edit)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalEditChild, setModalEditChild] = useState<ChildProfile | null>(null);

  // State for the selector dropdown modal
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const canAddMore = (childrenList?.length || 0) < MAX_CHILDREN;

  const handleAdd = () => {
    if (onAddChildClick) {
      onAddChildClick();
    } else {
      setModalEditChild(null);
      setIsProfileModalOpen(true);
    }
  };

  const handleEdit = (child: ChildProfile) => {
    if (onEditChildClick) {
      onEditChildClick(child);
    } else {
      setModalEditChild(child);
      setIsProfileModalOpen(true);
    }
  };

  // Close selector on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelectOpen) {
        setIsSelectOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelectOpen]);

  return (
    <>
      {/* Trigger button and optional edit button */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsSelectOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-[#EAE2F3] text-[#231B2E] text-xs font-bold hover:bg-[#F4EFFA] transition shadow-2xs"
          title={t('selectChild' as any) || 'Select Child'}
        >
          {activeChild && (
            isValidPhoto(activeChild.fullBodyPhotoUrl) ? (
              <img
                src={activeChild.fullBodyPhotoUrl}
                alt={getLocalizedChildName(activeChild.name, locale)}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#F4EFFA] border border-[#8B68BD]/30 flex items-center justify-center text-[10px] font-black text-[#8B68BD]">
                {getLocalizedChildName(activeChild.name, locale).slice(0, 1)}
              </div>
            )
          )}
          <span className="max-w-[90px] truncate font-extrabold text-[#231B2E]">
            {activeChild ? getLocalizedChildName(activeChild.name, locale) : ''}
          </span>
          {activeChild && (
            <span className="text-[10px] text-[#5A4F6B] font-semibold bg-[#F4EFFA] px-1.5 py-0.2 rounded-full border border-[#EAE2F3]">
              {formatChildAge(activeChild.age, locale)}
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-[#5A4F6B]" />
        </button>
        {showManageButtons && activeChild && (
          <button
            type="button"
            onClick={() => handleEdit(activeChild)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#EAE2F3] text-[#5A4F6B] bg-white text-xs font-semibold shrink-0 hover:bg-[#F4EFFA] hover:text-[#7A56AE] hover:border-[#8B68BD]/40 transition"
            title={t('editChildBtn')}
          >
            <Settings className="w-3.5 h-3.5 text-[#5A4F6B]" />
            <span className="text-[11px]">{t('editChildBtn')}</span>
          </button>
        )}
      </div>

      {/* Selector Modal */}
      {isSelectOpen &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/50 flex flex-col items-center justify-start pt-4 px-4"
            onClick={() => setIsSelectOpen(false)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: 'calc(100dvh - 32px)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="shrink-0 p-4 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-stone-800">{t('targetChild')}</h3>
                <button
                  type="button"
                  onClick={() => setIsSelectOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {childrenList.map((child) => {
                  const isSelected = child.id === activeChildId;
                  const localizedName = getLocalizedChildName(child.name, locale);
                  const hasPhoto = isValidPhoto(child.fullBodyPhotoUrl);

                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        setActiveChildId(child.id);
                        setIsSelectOpen(false);
                      }}
                      className={`flex items-center gap-2.5 w-full p-2.5 rounded-xl transition ${
                        isSelected ? 'bg-[#8B68BD] text-white shadow-soft' : 'bg-[#FAF8FC] text-[#231B2E] hover:bg-[#F4EFFA]'
                      }`}
                    >
                      {hasPhoto ? (
                        <img
                          src={child.fullBodyPhotoUrl}
                          alt={localizedName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-[#F4EFFA] text-[#8B68BD] border border-[#8B68BD]/30'
                          }`}
                        >
                          {localizedName.slice(0, 1)}
                        </div>
                      )}
                      <span className="font-bold text-xs truncate flex-1 text-left">{localizedName}</span>
                      <span className={`text-[11px] font-medium ${isSelected ? 'text-white/80' : 'text-[#5A4F6B]'}`}>
                        {formatChildAge(child.age, locale)}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
              {/* Footer */}
              <div className="shrink-0 p-3 border-t border-[#EAE2F3] flex justify-between items-center">
                {canAddMore && (
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-[#8B68BD] text-[#7A56AE] bg-[#F4EFFA]/80 text-xs font-bold hover:bg-[#F4EFFA] transition"
                    title={t('addChildBtn')}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{t('addChildBtn')}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSelectOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                  title={t('cancel') ?? 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Internal Modal Fallback for Add / Edit Child */}
      <ChildProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        childToEdit={modalEditChild}
      />
    </>
  );
};
