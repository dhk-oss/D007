import React, { useEffect, useRef, useState } from 'react';
import { X, Camera } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

/**
 * GarmentCameraModal – a modal that allows parents to capture a photo of a garment
 * using the device camera. It provides front/rear camera switching, a simple overlay
 * guide, and fallback to a file picker when camera access is not available.
 */
interface GarmentCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  childName?: string;
}

export const GarmentCameraModal: React.FC<GarmentCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [usingFront, setUsingFront] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start camera when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const constraints: MediaStreamConstraints = {
      video: { facingMode: usingFront ? 'user' : { exact: 'environment' } },
      audio: false,
    };
    let stream: MediaStream;
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
        setIsCameraReady(true);
      })
      .catch((err) => {
        console.warn('Camera access error:', err);
        setError(t('cameraNotAvailable') ?? 'Camera not available');
        setIsCameraReady(false);
      });
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, usingFront, t]);

  const handleToggleCamera = () => setUsingFront((prev) => !prev);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Set canvas size to video size (limited to 800px width for payload size)
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // reasonable compression
    onCapture(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-coral">
              {t('garmentCaptureTitle') ?? 'Garment Capture'}
            </span>
            <h3 className="font-extrabold text-base text-stone-800">
              {t('captureGarmentBtn') ?? 'Take Garment Photo'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Video preview or error */}
        {error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="relative aspect-square bg-stone-100 flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            {/* Simple overlay guide – a centered rectangle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-3/4 border-2 border-dashed border-pastel-coral rounded-lg" />
            </div>
            {/* Controls */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center space-x-2">
              <button
                type="button"
                onClick={handleToggleCamera}
                className="px-2 py-1 bg-pastel-coral text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {usingFront ? t('useRearCamera') ?? 'Rear' : t('useFrontCamera') ?? 'Front'}
              </button>
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isCameraReady}
                className="px-3 py-1 bg-pastel-warm text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {t('confirmPhoto') ?? 'Confirm'}
              </button>
            </div>
          </div>
        )}
        {/* Hidden canvas for snapshot */}
        <canvas ref={canvasRef} className="hidden" />
        {/* Fallback file picker */}
        <div className="pt-2 flex justify-center">
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1 bg-pastel-coral-light text-pastel-coral rounded-xl text-xs font-bold">
            <Camera className="w-4 h-4" />
            {t('uploadPhotoFallback') ?? 'Upload Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const dataUrl = reader.result as string;
                  onCapture(dataUrl);
                  onClose();
                };
                reader.readAsDataURL(file);
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
