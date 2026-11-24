import {
  ChildProfile,
  WardrobeItem,
  WeatherSnapshot,
  ClothingCategory,
  OccasionKey,
  OccasionInfo,
  SeasonType,
  SilhouetteType,
} from '../types';
import { SupportedLocale } from '../i18n/translations';
import { getLocalizedItemName } from '../utils/wardrobeLocalization';

export const CORE_OCCASIONS: OccasionInfo[] = [
  {
    key: 'daycare_school',
    label: 'Daycare & School',
    koreanLabel: '어린이집 & 등교',
    emoji: '🎒',
    description: 'High mobility and breathable soft fabrics for play and classroom activities',
    formality: 'casual',
    activityLevel: 'high',
  },
  {
    key: 'birthday_party',
    label: 'Birthday Party',
    koreanLabel: '생일파티',
    emoji: '🎂',
    description: 'Lively, photogenic, cheerful styling with standout colors or cute accessories',
    formality: 'smart_casual',
    activityLevel: 'moderate',
  },
  {
    key: 'outing_event',
    label: 'Picnic & Outing',
    koreanLabel: '소풍 & 야외행사',
    emoji: '🎡',
    description: 'Layered for outdoor temperature changes, sun protection, and comfortable walking',
    formality: 'casual',
    activityLevel: 'high',
  },
  {
    key: 'visiting_relatives',
    label: 'Visiting Relatives',
    koreanLabel: '친척집 방문',
    emoji: '🏡',
    description: 'Polite, tidy, and endearing look with gentle knits or tidy trousers',
    formality: 'smart_casual',
    activityLevel: 'moderate',
  },
  {
    key: 'ceremonial',
    label: 'Ceremonial & Formal',
    koreanLabel: '경조사 & 포멀',
    emoji: '💐',
    description: 'Neat, dignified formal attire such as tailored jackets, classic dresses, or pressed pants',
    formality: 'formal',
    activityLevel: 'calm',
  },
];

export interface OutfitRecommendation {
  selectedItems: WardrobeItem[];
  selectedItemIds: string[];
  slots: {
    top: WardrobeItem | null;
    bottom: WardrobeItem | null;
    outerwear: WardrobeItem | null;
    onepiece: WardrobeItem | null;
    shoes: WardrobeItem | null;
    accessories: WardrobeItem | null;
  };
  stylingRationale: string;
  weatherMatchScore: number;
  proportionAdvice: string;
  weatherTip: string;
  missingCategories: ClothingCategory[];
}

/**
 * Determine suitable seasons based on current temperature
 */
function getTargetSeasonsForTemp(temp: number): SeasonType[] {
  if (temp < 10) return ['winter'];
  if (temp < 18) return ['spring', 'autumn', 'winter'];
  if (temp < 25) return ['spring', 'autumn', 'summer'];
  return ['summer'];
}

/**
 * Score item suitability based on temperature, occasion, and proportions
 */
function scoreItem(
  item: WardrobeItem,
  temp: number,
  targetSeasons: SeasonType[],
  occasion: OccasionInfo,
  child: ChildProfile
): number {
  let score = 50;

  // 1. Season / Temperature Match
  if (item.category === 'shoes' || item.category === 'accessories') {
    score += 20; // All-season applicable
  } else if (item.seasons && item.seasons.length > 0) {
    const hasSeasonMatch = item.seasons.some((s) => targetSeasons.includes(s));
    if (hasSeasonMatch) score += 30;
    else score -= 20;
  }

  // 2. Occasion Formality & Style
  const nameLower = (item.name || '').toLowerCase();
  const colorLower = (item.color || '').toLowerCase();

  if (occasion.key === 'ceremonial') {
    if (item.category === 'onepiece') score += 25;
    if (nameLower.includes('trench') || nameLower.includes('coat') || nameLower.includes('formal')) score += 20;
    if (colorLower.includes('cream') || colorLower.includes('navy') || colorLower.includes('black')) score += 15;
  } else if (occasion.key === 'birthday_party') {
    if (item.category === 'onepiece' || item.category === 'accessories') score += 25;
    if (colorLower.includes('yellow') || colorLower.includes('pink') || colorLower.includes('peach')) score += 15;
  } else if (occasion.key === 'daycare_school' || occasion.key === 'outing_event') {
    if (nameLower.includes('jogger') || nameLower.includes('tee') || nameLower.includes('runner')) score += 25;
    if (item.category === 'shoes') score += 20;
    if (temp < 18 && item.category === 'outerwear') score += 20;
  } else if (occasion.key === 'visiting_relatives') {
    if (nameLower.includes('knit') || nameLower.includes('sweater') || nameLower.includes('denim')) score += 20;
  }

  // 3. Child Body Proportion Matching
  const silhouette = child.bodyProportionAnalysis.silhouetteType;
  if (silhouette === 'tall-lean') {
    if (nameLower.includes('flared') || nameLower.includes('trousers') || nameLower.includes('cardigan')) {
      score += 15;
    }
  } else if (silhouette === 'petite-active') {
    if (nameLower.includes('jogger') || nameLower.includes('vest') || nameLower.includes('fleece')) {
      score += 15;
    }
  }

  return score;
}

