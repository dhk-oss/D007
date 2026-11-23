import { GenderType, BodyProportionAnalysis, SilhouetteType } from '../types';

export interface EstimateBodyProportionParams {
  imageDataUrlOrUrl: string;
  age: number; // 3 to 11
  gender: GenderType;
  heightCm?: number;
  weightKg?: number;
  waistCm?: number;
}

/**
 * Interface for AI Vision Providers (Local Heuristic vs Gemini / Vertex AI)
 */
export interface VisionEstimatorProvider {
  estimate(params: EstimateBodyProportionParams): Promise<BodyProportionAnalysis>;
}

/**
 * Analyzes offscreen image element to inspect aspect ratio, orientation, and resolution
 */
function analyzeImageMetadata(imageUrl?: string | null): Promise<{ width: number; height: number; aspectRatio: number }> {
  return new Promise((resolve) => {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '' || imageUrl.includes('unsplash.com')) {
      resolve({ width: 400, height: 600, aspectRatio: 1.5 });
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const width = img.naturalWidth || 400;
      const height = img.naturalHeight || 600;
      resolve({ width, height, aspectRatio: height / width });
    };
    img.onerror = () => {
      // Fallback standard portrait aspect ratio
      resolve({ width: 400, height: 600, aspectRatio: 1.5 });
    };
    img.src = imageUrl;
  });
}

/**
 * Localized body proportion metadata helpers
 */
export function getLocalizedSilhouetteLabel(type: SilhouetteType, locale: string = 'ko'): string {
  const map: Record<SilhouetteType, Record<string, string>> = {
    'tall-lean': {
      ko: '롱 슬림 체형',
      ja: 'すらりスリム型',
      zh: '高挑修长型',
      en: 'Tall & Lean',
    },
    'petite-active': {
      ko: '아담 활동형',
      ja: '活発小柄型',
      zh: '娇小活力型',
      en: 'Petite & Active',
    },
    'sturdy': {
      ko: '탄탄 균형형',
      ja: 'しっかり体格型',
      zh: '结实匀称型',
      en: 'Sturdy & Comfy',
    },
    'balanced': {
      ko: '표준 균형형',
      ja: '標準バランス型',
      zh: '标准匀称型',
      en: 'Balanced Proportions',
    },
  };

  const entry = map[type];
  if (entry) {
    return entry[locale] || entry['en'] || type;
  }
  return type;
}

export function getLocalizedBodySummary(
  type: SilhouetteType,
  ratio: string,
  locale: string = 'ko'
): string {
  if (locale === 'ko') {
    switch (type) {
      case 'tall-lean':
        return `하체 비율이 우수한 길고 슬림한 체형(${ratio})으로 세로 라인을 살려주는 핏이 돋보입니다.`;
      case 'petite-active':
        return `활동성과 유연성이 뛰어난 아담한 체형(${ratio})으로 편안하고 신축성 좋은 룩이 이상적입니다.`;
      case 'sturdy':
        return `체격이 다부지고 안정감 있는 체형(${ratio})으로 여유로운 실루엣과 오픈 레이어드가 단정합니다.`;
      case 'balanced':
      default:
        return `상·하체 밸런스가 조화로운 표준 균형 체형(${ratio})으로 다양한 스타일을 폭넓게 소화합니다.`;
    }
  }

  if (locale === 'ja') {
    switch (type) {
      case 'tall-lean':
        return `脚長比率が際立つすらりとした体型（${ratio}）で、綺麗な縦ラインを引き立てるシルエットが似合います。`;
      case 'petite-active':
        return `活発で動きやすさに優れた小柄な体型（${ratio}）で、伸縮性の高い快適なアイテムが最適です。`;
      case 'sturdy':
        return `しっかりとした安定感のある体格（${ratio}）で、ゆったりしたシルエットや羽織りスタイルが上品です。`;
      case 'balanced':
      default:
        return `バランスの取れた標準的な体型プロポーション（${ratio}）で、多彩なコーディネートを着こなせます。`;
    }
  }

  if (locale === 'zh') {
    switch (type) {
      case 'tall-lean':
        return `下肢修长的高挑身材比例（${ratio}），利落流畅的竖向剪裁最显优雅挺拔。`;
      case 'petite-active':
        return `活泼敏捷的娇小身材比例（${ratio}），弹力舒适与活动自如的日常版型最合适。`;
      case 'sturdy':
        return `结实自然的稳健身材比例（${ratio}），宽松舒适的直筒与外搭层次能修饰身形。`;
      case 'balanced':
      default:
        return `上下身比例协调的标准身材（${ratio}），能轻松驾驭多种不同场合的日常风格。`;
    }
  }

  // English fallback
  switch (type) {
    case 'tall-lean':
      return `Elongated vertical silhouette with dominant lower body ratio (${ratio}).`;
    case 'petite-active':
      return `Playful, agile child silhouette with balanced limb mobility (${ratio}).`;
    case 'sturdy':
      return `Solid, comfortable frame with relaxed waist proportions (${ratio}).`;
    case 'balanced':
    default:
      return `Harmonious standard proportion (${ratio}) suitable for versatile styling.`;
  }
}

