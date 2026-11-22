import { ChildProfile, WardrobeItem, StylingLookbook, ParentUser, LocationInfo, BodyProportionAnalysis } from '../types';
import { initialChildren, initialWardrobe, initialLookbooks, mockParentUser } from '../utils/mockData';
import { isMockMode, storage, auth } from './firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { DEFAULT_LOCATION } from './weatherService';

const STORAGE_KEYS = {
  CHILDREN: 'kids_ai_children_v2',
  WARDROBE: 'kids_ai_wardrobe_v2',
  LOOKBOOKS: 'kids_ai_lookbooks_v2',
  ACTIVE_CHILD: 'kids_ai_active_child_v2',
  PARENT_USER: 'kids_ai_parent_user_v2',
  LOCATION: 'kids_ai_location_v2',
};

// Legacy keys to clean up if present
const LEGACY_KEYS = [
  'kids_ai_children_v1',
  'kids_ai_wardrobe_v1',
  'kids_ai_lookbooks_v1',
  'kids_ai_active_child_v1',
  'kids_ai_parent_user_v1',
  'kids_ai_location_v1',
];

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
   * Wardrobe Items CRUD
   */
  getWardrobe(): WardrobeItem[] {
    const raw = getItem<WardrobeItem[]>(STORAGE_KEYS.WARDROBE, initialWardrobe);
    if (!Array.isArray(raw) || raw.length === 0) {
      this.saveWardrobe(initialWardrobe);
      return initialWardrobe;
    }

    // Auto-migrate legacy adult sample items or unsplash photos
    const legacyNames = [
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
    ];

    const hasLegacyAdultItems = raw.some(
      (item) =>
        Boolean(item.name && legacyNames.includes(item.name)) ||
        Boolean(item.imageUrl && item.imageUrl.includes('unsplash.com')) ||
        Boolean(item.id && item.id.startsWith('item-'))
    );

    if (hasLegacyAdultItems) {
      // Filter out user-created custom items (custom items have timestamp IDs like item-17...)
      const customItems = raw.filter(
        (item) =>
          !legacyNames.includes(item.name || '') &&
          !item.imageUrl?.includes('unsplash.com') &&
          !['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7', 'item-8', 'item-9', 'item-10'].includes(item.id || '')
      );
      const migrated = [...initialWardrobe, ...customItems];
      this.saveWardrobe(migrated);
      return migrated;
    }

    return raw;
  },

  saveWardrobe(items: WardrobeItem[]): void {
    setItem(STORAGE_KEYS.WARDROBE, items);
  },

  /**
   * Styling Lookbooks CRUD
   */
  getLookbooks(): StylingLookbook[] {
    const raw = getItem<StylingLookbook[]>(STORAGE_KEYS.LOOKBOOKS, initialLookbooks);
    if (!Array.isArray(raw)) {
      this.saveLookbooks(initialLookbooks);
      return initialLookbooks;
    }
    return raw;
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
   * Image File & Camera Snapshot Upload Helper
   */
  async uploadImage(dataUrlOrFile: string | File, folder: 'children' | 'wardrobe' = 'wardrobe'): Promise<string> {
    if (typeof dataUrlOrFile === 'string') {
      if (!isMockMode && storage) {
        try {
          const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
          const storageRef = ref(storage, fileName);
          await uploadString(storageRef, dataUrlOrFile, 'data_url');
          return await getDownloadURL(storageRef);
        } catch (err) {
          console.warn('Firebase upload failed, using dataUrl directly:', err);
          return dataUrlOrFile;
        }
      }
      return dataUrlOrFile;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        if (!isMockMode && storage) {
          try {
            const fileName = `${folder}/${Date.now()}_${dataUrlOrFile.name}`;
            const storageRef = ref(storage, fileName);
            await uploadString(storageRef, dataUrl, 'data_url');
            resolve(await getDownloadURL(storageRef));
          } catch (e) {
            resolve(dataUrl);
          }
        } else {
          resolve(dataUrl);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(dataUrlOrFile);
    });
  },
};
