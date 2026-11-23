export const MAX_CHILDREN = 5;

export type GenderType = 'male' | 'female';

export type ClothingCategory = 
  | 'tops' 
  | 'bottoms' 
  | 'outerwear' 
  | 'onepiece' 
  | 'shoes' 
  | 'accessories';

export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

export type SilhouetteType = 'balanced' | 'petite-active' | 'tall-lean' | 'sturdy';

export interface LocationInfo {
  country: string;
  province: string;
  city: string;
  displayName?: string;
  latitude?: number;
  longitude?: number;
}

export interface ParentUser {
  uid: string;
  email: string;
  displayName: string;
  location: LocationInfo;
}

export interface BodyProportionAnalysis {
  torsoRatio: number; // e.g. 0.44
  legRatio: number;   // e.g. 0.56
  upperToLowerRatio: string; // e.g. "44:56"
  silhouetteType: SilhouetteType;
  bodyTypeSummary: string;
  stylingNotes: string[];
  analyzedAt: string; // ISO timestamp string
}

export interface ChildProfile {
  id: string;
  parentId: string;
  name: string;
  gender: GenderType;
  age: number; // 3 to 11
  heightCm: number;
  weightKg: number;
  waistCm: number;
  fullBodyPhotoUrl: string;
  bodyProportionAnalysis: BodyProportionAnalysis;
}

export interface WardrobeItem {
  id: string;
  childId: string;
  imageUrl: string;
  category: ClothingCategory;
  name?: string;
  seasons?: SeasonType[];
  color?: string;
  createdAt: string | number;
}

export interface WeatherSnapshot {
  temp: number;
  condition: string; // e.g., 'Sunny', 'Rainy', 'Cloudy', 'Snowy', 'Cold/Windy'
  highTemp?: number;
  lowTemp?: number;
  description?: string;
  humidity?: number;
  source?: string; // 'Open-Meteo Live' | 'AccuWeather' | 'AccuWeather (Simulated Seasonal)'
  attributionLink?: string; // 'https://open-meteo.com/' | 'https://www.accuweather.com/'
  updatedAt?: string;
  isLive?: boolean;
}

export type OccasionKey = 
  | 'daycare_school'
  | 'birthday_party'
  | 'outing_event'
  | 'visiting_relatives'
  | 'ceremonial';

export type OccasionType = OccasionKey | string;

export interface OccasionInfo {
  key: OccasionKey;
  label: string;
  koreanLabel: string;
  emoji: string;
  description: string;
  formality: 'casual' | 'smart_casual' | 'formal';
  activityLevel: 'high' | 'moderate' | 'calm';
}

export interface StylingLookbook {
  id: string;
  childId: string;
  occasion: string;
  weatherSnapshot: WeatherSnapshot | string;
  selectedItemIds: string[];
  generatedImageUrl: string;
  createdAt: string | number;
  aiAdvice?: string;
}