export function getLocalizedStylingNotes(
  type: SilhouetteType,
  locale: string = 'ko'
): string[] {
  if (locale === 'ko') {
    switch (type) {
      case 'tall-lean':
        return [
          '하이웨이스트 컷이나 A라인 스커트/팬츠가 긴 다리 라인을 자연스럽게 돋보이게 합니다.',
          '살짝 숏한 가디건이나 턱인(Tuck-in) 상의는 상·하체 비율을 시각적으로 균형 있게 연출합니다.',
          '후드 점퍼나 텍스처 있는 아우터를 레이어드하면 풍성하고 포근한 실루엣이 완성됩니다.',
        ];
      case 'petite-active':
        return [
          '밴딩 조거팬츠와 부드러운 밑단 시보리는 놀이터나 야외 활동 시 최고의 편안함을 제공합니다.',
          '드롭숄더 티셔츠와 편안한 래글런 슬리브는 아이의 팔 움직임을 자유롭게 해줍니다.',
          '상·하의 셋업(Co-ord) 코디는 단정하면서도 사랑스러운 데일리 룩을 완성해 줍니다.',
        ];
      case 'sturdy':
        return [
          '허리 스트링 조절이 가능한 루즈핏 카고/조거팬츠가 복부 압박 없이 편안합니다.',
          '가벼운 오픈 셔츠나 지퍼 가디건을 레이어드하면 자연스러운 슬림 효과를 줍니다.',
          '통기성 좋은 부드러운 코튼 니트와 여유 있는 티셔츠가 온종일 쾌적함을 유지합니다.',
        ];
      case 'balanced':
      default:
        return [
          '스트레이트 팬츠, 기본 면 티셔츠, 클래식 데님 등 모든 베이직 아이템과 잘 어울립니다.',
          '선명한 컬러 포인트 버킷햇이나 귀여운 스니커즈로 발랄한 포인트를 주기 좋습니다.',
          '자켓이나 패딩 조끼가 골반 라인에 딱 떨어져 깔끔하고 안정적인 핏을 연출합니다.',
        ];
    }
  }

  if (locale === 'ja') {
    switch (type) {
      case 'tall-lean':
        return [
          'ハイウエストボトムスやAラインが綺麗な脚長ラインを引き立てます。',
          'やや短めのカーディガンやインスタイルで上半身と下半身のバランスを整えます。',
          '質感のあるアウターのレイヤードでふんわり優しいボリューム感をプラス。',
        ];
      case 'petite-active':
        return [
          'ウエストゴムのジョガーパンツが元気な遊びの時間をしっかりサポートします。',
          'ドロップショルダーのトップスは肩まわりの動きを邪魔せず快適です。',
          'セットアップコーデなら簡単におしゃれで元気な印象に仕上がります。',
        ];
      case 'sturdy':
        return [
          'ウエスト調節できるリラックスフィットパンツが快適な履き心地を提供します。',
          '羽織りものや前開きジップで自然な縦ラインを作るとすっきり見えます。',
          '通気性の良いコットン素材で一日中爽やかに過ごせます。',
        ];
      case 'balanced':
      default:
        return [
          'レギュラーフィットのパンツや定番Tシャツなど幅広いスタイルが似合います。',
          '差し色になる帽子やスニーカーでアクセントをつけるのがおすすめです。',
          '定番のベストやジャケットが程よい丈感で美しく決まります。',
        ];
    }
  }

  if (locale === 'zh') {
    switch (type) {
      case 'tall-lean':
        return [
          '高腰剪裁与A字版型能自然突显修长的下肢线条美。',
          '微短款开衫或扎腰穿法可营造视觉上更匀称的上下身比例。',
          '搭配层次感外套能为身形增添恰到好处的蓬松与丰盈度。',
        ];
      case 'petite-active':
        return [
          '弹力腰身束脚运动裤，兼顾活动安全性与游乐场自如奔跑。',
          '落肩款宽松T恤为宝宝的日常肢体活动提供充裕空间。',
          '上下装同色系套装穿搭既干净利落又充满活泼朝气。',
        ];
      case 'sturdy':
        return [
          '带有抽绳调节的宽松工装裤可有效减轻腰腹部紧绷感。',
          '敞开穿的外套或拉链开衫能在视觉上修饰出修长纵向线条。',
          '柔软透气纯棉针织面料确保全天候活动的干爽舒适。',
        ];
      case 'balanced':
      default:
        return [
          '直筒裤、标准圆领T恤等基础款式均能呈现自然大方效果。',
          '搭配亮色渔夫帽或活泼运动鞋能成为造型的点睛之笔。',
          '经典马甲或休闲夹克刚好落在髋线处，利落得体。',
        ];
    }
  }

  // English fallback
  switch (type) {
    case 'tall-lean':
      return [
        'Opt for high-waisted bottoms, flared trousers, or A-line cuts to accentuate natural leg length.',
        'Slightly cropped cardigans, jackets, and tucked-in tops give balanced upper-to-lower visual proportion.',
        'Layering textured outerwear (e.g. trench coats, sherpa vests) adds comfortable fullness.',
      ];
    case 'petite-active':
      return [
        'Elastic joggers, soft rib-cuff hems, and stretch chinos ensure max playground safety and movement.',
        'Drop-shoulder tops and raglan sleeve tees provide comfortable armhole space for active climbing.',
        'Two-piece co-ord sets keep dressing simple while looking organized and lively.',
      ];
    case 'sturdy':
      return [
        'Relaxed-fit cargo pants with adjustable drawstrings prevent waist constriction.',
        'Open overshirts or lightweight zip-up cardigans create flattering vertical lines.',
        'Breathable cotton knits and loose-cut tees provide all-day playground comfort.',
      ];
    case 'balanced':
    default:
      return [
        'Works great with regular-fit jeans, straight chinos, and standard round-neck tops.',
        'Add colorful statement accessories like bucket hats or sneakers for lively accents.',
        'Classic outerwear like denim jackets or fleece vests sit at the natural hip line perfectly.',
      ];
  }
}

