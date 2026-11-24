import { ChildProfile, WardrobeItem, StylingLookbook, ParentUser, LocationInfo, BodyProportionAnalysis } from '../types';
import { initialChildren, mockParentUser } from '../utils/mockData';
import { isMockMode, storage, auth } from './firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { DEFAULT_LOCATION } from './weatherService';

const STORAGE_KEYS = {
  CHILDREN: 'kids_ai_children_v2',
  WARDROBE: 'kids_ai_wardrobe_v3',
  LOOKBOOKS: 'kids_ai_lookbooks_v3',
  ACTIVE_CHILD: 'kids_ai_active_child_v2',
  PARENT_USER: 'kids_ai_parent_user_v2',
  LOCATION: 'kids_ai_location_v2',
};

// Legacy keys to clean up if present
const LEGACY_KEYS = [
  'kids_ai_children_v1',
  'kids_ai_wardrobe_v1',
  'kids_ai_wardrobe_v2',
  'kids_ai_lookbooks_v1',
  'kids_ai_lookbooks_v2',
  'kids_ai_active_child_v1',
  'kids_ai_parent_user_v1',
  'kids_ai_location_v1',
];

/**
 * Detects whether an item is one of the initial seed/sample items
 */
export function isSampleWardrobeItem(item: Partial<WardrobeItem>): boolean {
  if (!item) return false;

  const sampleIds = new Set([
    'kids-item-1', 'kids-item-2', 'kids-item-3', 'kids-item-4', 'kids-item-5', 'kids-item-6',
    'kids-item-7', 'kids-item-8', 'kids-item-9', 'kids-item-10', 'kids-item-11', 'kids-item-12',
    'item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7', 'item-8', 'item-9', 'item-10',
  ]);

  if (item.id && (sampleIds.has(item.id) || item.id.startsWith('kids-item-'))) {
    return true;
  }

  const sampleNames = new Set([
    'Pastel Bear Knit Cardigan',
    'Rainbow Stripe Kids Cotton Tee',
    'Soft Corduroy Kids Overalls',
    'Comfy Kids Cotton Jogger Pants',
    'Kids Hooded Windbreaker Jacket',
    'Cozy Teddy Fleece Kids Vest',
    'Daisy Smocked Kids Sundress',
    'Kids Velcro Cloud Sneakers',
    'Kids Sun-Shield Cotton Bucket Hat',
    'Soft Peach Trench Coat',
    'Floral Prairie Dress',
    'Denim Flared Trousers',
    'Denim Flared Jeans',
    'Canvas Sneaker Lows',
    'Sunflower Straw Bucket Hat',
    'Cream Knit Sweater',
    'Striped Long-sleeve Tee',
    'Khaki Cargo Joggers',
    'Teddy Bear Fleece Vest',
    'Velcro Easy Runners',
    '파스텔 곰돌이 니트 가디건',
    '무지개 스트라이프 키즈 면 티셔츠',
    '소프트 코듀로이 키즈 멜빵바지',
    '편안한 키즈 코튼 조거팬츠',
    '키즈 후드 바람막이 점퍼',
    '포근한 테디 플리스 키즈 조끼',
    '데이지 스모킹 키즈 원피스',
    '키즈 벨크로 클라우드 운동화',
    '키즈 자외선차단 코튼 버킷햇',
  ]);

  if (item.name && sampleNames.has(item.name.trim())) {
    return true;
  }

  if (item.imageUrl) {
    if (item.imageUrl.includes('unsplash.com')) return true;
    if (item.imageUrl.includes('KIDS 3-11') || item.imageUrl.includes('KIDS%203-11')) return true;
  }

  return false;
}

/**
 * Offscreen HTML5 Canvas Image Compressor
 * Resizes high-resolution camera captures and uploaded files to max dimensions and compresses to JPEG
 */
