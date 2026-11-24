/**
 * Garment Vision & AI Analysis Service
 * Automatically detects clothing color and style mood from garment photos
 * via HTML5 Canvas computer vision with optional Gemini Vision API fallback.
 */

export interface GarmentAnalysisResult {
  colorMood: string;
  dominantColor: string;
  mood: string;
  hex?: string;
  secondaryColor?: string;
}

type ColorCategory =
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'sky_blue'
  | 'blue'
  | 'navy'
  | 'brown'
  | 'beige'
  | 'cream'
  | 'white'
  | 'black'
  | 'gray';

type MoodCategory =
  | 'casual'
  | 'lovely'
  | 'vivid'
  | 'cozy'
  | 'modern'
  | 'fresh'
  | 'sporty';

const COLOR_TRANSLATIONS: Record<ColorCategory, Record<string, string>> = {
  purple: {
    ko: '퍼플',
    en: 'Purple',
    ja: 'パープル',
    zh: '紫色',
    mn: 'Нил ягаан',
    es: 'Púrpura',
    ru: 'Фиолетовый',
    pt: 'Roxo',
    fr: 'Violet',
  },
  pink: {
    ko: '핑크',
    en: 'Pink',
    ja: 'ピンク',
    zh: '粉色',
    mn: 'Ягаан',
    es: 'Rosa',
    ru: 'Розовый',
    pt: 'Rosa',
    fr: 'Rose',
  },
  red: {
    ko: '레드',
    en: 'Red',
    ja: 'レッド',
    zh: '红色',
    mn: 'Улаан',
    es: 'Rojo',
    ru: 'Красный',
    pt: 'Vermelho',
    fr: 'Rouge',
  },
  orange: {
    ko: '오렌지',
    en: 'Orange',
    ja: 'オレンジ',
    zh: '橙色',
    mn: 'Улбар шар',
    es: 'Naranja',
    ru: 'Оранжевый',
    pt: 'Laranja',
    fr: 'Orange',
  },
  yellow: {
    ko: '옐로우',
    en: 'Yellow',
    ja: 'イエロー',
    zh: '黄色',
    mn: 'Шар',
    es: 'Amarillo',
    ru: 'Желтый',
    pt: 'Amarelo',
    fr: 'Jaune',
  },
  green: {
    ko: '그린',
    en: 'Green',
    ja: 'グリーン',
    zh: '绿色',
    mn: 'Ногоон',
    es: 'Verde',
    ru: 'Зеленый',
    pt: 'Verde',
    fr: 'Vert',
  },
  sky_blue: {
    ko: '스카이블루',
    en: 'Sky Blue',
    ja: 'スカイブルー',
    zh: '天蓝色',
    mn: 'Цэнхэр',
    es: 'Celeste',
    ru: 'Голубой',
    pt: 'Azul Claro',
    fr: 'Bleu Ciel',
  },
  blue: {
    ko: '블루',
    en: 'Blue',
    ja: 'ブルー',
    zh: '蓝色',
    mn: 'Хөх',
    es: 'Azul',
    ru: 'Синий',
    pt: 'Azul',
    fr: 'Bleu',
  },
  navy: {
    ko: '네이비',
    en: 'Navy',
    ja: 'ネイビー',
    zh: '藏青色',
    mn: 'Бараан хөх',
    es: 'Azul Marino',
    ru: 'Темно-синий',
    pt: 'Azul Marinho',
    fr: 'Bleu Marine',
  },
  brown: {
    ko: '브라운',
    en: 'Brown',
    ja: 'ブラウン',
    zh: '棕色',
    mn: 'Бор',
    es: 'Marrón',
    ru: 'Коричневый',
    pt: 'Marrom',
    fr: 'Marron',
  },
  beige: {
    ko: '베이지',
    en: 'Beige',
    ja: 'ベージュ',
    zh: '米黄色',
    mn: 'Шаргал',
    es: 'Beige',
    ru: 'Бежевый',
    pt: 'Bege',
    fr: 'Beige',
  },
  cream: {
    ko: '크림',
    en: 'Cream',
    ja: 'クリーム',
    zh: '奶油白',
    mn: 'Цөцгийн шар',
    es: 'Crema',
    ru: 'Кремовый',
    pt: 'Creme',
    fr: 'Crème',
  },
  white: {
    ko: '화이트',
    en: 'White',
    ja: 'ホワイト',
    zh: '白色',
    mn: 'Цагаан',
    es: 'Blanco',
    ru: 'Белый',
    pt: 'Branco',
    fr: 'Blanc',
  },
  black: {
    ko: '블랙',
    en: 'Black',
    ja: 'ブラック',
    zh: '黑色',
    mn: 'Хар',
    es: 'Negro',
    ru: 'Черный',
    pt: 'Preto',
    fr: 'Noir',
  },
  gray: {
    ko: '그레이',
    en: 'Gray',
    ja: 'グレー',
    zh: '灰色',
    mn: 'Саарал',
    es: 'Gris',
    ru: 'Серый',
    pt: 'Cinza',
    fr: 'Gris',
  },
};