/**
 * Default Built-in Anthropometric & Image Dimension Estimator
 * Uses pediatric growth ratios adjusted by image aspect ratio and optional physical measurements
 */
export class LocalHeuristicEstimator implements VisionEstimatorProvider {
  async estimate(params: EstimateBodyProportionParams): Promise<BodyProportionAnalysis> {
    const { imageDataUrlOrUrl, age, gender, heightCm, weightKg, waistCm } = params;

    // Inspect image geometry via offscreen Image / Canvas
    const imgMeta = await analyzeImageMetadata(imageDataUrlOrUrl);

    // Baseline pediatric body proportion curves (torso vs legs by age)
    let torsoRatio: number;
    if (age <= 4) {
      torsoRatio = 0.45;
    } else if (age <= 6) {
      torsoRatio = 0.43;
    } else if (age <= 8) {
      torsoRatio = 0.41;
    } else {
      torsoRatio = 0.39;
    }

    // Gender slight variance in pediatric growth spurts
    if (gender === 'female' && age >= 8) {
      torsoRatio -= 0.01;
    }

    // Adjust based on image height-to-width ratio (taller framing indicates longer relative limb proportion)
    if (imgMeta.aspectRatio > 1.6) {
      torsoRatio -= 0.01;
    } else if (imgMeta.aspectRatio < 1.2) {
      torsoRatio += 0.01;
    }

    // Adjust if height is given
    if (heightCm) {
      const expectedHeight = age * 6 + 78; // General pediatric benchmark formula
      if (heightCm > expectedHeight + 5) {
        torsoRatio -= 0.015;
      } else if (heightCm < expectedHeight - 5) {
        torsoRatio += 0.015;
      }
    }

    // Clamp torso ratio between 0.36 and 0.48
    torsoRatio = Math.max(0.36, Math.min(0.48, Math.round(torsoRatio * 100) / 100));
    const legRatio = Math.round((1 - torsoRatio) * 100) / 100;

    const upperPercent = Math.round(torsoRatio * 100);
    const lowerPercent = Math.round(legRatio * 100);
    const upperToLowerRatio = `${upperPercent}:${lowerPercent}`;

    // Determine Silhouette Type
    let silhouetteType: SilhouetteType = 'balanced';
    let bmi: number | null = null;
    if (heightCm && weightKg) {
      const heightInMeters = heightCm / 100;
      bmi = weightKg / (heightInMeters * heightInMeters);
    }

    if (bmi !== null) {
      if (bmi < 14.5 && age >= 5) {
        silhouetteType = 'tall-lean';
      } else if (bmi > 17.5 || (waistCm && waistCm > 58)) {
        silhouetteType = 'sturdy';
      } else if (age <= 5 || bmi <= 16.0) {
        silhouetteType = 'petite-active';
      } else {
        silhouetteType = 'balanced';
      }
    } else {
      if (lowerPercent >= 58) {
        silhouetteType = 'tall-lean';
      } else if (age <= 5) {
        silhouetteType = 'petite-active';
      } else {
        silhouetteType = 'balanced';
      }
    }

    const bodyTypeSummary = getLocalizedBodySummary(silhouetteType, upperToLowerRatio, 'ko');
    const stylingNotes = getLocalizedStylingNotes(silhouetteType, 'ko');

    return {
      torsoRatio,
      legRatio,
      upperToLowerRatio,
      silhouetteType,
      bodyTypeSummary,
      stylingNotes,
      analyzedAt: new Date().toISOString(),
    };
  }
}

// Default singleton estimator
let currentProvider: VisionEstimatorProvider = new LocalHeuristicEstimator();

/**
 * Configure external vision provider (e.g. Gemini / Vertex AI multimodal endpoint)
 */
export function setVisionEstimatorProvider(provider: VisionEstimatorProvider) {
  currentProvider = provider;
}

/**
 * Core estimation entry point
 */
export async function estimateBodyProportions(params: EstimateBodyProportionParams): Promise<BodyProportionAnalysis> {
  return currentProvider.estimate(params);
}