export async function compressImageToDataUrl(
  fileOrDataUrl: File | string,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<string> {
  // If it is an SVG flat-lay, preserve vector clarity and do not rasterize
  if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/svg+xml')) {
    return fileOrDataUrl;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const processImage = () => {
      let width = img.naturalWidth || img.width || maxWidth;
      let height = img.naturalHeight || img.height || maxHeight;

      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onload = processImage;
    img.onerror = () => {
      if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        reject(new Error('Failed to load image for compression'));
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          img.src = reader.result;
        } else {
          reject(new Error('Failed to read file as DataURL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`Failed reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed saving ${key} to localStorage:`, e);
  }
}

/**
 * Sanitizes and migrates a child profile object to ensure all required fields exist
 */
function sanitizeChildProfile(rawChild: Partial<ChildProfile>, index: number): ChildProfile {
  const fallback = initialChildren[index % initialChildren.length] || initialChildren[0];

  const torsoRatio = typeof rawChild.bodyProportionAnalysis?.torsoRatio === 'number'
    ? rawChild.bodyProportionAnalysis.torsoRatio
    : fallback.bodyProportionAnalysis.torsoRatio;

  const legRatio = typeof rawChild.bodyProportionAnalysis?.legRatio === 'number'
    ? rawChild.bodyProportionAnalysis.legRatio
    : fallback.bodyProportionAnalysis.legRatio;

  const upperPercent = Math.round(torsoRatio * 100);
  const lowerPercent = Math.round(legRatio * 100);
  const upperToLowerRatio = rawChild.bodyProportionAnalysis?.upperToLowerRatio || `${upperPercent}:${lowerPercent}`;

  const silhouetteType = rawChild.bodyProportionAnalysis?.silhouetteType ||
    (lowerPercent >= 58 ? 'tall-lean' : 'balanced');

  const stylingNotes = Array.isArray(rawChild.bodyProportionAnalysis?.stylingNotes) && rawChild.bodyProportionAnalysis.stylingNotes.length > 0
    ? rawChild.bodyProportionAnalysis.stylingNotes
    : fallback.bodyProportionAnalysis.stylingNotes;

  const bodyTypeSummary = rawChild.bodyProportionAnalysis?.bodyTypeSummary || fallback.bodyProportionAnalysis.bodyTypeSummary;

  const sanitizedAnalysis: BodyProportionAnalysis = {
    torsoRatio,
    legRatio,
    upperToLowerRatio,
    silhouetteType,
    bodyTypeSummary,
    stylingNotes,
    analyzedAt: rawChild.bodyProportionAnalysis?.analyzedAt || new Date().toISOString(),
  };

  return {
    id: rawChild.id || `child-${index + 1}`,
    parentId: rawChild.parentId || 'parent-1',
    name: rawChild.name || fallback.name,
    gender: rawChild.gender === 'male' || rawChild.gender === 'female' ? rawChild.gender : fallback.gender,
    age: typeof rawChild.age === 'number' && rawChild.age >= 3 && rawChild.age <= 11 ? rawChild.age : fallback.age,
    heightCm: typeof rawChild.heightCm === 'number' ? rawChild.heightCm : fallback.heightCm,
    weightKg: typeof rawChild.weightKg === 'number' ? rawChild.weightKg : fallback.weightKg,
    waistCm: typeof rawChild.waistCm === 'number' ? rawChild.waistCm : fallback.waistCm,
    fullBodyPhotoUrl: rawChild.fullBodyPhotoUrl || fallback.fullBodyPhotoUrl,
    bodyProportionAnalysis: sanitizedAnalysis,
  };
}

export const DataService = {
  /**
   * Reset all local application storage to clean defaults
   */
  resetAllStorage(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('LocalStorage clear warning:', e);
    }
  },

  /**
   * Location Settings with defensive fallback
   */
  getLocation(): LocationInfo {
    const raw = getItem<Partial<LocationInfo>>(STORAGE_KEYS.LOCATION, DEFAULT_LOCATION);
    if (!raw || !raw.city || !raw.province) {
      return DEFAULT_LOCATION;
    }
    return {
      country: raw.country || DEFAULT_LOCATION.country,
      province: raw.province || DEFAULT_LOCATION.province,
      city: raw.city || DEFAULT_LOCATION.city,
      displayName: raw.displayName || `${raw.city}, ${raw.province}`,
    };
  },

  saveLocation(loc: LocationInfo): void {
    setItem(STORAGE_KEYS.LOCATION, loc);
  },

  /**
   * Parent User Authentication & Profile
   */
  getParentUser(): ParentUser {
    if (!isMockMode && auth?.currentUser) {
      const u = auth.currentUser;
      return {
        uid: u.uid,
        email: u.email || 'parent@kidsaistylist.com',
        displayName: u.displayName || 'Parent',
        location: this.getLocation(),
      };
    }
    const raw = getItem<Partial<ParentUser>>(STORAGE_KEYS.PARENT_USER, mockParentUser);
    return {
      uid: raw.uid || mockParentUser.uid,
      email: raw.email || mockParentUser.email,
      displayName: raw.displayName || mockParentUser.displayName,
      location: this.getLocation(),
    };
  },

  setParentUser(user: ParentUser): void {
    setItem(STORAGE_KEYS.PARENT_USER, user);
  },

  /**
   * Children Profile CRUD with Schema Migration & Max 5 Enforcement
   */
  getChildren(): ChildProfile[] {
    const raw = getItem<Partial<ChildProfile>[]>(STORAGE_KEYS.CHILDREN, initialChildren);
    if (!Array.isArray(raw) || raw.length === 0) {
      this.saveChildren(initialChildren);
      return initialChildren;
    }

    const sanitized = raw.slice(0, 5).map((c, i) => sanitizeChildProfile(c, i));
    return sanitized;
  },

  saveChildren(children: ChildProfile[]): void {
    const limited = children.slice(0, 5);
    setItem(STORAGE_KEYS.CHILDREN, limited);
  },

  getActiveChildId(): string {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHILD);
    const children = this.getChildren();
    if (saved && children.some((c) => c.id === saved)) {
      return saved;
    }
    return children[0]?.id || initialChildren[0].id;
  },

  setActiveChildId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHILD, id);
  },

  /**
   * Wardrobe Items CRUD (Only User-Added Items)
   */
  getWardrobe(): WardrobeItem[] {
    let raw = getItem<WardrobeItem[]>(STORAGE_KEYS.WARDROBE, []);
    if (!Array.isArray(raw) || raw.length === 0) {
      const v2 = getItem<WardrobeItem[]>('kids_ai_wardrobe_v2', []);
      if (Array.isArray(v2) && v2.length > 0) {
        raw = v2;
      }
    }

    if (!Array.isArray(raw)) {
      this.saveWardrobe([]);
      return [];
    }

    // Filter out all sample seed items, retaining only actual user-added garments
    const userOnlyItems = raw.filter((item) => !isSampleWardrobeItem(item));

    this.saveWardrobe(userOnlyItems);
    try {
      localStorage.removeItem('kids_ai_wardrobe_v2');
      localStorage.removeItem('kids_ai_wardrobe_v1');
    } catch {}

    return userOnlyItems;
  },

  saveWardrobe(items: WardrobeItem[]): void {
    const userOnlyItems = (items || []).filter((item) => !isSampleWardrobeItem(item));
    setItem(STORAGE_KEYS.WARDROBE, userOnlyItems);
  },

  /**
   * Styling Lookbooks CRUD (Only User-Saved Looks)
   */
  getLookbooks(): StylingLookbook[] {
    let raw = getItem<StylingLookbook[]>(STORAGE_KEYS.LOOKBOOKS, []);
    if (!Array.isArray(raw) || raw.length === 0) {
      const v2 = getItem<StylingLookbook[]>('kids_ai_lookbooks_v2', []);
      if (Array.isArray(v2) && v2.length > 0) {
        raw = v2;
      }
    }

    if (!Array.isArray(raw)) {
      this.saveLookbooks([]);
      return [];
    }

    // Filter out seed lookbooks ('look-1', 'look-2')
    const userOnlyLooks = raw.filter((look) => look && look.id !== 'look-1' && look.id !== 'look-2');
    this.saveLookbooks(userOnlyLooks);
    try {
      localStorage.removeItem('kids_ai_lookbooks_v2');
      localStorage.removeItem('kids_ai_lookbooks_v1');
    } catch {}

    return userOnlyLooks;
  },

  saveLookbooks(lookbooks: StylingLookbook[]): void {
    setItem(STORAGE_KEYS.LOOKBOOKS, lookbooks);
  },

  deleteLookbook(id: string): StylingLookbook[] {
    const list = this.getLookbooks().filter((l) => l.id !== id);
    this.saveLookbooks(list);
    return list;
  },

  /**
   * Image File & Camera Snapshot Upload Helper with automatic client-side compression
   */
  async uploadImage(dataUrlOrFile: string | File, folder: 'children' | 'wardrobe' = 'wardrobe'): Promise<string> {
    try {
      const compressedDataUrl = await compressImageToDataUrl(dataUrlOrFile, 800, 800, 0.8);

      if (!isMockMode && storage) {
        try {
          const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
          const storageRef = ref(storage, fileName);
          await uploadString(storageRef, compressedDataUrl, 'data_url');
          return await getDownloadURL(storageRef);
        } catch (err) {
          console.warn('Firebase upload failed, using compressed dataUrl directly:', err);
          return compressedDataUrl;
        }
      }

      return compressedDataUrl;
    } catch (err) {
      console.warn('Image processing error, using fallback:', err);
      if (typeof dataUrlOrFile === 'string') return dataUrlOrFile;
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(dataUrlOrFile);
      });
    }
  },
};
