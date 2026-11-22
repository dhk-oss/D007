import { SupportedLocale } from '../i18n/translations';

// Pre-defined seed item names in multiple languages (covering 3-11 yr old kids fashion items & legacy fallbacks)
const ITEM_NAME_MAP: Record<string, Record<string, string>> = {
  // New 3-11 Year-Old Kids Wardrobe Items
  'Pastel Bear Knit Cardigan': {
    ko: '파스텔 곰돌이 니트 가디건',
    ja: 'パステルベアニットカーディガン',
    zh: '柔彩小熊针织开衫',
    en: 'Pastel Bear Knit Cardigan',
  },
  'Rainbow Stripe Kids Cotton Tee': {
    ko: '무지개 스트라이프 키즈 면 티셔츠',
    ja: 'レインボーストライプキッズコットンTシャツ',
    zh: '彩虹条纹纯棉童T恤',
    en: 'Rainbow Stripe Kids Cotton Tee',
  },
  'Soft Corduroy Kids Overalls': {
    ko: '소프트 코듀로이 키즈 멜빵바지',
    ja: 'ソフトコーデュロイキッズオーバーオール',
    zh: '柔软灯芯绒儿童背带裤',
    en: 'Soft Corduroy Kids Overalls',
  },
  'Comfy Kids Cotton Jogger Pants': {
    ko: '편안한 키즈 코튼 조거팬츠',
    ja: '快適キッズコットンジョガーパンツ',
    zh: '舒适纯棉儿童束脚运动裤',
    en: 'Comfy Kids Cotton Jogger Pants',
  },
  'Kids Hooded Windbreaker Jacket': {
    ko: '키즈 후드 바람막이 점퍼',
    ja: 'キッズフード付きウィンドブレーカー',
    zh: '儿童连帽防风夹克外套',
    en: 'Kids Hooded Windbreaker Jacket',
  },
  'Cozy Teddy Fleece Kids Vest': {
    ko: '포근한 테디 플리스 키즈 조끼',
    ja: 'ぬくもりテディフリースキッズベスト',
    zh: '温暖泰迪熊抓绒儿童背心',
    en: 'Cozy Teddy Fleece Kids Vest',
  },
  'Daisy Smocked Kids Sundress': {
    ko: '데이지 스모킹 키즈 원피스',
    ja: 'デイジースモッキングキッズサンドレス',
    zh: '雏菊褶皱儿童吊带连衣裙',
    en: 'Daisy Smocked Kids Sundress',
  },
  'Kids Velcro Cloud Sneakers': {
    ko: '키즈 벨크로 클라우드 운동화',
    ja: 'キッズベルクロクラウドスニーカー',
    zh: '儿童魔术贴云朵运动鞋',
    en: 'Kids Velcro Cloud Sneakers',
  },
  'Kids Sun-Shield Cotton Bucket Hat': {
    ko: '키즈 자외선차단 코튼 버킷햇',
    ja: 'キッズUVカットコットンバケットハット',
    zh: '儿童防晒纯棉遮阳渔夫帽',
    en: 'Kids Sun-Shield Cotton Bucket Hat',
  },

  // Legacy item fallbacks
  'Cream Knit Sweater': {
    ko: '크림 니트 스웨터',
    ja: 'クリームニットセーター',
    zh: '米白色针织毛衣',
    en: 'Cream Knit Sweater',
  },
  'Denim Flared Trousers': {
    ko: '데님 플레어 진',
    ja: 'デニムフレアパンツ',
    zh: '微喇牛仔长裤',
    en: 'Denim Flared Trousers',
  },
  'Denim Flared Jeans': {
    ko: '데님 플레어 진',
    ja: 'デニムフレアジーンズ',
    zh: '微喇牛仔裤',
    en: 'Denim Flared Jeans',
  },
  'Soft Peach Trench Coat': {
    ko: '소프트 피치 트렌치 코트',
    ja: 'ソフトピーチトレンチコート',
    zh: '柔桃色风衣外套',
    en: 'Soft Peach Trench Coat',
  },
  'Floral Prairie Dress': {
    ko: '플로럴 프레리 원피스',
    ja: '小花柄プレーリーワンピース',
    zh: '田园碎花连衣裙',
    en: 'Floral Prairie Dress',
  },
  'Canvas Sneaker Lows': {
    ko: '캔버스 로우 스니커즈',
    ja: 'キャンバスロースニーカー',
    zh: '低帮帆布板鞋',
    en: 'Canvas Sneaker Lows',
  },
  'Sunflower Straw Bucket Hat': {
    ko: '해바라기 밀짚 버킷햇',
    ja: 'ひまわり麦わらバケットハット',
    zh: '向日葵草编渔夫帽',
    en: 'Sunflower Straw Bucket Hat',
  },
  'Striped Long-sleeve Tee': {
    ko: '스트라이프 롱슬리브 티셔츠',
    ja: 'ボーダー長袖Tシャツ',
    zh: '条纹长袖T恤',
    en: 'Striped Long-sleeve Tee',
  },
  'Khaki Cargo Joggers': {
    ko: '카키 카고 조거팬츠',
    ja: 'カーキカーゴジョガーパンツ',
    zh: '卡其色工装束脚裤',
    en: 'Khaki Cargo Joggers',
  },
  'Teddy Bear Fleece Vest': {
    ko: '테디베어 플리스 베스트',
    ja: 'テディベアフリースベスト',
    zh: '泰迪熊抓绒背心',
    en: 'Teddy Bear Fleece Vest',
  },
  'Velcro Easy Runners': {
    ko: '벨크로 이지 런닝화',
    ja: 'ベルクロイージーランナーズ',
    zh: '魔术贴便捷跑鞋',
    en: 'Velcro Easy Runners',
  },
};

