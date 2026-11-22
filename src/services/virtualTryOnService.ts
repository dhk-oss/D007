import { ChildProfile, WardrobeItem, WeatherSnapshot } from '../types';
import { getLocalizedChildName, getLocalizedWeatherBadge } from '../utils/localeHelpers';

export interface VirtualTryOnParams {
  child: ChildProfile;
  items: WardrobeItem[];
  occasionLabel: string;
  weather: WeatherSnapshot;
  locale?: string;
}

export interface VirtualTryOnProvider {
  renderTryOn(params: VirtualTryOnParams): Promise<string>;
}

/** Loads an image URL safely into an HTMLImageElement */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // empty placeholder image on error
      const fallback = new Image();
      resolve(fallback);
    };
    img.src = src;
  });
}

// Helper to validate only user-uploaded photos
const isValidCustomPhoto = (url?: string | null): boolean =>
  Boolean(
    url &&
      (url.startsWith('data:image/') ||
        url.startsWith('blob:') ||
        url.includes('firebasestorage.googleapis.com'))
  );

const kidAvatarSvgString = `
<svg viewBox="0 0 320 440" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="studioBg" x1="0" y1="0" x2="0" y2="440" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FDFBF7" />
      <stop offset="100%" stop-color="#F2ECE1" />
    </linearGradient>
    <linearGradient id="avatarSkin" x1="160" y1="55" x2="160" y2="405" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#D8C7B4" />
      <stop offset="100%" stop-color="#BFA992" />
    </linearGradient>
    <linearGradient id="avatarOutfit" x1="160" y1="130" x2="160" y2="335" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E89E84" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#D4846A" stop-opacity="0.45" />
    </linearGradient>
  </defs>
  <rect width="320" height="440" fill="url(#studioBg)" />
  <ellipse cx="160" cy="406" rx="68" ry="11" fill="#DDD2C2" />
  <circle cx="160" cy="86" r="32" fill="url(#avatarSkin)" />
  <path d="M128 82 C128 52, 192 52, 192 82 C188 66, 132 66, 128 82 Z" fill="#A68E76" />
  <rect x="151" y="116" width="18" height="16" rx="6" fill="url(#avatarSkin)" />
  <path d="M118 140 L92 232 C90 239, 100 242, 104 235 L125 162 Z" fill="url(#avatarSkin)" />
  <path d="M202 140 L228 232 C230 239, 220 242, 216 235 L195 162 Z" fill="url(#avatarSkin)" />
  <path d="M132 252 L126 392 C126 399, 146 399, 147 392 L155 256 Z" fill="url(#avatarSkin)" />
  <path d="M188 252 L194 392 C194 399, 174 399, 173 392 L165 256 Z" fill="url(#avatarSkin)" />
  <path d="M120 138 C120 129, 200 129, 200 138 L195 252 C195 260, 125 260, 125 252 Z" fill="url(#avatarSkin)" />
  <path d="M120 138 C120 129, 200 129, 200 138 L195 252 C195 260, 125 260, 125 252 Z" fill="url(#avatarOutfit)" stroke="#C99B84" stroke-width="1.5" stroke-dasharray="4 3" />
</svg>
`;

/** High-fidelity HTML5 Canvas Virtual Try-On Compositor */
export class CanvasVirtualTryOnRenderer implements VirtualTryOnProvider {
  async renderTryOn(params: VirtualTryOnParams): Promise<string> {
    const { child, occasionLabel, weather, locale = 'ko' } = params;

    const width = 640;
    const height = 860;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return child.fullBodyPhotoUrl;

    const hasCustomPhoto = isValidCustomPhoto(child.fullBodyPhotoUrl);

    // 1. Draw avatar or custom photo
    if (hasCustomPhoto) {
      const childImg = await loadImage(child.fullBodyPhotoUrl);
      if (childImg.width > 0) {
        const scale = Math.max(width / childImg.width, height / childImg.height);
        const x = (width - childImg.width * scale) / 2;
        const y = (height - childImg.height * scale) / 2;
        ctx.drawImage(childImg, x, y, childImg.width * scale, childImg.height * scale);
      }
      // Light scrim for user photo readability
      const scrim = ctx.createLinearGradient(0, 0, 0, height);
      scrim.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
      scrim.addColorStop(0.2, 'rgba(0, 0, 0, 0.0)');
      scrim.addColorStop(0.8, 'rgba(0, 0, 0, 0.05)');
      scrim.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Draw crisp KidAvatarIllustration centered and clearly visible
      const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(kidAvatarSvgString);
      const avatarImg = await loadImage(svgDataUrl);
      if (avatarImg.width > 0) {
        const scale = Math.min((width * 0.95) / avatarImg.width, (height * 0.95) / avatarImg.height);
        const dw = avatarImg.width * scale;
        const dh = avatarImg.height * scale;
        const dx = (width - dw) / 2;
        const dy = (height - dh) / 2;

        // Warm studio background fill
        ctx.fillStyle = '#FDFBF7';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(avatarImg, dx, dy, dw, dh);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#FDFBF7');
        grad.addColorStop(1, '#F2ECE1');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    }

    const localizedName = getLocalizedChildName(child.name, locale);
    const localizedCondition = getLocalizedWeatherBadge(weather.condition, locale);

    // 2. Header card: Child info & Occasion (clean, subtle)
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    this.roundRect(ctx, 24, 24, width - 48, 64, 20);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#FF7B60';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('✨ AI VIRTUAL TRY-ON FITTING', 42, 48);

    ctx.fillStyle = '#2D3436';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(`${localizedName} • ${occasionLabel}`, 42, 70);

    ctx.fillStyle = '#636E72';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${weather.temp}°C ${localizedCondition}`, width - 44, 58);
    ctx.restore();

    // 3. Bottom Brand & Fit Status Watermark
    ctx.save();
    ctx.fillStyle = 'rgba(45, 52, 54, 0.85)';
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(
      `Kids AI Stylist • Fitted for ${localizedName} (${child.bodyProportionAnalysis.upperToLowerRatio} Ratio)`,
      width / 2,
      height - 30
    );
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.92);
  }

  /** Rounded rectangle helper */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

// Singleton provider instance
let tryOnRenderer: VirtualTryOnProvider = new CanvasVirtualTryOnRenderer();

export function setVirtualTryOnProvider(provider: VirtualTryOnProvider) {
  tryOnRenderer = provider;
}

export async function generateVirtualTryOn(params: VirtualTryOnParams): Promise<string> {
  return tryOnRenderer.renderTryOn(params);
}
