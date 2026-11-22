import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Upload, FlipHorizontal, AlertCircle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface GuidedCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  childName?: string;
}

export const GuidedCameraModal: React.FC<GuidedCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  childName,
}) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(true);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (mode: 'environment' | 'user') => {
    stopStream();
    setIsLoadingCamera(true);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsLoadingCamera(false);
    } catch (err: unknown) {
      console.warn('Failed to start camera, falling back to file upload:', err);
      const msg = err instanceof Error ? err.message : 'Camera permission was denied or device not found.';
      setCameraError(msg);
      setIsLoadingCamera(false);
    }
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera(facingMode);
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, capturedImage]);

  if (!isOpen) return null;

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopStream();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedImage(reader.result);
        stopStream();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-between max-w-[480px] mx-auto text-white">
      {/* Top Header */}
      <div className="p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-pastel-coral" />
            {t('cameraGuideTitle')}
          </h3>
          <p className="text-[11px] text-stone-300">
            {childName ? `${childName}: ${t('alignInsideGuide')}` : t('alignInsideGuide')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-stone-900">
        {capturedImage ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedImage}
              alt="Full-body preview"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white border border-white/20">
              {t('snapshotReady')}
            </div>
          </div>
        ) : cameraError ? (
          <div className="p-6 text-center space-y-4 max-w-xs mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">{t('cameraNoticeTitle')}</h4>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                {t('cameraNoticeDesc')}
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl bg-pastel-coral text-white font-bold text-xs shadow-lg hover:bg-rose-500 transition flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{t('chooseFromAlbum')}</span>
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {isLoadingCamera && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 text-pastel-coral">
                <RefreshCw className="w-7 h-7 animate-spin" />
                <span className="text-xs font-bold text-white">{t('startingCamera')}</span>
              </div>
            )}

            {/* SVG Silhouette & Marker Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              <svg
                viewBox="0 0 200 360"
                className="w-full h-full max-h-[460px] opacity-85 drop-shadow-md"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="guideGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#55EFC4" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#FFEAA7" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FF7675" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Standing Child Silhouette Outline */}
                <ellipse cx="100" cy="50" rx="20" ry="24" fill="none" stroke="url(#guideGlow)" strokeWidth="2" strokeDasharray="4,3" />
                <path
                  d="M86,72 C80,82 60,90 52,106 C46,120 48,150 52,168"
                  fill="none"
                  stroke="url(#guideGlow)"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
                <path
                  d="M114,72 C120,82 140,90 148,106 C154,120 152,150 148,168"
                  fill="none"
                  stroke="url(#guideGlow)"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
                <path
                  d="M68,102 C72,130 74,155 76,180 C82,183 118,183 124,180 C126,155 128,130 132,102"
                  fill="none"
                  stroke="url(#guideGlow)"
                  strokeWidth="2"
                />
                <path
                  d="M80,183 L75,260 L72,320 L66,330"
                  fill="none"
                  stroke="url(#guideGlow)"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
                <path
                  d="M96,185 L96,260 L96,325 L92,330"
                  fill="none"
                  stroke="url(#guideGlow)"
                  strokeWidth="2"
                />
                <path
                  d="M104,185 L104,260 L104,325 L108,330"
                  fill="none"
                  stroke="url(#guideGlow)"
                  strokeWidth="2"
                />
                <path
                  d="M120,183 L125,260 L128,320 L134,330"
                  fill="none"
                  stroke="url(#guideGlow)"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />

                {/* Alignment Guidelines */}
                <line x1="20" y1="26" x2="180" y2="26" stroke="#55EFC4" strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
                <text x="24" y="22" fill="#55EFC4" fontSize="8" fontWeight="bold">{t('headTopLine')}</text>

                <line x1="30" y1="92" x2="170" y2="92" stroke="#74B9FF" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                <text x="32" y="88" fill="#74B9FF" fontSize="8" fontWeight="bold">{t('shouldersLine')}</text>

                <line x1="30" y1="180" x2="170" y2="180" stroke="#FDCB6E" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.8" />
                <text x="32" y="176" fill="#FDCB6E" fontSize="8" fontWeight="bold">{t('waistLine')}</text>

                <line x1="20" y1="334" x2="180" y2="334" stroke="#FF7675" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />
                <text x="24" y="344" fill="#FF7675" fontSize="8" fontWeight="bold">{t('feetBaseline')}</text>
              </svg>

              <div className="absolute bottom-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold text-amber-300 border border-amber-300/30">
                {t('feetBaselineHint')}
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Bottom Controls Bar */}
      <div className="p-4 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
        {capturedImage ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleRetake}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('retakePhotoBtn')}</span>
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-pastel-coral hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t('confirmAnalyzeBtn')}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-2xl bg-white/15 hover:bg-white/25 flex flex-col items-center justify-center text-white transition gap-0.5"
              title={t('chooseFromAlbum')}
            >
              <Upload className="w-5 h-5 text-stone-200" />
              <span className="text-[9px] font-semibold">{t('albumBtn')}</span>
            </button>

            <button
              onClick={handleTakeSnapshot}
              disabled={isLoadingCamera || !!cameraError}
              className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 shadow-xl hover:scale-105 active:scale-95 transition disabled:opacity-40"
              title="Snap standing photo"
            >
              <div className="w-full h-full rounded-full bg-pastel-coral flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
            </button>

            <button
              onClick={handleToggleFacingMode}
              disabled={isLoadingCamera || !!cameraError}
              className="w-12 h-12 rounded-2xl bg-white/15 hover:bg-white/25 flex flex-col items-center justify-center text-white transition gap-0.5 disabled:opacity-40"
              title={t('flipBtn')}
            >
              <FlipHorizontal className="w-5 h-5 text-stone-200" />
              <span className="text-[9px] font-semibold">{t('flipBtn')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
