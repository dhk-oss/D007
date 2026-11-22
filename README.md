# Kids AI Stylist 🌟

A modern, mobile-first responsive web application for AI-powered children's fashion styling, body proportion analysis, digital wardrobe management, weather-aware outfit generation, virtual try-on fitting, and full **9-Language Internationalization (i18n)**.

## Supported Languages (9 Languages)
- 🇰🇷 **한국어 (Korean)** (Default)
- 🇺🇸 **English (English)**
- 🇯🇵 **日本語 (Japanese)**
- 🇨🇳 **中文 (Chinese)**
- 🇪🇸 **Español (Spanish)**
- 🇷🇺 **Русский (Russian)**
- 🇲🇳 **Монгол (Mongolian)**
- 🇧🇷 **Português (Portuguese)**
- 🇫🇷 **Français (French)**

The language selector is located in the top navigation header and allows instant switching across all tabs with persistent `localStorage` memory.

---

## Tech Stack
- **Framework:** React 18 + Vite + TypeScript
- **Internationalization (i18n):** Native React Context with Type-Safe Dictionary & Fallback
- **Styling:** Tailwind CSS (Soft pastel aesthetic, rounded UI)
- **Icons:** Lucide React
- **Backend / Storage:** Firebase Web SDK (with built-in Mock / LocalStorage persistence fallback)
- **Routing:** React Router DOM

---

## Getting Started

### 1. Windows PowerShell Note (`PSSecurityException`)
On Windows systems where PowerShell script execution is restricted by default, attempting to invoke `npm` may trigger a `PSSecurityException` (`npm.ps1 cannot be loaded`).

To resolve this:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
npm run dev
# or invoke npm.cmd directly:
npm.cmd run dev
```

---

### 2. Installation & Running Dev Server

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev
# or on Windows PowerShell:
npm.cmd run dev
```

The Vite dev server will start at `http://localhost:5173`.

---

### 3. Key Features

- **9-Language i18n Selector (`src/i18n/translations.ts` & `src/context/LanguageContext.tsx`):**
  - Seamless localized experience across Korean, English, Japanese, Chinese, Spanish, Russian, Mongolian, Portuguese, and French.
  - Covers every screen: Stylist, Wardrobe, Child Profiles, AI Lookbook, Guided Camera, and Modals.
- **Location & AccuWeather Service (`src/services/weatherService.ts`):**
  - Regional location selector supporting `country`, `province`, and `city` (Seoul, Goyang, Seongnam, Busan, Tokyo, New York, etc.).
  - Real-time weather forecasting with AccuWeather attribution and fallback seasonal simulation.
- **Occasion & Weather Styling Engine (`src/services/stylingEngine.ts`):**
  - Supports 5 core child occasions (ages 3-11):
    1. Daycare & School (어린이집 또는 등교)
    2. Birthday Party (친구의 생일파티)
    3. Picnic & Outing (소풍 또는 학예회 등 외부행사)
    4. Visiting Relatives (친척집 방문)
    5. Ceremonial & Formal (친척 또는 부모 지인의 경조사)
- **Virtual Try-On & Manual Outfit Swap (`src/services/virtualTryOnService.ts`):**
  - HTML5 Canvas compositor renders the selected wardrobe items over the child's standing photo.
  - Manual override allows parents to tap "Swap ⇄" on any slot (Top, Bottom, Outerwear, Shoes, Accessories) to pick alternatives from the digital wardrobe.
- **Children Profiles & Guided Full-Body Camera (`src/pages/ProfilesPage.tsx`):**
  - Manages up to 5 children per parent account.
  - Interactive SVG human silhouette guide for standing full-body photo capture.
  - AI body proportion estimation (Torso vs. Leg ratio, silhouette classification).
- **Digital Wardrobe (`src/pages/WardrobePage.tsx`):**
  - Filter by category and season with smart rules (shoes & accessories are all-season).
- **Saved AI Lookbook Gallery (`src/pages/LookbookPage.tsx`):**
  - Save fittings with occasion badges, weather snapshots, and tailored AI styling rationales.
