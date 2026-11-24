import { LocationInfo } from '../types';

/**
 * Check if the child name is one of the initial seed/default names
 */
export function isDefaultChildName(name: string = ''): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  const firstName = trimmed.split(' ')[0].trim();
  return (
    trimmed === 'Ha-eun (Chloe)' ||
    trimmed === 'Min-woo (Leo)' ||
    trimmed === 'Ha-eun' ||
    trimmed === 'Min-woo' ||
    trimmed === 'Chloe' ||
    trimmed === 'Leo' ||
    trimmed === '하은' ||
    trimmed === '민우' ||
    trimmed === 'ハウン' ||
    trimmed === 'ミヌ' ||
    trimmed === '夏恩' ||
    trimmed === '民宇' ||
    firstName === 'Ha-eun' ||
    firstName === 'Min-woo'
  );
}

/**
 * Localizes child names (maps default seed names, preserves user custom names)
 */
export function getLocalizedChildName(name: string = '', locale: string = 'ko'): string {
  if (!name) return '';
  const trimmed = name.trim();

  // Mapping for default names
  const nameMap: Record<string, Record<string, string>> = {
    'Ha-eun (Chloe)': { ko: '하은', en: 'Ha-eun', ja: 'ハウン', zh: '夏恩', es: 'Ha-eun', ru: 'Ха-ын', mn: 'Ха-ын', pt: 'Ha-eun', fr: 'Ha-eun' },
    'Min-woo (Leo)': { ko: '민우', en: 'Min-woo', ja: 'ミヌ', zh: '民宇', es: 'Min-woo', ru: 'Мин-у', mn: 'Мин-ү', pt: 'Min-woo', fr: 'Min-woo' },
    'Ha-eun': { ko: '하은', en: 'Ha-eun', ja: 'ハウン', zh: '夏恩', es: 'Ha-eun', ru: 'Ха-ын', mn: 'Ха-ын', pt: 'Ha-eun', fr: 'Ha-eun' },
    'Chloe': { ko: '하은', en: 'Chloe', ja: 'ハウン', zh: '夏恩', es: 'Chloe', ru: 'Хлоя', mn: 'Клое', pt: 'Chloe', fr: 'Chloé' },
    'Min-woo': { ko: '민우', en: 'Min-woo', ja: 'ミヌ', zh: '民宇', es: 'Min-woo', ru: 'Мин-у', mn: 'Мин-ү', pt: 'Min-woo', fr: 'Min-woo' },
    'Leo': { ko: '민우', en: 'Leo', ja: 'ミヌ', zh: '民宇', es: 'Leo', ru: 'Лео', mn: 'Лео', pt: 'Leo', fr: 'Léo' },
    '하은': { ko: '하은', en: 'Ha-eun', ja: 'ハウン', zh: '夏恩', es: 'Ha-eun', ru: 'Ха-ын', mn: 'Ха-ын', pt: 'Ha-eun', fr: 'Ha-eun' },
    '민우': { ko: '민우', en: 'Min-woo', ja: 'ミヌ', zh: '民宇', es: 'Min-woo', ru: 'Мин-у', mn: 'Мин-ү', pt: 'Min-woo', fr: 'Min-woo' },
    'ハウン': { ko: '하은', en: 'Ha-eun', ja: 'ハウン', zh: '夏恩', es: 'Ha-eun', ru: 'Ха-ын', mn: 'Ха-ын', pt: 'Ha-eun', fr: 'Ha-eun' },
    'ミヌ': { ko: '민우', en: 'Min-woo', ja: 'ミヌ', zh: '民宇', es: 'Min-woo', ru: 'Мин-у', mn: 'Мин-ү', pt: 'Min-woo', fr: 'Min-woo' },
    '夏恩': { ko: '하은', en: 'Ha-eun', ja: 'ハウン', zh: '夏恩', es: 'Ha-eun', ru: 'Ха-ын', mn: 'Ха-ын', pt: 'Ha-eun', fr: 'Ha-eun' },
    '民宇': { ko: '민우', en: 'Min-woo', ja: 'ミヌ', zh: '民宇', es: 'Min-woo', ru: 'Мин-у', mn: 'Мин-ү', pt: 'Min-woo', fr: 'Min-woo' },
  };

  if (nameMap[trimmed]) {
    return nameMap[trimmed][locale] || nameMap[trimmed]['en'] || trimmed;
  }

  const firstName = trimmed.split(' ')[0].trim();
  if (nameMap[firstName]) {
    return nameMap[firstName][locale] || nameMap[firstName]['en'] || firstName;
  }

  return trimmed;
}

/**
 * Formats child's age according to locale rules:
 * ko: "6세"
 * en: "6 yrs"
 * ja: "6歳"
 * zh: "6岁"
 */
export function formatChildAge(age: number | string = 0, locale: string = 'ko'): string {
  if (locale === 'ko') return `${age}세`;
  if (locale === 'ja') return `${age}歳`;
  if (locale === 'zh') return `${age}岁`;
  return `${age} yrs`;
}