/**
 * Localized occasion names
 */
function getLocalizedOccasionName(key: OccasionKey, lang: SupportedLocale): string {
  const map: Record<OccasionKey, Record<string, string>> = {
    daycare_school: {
      ko: '어린이집 & 등교',
      en: 'Daycare & School',
      ja: '保育園・登校',
      zh: '幼儿园与上学',
    },
    birthday_party: {
      ko: '생일파티',
      en: 'Birthday Party',
      ja: '誕生日パーティー',
      zh: '生日聚会',
    },
    outing_event: {
      ko: '소풍 & 야외행사',
      en: 'Picnic & Outing',
      ja: 'ピクニック・遠足',
      zh: '郊游与户外活动',
    },
    visiting_relatives: {
      ko: '친척집 방문',
      en: 'Visiting Relatives',
      ja: '親戚宅への訪問',
      zh: '走亲访友',
    },
    ceremonial: {
      ko: '경조사 & 포멀',
      en: 'Ceremonial & Formal',
      ja: '冠婚葬祭・フォーマル',
      zh: '礼仪与正式场合',
    },
  };

  const entry = map[key];
  if (entry) {
    return entry[lang] || entry['en'] || key;
  }
  return key;
}

/**
 * Localized weather condition names
 */
function getLocalizedWeatherCondition(condition: string, lang: SupportedLocale): string {
  const condLower = (condition || '').toLowerCase();
  const isRain = condLower.includes('rain') || condLower.includes('shower');
  const isSnow = condLower.includes('snow');
  const isCloudy = condLower.includes('cloud') || condLower.includes('overcast');
  const isWindy = condLower.includes('wind');
  const isClear = condLower.includes('clear') || condLower.includes('sun');

  if (lang === 'ko') {
    if (isRain) return '비/흐림';
    if (isSnow) return '눈/한파';
    if (isCloudy) return '구름 많음';
    if (isWindy) return '바람 쌀쌀';
    if (isClear) return '맑고 쾌적함';
    return condition;
  }

  if (lang === 'ja') {
    if (isRain) return '雨模様';
    if (isSnow) return '雪';
    if (isCloudy) return '曇りがち';
    if (isWindy) return '風が強め';
    if (isClear) return '快晴・過ごしやすい';
    return condition;
  }

  if (lang === 'zh') {
    if (isRain) return '小雨阴天';
    if (isSnow) return '下雪冷天';
    if (isCloudy) return '多云阴天';
    if (isWindy) return '微风稍凉';
    if (isClear) return '晴朗舒适';
    return condition;
  }

  return condition;
}

/**
 * Localized silhouette names
 */
function getLocalizedSilhouette(silhouette: SilhouetteType, lang: SupportedLocale): string {
  if (lang === 'ko') {
    switch (silhouette) {
      case 'tall-lean':
        return '길고 슬림한';
      case 'petite-active':
        return '활동적인 아담한';
      case 'sturdy':
        return '탄탄하고 편안한';
      case 'balanced':
      default:
        return '균형 잡힌 표준';
    }
  }

  if (lang === 'ja') {
    switch (silhouette) {
      case 'tall-lean':
        return 'すらりとしたスリムな';
      case 'petite-active':
        return '活発で小柄な';
      case 'sturdy':
        return 'しっかりとした';
      case 'balanced':
      default:
        return 'バランスの良い標準';
    }
  }

  if (lang === 'zh') {
    switch (silhouette) {
      case 'tall-lean':
        return '高挑修长的';
      case 'petite-active':
        return '活泼娇小的';
      case 'sturdy':
        return '结实舒适的';
      case 'balanced':
      default:
        return '匀称标准的';
    }
  }

  return `${silhouette}`;
}