const CATEGORY_MAP: Record<string, Record<string, string>> = {
  tops: {
    ko: '상의',
    ja: 'トップス',
    zh: '上衣',
    en: 'Tops',
  },
  bottoms: {
    ko: '하의',
    ja: 'ボトムス',
    zh: '下装',
    en: 'Bottoms',
  },
  outerwear: {
    ko: '아우터',
    ja: 'アウター',
    zh: '外套',
    en: 'Outerwear',
  },
  onepiece: {
    ko: '원피스',
    ja: 'ワンピース',
    zh: '连衣裙',
    en: 'Onepiece',
  },
  dress: {
    ko: '원피스',
    ja: 'ワンピース',
    zh: '连衣裙',
    en: 'Dress',
  },
  shoes: {
    ko: '신발',
    ja: 'シューズ',
    zh: '鞋子',
    en: 'Shoes',
  },
  accessories: {
    ko: '액세서리',
    ja: 'アクセサリー',
    zh: '配饰',
    en: 'Accessories',
  },
};

const COLOR_MAP: Record<string, Record<string, string>> = {
  peach: { ko: '피치', ja: 'ピーチ', zh: '桃色', en: 'Peach' },
  'pastel yellow': { ko: '파스텔 옐로우', ja: 'パステルイエロー', zh: '浅黄色', en: 'Pastel Yellow' },
  white: { ko: '화이트', ja: 'ホワイト', zh: '白色', en: 'White' },
  beige: { ko: '베이지', ja: 'ベージュ', zh: '米黄色', en: 'Beige' },
  cream: { ko: '크림', ja: 'クリーム', zh: '奶油白', en: 'Cream' },
  'cream / beige': { ko: '크림 / 베이지', ja: 'クリーム / ベージュ', zh: '奶油白 / 米色', en: 'Cream / Beige' },
  'sky blue / cream': { ko: '스카이블루 / 크림', ja: 'スカイブルー / クリーム', zh: '天蓝 / 米白', en: 'Sky Blue / Cream' },
  'indigo blue': { ko: '인디고 블루', ja: 'インディゴブルー', zh: '靛蓝色', en: 'Indigo Blue' },
  navy: { ko: '네이비', ja: 'ネイビー', zh: '藏蓝色', en: 'Navy' },
  'navy / ivory': { ko: '네이비 / 아이보리', ja: 'ネイビー / アイボリー', zh: '藏青 / 米白', en: 'Navy / Ivory' },
  'olive khaki': { ko: '올리브 카키', ja: 'オリーブカーキ', zh: '橄榄卡其', en: 'Olive Khaki' },
  'teddy caramel': { ko: '테디 카라멜', ja: 'テディキャラメル', zh: '焦糖棕', en: 'Teddy Caramel' },
  'grey / neon yellow': { ko: '그레이 / 형광 옐로우', ja: 'グレー / ネオンイエロー', zh: '灰 / 荧光黄', en: 'Grey / Neon Yellow' },
  pink: { ko: '핑크', ja: 'ピンク', zh: '粉色', en: 'Pink' },
  black: { ko: '블랙', ja: 'ブラック', zh: '黑色', en: 'Black' },
  gray: { ko: '그레이', ja: 'グレー', zh: '灰色', en: 'Gray' },
  grey: { ko: '그레이', ja: 'グレー', zh: '灰色', en: 'Grey' },
  'sky blue': { ko: '스카이블루', ja: 'スカイブルー', zh: '天蓝色', en: 'Sky Blue' },
  mint: { ko: '민트', ja: 'ミント', zh: '薄荷绿', en: 'Mint' },
  brown: { ko: '브라운', ja: 'ブラウン', zh: '棕色', en: 'Brown' },
  red: { ko: '레드', ja: 'レッド', zh: '红色', en: 'Red' },
  yellow: { ko: '옐로우', ja: 'イエロー', zh: '黄色', en: 'Yellow' },
  green: { ko: '그린', ja: 'グリーン', zh: '绿色', en: 'Green' },
  blue: { ko: '블루', ja: 'ブルー', zh: '蓝色', en: 'Blue' },
  neutral: { ko: '내추럴', ja: 'ナチュラル', zh: '自然色', en: 'Neutral' },
};