/**
 * Localizes preset city and province display for weather card
 * ko: "서울시 강남구"
 * ja: "ソウル市 江南区"
 * zh: "首尔市 江南区"
 * en: "Gangnam-gu, Seoul"
 */
export function getLocalizedLocation(location?: Partial<LocationInfo> | null, locale: string = 'ko'): string {
  if (!location) {
    if (locale === 'ko') return '서울시 강남구';
    if (locale === 'ja') return 'ソウル市 江南区';
    if (locale === 'zh') return '首尔市 江南区';
    return 'Gangnam-gu, Seoul';
  }

  const city = location.city || '';
  const province = location.province || '';

  // Specific city / province translations
  const locationMap: Record<string, Record<string, { city: string; prov: string; format: string }>> = {
    'Gangnam-gu': {
      ko: { city: '강남구', prov: '서울시', format: '{prov} {city}' },
      ja: { city: '江南区', prov: 'ソウル市', format: '{prov} {city}' },
      zh: { city: '江南区', prov: '首尔市', format: '{prov} {city}' },
      en: { city: 'Gangnam-gu', prov: 'Seoul', format: '{city}, {prov}' },
    },
    'Mapo-gu': {
      ko: { city: '마포구', prov: '서울시', format: '{prov} {city}' },
      ja: { city: '麻浦区', prov: 'ソウル市', format: '{prov} {city}' },
      zh: { city: '麻浦区', prov: '首尔市', format: '{prov} {city}' },
      en: { city: 'Mapo-gu', prov: 'Seoul', format: '{city}, {prov}' },
    },
    'Songpa-gu': {
      ko: { city: '송파구', prov: '서울시', format: '{prov} {city}' },
      ja: { city: '松坡区', prov: 'ソウル市', format: '{prov} {city}' },
      zh: { city: '松坡区', prov: '首尔市', format: '{prov} {city}' },
      en: { city: 'Songpa-gu', prov: 'Seoul', format: '{city}, {prov}' },
    },
    'Goyang-si': {
      ko: { city: '고양시', prov: '경기도', format: '{prov} {city}' },
      ja: { city: '高陽市', prov: '京畿道', format: '{prov} {city}' },
      zh: { city: '高阳市', prov: '京畿道', format: '{prov} {city}' },
      en: { city: 'Goyang-si', prov: 'Gyeonggi-do', format: '{city}, {prov}' },
    },
    'Seongnam-si': {
      ko: { city: '성남/분당', prov: '경기도', format: '{prov} {city}' },
      ja: { city: '城南/盆唐', prov: '京畿道', format: '{prov} {city}' },
      zh: { city: '城南/盆唐', prov: '京畿道', format: '{prov} {city}' },
      en: { city: 'Seongnam / Bundang', prov: 'Gyeonggi', format: '{city}, {prov}' },
    },
    'Suwon-si': {
      ko: { city: '수원시', prov: '경기도', format: '{prov} {city}' },
      ja: { city: '水原市', prov: '京畿道', format: '{prov} {city}' },
      zh: { city: '水原市', prov: '京畿道', format: '{prov} {city}' },
      en: { city: 'Suwon-si', prov: 'Gyeonggi', format: '{city}, {prov}' },
    },
    'Haeundae-gu': {
      ko: { city: '해운대구', prov: '부산시', format: '{prov} {city}' },
      ja: { city: '海雲台区', prov: '釜山市', format: '{prov} {city}' },
      zh: { city: '海云台区', prov: '釜山市', format: '{prov} {city}' },
      en: { city: 'Haeundae', prov: 'Busan', format: '{city}, {prov}' },
    },
    'Yeonsu-gu': {
      ko: { city: '송도/연수구', prov: '인천시', format: '{prov} {city}' },
      ja: { city: '松島/延寿区', prov: '仁川市', format: '{prov} {city}' },
      zh: { city: '松岛/延寿区', prov: '仁川市', format: '{prov} {city}' },
      en: { city: 'Songdo', prov: 'Incheon', format: '{city}, {prov}' },
    },
    'Jeju-si': {
      ko: { city: '제주시', prov: '제주도', format: '{prov} {city}' },
      ja: { city: '済州市', prov: '済州島', format: '{prov} {city}' },
      zh: { city: '济州市', prov: '济州岛', format: '{prov} {city}' },
      en: { city: 'Jeju Island', prov: 'Jeju', format: '{city}, {prov}' },
    },
    'Shinjuku': {
      ko: { city: '신주쿠', prov: '도쿄', format: '일본 {prov} {city}' },
      ja: { city: '新宿区', prov: '東京都', format: '{prov} {city}' },
      zh: { city: '新宿区', prov: '东京', format: '日本 {prov} {city}' },
      en: { city: 'Shinjuku', prov: 'Tokyo', format: '{city}, {prov}' },
    },
    'Kita-ku': {
      ko: { city: '기타구', prov: '오사카', format: '일본 {prov} {city}' },
      ja: { city: '北区', prov: '大阪市', format: '{prov} {city}' },
      zh: { city: '北区', prov: '大阪', format: '日本 {prov} {city}' },
      en: { city: 'Kita-ku', prov: 'Osaka', format: '{city}, {prov}' },
    },
    'Los Angeles': {
      ko: { city: '로스앤젤레스', prov: '캘리포니아', format: '미국 {prov} {city}' },
      ja: { city: 'ロサンゼルス', prov: 'カリフォルニア', format: '米国 {prov} {city}' },
      zh: { city: '洛杉矶', prov: '加州', format: '美国 {prov} {city}' },
      en: { city: 'Los Angeles', prov: 'California', format: '{city}, {prov}' },
    },
    'New York City': {
      ko: { city: '뉴욕', prov: '뉴욕주', format: '미국 {prov} {city}' },
      ja: { city: 'ニューヨーク', prov: 'NY州', format: '米国 {prov} {city}' },
      zh: { city: '纽约', prov: '纽约州', format: '美国 {prov} {city}' },
      en: { city: 'New York City', prov: 'New York', format: '{city}, {prov}' },
    },
    'London': {
      ko: { city: '런던', prov: '잉글랜드', format: '영국 {city}' },
      ja: { city: 'ロンドン', prov: 'イングランド', format: '英国 {city}' },
      zh: { city: '伦敦', prov: '英格兰', format: '英国 {city}' },
      en: { city: 'London', prov: 'UK', format: '{city}, {prov}' },
    },
  };

  const entry = locationMap[city];
  if (entry) {
    const locItem = entry[locale] || entry['en'];
    if (locItem) {
      return locItem.format
        .replace('{prov}', locItem.prov)
        .replace('{city}', locItem.city);
    }
  }

  // Fallback for custom locations
  if (locale === 'ko' || locale === 'ja' || locale === 'zh') {
    return `${province} ${city}`.trim();
  }
  return `${city}, ${province}`.trim();
}