/**
 * Localized body proportion advice
 */
function getLocalizedProportionAdvice(
  childName: string,
  silhouette: SilhouetteType,
  legRatioPercent: number,
  lang: SupportedLocale
): string {
  const firstName = childName.split(' ')[0];

  if (lang === 'ko') {
    switch (silhouette) {
      case 'tall-lean':
        return `${firstName} 아이의 길고 슬림한 체형(다리 비율 ${legRatioPercent}%)에는 균형 잡힌 세로 라인과 편안한 활동성 핏이 가장 잘 어울립니다.`;
      case 'petite-active':
        return `${firstName} 아이의 아담하고 활동적인 체형(다리 비율 ${legRatioPercent}%)에는 편안한 밴딩 팬츠와 활기찬 드롭숄더 핏이 자연스럽습니다.`;
      case 'sturdy':
        return `${firstName} 아이의 탄탄한 체형(다리 비율 ${legRatioPercent}%)에는 여유 있는 스트레이트 핏과 가벼운 오픈 레이어드가 체형을 단정하게 정돈해 줍니다.`;
      case 'balanced':
      default:
        return `${firstName} 아이의 균형 잡힌 체형(다리 비율 ${legRatioPercent}%)에는 베이직한 실루엣에 화사한 포인트 아이템을 더할 때 가장 돋보입니다.`;
    }
  }

  if (lang === 'ja') {
    switch (silhouette) {
      case 'tall-lean':
        return `${firstName}ちゃんのすらりとしたスタイル（脚長比率 ${legRatioPercent}%）には、綺麗な縦ラインと動きやすいフィットが最も似合います。`;
      case 'petite-active':
        return `${firstName}ちゃんの小柄で活発な体型（脚比率 ${legRatioPercent}%）には、快適なウエストゴムやドロップショルダーがぴったりです。`;
      case 'sturdy':
        return `${firstName}ちゃんのしっかりした体格（脚比率 ${legRatioPercent}%）には、ゆったりストレートや羽織りものがすっきり見せてくれます。`;
      case 'balanced':
      default:
        return `${firstName}ちゃんのバランスの取れたプロポーション（脚比率 ${legRatioPercent}%）には、定番シルエットにアクセントアイテムが映えます。`;
    }
  }

  if (lang === 'zh') {
    switch (silhouette) {
      case 'tall-lean':
        return `${firstName}小朋友高挑修长的身形（腿长比例 ${legRatioPercent}%），搭配流畅的纵向线条与舒适的日常剪裁最为合身显气质。`;
      case 'petite-active':
        return `${firstName}小朋友娇小活泼的体型（腿长比例 ${legRatioPercent}%），适合弹力腰身与落肩版型，保证舒适活动自如。`;
      case 'sturdy':
        return `${firstName}小朋友结实体型（腿长比例 ${legRatioPercent}%），宽松直筒剪裁与轻便外搭能带来自然大方的修身效果。`;
      case 'balanced':
      default:
        return `${firstName}小朋友匀称标准的身形（腿长比例 ${legRatioPercent}%），以经典版型搭配明亮焦点配饰最显朝气。`;
    }
  }

  // English fallback
  return `${firstName}'s ${silhouette} build (${legRatioPercent}% leg ratio) is complemented by balanced vertical lines and comfortable active fit.`;
}

/**
 * Localized weather tip
 */
function getLocalizedWeatherTip(temp: number, lang: SupportedLocale): string {
  if (lang === 'ko') {
    if (temp < 12) {
      return `${temp}°C 쌀쌀한 날씨: 보온성 높은 아우터와 방풍 아이템을 추천합니다.`;
    } else if (temp > 25) {
      return `${temp}°C 따뜻한 햇살: 통기성이 우수한 면 소재와 자외선 차단 액세서리가 좋습니다.`;
    }
    return `${temp}°C 온화한 기온: 통기성 좋은 가벼운 레이어드 룩이 적합합니다.`;
  }

  if (lang === 'ja') {
    if (temp < 12) {
      return `${temp}°C 肌寒い気温：保温性の高いアウターや防風アイテムがおすすめです。`;
    } else if (temp > 25) {
      return `${temp}°C 暖かい日差し：通気性の良いコットン素材や日差し対策小物が最適です。`;
    }
    return `${temp}°C 過ごしやすい気候：軽やかな重ね着スタイルがぴったりです。`;
  }

  if (lang === 'zh') {
    if (temp < 12) {
      return `${temp}°C 天气偏凉：建议搭配保暖外套与防风单品。`;
    } else if (temp > 25) {
      return `${temp}°C 阳光温暖：适宜透气纯棉面料与防晒配饰。`;
    }
    return `${temp}°C 气温适中：轻便透气的多层次搭配最适宜。`;
  }

  // English fallback
  if (temp < 12) {
    return `Chilly ${temp}°C weather: ensure warm thermal outer layer and windproof boots.`;
  } else if (temp > 25) {
    return `Warm ${temp}°C sunshine: choose sun protection accessories and light cotton.`;
  }
  return `At ${temp}°C, light breathable layering is ideal.`;
}