const SEASON_MAP: Record<string, Record<string, string>> = {
  spring: { ko: '봄', ja: '春', zh: '春', en: 'Spring' },
  summer: { ko: '여름', ja: '夏', zh: '夏', en: 'Summer' },
  autumn: { ko: '가을', ja: '秋', zh: '秋', en: 'Autumn' },
  fall: { ko: '가을', ja: '秋', zh: '秋', en: 'Fall' },
  winter: { ko: '겨울', ja: '冬', zh: '冬', en: 'Winter' },
};

/**
 * Localizes a wardrobe item name based on locale
 */
export function getLocalizedItemName(
  item: { name?: string; nameKo?: string; nameJa?: string; nameZh?: string } | string | null | undefined,
  locale: SupportedLocale | string = 'ko'
): string {
  if (!item) return '';

  const rawName = typeof item === 'string' ? item : item.name || '';
  if (!rawName) return '';

  // If item object has explicit language override fields
  if (typeof item === 'object') {
    if (locale === 'ko' && item.nameKo) return item.nameKo;
    if (locale === 'ja' && item.nameJa) return item.nameJa;
    if (locale === 'zh' && item.nameZh) return item.nameZh;
  }

  const lookup = ITEM_NAME_MAP[rawName];
  if (lookup) {
    return lookup[locale] || lookup['en'] || rawName;
  }

  return rawName;
}

/**
 * Localizes clothing category
 */
export function getLocalizedCategory(category: string = '', locale: string = 'ko'): string {
  const catKey = category.toLowerCase().trim();
  const lookup = CATEGORY_MAP[catKey];
  if (lookup) {
    return lookup[locale] || lookup['en'] || category;
  }
  return category;
}

/**
 * Localizes clothing color tag
 */
export function getLocalizedColor(color: string = '', locale: string = 'ko'): string {
  if (!color) return '';
  const colorKey = color.toLowerCase().trim();
  const lookup = COLOR_MAP[colorKey];
  if (lookup) {
    return lookup[locale] || lookup['en'] || color;
  }
  return color;
}

/**
 * Localizes season tag
 */
export function getLocalizedSeason(season: string = '', locale: string = 'ko'): string {
  const seasonKey = season.toLowerCase().trim();
  const lookup = SEASON_MAP[seasonKey];
  if (lookup) {
    return lookup[locale] || lookup['en'] || season;
  }
  return season;
}