/**
 * Localizes weather conditions across all languages
 */
export function getLocalizedWeatherBadge(condition: string = '', locale: string = 'ko'): string {
  const condLower = (condition || '').toLowerCase();

  const isDrizzle = condLower.includes('drizzle');
  const isFog = condLower.includes('fog');
  const isRain = condLower.includes('rain') || condLower.includes('shower');
  const isSnow = condLower.includes('snow');
  const isCloudy = condLower.includes('cloud') || condLower.includes('overcast');
  const isWindy = condLower.includes('wind');
  const isColdClear = condLower.includes('cold') || condLower.includes('freeze');
  const isSunnyWarm = condLower.includes('warm');
  const isClear = condLower.includes('clear') || condLower.includes('sun') || condLower.includes('pleasant');

  if (locale === 'ko') {
    if (isDrizzle) return '이슬비/흐림';
    if (isFog) return '안개/흐림';
    if (isRain) return '비/소나기';
    if (isSnow) return '눈/한파';
    if (isColdClear) return '맑고 쌀쌀함';
    if (isSunnyWarm) return '맑고 따뜻함';
    if (isCloudy) return '구름 많음';
    if (isWindy) return '바람 쌀쌀';
    if (isClear) return '맑고 쾌적함';
    return condition || '맑음';
  }

  if (locale === 'ja') {
    if (isDrizzle) return '小雨・曇り';
    if (isFog) return '霧・かすみ';
    if (isRain) return '雨模様';
    if (isSnow) return '雪・寒波';
    if (isColdClear) return '寒冷・晴れ';
    if (isSunnyWarm) return '快晴・温暖';
    if (isCloudy) return '曇りがち';
    if (isWindy) return '風強め';
    if (isClear) return '晴れ・快適';
    return condition || '晴れ';
  }

  if (locale === 'zh') {
    if (isDrizzle) return '小雨微湿';
    if (isFog) return '雾气阴天';
    if (isRain) return '小雨/阵雨';
    if (isSnow) return '降雪冷锋';
    if (isColdClear) return '晴朗干冷';
    if (isSunnyWarm) return '晴朗暖和';
    if (isCloudy) return '多云阴天';
    if (isWindy) return '微风稍凉';
    if (isClear) return '晴朗舒适';
    return condition || '晴朗';
  }

  // English fallback
  if (isDrizzle) return 'Drizzle / Overcast';
  if (isFog) return 'Foggy';
  if (isRain) return 'Rain / Showers';
  if (isSnow) return 'Snow & Cold';
  if (isColdClear) return 'Cold & Clear';
  if (isSunnyWarm) return 'Sunny & Warm';
  if (isCloudy) return 'Partly Cloudy';
  if (isWindy) return 'Windy & Cool';
  if (isClear) return 'Clear & Pleasant';
  return condition || 'Clear';
}

/**
 * Formats high / low temperatures according to locale:
 * ko: "최고 21° / 최저 12°"
 * ja: "最高 21° / 最低 12°"
 * zh: "最高 21° / 最低 12°"
 * en: "High 21° / Low 12°"
 */
export function formatHighLowTemps(high: number = 0, low: number = 0, locale: string = 'ko'): string {
  if (locale === 'ko') {
    return `최고 ${high}° / 최저 ${low}°`;
  }
  if (locale === 'ja' || locale === 'zh') {
    return `最高 ${high}° / 最低 ${low}°`;
  }
  return `High ${high}° / Low ${low}°`;
}
