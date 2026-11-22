# Kids AI Stylist — Product Requirements Document (PRD) & System Architecture Specification

> **Document Version:** 1.0.0  
> **Target Audience:** Developers, Product Managers, AI Engineers, and Google NotebookLM Knowledge Base  
> **Platform:** React 18, Vite, TypeScript, Tailwind CSS, Google Cloud / Firebase  

---

## 1. Executive Summary & Product Vision

**Kids AI Stylist** is a specialized, mobile-first Web Application and Progressive Web App (PWA) tailored for parents and guardians of children aged 3 to 11. It eliminates morning routine friction by recommending daily outfits that harmonize:
1. **Real-time Local Weather:** Hyperlocal temperature, humidity, rainfall, and wind speed.
2. **Body Proportion & Growth Dynamics:** 41:59 leg-to-torso proportions, silhouette classification (tall-lean, petite-active, sturdy, balanced), and growth allowance.
3. **Daily Occasion:** Daycare/Kindergarten, School, Weekend Play, Formal Gatherings, and Sports/Outdoors.
4. **Digital Wardrobe:** Real-time garment matching with automatic SVG flat-lay visual generation, manual swapping, and camera integration.
5. **Commercial Monetization:** Native boutique banner ads (Google AdSense ready) and localized affiliate shopping links (*"Shop Similar Look"*).

---

## 2. Target Demographic & Age Segmentation

The system focuses strictly on **children aged 3 to 11**:
- **Toddler / Kindergarten (Ages 3–6):** Focus on comfortable waistbands, stretchable cotton, soft peach/pastel palettes, and outerwear that protects against sudden temperature drops.
- **Elementary / Early Youth (Ages 7–11):** Focus on balanced proportions, trendy denim flared jeans, campus varsity jackets, and expressive graphic tees suitable for active school and weekend settings.

---

## 3. System Architecture & Tech Stack

```
+--------------------------------------------------------------------------+
|                        Client Layer (Vite + React 18)                    |
|  - Pretendard Variable Typography (Korean/CJK Optimized Font Stack)      |
|  - Progressive Web App (PWA): Standalone display, manifest.json, SVG icon|
|  - Mobile-First Layout: Safe Area Insets, Warm Palette (#FAF6F0/#E89E84) |
+------------------------------------+-------------------------------------+
                                     |
+------------------------------------+-------------------------------------+
|                     Core Service & Engine Modules                        |
|                                                                          |
|  1. StylingEngine (`stylingEngine.ts`)                                   |
|     - Multi-factor scoring (Weather 40%, Occasion 30%, Proportion 30%)  |
|     - Temperature threshold bands (Hot, Warm, Mild, Cool, Cold, Freezing)|
|                                                                          |
|  2. BodyProportionService (`bodyProportionService.ts`)                   |
|     - Leg-to-body ratio estimation (e.g., 59% ratio)                     |
|     - Silhouette categorization: tall-lean, petite-active, sturdy,       |
|       balanced                                                           |
|     - Localized advice generation for ko, en, ja, zh                     |
|                                                                          |
|  3. LocalizationEngine (`translations.ts`, `wardrobeLocalization.ts`,    |
|     `localeHelpers.ts`)                                                  |
|     - Dynamic quad-locale engine: ko (Korean), en (English), ja, zh      |
|     - Fallback hierarchy with zero raw keys exposed                      |
|                                                                          |
|  4. DigitalWardrobe & MockData (`mockData.ts`, `dataService.ts`)         |
|     - Kids-only SVG vector product flat-lays (resolution-independent)   |
|     - Indexed by category, season, occasion, palette, and child ownership|
+------------------------------------+-------------------------------------+
                                     |
+------------------------------------+-------------------------------------+
|                  Cloud & Deployment Infrastructure                       |
|  - Hosting: Google Cloud / Firebase Hosting (Vite SPA Rewrite)          |
|  - Source Control: GitHub Repository (Branch: `main`)                    |
|  - Storage & DB: Firebase Storage / Firestore (with Mock Offline Fallback)
|  - Monetization: Google AdSense + Affiliate E-Commerce Deep Links        |
+--------------------------------------------------------------------------+
```

---

## 4. Wardrobe Data Schema & Kids Garment Specifications

Each garment in the system follows the strict `WardrobeItem` interface:

```typescript
export type ClothingCategory = 'tops' | 'bottoms' | 'outerwear' | 'onepiece' | 'shoes' | 'accessories';
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
export type OccasionKey = 'kindergarten' | 'school' | 'weekend-play' | 'formal' | 'sports';

export interface WardrobeItem {
  id: string;
  childId: string;
  name: string;
  category: ClothingCategory;
  season: SeasonType;
  primaryColor: string;
  paletteGroup: string;
  imageUrl: string; // High-resolution SVG flat-lay data URL
  tags: string[];
  formalityScore: number; // 1 (ultra-casual) to 5 (formal)
  warmthRating: number;   // 1 (summer breathable) to 5 (heavy winter insulation)
  waterproof?: boolean;
}
```