const MOOD_TRANSLATIONS: Record<MoodCategory, Record<string, string>> = {
  casual: {
    ko: '캐주얼',
    en: 'Casual',
    ja: 'カジュアル',
    zh: '休闲',
    mn: 'Энгийн',
    es: 'Casual',
    ru: 'Повседневный',
    pt: 'Casual',
    fr: 'Décontracté',
  },
  lovely: {
    ko: '러블리',
    en: 'Lovely',
    ja: 'ラブリー',
    zh: '甜美可爱',
    mn: 'Хөөрхөн',
    es: 'Encantador',
    ru: 'Милый',
    pt: 'Adorável',
    fr: 'Charmant',
  },
  vivid: {
    ko: '발랄한 비비드',
    en: 'Vivid & Lively',
    ja: '鮮やか・アクティブ',
    zh: '活泼亮眼',
    mn: 'Цоглог тод',
    es: 'Vibrante',
    ru: 'Яркий',
    pt: 'Vibrante',
    fr: 'Pétillant',
  },
  cozy: {
    ko: '포근한 내추럴',
    en: 'Cozy & Natural',
    ja: 'ナチュラル・温もり',
    zh: '温馨自然',
    mn: 'Дулаахан энгийн',
    es: 'Acogedor y Natural',
    ru: 'Уютный и естественный',
    pt: 'Aconchegante',
    fr: 'Douillet et Naturel',
  },
  modern: {
    ko: '모던 / 심플',
    en: 'Modern & Simple',
    ja: 'モダン・シンプル',
    zh: '简约现代',
    mn: 'Орчин үеийн',
    es: 'Moderno y Sencillo',
    ru: 'Современный',
    pt: 'Moderno e Simples',
    fr: 'Moderne et Épuré',
  },
  fresh: {
    ko: '산뜻한 데일리',
    en: 'Fresh & Daily',
    ja: 'さわやか・デイリー',
    zh: '清爽日常',
    mn: 'Сэргэг өдөр тутмын',
    es: 'Fresco y Diario',
    ru: 'Свежий повседневный',
    pt: 'Fresco e Diário',
    fr: 'Frais au Quotidien',
  },
  sporty: {
    ko: '활동적인 스포티',
    en: 'Sporty & Active',
    ja: 'スポーティ・アクティブ',
    zh: '运动活力',
    mn: 'Спортлог хөдөлгөөнт',
    es: 'Deportivo y Activo',
    ru: 'Спортивный',
    pt: 'Esportivo e Ativo',
    fr: 'Sportif et Actif',
  },
};

/**
 * Converts RGB color values (0-255) to HSL (H: 0-360, S: 0-1, L: 0-1)
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return [h, s, l];
}

/**
 * Classifies an RGB/HSL pixel into a high-level color category
 */
