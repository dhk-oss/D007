import { ChildProfile, WardrobeItem, WeatherSnapshot } from '../types';
import { getLocalizedChildName, getLocalizedWeatherBadge } from '../utils/localeHelpers';

export interface VirtualTryOnParams {
  child: ChildProfile;
  items: WardrobeItem[];
  occasionLabel: string;
  weather: WeatherSnapshot;
  locale?: string;
}

export interface VirtualTryOnResult {
  imageUrl: string;
  isAiGenerated: boolean;
  providerName?: string;
}

export interface VirtualTryOnProvider {
  renderTryOn(params: VirtualTryOnParams): Promise<VirtualTryOnResult>;
}

/** Loads an image URL safely into an HTMLImageElement with CORS fallback */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (!src || src.trim() === '') {
      resolve(new Image());
      return;
    }

    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => resolve(img);
    img.onerror = () => {
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

/** Converts an image URL (remote, blob, or data) into clean base64 data for AI APIs */
async function toBase64Payload(url: string): Promise<{ mimeType: string; data: string } | null> {
  if (!url || typeof url !== 'string') return null;

  if (url.startsWith('data:image/')) {
    const parts = url.split(',');
    const match = parts[0].match(/data:(image\/[^;]+);base64/);
    if (match && parts[1]) {
      return { mimeType: match[1], data: parts[1] };
    }
  }

  try {
    const img = await loadImage(url);
    if (img.naturalWidth === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = Math.min(img.naturalWidth, 800);
    canvas.height = Math.round((canvas.width * img.naturalHeight) / img.naturalWidth);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const parts = dataUrl.split(',');
    return { mimeType: 'image/jpeg', data: parts[1] };
  } catch (err) {
    console.warn('Could not serialize image to base64 for AI API:', err);
    return null;
  }
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
 * When isOpenOuterwear is true, creates a soft center-front opening so the inner top remains visible.
 */
function createGarmentCutout(sourceImg: HTMLImageElement, isOpenOuterwear = false): HTMLCanvasElement {
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

    // Sample corners to detect backdrop reference
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
      if (a > 200 && r > 200 && g > 200 && b > 200) {
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

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const dist = Math.sqrt(
          (r - avgBgR) ** 2 + (g - avgBgG) ** 2 + (b - avgBgB) ** 2
        );

        if (dist < 34) {
          data[i + 3] = 0;
        } else if (dist < 60) {
          const alphaFactor = (dist - 34) / 26;
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      gCtx.putImageData(imgData, 0, 0);
    }

    // If this is outerwear over an inner top, apply a soft unbuttoned/open center-front vertical split
    if (isOpenOuterwear) {
      const centerX = gCanvas.width / 2;
      const halfOpeningWidth = gCanvas.width * 0.16; // 32% center opening
      const topY = gCanvas.height * 0.12;
      const bottomY = gCanvas.height * 0.95;

      const splitData = gCtx.getImageData(0, 0, gCanvas.width, gCanvas.height);
      const sData = splitData.data;

      for (let y = Math.floor(topY); y < Math.floor(bottomY); y++) {
        // Subtle natural tapering: slightly wider at hem than collar
        const progress = (y - topY) / (bottomY - topY);
        const currentOpening = halfOpeningWidth * (0.85 + 0.35 * progress);

        for (let x = Math.floor(centerX - currentOpening); x <= Math.ceil(centerX + currentOpening); x++) {
          if (x < 0 || x >= gCanvas.width) continue;
          const idx = (y * gCanvas.width + x) * 4;
          const distFromCenter = Math.abs(x - centerX);

          if (distFromCenter < currentOpening * 0.70) {
            // Full opening
            sData[idx + 3] = 0;
          } else {
            // Feathered soft edge along the open coat lapels
            const edgeFactor = (distFromCenter - currentOpening * 0.70) / (currentOpening * 0.30);
            sData[idx + 3] = Math.round(sData[idx + 3] * Math.min(1, Math.max(0, edgeFactor)));
          }
        }
      }

      gCtx.putImageData(splitData, 0, 0);
    }
  } catch (e) {
    console.warn('Could not key out background for garment image:', e);
  }

  return gCanvas;
}

/**
 * Candidate Gemini models supporting multimodal image output or multimodal instruction synthesis.
 */
const GEMINI_IMAGE_MODELS = [
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.5-flash-image',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

/**
 * Attempts real AI virtual try-on image synthesis using Gemini Imagen / Multimodal Image generation
 * when an API key is available. Returns the synthesized image URL (base64 data URL) or null.
 */
async function trySynthesizeWithGemini(params: VirtualTryOnParams): Promise<{ imageUrl: string; model: string } | null> {
  const apiKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof window !== 'undefined' && (window as unknown as { __GEMINI_API_KEY__?: string }).__GEMINI_API_KEY__);

  if (!apiKey || !params.child.fullBodyPhotoUrl || !params.items.length) {
    return null;
  }

  // 1. Prepare child photo payload
  const childPayload = await toBase64Payload(params.child.fullBodyPhotoUrl);
  if (!childPayload) {
    return null;
  }

  // 2. Prepare garment payloads
  const garmentParts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];
  for (const item of params.items) {
    if (!item.imageUrl) continue;
    const gPayload = await toBase64Payload(item.imageUrl);
    if (gPayload) {
      garmentParts.push({ text: `Garment Item [Category: ${item.category}, Name: ${item.name}, Color: ${item.color || 'auto'}]` });
      garmentParts.push({ inlineData: gPayload });
    }
  }

  const promptText = `High-End Commercial Fashion Virtual Try-On Studio:
Subject Model: Child ${params.child.name}, age ${params.child.age}, gender ${params.child.gender}.
Occasion: ${params.occasionLabel} (${params.weather.temp}°C, ${params.weather.condition}).

Styling Task:
Generate a single photorealistic studio fashion photograph of this exact child model naturally and realistically wearing the selected garments.
Strict rules:
1. FACIAL & PHYSICAL IDENTITY: Retain the exact face, eyes, hair, head, expression, body proportions, and skin tone from the child's photo.
2. DETERMINISTIC WEARING ORDER: Layer garments in the sequence: tops (or onepiece) -> bottoms -> shoes -> outerwear -> accessories.
3. OPEN OUTERWEAR TO REVEAL INNER TOP: Outerwear MUST appear open in the center-front (unzipped/unbuttoned) so the inner top or onepiece underneath is clearly visible.
4. FABRIC REALISM: Clothing must contour naturally to the child's body with authentic folds, seams, sleeves around arms, and ambient shadows. No floating cutouts or stickers.
5. CLEAR SIGHTLINE: Hats or hair accessories sit comfortably above eyebrows without covering eyes or face.
6. Clean neutral soft studio backdrop, high-end catalog quality.`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: promptText },
          { inlineData: childPayload },
          ...garmentParts,
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
    },
  };

  // Try candidate image generation / multimodal models with fallback
  for (const model of GEMINI_IMAGE_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const candidate = json.candidates?.[0];
        const parts = candidate?.content?.parts;
        if (Array.isArray(parts)) {
          for (const part of parts) {
            if (part.inlineData?.data) {
              return {
                imageUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
                model,
              };
            }
          }
        }
      }
    } catch {
      // Continue to next model on error or timeout
      continue;
    }
  }

  return null;
}

