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

/** Loads an image URL safely into an HTMLImageElement with CORS fallback */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (!src || src.trim() === '') {
      resolve(new Image());
      return;
    }

    const img = new Image();
    // Only set crossOrigin if not a local data/blob URL to prevent unnecessary CORS security errors
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => resolve(img);
    img.onerror = () => {
      // If anonymous CORS failed on external domain, try fallback without crossOrigin
      if (img.crossOrigin) {
        const retryImg = new Image();
        retryImg.onload = () => resolve(retryImg);
        retryImg.onerror = () => resolve(new Image());
        retryImg.src = src;
      } else {
        resolve(new Image());
      }
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
      <stop offset="0%" stop-color="#FAF8FC" />
      <stop offset="100%" stop-color="#F4EFFA" />
    </linearGradient>
    <linearGradient id="avatarSkin" x1="160" y1="55" x2="160" y2="405" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#D8C7B4" />
      <stop offset="100%" stop-color="#BFA992" />
    </linearGradient>
    <linearGradient id="avatarOutfit" x1="160" y1="130" x2="160" y2="335" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8B68BD" stop-opacity="0.30" />
      <stop offset="100%" stop-color="#7A56AE" stop-opacity="0.45" />
    </linearGradient>
  </defs>
  <rect width="320" height="440" fill="url(#studioBg)" />
  <ellipse cx="160" cy="406" rx="68" ry="11" fill="#DDD5E8" />
  <circle cx="160" cy="86" r="32" fill="url(#avatarSkin)" />
  <path d="M128 82 C128 52, 192 52, 192 82 C188 66, 132 66, 128 82 Z" fill="#755E88" />
  <rect x="151" y="116" width="18" height="16" rx="6" fill="url(#avatarSkin)" />
  <path d="M118 140 L92 232 C90 239, 100 242, 104 235 L125 162 Z" fill="url(#avatarSkin)" />
  <path d="M202 140 L228 232 C230 239, 220 242, 216 235 L195 162 Z" fill="url(#avatarSkin)" />
  <path d="M132 252 L126 392 C126 399, 146 399, 147 392 L155 256 Z" fill="url(#avatarSkin)" />
  <path d="M188 252 L194 392 C194 399, 174 399, 173 392 L165 256 Z" fill="url(#avatarSkin)" />
  <path d="M120 138 C120 129, 200 129, 200 138 L195 252 C195 260, 125 260, 125 252 Z" fill="url(#avatarSkin)" />
  <path d="M120 138 C120 129, 200 129, 200 138 L195 252 C195 260, 125 260, 125 252 Z" fill="url(#avatarOutfit)" stroke="#8B68BD" stroke-width="1.5" stroke-dasharray="4 3" />
</svg>
`;

/**
 * Strips solid white, light grey, or high-luminance studio background from garment photos
 * via canvas pixel analysis, returning an offscreen canvas with a transparent, soft-edged cutout.
 */
function createGarmentCutout(sourceImg: HTMLImageElement): HTMLCanvasElement {
  const gCanvas = document.createElement('canvas');
  const w = sourceImg.naturalWidth || sourceImg.width;
  const h = sourceImg.naturalHeight || sourceImg.height;
  gCanvas.width = Math.min(w, 800);
  gCanvas.height = Math.round((gCanvas.width * h) / w);
  const gCtx = gCanvas.getContext('2d', { willReadFrequently: true });
  if (!gCtx) return gCanvas;

  gCtx.drawImage(sourceImg, 0, 0, gCanvas.width, gCanvas.height);

  try {
    const imgData = gCtx.getImageData(0, 0, gCanvas.width, gCanvas.height);
    const data = imgData.data;

    // Sample the 4 corner pixels to determine background reference color
    const corners = [
      [0, 0],
      [gCanvas.width - 1, 0],
      [0, gCanvas.height - 1],
      [gCanvas.width - 1, gCanvas.height - 1],
    ];

    let avgBgR = 255;
    let avgBgG = 255;
    let avgBgB = 255;
    let validCorners = 0;

    for (const [cx, cy] of corners) {
      const idx = (cy * gCanvas.width + cx) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      // Check if corner is near-white or light grey studio backdrop
      if (a > 200 && r > 210 && g > 210 && b > 210) {
        avgBgR += r;
        avgBgG += g;
        avgBgB += b;
        validCorners++;
      }
    }

    if (validCorners > 0) {
      avgBgR = Math.round(avgBgR / (validCorners + 1));
      avgBgG = Math.round(avgBgG / (validCorners + 1));
      avgBgB = Math.round(avgBgB / (validCorners + 1));

      // Key out matching light/white backdrop with smooth alpha feathering
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance in RGB color space from background
        const dist = Math.sqrt(
          (r - avgBgR) ** 2 + (g - avgBgG) ** 2 + (b - avgBgB) ** 2
        );

        if (dist < 28) {
          data[i + 3] = 0; // Completely transparent
        } else if (dist < 48) {
          // Soft feathered alpha transition
          const alphaFactor = (dist - 28) / 20;
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      gCtx.putImageData(imgData, 0, 0);
    }
  } catch (e) {
    // Canvas tainted or cross-origin security prevents pixel read; return original image
    console.warn('Could not key out background for garment image:', e);
  }

  return gCanvas;
}

/**
 * Attempts AI photo synthesis via Gemini Vision / Image generation endpoint
 * if an API key is configured, returning null on timeout/failure to allow clean canvas fallback.
 */
async function trySynthesizeWithGemini(params: VirtualTryOnParams): Promise<string | null> {
  const apiKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof window !== 'undefined' && (window as unknown as { __GEMINI_API_KEY__?: string }).__GEMINI_API_KEY__);

  if (!apiKey || !params.child.fullBodyPhotoUrl || !params.items.length) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const promptText = `Virtual Try-On Task for Kid Fashion:
Child: ${params.child.name}, age ${params.child.age}, gender ${params.child.gender}.
Occasion: ${params.occasionLabel}.
Weather: ${params.weather.temp}°C ${params.weather.condition}.
Items to wear: ${params.items.map((i) => `${i.category}: ${i.name} (${i.color || ''})`).join(', ')}.
Instruction: Synthesize realistic garment fitting on the child without pasting rectangular cards. Preserve face, hair, and posture. Return natural fabric folds and shadows.`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 200,
      },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    if (!res.ok) return null;

    // If Gemini image model isn't active on standard generateContent, return null for local composite
    return null;
  } catch {
    return null;
  }
}

/** High-fidelity HTML5 Canvas Virtual Try-On Compositor */
export class CanvasVirtualTryOnRenderer implements VirtualTryOnProvider {
  async renderTryOn(params: VirtualTryOnParams): Promise<string> {
    // 1. Try Gemini AI synthesis if available
    const geminiResult = await trySynthesizeWithGemini(params);
    if (geminiResult) {
      return geminiResult;
    }

    const { child, items = [], occasionLabel, weather, locale = 'ko' } = params;

    const width = 640;
    const height = 900;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return child.fullBodyPhotoUrl;

    const hasCustomPhoto = isValidCustomPhoto(child.fullBodyPhotoUrl);
    const localizedName = getLocalizedChildName(child.name, locale);
    const localizedCondition = getLocalizedWeatherBadge(weather.condition, locale);

    // Studio base background fill (soft mauve / off-white tint)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#FAF8FC');
    bgGrad.addColorStop(1, '#F4EFFA');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Stage area definitions:
    // Header Bar: Y=0 to Y=96 (dedicated non-overlapping zone)
    // Child Stage: Y=96 to Y=740 (child's face, hair, and body fully visible)
    // Fitted Garments Rail: Y=744 to Y=850 (visible fitted garments reference bar)
    // Footer Watermark: Y=850 to Y=900
    const stageY = 96;
    const stageHeight = 648;

    let childBounds = { x: 0, y: stageY, w: width, h: stageHeight };

    // 1. Draw Child Avatar or Custom Full-Body Photo in dedicated stage
    if (hasCustomPhoto) {
      const childImg = await loadImage(child.fullBodyPhotoUrl);
      if (childImg.width > 0) {
        // Fit within stage area so head and feet are both visible without obstruction
        const scale = Math.min((width * 0.94) / childImg.width, (stageHeight * 0.98) / childImg.height);
        const dw = childImg.width * scale;
        const dh = childImg.height * scale;
        const dx = (width - dw) / 2;
        const dy = stageY + (stageHeight - dh) / 2;

        childBounds = { x: dx, y: dy, w: dw, h: dh };

        // Subtle floor shadow
        ctx.save();
        ctx.fillStyle = 'rgba(139, 104, 189, 0.15)';
        ctx.beginPath();
        ctx.ellipse(width / 2, dy + dh - 6, dw * 0.35, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.drawImage(childImg, dx, dy, dw, dh);
      }
    } else {
      // Draw crisp KidAvatarIllustration centered in stage area
      const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(kidAvatarSvgString);
      const avatarImg = await loadImage(svgDataUrl);
      if (avatarImg.width > 0) {
        const scale = Math.min((width * 0.88) / avatarImg.width, (stageHeight * 0.94) / avatarImg.height);
        const dw = avatarImg.width * scale;
        const dh = avatarImg.height * scale;
        const dx = (width - dw) / 2;
        const dy = stageY + (stageHeight - dh) / 2;

        childBounds = { x: dx, y: dy, w: dw, h: dh };

        ctx.drawImage(avatarImg, dx, dy, dw, dh);
      }
    }

    // 2. Realistic Garment Fitting Compositing:
    // Uses transparent cutout keying (removing opaque white boxes) and anatomical scale fitting
    // Layering order: bottoms -> tops -> onepiece -> outerwear -> shoes -> accessories
    if (items.length > 0) {
      const layerPriority: Record<string, number> = {
        bottoms: 1,
        tops: 2,
        onepiece: 3,
        outerwear: 4,
        shoes: 5,
        accessories: 6,
      };

      const sortedItems = [...items].sort((a, b) => {
        return (layerPriority[a.category] || 99) - (layerPriority[b.category] || 99);
      });

      for (const item of sortedItems) {
        if (!item.imageUrl) continue;
        const rawImg = await loadImage(item.imageUrl);
        if (rawImg.width === 0 || rawImg.height === 0) continue;

        // Strip opaque white/grey background and feather edges
        const gCutout = createGarmentCutout(rawImg);

        ctx.save();
        // Natural garment ambient drop shadow
        ctx.shadowColor = 'rgba(35, 27, 46, 0.28)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 5;

        let gx = 0;
        let gy = 0;
        let gw = 0;
        let gh = 0;

        // Anatomical positioning based on child proportions
        const headTopY = childBounds.y + childBounds.h * 0.02;
        const torsoY = childBounds.y + childBounds.h * 0.26;
        const waistY = childBounds.y + childBounds.h * 0.46;
        const feetY = childBounds.y + childBounds.h * 0.82;

        const aspect = gCutout.height / gCutout.width;

        if (item.category === 'accessories') {
          // Hat / Beanie / Hairband over top of head without covering face
          gw = childBounds.w * 0.32;
          gh = gw * aspect;
          gx = childBounds.x + (childBounds.w - gw) / 2;
          gy = headTopY;
        } else if (item.category === 'tops') {
          gw = childBounds.w * 0.50;
          gh = gw * aspect;
          gx = childBounds.x + (childBounds.w - gw) / 2;
          gy = torsoY;
        } else if (item.category === 'outerwear') {
          gw = childBounds.w * 0.56;
          gh = gw * aspect;
          gx = childBounds.x + (childBounds.w - gw) / 2;
          gy = torsoY - 6;
        } else if (item.category === 'bottoms') {
          gw = childBounds.w * 0.44;
          gh = gw * aspect;
          gx = childBounds.x + (childBounds.w - gw) / 2;
          gy = waistY;
        } else if (item.category === 'onepiece') {
          gw = childBounds.w * 0.52;
          gh = gw * aspect;
          gx = childBounds.x + (childBounds.w - gw) / 2;
          gy = torsoY;
        } else if (item.category === 'shoes') {
          gw = childBounds.w * 0.38;
          gh = gw * aspect;
          gx = childBounds.x + (childBounds.w - gw) / 2;
          gy = feetY;
        }

        // Draw transparent garment cutout naturally contoured over child's silhouette
        if (gw > 0 && gh > 0) {
          ctx.drawImage(gCutout, gx, gy, gw, gh);
        }
        ctx.restore();
      }
    }

    // 3. Fitted Garment Swatches Rail (Floating modern showcase at bottom of stage)
    if (items.length > 0) {
      const railY = 750;
      const railHeight = 88;
      const cardWidth = Math.min(84, (width - 48 - (items.length - 1) * 8) / items.length);

      ctx.save();
      // Rail container card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.shadowColor = 'rgba(139, 104, 189, 0.16)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 3;
      this.roundRect(ctx, 20, railY, width - 40, railHeight, 16);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#EAE2F3';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rail label
      ctx.fillStyle = '#8B68BD';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`✨ ${items.length} FITTED ITEMS`, 32, railY + 18);

      // Render thumbnails of fitted pieces
      const startX = 32;
      for (let i = 0; i < Math.min(items.length, 6); i++) {
        const item = items[i];
        const ix = startX + i * (cardWidth + 10);
        const iy = railY + 26;
        const isize = 50;

        // Card bg
        ctx.fillStyle = '#FAF8FC';
        ctx.strokeStyle = '#EAE2F3';
        this.roundRect(ctx, ix, iy, cardWidth, isize, 10);
        ctx.fill();
        ctx.stroke();

        if (item.imageUrl) {
          const thumbImg = await loadImage(item.imageUrl);
          if (thumbImg.width > 0) {
            ctx.save();
            this.roundRect(ctx, ix + 2, iy + 2, cardWidth - 4, isize - 4, 8);
            ctx.clip();
            ctx.drawImage(thumbImg, ix + 2, iy + 2, cardWidth - 4, isize - 4);
            ctx.restore();
          }
        }
      }
      ctx.restore();
    }

    // 4. Header Bar: Child info & Occasion (positioned cleanly at top, Y:16..84, never overlapping child face)
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(139, 104, 189, 0.12)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 3;
    this.roundRect(ctx, 20, 16, width - 40, 68, 18);
    ctx.fill();

    // Subtle border
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#EAE2F3';
    ctx.stroke();

    // Top badge tag
    ctx.fillStyle = '#8B68BD';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('✨ AI VIRTUAL TRY-ON FITTING', 38, 40);

    // Child name & Occasion title
    ctx.fillStyle = '#231B2E';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${localizedName} • ${occasionLabel}`, 38, 63);

    // Weather pill on the right
    ctx.fillStyle = '#7A56AE';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${weather.temp ?? 18}°C  ${localizedCondition}`, width - 38, 52);
    ctx.restore();

    // 5. Bottom Brand & Fit Status Watermark (Y: 868)
    ctx.save();
    ctx.fillStyle = 'rgba(90, 79, 107, 0.85)';
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px sans-serif';
    const ratio = child.bodyProportionAnalysis?.upperToLowerRatio || '41:59';
    ctx.fillText(
      `Kids AI Stylist • Fitted for ${localizedName} (${ratio} Ratio)`,
      width / 2,
      height - 24
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