function classifyColor(h: number, s: number, l: number): ColorCategory {
  // Achromatic checks (black, white, gray, cream)
  if (l <= 0.16) return 'black';
  if (l >= 0.92 && s <= 0.2) return 'white';
  if (l >= 0.82 && s <= 0.25 && h >= 25 && h <= 65) return 'cream';
  if (s <= 0.14) {
    if (l >= 0.7) return 'cream';
    return 'gray';
  }

  // Beige check
  if (h >= 24 && h <= 55 && s <= 0.42 && l >= 0.62 && l <= 0.88) {
    return 'beige';
  }

  // Brown check
  if (h >= 15 && h <= 45 && s <= 0.65 && l <= 0.48) {
    return 'brown';
  }

  // Navy check
  if (h >= 200 && h <= 255 && l <= 0.24) {
    return 'navy';
  }

  // Chromatic hues
  if (h >= 255 && h < 305) return 'purple';
  if (h >= 305 && h < 345) return 'pink';
  if (h >= 345 || h < 16) {
    if (l > 0.75 && s < 0.6) return 'pink';
    return 'red';
  }
  if (h >= 16 && h < 42) return 'orange';
  if (h >= 42 && h < 68) return 'yellow';
  if (h >= 68 && h < 165) return 'green';
  if (h >= 165 && h < 205) return 'sky_blue';
  if (h >= 205 && h < 255) return 'blue';

  return 'gray';
}

/**
 * Loads an image source into an HTMLImageElement
 */
function loadImage(source: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for garment analysis: ' + err));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          img.src = reader.result;
        } else {
          reject(new Error('FileReader did not return a string.'));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Performs client-side Canvas pixel analysis on the garment image
 */
export async function analyzeGarmentImageCV(
  imageSource: string | File,
  locale: string = 'ko'
): Promise<GarmentAnalysisResult> {
  const img = await loadImage(imageSource);

  const canvas = document.createElement('canvas');
  const size = 120;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context not available.');
  }

  ctx.drawImage(img, 0, 0, size, size);
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // 1. Identify corner background colors to exclude background pixels
  const cornerIndices = [
    0, // top-left
    (size - 1) * 4, // top-right
    (size * (size - 1)) * 4, // bottom-left
    (size * size - 1) * 4, // bottom-right
  ];
  let bgR = 0, bgG = 0, bgB = 0;
  for (const idx of cornerIndices) {
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  }
  bgR /= 4;
  bgG /= 4;
  bgB /= 4;

  const colorCounts: Record<ColorCategory, number> = {
    purple: 0,
    pink: 0,
    red: 0,
    orange: 0,
    yellow: 0,
    green: 0,
    sky_blue: 0,
    blue: 0,
    navy: 0,
    brown: 0,
    beige: 0,
    cream: 0,
    white: 0,
    black: 0,
    gray: 0,
  };

  let totalForeground = 0;
  let totalSat = 0;
  let totalLight = 0;

  // Sample the central 70% of the image (clothing focus)
  const startX = Math.floor(size * 0.15);
  const endX = Math.floor(size * 0.85);
  const startY = Math.floor(size * 0.15);
  const endY = Math.floor(size * 0.85);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * size + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Exclude transparent pixels
      if (a < 50) continue;

      // Exclude pixels that match the corner background
      const distToBg = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
      if (distToBg < 32 && (bgR > 220 || bgR < 35)) {
        continue;
      }

      const [h, s, l] = rgbToHsl(r, g, b);
      const cat = classifyColor(h, s, l);
      colorCounts[cat]++;
      totalForeground++;
      totalSat += s;
      totalLight += l;
    }
  }

  // If insufficient foreground pixels were detected, fall back to neutral
  if (totalForeground === 0) {
    return {
      colorMood: COLOR_TRANSLATIONS['cream'][locale] || 'Cream / Beige',
      dominantColor: 'cream',
      mood: 'cozy',
    };
  }

  const avgSat = totalSat / totalForeground;
  const avgLight = totalLight / totalForeground;

  // Find dominant and secondary colors
  const sortedColors = (Object.keys(colorCounts) as ColorCategory[]).sort(
    (a, b) => colorCounts[b] - colorCounts[a]
  );
  const dominant = sortedColors[0];
  const secondary = sortedColors[1];

  // Infer fashion mood based on dominant color and saturation/lightness
  let mood: MoodCategory = 'casual';
  if (dominant === 'purple') {
    mood = avgSat > 0.35 ? 'vivid' : 'casual';
  } else if (dominant === 'pink') {
    mood = avgLight > 0.65 ? 'lovely' : 'vivid';
  } else if (dominant === 'red' || dominant === 'orange' || dominant === 'yellow') {
    mood = 'vivid';
  } else if (dominant === 'green' || dominant === 'sky_blue') {
    mood = 'fresh';
  } else if (dominant === 'navy' || dominant === 'black') {
    mood = 'modern';
  } else if (dominant === 'beige' || dominant === 'cream' || dominant === 'brown') {
    mood = 'cozy';
  } else if (dominant === 'gray') {
    mood = 'casual';
  }

  const locColor = COLOR_TRANSLATIONS[dominant][locale] || COLOR_TRANSLATIONS[dominant]['en'] || dominant;
  const locMood = MOOD_TRANSLATIONS[mood][locale] || MOOD_TRANSLATIONS[mood]['en'] || mood;

  return {
    colorMood: `${locColor} / ${locMood}`,
    dominantColor: dominant,
    mood,
    secondaryColor: colorCounts[secondary] > totalForeground * 0.2 ? secondary : undefined,
  };
}