/** High-fidelity HTML5 Canvas Virtual Try-On Compositor */
export class CanvasVirtualTryOnRenderer implements VirtualTryOnProvider {
  async renderTryOn(params: VirtualTryOnParams): Promise<VirtualTryOnResult> {
    // 1. Try Gemini AI synthesis if available
    const geminiResult = await trySynthesizeWithGemini(params);
    if (geminiResult) {
      return {
        imageUrl: geminiResult.imageUrl,
        isAiGenerated: true,
        providerName: `Gemini AI (${geminiResult.model})`,
      };
    }

    const { child, items = [], occasionLabel, weather, locale = 'ko' } = params;

    const width = 640;
    const height = 900;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return {
        imageUrl: child.fullBodyPhotoUrl,
        isAiGenerated: false,
        providerName: 'Photo Fallback',
      };
    }

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
    // Child Portrait Stage: Y=96 to Y=740 (child's face, hair, and body fully visible & unobstructed)
    // Fitted Garments Rail: Y=744 to Y=850 (neat reference cards of worn pieces)
    // Footer Watermark: Y=850 to Y=900
    const stageY = 96;
    const stageHeight = 644;

    let childBounds = { x: 0, y: stageY, w: width, h: stageHeight };

    // 1. Draw Child Avatar or Custom Full-Body Photo in dedicated stage
    if (hasCustomPhoto) {
      const childImg = await loadImage(child.fullBodyPhotoUrl);
      if (childImg.width > 0) {
        const scale = Math.min((width * 0.94) / childImg.width, (stageHeight * 0.98) / childImg.height);
        const dw = childImg.width * scale;
        const dh = childImg.height * scale;
        const dx = (width - dw) / 2;
        const dy = stageY + (stageHeight - dh) / 2;

        childBounds = { x: dx, y: dy, w: dw, h: dh };

        // Subtle soft studio floor shadow
        ctx.save();
        ctx.fillStyle = 'rgba(139, 104, 189, 0.15)';
        ctx.beginPath();
        ctx.ellipse(width / 2, dy + dh - 6, dw * 0.35, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Render child portrait cleanly
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

    // 2. Realistic Garment Compositing onto Child Photo/Avatar:
    // Strictly enforced deterministic fitting order:
    // Standard sequence: tops -> bottoms -> shoes -> outerwear -> accessories
    // When onepiece is present: onepiece (replaces tops+bottoms) -> shoes -> outerwear -> accessories
    if (items.length > 0) {
      const hasOnepiece = items.some((i) => i.category === 'onepiece');
      const hasInnerTop = items.some((i) => i.category === 'tops' || i.category === 'onepiece');

      const layerPriority: Record<string, number> = {
        tops: hasOnepiece ? 10 : 1, // tops rendered first (or skipped if onepiece)
        onepiece: 1,                 // onepiece serves as combined top+bottom step
        bottoms: hasOnepiece ? 10 : 2, // bottoms follow tops
        shoes: 3,                   // shoes ground the feet
        outerwear: 4,               // outerwear layered over tops/bottoms/shoes
        accessories: 5,             // hats/accessories finish top of head
      };

      const sortedItems = [...items].sort((a, b) => {
        return (layerPriority[a.category] || 99) - (layerPriority[b.category] || 99);
      });

      for (const item of sortedItems) {
        if (!item.imageUrl) continue;
        const rawImg = await loadImage(item.imageUrl);
        if (rawImg.width === 0 || rawImg.height === 0) continue;

        // If this item is outerwear and an inner top/onepiece is present,
        // render with an open front so the inner garment shows through naturally!
        const isOpenOuterwear = item.category === 'outerwear' && hasInnerTop;
        const gCutout = createGarmentCutout(rawImg, isOpenOuterwear);

        ctx.save();
        ctx.shadowColor = 'rgba(35, 27, 46, 0.24)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        let gx = 0;
        let gy = 0;
        let gw = 0;
        let gh = 0;

        const aspect = gCutout.height / gCutout.width;

        // Precise anatomical anchors relative to child proportions
        // Head / Hat anchor: Y = top 0%..12%
        // Torso / Tops: Y = 28%..54%
        // Waist / Bottoms: Y = 48%..78%
        // Feet / Shoes: Y = 84%..96%
        if (item.category === 'accessories') {
          // Hats and hair accessories sit strictly above the eye/brow line
          gw = childBounds.w * 0.30;
          gh = gw * aspect;
          gx = childBounds.x + (childBounds.w - gw) / 2;
          gy = childBounds.y + childBounds.h * 0.01;
        } else if (item.category === 'tops') {
          gw = childBounds.w * 0.50;
          gh = gw * aspect;
          gx = childBounds.x + (childBounds.w - gw) / 2;
          gy = childBounds.y + childBounds.h * 0.28;
        } else if (item.category === 'onepiece') {
          gw = childBounds.w * 0.52;
          gh = gw * aspect;
          gx = childBounds.x + (childBounds.w - gw) / 2;
          gy = childBounds.y + childBounds.h * 0.28;
        } else if (item.category === 'bottoms') {
          gw = childBounds.w * 0.44;
          gh = gw * aspect;
          gx = childBounds.x + (childBounds.w - gw) / 2;
          gy = childBounds.y + childBounds.h * 0.48;
        } else if (item.category === 'shoes') {
          gw = childBounds.w * 0.36;
          gh = gw * aspect;
          gx = childBounds.x + (childBounds.w - gw) / 2;
          gy = childBounds.y + childBounds.h * 0.84;
        } else if (item.category === 'outerwear') {
          // Outerwear wraps around shoulders slightly wider to comfortably layer over top
          gw = childBounds.w * 0.58;
          gh = gw * aspect;
          gx = childBounds.x + (childBounds.w - gw) / 2;
          gy = childBounds.y + childBounds.h * 0.25;
        }

        if (gw > 0 && gh > 0) {
          ctx.drawImage(gCutout, gx, gy, gw, gh);
        }
        ctx.restore();
      }
    }

    // 3. Fitted Garment Swatches Rail (Clean, modern showcase card at bottom of stage)
    if (items.length > 0) {
      const railY = 748;
      const railHeight = 90;
      const cardWidth = Math.min(84, (width - 48 - (items.length - 1) * 8) / items.length);

      ctx.save();
      // Rail container card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
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
      ctx.fillText(`✨ ${items.length} FITTED ITEMS • ${occasionLabel}`, 32, railY + 18);

      // Render thumbnails of fitted pieces
      const startX = 32;
      for (let i = 0; i < Math.min(items.length, 6); i++) {
        const item = items[i];
        const ix = startX + i * (cardWidth + 10);
        const iy = railY + 26;
        const isize = 52;

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

    return {
      imageUrl: canvas.toDataURL('image/jpeg', 0.92),
      isAiGenerated: false,
      providerName: 'Canvas Compositor',
    };
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

export async function generateVirtualTryOn(params: VirtualTryOnParams): Promise<VirtualTryOnResult> {
  return tryOnRenderer.renderTryOn(params);
}