/**
 * Localized AI Styling Rationale
 */
function getLocalizedStylingRationale(params: {
  childName: string;
  occasionName: string;
  itemsList: string;
  temp: number;
  weatherCondition: string;
  silhouetteDesc: string;
  lang: SupportedLocale;
}): string {
  const { childName, occasionName, itemsList, temp, weatherCondition, silhouetteDesc, lang } = params;
  const firstName = childName.split(' ')[0];

  if (!itemsList || itemsList.trim() === '') {
    if (lang === 'ko') return '아직 등록된 옷이 없습니다. 옷장 탭에서 아이의 예쁜 옷을 등록해보세요!';
    if (lang === 'ja') return '登録されている洋服がまだありません。クローゼットタブでお気に入りの服を登録してみましょう！';
    if (lang === 'zh') return '暂无已登记的衣物。请前往衣橱页面添加宝贝的漂亮衣服吧！';
    if (lang === 'mn') return 'Одоогоор бүртгэгдсэн хувцас алга байна. Шүүгээ хэсэгт очиж хүүхдийнхээ хувцсыг нэмээрэй!';
    if (lang === 'es') return 'Aún no hay prendas registradas. ¡Añade la ropa favorita de tu peque en el Armario!';
    if (lang === 'ru') return 'Пока нет зарегистрированных вещей. Добавьте одежду ребенка во вкладке Гардероб!';
    if (lang === 'pt') return 'Ainda não há roupas cadastradas. Adicione as peças favoritas no Guarda-roupa!';
    if (lang === 'fr') return 'Aucun vêtement enregistré. Ajoutez les tenues de votre enfant dans la Garde-robe !';
    return "No clothes registered yet. Add your child's favorite outfits in the Wardrobe tab!";
  }

  if (lang === 'ko') {
    return `${occasionName} 일정과 ${temp}°C (${weatherCondition}) 날씨에 맞춰 ${itemsList || '선택한 아이템'}으로 조화롭게 스타일링했습니다. ${firstName} 아이의 ${silhouetteDesc} 체형 비율을 돋보이게 연출합니다.`;
  }

  if (lang === 'ja') {
    return `${occasionName}の予定と${temp}°C（${weatherCondition}）の気候に合わせ、${itemsList || '選定アイテム'}で上品にコーディネートしました。${firstName}ちゃんの${silhouetteDesc}体型バランスを美しく引き立てます。`;
  }

  if (lang === 'zh') {
    return `针对${occasionName}活动及${temp}°C（${weatherCondition}）天气，选用${itemsList || '精选单品'}进行了和谐搭配，完美衬托出${firstName}小朋友${silhouetteDesc}身形比例。`;
  }

  // English fallback
  return `Tailored for "${occasionName}": Styled ${itemsList || 'selected pieces'} to harmonize with ${temp}°C (${weatherCondition}). Designed to flatter ${firstName}'s ${silhouetteDesc} proportions.`;
}

/**
 * Intelligent outfit recommendation algorithm
 */