/**
 * High-level analysis function with graceful timeout and Gemini fallback if available
 */
export async function analyzeGarmentColorAndMood(
  imageSource: string | File,
  locale: string = 'ko'
): Promise<GarmentAnalysisResult> {
  try {
    // Check optional Gemini API Key in Vite environment
    const geminiApiKey =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
      (typeof window !== 'undefined' && (window as unknown as { __GEMINI_API_KEY__?: string }).__GEMINI_API_KEY__);

    if (geminiApiKey && typeof imageSource === 'string' && imageSource.startsWith('data:image/')) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 2200)
        );
        const match = imageSource.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];

          const apiCall = fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `You are an expert children's fashion stylist. Analyze this kids garment image. Output ONLY the color and mood in format 'Color / Mood' translated to locale '${locale}'. Example: '퍼플 / 캐주얼'. Do not include markdown or extra words.`,
                      },
                      {
                        inline_data: {
                          mime_type: mimeType,
                          data: base64Data,
                        },
                      },
                    ],
                  },
                ],
              }),
            }
          );

          const response = (await Promise.race([apiCall, timeoutPromise])) as Response;
          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text && text.includes('/')) {
              const parts = text.split('/').map((s: string) => s.trim());
              return {
                colorMood: text.replace(/[*\n#]/g, '').trim(),
                dominantColor: parts[0] || 'Unknown',
                mood: parts[1] || 'Casual',
              };
            }
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini vision analysis skipped/failed, using canvas CV:', geminiErr);
      }
    }

    // Default fast & robust Canvas CV
    return await analyzeGarmentImageCV(imageSource, locale);
  } catch (error) {
    console.warn('Garment analysis fallback applied:', error);
    const fallbackColor = COLOR_TRANSLATIONS['purple'][locale] || 'Purple';
    const fallbackMood = MOOD_TRANSLATIONS['casual'][locale] || 'Casual';
    return {
      colorMood: `${fallbackColor} / ${fallbackMood}`,
      dominantColor: 'purple',
      mood: 'casual',
    };
  }
}