### Authentic 3–11y Garment Catalog
- **Tops:** Soft Mint Graphic Tee, Lavender Striped Long Sleeve, Cream Knit Cable Sweater, Sunny Yellow Hoodie.
- **Bottoms:** Denim Flared Elastic Jeans, Beige Corduroy Pants, Cozy Jogger Fleece Pants.
- **Outerwear:** Soft Peach Trench Coat, Daisy Quilted Puffer Jacket, Teddy Fleece Zip Jacket.
- **Onepiece / Dresses:** Floral Prairie Cotton Dress.
- **Shoes:** Canvas Sneaker Lows, Warm Sherpa Slip-On Boots, Waterproof Rain Boots.
- **Accessories:** Sunflower Straw Bucket Hat, Pastel Beanie & Muffler Set, Embroidered School Cap.

All sample items use standalone SVG vectors embedded as clean `data:image/svg+xml;utf8,...` flat-lays, guaranteeing instant loading with zero broken images.

---

## 5. Body Proportion Algorithm & Virtual Fitting

### Leg-to-Torso Proportion Ratio
- Analyzes vertical body milestones: Crown, Chin, Shoulder, Hip, Knee, and Ankle.
- Golden ratio for active kids fashion targets a 56%–60% visual leg ratio.
- **Styling Compensation Rules:**
  - *Tall-Lean:* High-waist bottoms or cropped jackets to balance vertical elongation.
  - *Petite-Active:* Tonal matching (monochrome tops and bottoms) with vertical accents to create elongation.
  - *Sturdy / Athletic:* Relaxed dropped-shoulder cuts and stretch waistbands for maximum mobility.
  - *Balanced:* Versatile pairing suitable for multi-layering.

### Virtual Fitting Canvas
The Fitting Canvas displays:
- Scaled vector fashion avatar (`KidAvatarIllustration`) when no custom photo is present.
- Safe-guarded photo loader (`isValidCustomPhoto`) restricting rendering to custom uploads (`data:`, `blob:`, Firebase Storage) to prevent third-party stock photo fallback.
- Clean canvas view without cluttering overlay pins.

---

## 6. Quad-Locale Engine (ko, en, ja, zh)

Every user-visible string in the application is managed through a central localization architecture:
1. **Core UI strings:** `src/i18n/translations.ts` via `useTranslation()`.
2. **Wardrobe item metadata:** `src/utils/wardrobeLocalization.ts` (`getLocalizedItemName`, `getLocalizedCategoryName`, `getLocalizedColorName`, `getLocalizedSeasonName`).
3. **Child profiles & names:** `src/utils/localeHelpers.ts` (`getLocalizedChildName`: Chloe/Ha-eun -> 하은, Leo/Min-woo -> 민우; custom names preserved as-is).
4. **Body proportion badges & advice:** `src/services/bodyProportionService.ts` (`getLocalizedSilhouetteLabel`, `getLocalizedBodySummary`, `getLocalizedStylingNotes`).
5. **Weather & locations:** `src/utils/localeHelpers.ts` (`getLocalizedLocation`, `getLocalizedWeatherBadge`, `formatHighLowTemps`).

---

## 7. Commercial Monetization Strategy

1. **AdBanner Component (`src/components/AdBanner.tsx`):**
   - Configurable for Google AdSense via `VITE_ADSENSE_CLIENT_ID`.
   - Elegant fallback to a curated, warm boutique-themed native card (`#FAF6F0` background, `#E89E84` coral accents) linking to trending kids wear collections.
2. **Affiliate Shopping Deep Links (*"Shop Similar Look"* / *유사 아이템 쇼핑하기*):**
   - Mounted on each individual garment row and the overall recommended outfit card.
   - Generates safe outbound search queries (`rel="noopener noreferrer"`) for instant purchase of matching items.

---

## 8. Deployment & Cloud Architecture

### Google Cloud / Firebase Hosting
- **Configuration:** `firebase.json` with SPA catch-all rewrites (`"destination": "/index.html"`).
- **Public Folder:** `dist/` generated by Vite production build.
- **Firebase RC:** `.firebaserc` binds the deployment target to the configured Google Cloud / Firebase Project ID.

### GitHub Continuous Version Control
- Branch `main` serves as the single source of truth for production code.
- `.gitignore` strictly protects `.env`, `.env.local`, `dist/`, `node_modules/`, and debug logs.

---

## 9. Verification & Quality Gates

Every release must fulfill:
- `npx tsc --noEmit` -> **0 Errors**
- `npm run build` -> Clean bundle in `dist/` with minified CSS and JavaScript chunks.
- Visual inspection: Zero broken `<img>` tags across all device viewports.
- Typography: Global **Pretendard Variable** applied to all text, buttons, and inputs.