export function recommendOutfitFromWardrobe(params: {
  child: ChildProfile;
  wardrobeItems: WardrobeItem[];
  weather: WeatherSnapshot;
  occasionKey: OccasionKey;
  language?: SupportedLocale;
}): OutfitRecommendation {
  const { child, wardrobeItems, weather, occasionKey, language = 'ko' } = params;

  // Filter items owned by this child
  const childWardrobe = wardrobeItems.filter((i) => i.childId === child.id);
  const targetSeasons = getTargetSeasonsForTemp(weather.temp);
  const occasion =
    CORE_OCCASIONS.find((o) => o.key === occasionKey) || CORE_OCCASIONS[0];

  // Group by category
  const categorized: Record<ClothingCategory, WardrobeItem[]> = {
    tops: [],
    bottoms: [],
    outerwear: [],
    onepiece: [],
    shoes: [],
    accessories: [],
  };

  childWardrobe.forEach((item) => {
    if (categorized[item.category]) {
      categorized[item.category].push(item);
    }
  });

  // Sort items in each category by score
  (Object.keys(categorized) as ClothingCategory[]).forEach((cat) => {
    categorized[cat].sort((a, b) => {
      const scoreA = scoreItem(a, weather.temp, targetSeasons, occasion, child);
      const scoreB = scoreItem(b, weather.temp, targetSeasons, occasion, child);
      return scoreB - scoreA;
    });
  });

  // Decide between (Onepiece) vs (Top + Bottom)
  const bestOnepiece = categorized.onepiece[0] || null;
  const bestTop = categorized.tops[0] || null;
  const bestBottom = categorized.bottoms[0] || null;

  let chosenOnepiece: WardrobeItem | null = null;
  let chosenTop: WardrobeItem | null = null;
  let chosenBottom: WardrobeItem | null = null;

  const preferDress =
    bestOnepiece &&
    (occasion.key === 'birthday_party' || occasion.key === 'ceremonial' || !bestTop || !bestBottom);

  if (preferDress && bestOnepiece) {
    chosenOnepiece = bestOnepiece;
  } else {
    chosenTop = bestTop;
    chosenBottom = bestBottom;
  }

  // Outerwear decision: recommend if temperature < 19°C or if occasion is outdoor/ceremonial
  let chosenOuterwear: WardrobeItem | null = null;
  if (categorized.outerwear.length > 0 && (weather.temp < 19 || occasion.key === 'outing_event' || occasion.key === 'ceremonial')) {
    chosenOuterwear = categorized.outerwear[0];
  }

  // Shoes & Accessories
  const chosenShoes = categorized.shoes[0] || null;
  const chosenAccessory = categorized.accessories[0] || null;

  // Collect final selected items
  const selectedItems: WardrobeItem[] = [
    chosenOnepiece,
    chosenTop,
    chosenBottom,
    chosenOuterwear,
    chosenShoes,
    chosenAccessory,
  ].filter(Boolean) as WardrobeItem[];

  // Missing categories detection
  const missingCategories: ClothingCategory[] = [];
  if (!chosenOnepiece && !chosenTop) missingCategories.push('tops');
  if (!chosenOnepiece && !chosenBottom) missingCategories.push('bottoms');
  if (weather.temp < 18 && !chosenOuterwear) missingCategories.push('outerwear');
  if (!chosenShoes) missingCategories.push('shoes');

  // Proportion guidance text (Localized)
  const legRatioPercent = Math.round(child.bodyProportionAnalysis.legRatio * 100);
  const proportionAdvice = getLocalizedProportionAdvice(
    child.name,
    child.bodyProportionAnalysis.silhouetteType,
    legRatioPercent,
    language
  );

  // Dynamic Weather Tip (Localized)
  const weatherTip = getLocalizedWeatherTip(weather.temp, language);

  // Comprehensive AI Styling Rationale (Localized)
  const localizedOccasion = getLocalizedOccasionName(occasion.key, language);
  const localizedWeather = getLocalizedWeatherCondition(weather.condition, language);
  const localizedSilhouette = getLocalizedSilhouette(child.bodyProportionAnalysis.silhouetteType, language);
  const itemsSummary = selectedItems.map((i) => getLocalizedItemName(i, language)).join(', ') || '';

  const stylingRationale = getLocalizedStylingRationale({
    childName: child.name,
    occasionName: localizedOccasion,
    itemsList: itemsSummary,
    temp: weather.temp,
    weatherCondition: localizedWeather,
    silhouetteDesc: localizedSilhouette,
    lang: language,
  });

  // Match score calculation
  const weatherMatchScore = selectedItems.length > 0 ? Math.min(99, 85 + selectedItems.length * 3) : 0;

  return {
    selectedItems,
    selectedItemIds: selectedItems.map((i) => i.id),
    slots: {
      top: chosenTop,
      bottom: chosenBottom,
      outerwear: chosenOuterwear,
      onepiece: chosenOnepiece,
      shoes: chosenShoes,
      accessories: chosenAccessory,
    },
    stylingRationale,
    weatherMatchScore,
    proportionAdvice,
    weatherTip,
    missingCategories,
  };
}
