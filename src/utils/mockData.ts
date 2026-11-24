import { ChildProfile, WardrobeItem, StylingLookbook, WeatherSnapshot, ParentUser } from '../types';

/**
 * Creates high-resolution, kid-proportioned garment product flat-lay SVGs
 * formatted as clean data:image/svg+xml;utf8,... URLs.
 * Never breaks, loads instantaneously offline & online, and looks adorable for 3-11 yr olds.
 */
export function createKidsGarmentSvg(
  type: 'cardigan' | 'tee' | 'overalls' | 'joggers' | 'windbreaker' | 'vest' | 'sundress' | 'sneakers' | 'buckethat',
  primaryColor: string,
  accentColor: string,
  label: string
): string {
  let illustrationSvg = '';

  switch (type) {
    case 'cardigan':
      // Pastel Bear Knit Cardigan
      illustrationSvg = `
        <g transform="translate(40, 35)">
          <!-- Bear ears on hood / collar -->
          <circle cx="85" cy="40" r="12" fill="${accentColor}" />
          <circle cx="85" cy="40" r="7" fill="#FFF2E8" />
          <circle cx="155" cy="40" r="12" fill="${accentColor}" />
          <circle cx="155" cy="40" r="7" fill="#FFF2E8" />
          <!-- Main Cardigan Body -->
          <path d="M60 55 L30 115 C26 122 36 127 41 122 L65 85 L65 190 C65 198 175 198 175 190 L175 85 L199 122 C204 127 214 122 210 115 L180 55 C165 48 75 48 60 55 Z" fill="${primaryColor}" stroke="#D1BFA7" stroke-width="2.5" stroke-linejoin="round" />
          <!-- Placket & Wooden Buttons -->
          <line x1="120" y1="52" x2="120" y2="190" stroke="#C4B097" stroke-width="3" />
          <circle cx="120" cy="75" r="4.5" fill="#8E6E53" />
          <circle cx="120" cy="110" r="4.5" fill="#8E6E53" />
          <circle cx="120" cy="145" r="4.5" fill="#8E6E53" />
          <circle cx="120" cy="180" r="4.5" fill="#8E6E53" />
          <!-- Little Bear Pocket -->
          <rect x="76" y="135" width="28" height="26" rx="6" fill="#F8F3EC" stroke="#C4B097" stroke-width="1.5" />
          <circle cx="90" cy="146" r="2" fill="#5A4738" />
          <circle cx="86" cy="143" r="1" fill="#5A4738" />
          <circle cx="94" cy="143" r="1" fill="#5A4738" />
        </g>
      `;
      break;

    case 'tee':
      // Rainbow Stripe Kids Cotton Tee
      illustrationSvg = `
        <g transform="translate(40, 38)">
          <!-- Tee Shape -->
          <path d="M70 45 L32 85 C27 91 36 98 42 93 L62 75 L62 195 C62 202 178 202 178 195 L178 75 L198 93 C204 98 213 91 208 85 L170 45 C150 54 90 54 70 45 Z" fill="${primaryColor}" stroke="#B8D5E5" stroke-width="2.5" stroke-linejoin="round" />
          <!-- Soft Rib Collar -->
          <path d="M85 43 C95 56 145 56 155 43" fill="none" stroke="#68A5CA" stroke-width="4.5" stroke-linecap="round" />
          <!-- Cheerful Rainbow Stripes -->
          <path d="M63 95 L177 95" stroke="#FFAAA6" stroke-width="7" stroke-linecap="round" />
          <path d="M63 115 L177 115" stroke="#FFD3B6" stroke-width="7" stroke-linecap="round" />
          <path d="M63 135 L177 135" stroke="#DCEDC1" stroke-width="7" stroke-linecap="round" />
          <path d="M63 155 L177 155" stroke="#A8E6CF" stroke-width="7" stroke-linecap="round" />
          <!-- Smiley Pocket -->
          <rect x="76" y="70" width="22" height="20" rx="4" fill="#FFFFFF" opacity="0.9" />
          <path d="M82 81 Q87 86 92 81" fill="none" stroke="#FF8B94" stroke-width="1.8" stroke-linecap="round" />
        </g>
      `;
      break;

    case 'overalls':
      // Soft Corduroy Kids Overalls
      illustrationSvg = `
        <g transform="translate(40, 32)">
          <!-- Suspenders -->
          <rect x="80" y="25" width="14" height="60" rx="4" fill="${primaryColor}" stroke="#2B4263" stroke-width="2" />
          <rect x="146" y="25" width="14" height="60" rx="4" fill="${primaryColor}" stroke="#2B4263" stroke-width="2" />
          <!-- Metal Buckles -->
          <rect x="78" y="75" width="18" height="12" rx="3" fill="#E2BA65" />
          <rect x="144" y="75" width="18" height="12" rx="3" fill="#E2BA65" />
          <!-- Bib & Pants Body -->
          <path d="M68 85 L172 85 L172 135 L190 220 C190 226 155 226 150 220 L125 155 L100 220 C95 226 60 226 60 220 L78 135 Z" fill="${primaryColor}" stroke="#2B4263" stroke-width="2.5" stroke-linejoin="round" />
          <!-- Center Chest Pocket -->
          <rect x="98" y="95" width="44" height="34" rx="6" fill="#4B6A96" stroke="#2B4263" stroke-width="1.5" />
          <!-- Cute patch inside pocket -->
          <circle cx="120" cy="112" r="7" fill="#E2BA65" />
          <polygon points="120,107 122,111 126,112 123,115 124,119 120,117 116,119 117,115 114,112 118,111" fill="#FFFFFF" />
          <!-- Folded Cuff Details -->
          <rect x="58" y="208" width="34" height="10" rx="3" fill="#3D5A80" />
          <rect x="148" y="208" width="34" height="10" rx="3" fill="#3D5A80" />
        </g>
      `;
      break;

    case 'joggers':
      // Comfy Kids Cotton Jogger Pants
      illustrationSvg = `
        <g transform="translate(40, 35)">
          <!-- Elastic Rib Waistband -->
          <rect x="70" y="38" width="100" height="20" rx="7" fill="#5F6D54" stroke="#46523D" stroke-width="2" />
          <!-- Yellow Drawstring -->
          <path d="M116 48 L114 68 M124 48 L126 68" stroke="#F4D06F" stroke-width="2.5" stroke-linecap="round" />
          <!-- Relaxed Pants Legs -->
          <path d="M72 56 L62 205 C62 212 96 212 98 205 L120 120 L142 205 C144 212 178 212 178 205 L168 56 Z" fill="${primaryColor}" stroke="#46523D" stroke-width="2.5" stroke-linejoin="round" />
          <!-- Reinforced Knee Patches (Kids style) -->
          <ellipse cx="86" cy="138" rx="13" ry="16" fill="#6A7A5E" opacity="0.8" />
          <ellipse cx="154" cy="138" rx="13" ry="16" fill="#6A7A5E" opacity="0.8" />
          <!-- Stretch Ankle Cuffs -->
          <rect x="63" y="198" width="34" height="12" rx="4" fill="#5F6D54" stroke="#46523D" stroke-width="1.5" />
          <rect x="143" y="198" width="34" height="12" rx="4" fill="#5F6D54" stroke="#46523D" stroke-width="1.5" />
        </g>
      `;
      break;

    case 'windbreaker':
      // Kids Hooded Windbreaker Jacket
      illustrationSvg = `
        <g transform="translate(40, 32)">
          <!-- Hood -->
          <path d="M85 45 C80 15 160 15 155 45 Z" fill="${accentColor}" stroke="#D97A62" stroke-width="2" />
          <!-- Jacket Body & Sleeves -->
          <path d="M62 52 L26 112 C21 119 32 125 38 118 L60 88 L60 192 C60 198 180 198 180 192 L180 88 L202 118 C208 125 219 119 214 112 L178 52 Z" fill="${primaryColor}" stroke="#D97A62" stroke-width="2.5" stroke-linejoin="round" />
          <!-- Colorblock Chest Section -->
          <path d="M60 52 L180 52 L180 102 L60 102 Z" fill="${accentColor}" opacity="0.85" />
          <!-- Center Bright Zipper -->
          <line x1="120" y1="50" x2="120" y2="192" stroke="#FFFFFF" stroke-width="3.5" />
          <circle cx="120" cy="58" r="4" fill="#FFFFFF" />
          <!-- Elastic Bottom Hem -->
          <rect x="59" y="184" width="122" height="12" rx="4" fill="#E8826A" opacity="0.6" />
        </g>
      `;
      break;

    case 'vest':
      // Cozy Teddy Fleece Kids Vest
      illustrationSvg = `
        <g transform="translate(40, 35)">
          <!-- Fluffy Fleece Vest Body -->
          <path d="M72 45 L50 85 C46 92 56 95 62 90 L75 75 L75 190 C75 198 165 198 165 190 L165 75 L178 90 C184 95 194 92 190 85 L168 45 C150 52 90 52 72 45 Z" fill="${primaryColor}" stroke="#C7B299" stroke-width="3" stroke-linejoin="round" />
          <!-- Contrast Nylon Zipper Placket & Pocket -->
          <line x1="120" y1="48" x2="120" y2="190" stroke="#8D6E53" stroke-width="3.5" />
          <rect x="130" y="80" width="28" height="26" rx="5" fill="#8D6E53" />
          <line x1="130" y1="88" x2="158" y2="88" stroke="#E6D3C1" stroke-width="2" />
          <!-- Cozy Teddy Fur Dots Texture -->
          <circle cx="95" cy="115" r="3" fill="#D8C5AE" />
          <circle cx="108" cy="140" r="3.5" fill="#D8C5AE" />
          <circle cx="92" cy="160" r="3" fill="#D8C5AE" />
          <circle cx="145" cy="135" r="3" fill="#D8C5AE" />
          <circle cx="138" cy="165" r="3.5" fill="#D8C5AE" />
        </g>
      `;
      break;

    case 'sundress':
      // Daisy Smocked Kids Sundress
      illustrationSvg = `
        <g transform="translate(40, 30)">
          <!-- Shoulder Ribbon Straps -->
          <rect x="85" y="25" width="8" height="42" rx="3" fill="${accentColor}" />
          <rect x="147" y="25" width="8" height="42" rx="3" fill="${accentColor}" />
          <circle cx="89" cy="28" r="4.5" fill="#FFAAA6" />
          <circle cx="151" cy="28" r="4.5" fill="#FFAAA6" />
          <!-- Smocked Elastic Bodice -->
          <rect x="75" y="65" width="90" height="42" rx="6" fill="${primaryColor}" stroke="#E6B800" stroke-width="2" />
          <line x1="77" y1="75" x2="163" y2="75" stroke="#E6B800" stroke-width="1.5" stroke-dasharray="3 2" />
          <line x1="77" y1="86" x2="163" y2="86" stroke="#E6B800" stroke-width="1.5" stroke-dasharray="3 2" />
          <line x1="77" y1="97" x2="163" y2="97" stroke="#E6B800" stroke-width="1.5" stroke-dasharray="3 2" />
          <!-- Flared A-Line Skirt -->
          <path d="M75 107 L45 220 C45 228 195 228 195 220 L165 107 Z" fill="${primaryColor}" stroke="#E6B800" stroke-width="2.5" stroke-linejoin="round" />
          <!-- Little Daisy Flowers -->
          <circle cx="85" cy="150" r="4" fill="#FFAAA6" />
          <circle cx="120" cy="175" r="4" fill="#FFAAA6" />
          <circle cx="155" cy="145" r="4" fill="#FFAAA6" />
          <circle cx="95" cy="195" r="4" fill="#FFAAA6" />
          <circle cx="145" cy="195" r="4" fill="#FFAAA6" />
          <!-- Ruffled Hem -->
          <path d="M45 220 Q60 226 75 220 Q90 226 105 220 Q120 226 135 220 Q150 226 165 220 Q180 226 195 220" fill="none" stroke="#E6B800" stroke-width="2.5" />
        </g>
      `;
      break;

    case 'sneakers':
      // Kids Velcro Cloud Sneakers
      illustrationSvg = `
        <g transform="translate(35, 45)">
          <!-- Left Sneaker -->
          <g transform="translate(10, 20)">
            <path d="M10 65 Q20 30 55 25 L85 45 L95 65 L95 78 L5 78 L5 70 Z" fill="${primaryColor}" stroke="#CBD5E1" stroke-width="2" />
            <!-- Double Velcro Straps -->
            <rect x="35" y="32" width="38" height="9" rx="3" fill="#FF8B94" />
            <rect x="42" y="45" width="38" height="9" rx="3" fill="#FF8B94" />
            <!-- Cloud Cushion Sole -->
            <path d="M3 76 Q25 72 50 76 Q75 72 100 76 L98 88 Q50 92 3 88 Z" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2" />
          </g>
          <!-- Right Sneaker (Layered slightly offset) -->
          <g transform="translate(95, 35)">
            <path d="M10 65 Q20 30 55 25 L85 45 L95 65 L95 78 L5 78 L5 70 Z" fill="${primaryColor}" stroke="#CBD5E1" stroke-width="2" />
            <rect x="35" y="32" width="38" height="9" rx="3" fill="#68A5CA" />
            <rect x="42" y="45" width="38" height="9" rx="3" fill="#68A5CA" />
            <path d="M3 76 Q25 72 50 76 Q75 72 100 76 L98 88 Q50 92 3 88 Z" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2" />
          </g>
        </g>
      `;
      break;

    case 'buckethat':
      // Kids Sun-Shield Cotton Bucket Hat
      illustrationSvg = `
        <g transform="translate(40, 42)">
          <!-- Dome Crown -->
          <path d="M60 85 Q75 25 120 25 Q165 25 180 85 Z" fill="${primaryColor}" stroke="#B8A082" stroke-width="2.5" />
          <!-- Hat Ribbon Band -->
          <path d="M57 85 Q120 95 183 85 L184 95 Q120 105 56 95 Z" fill="${accentColor}" />
          <!-- Flared Sun Brim -->
          <path d="M57 95 Q20 128 40 145 Q120 162 200 145 Q220 128 183 95 Z" fill="${primaryColor}" stroke="#B8A082" stroke-width="2.5" />
          <!-- Chin Tie String -->
          <path d="M90 148 Q105 185 120 195 Q135 185 150 148" fill="none" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="120" cy="195" r="4.5" fill="#FFAAA6" />
        </g>
      `;
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="320" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FCFAF7" />
        <stop offset="100%" stop-color="#F3ECE2" />
      </linearGradient>
      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#5A4738" flood-opacity="0.08" />
      </filter>
    </defs>
    <!-- Background Card -->
    <rect width="320" height="320" rx="32" fill="url(#bgGrad)" />
    <!-- Subtle Floor / Surface Pedestal -->
    <ellipse cx="160" cy="265" rx="100" ry="20" fill="#E8DFD3" opacity="0.75" />
    <!-- Garment Flat-lay Art -->
    <g filter="url(#cardShadow)">
      ${illustrationSvg}
    </g>
    <!-- Boutique Badge / Tag -->
    <g transform="translate(16, 16)">
      <rect width="84" height="24" rx="12" fill="#FFFFFF" opacity="0.92" />
      <text x="42" y="16" fill="#8C7A68" font-size="10" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="bold" text-anchor="middle">
        ${label}
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const mockParentUser: ParentUser = {
  uid: 'parent-1',
  email: 'parent@kidsaistylist.com',
  displayName: 'Sarah Kim',
  location: {
    country: 'South Korea',
    province: 'Seoul',
    city: 'Gangnam-gu',
  },
};

export const initialChildren: ChildProfile[] = [
  {
    id: 'child-1',
    parentId: 'parent-1',
    name: 'Ha-eun (Chloe)',
    gender: 'female',
    age: 6,
    heightCm: 115,
    weightKg: 20.5,
    waistCm: 53,
    fullBodyPhotoUrl: '',
    bodyProportionAnalysis: {
      torsoRatio: 0.41,
      legRatio: 0.59,
      upperToLowerRatio: '41:59',
      silhouetteType: 'tall-lean',
      bodyTypeSummary: 'Long-limbed slender profile with elongated lower body proportions.',
      stylingNotes: [
        'High-waisted A-line skirts and flare cuts accentuate natural leg line.',
        'Slightly cropped knit cardigans balance torso length.',
        'Vertical stripe accents and tuck-in shirts complement proportional height.'
      ],
      analyzedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    }
  },
  {
    id: 'child-2',
    parentId: 'parent-1',
    name: 'Min-woo (Leo)',
    gender: 'male',
    age: 8,
    heightCm: 128,
    weightKg: 26.5,
    waistCm: 57,
    fullBodyPhotoUrl: '',
    bodyProportionAnalysis: {
      torsoRatio: 0.43,
      legRatio: 0.57,
      upperToLowerRatio: '43:57',
      silhouetteType: 'petite-active',
      bodyTypeSummary: 'Active, healthy junior build with agile limb mobility.',
      stylingNotes: [
        'Elastic joggers and flexible hems ensure full freedom for energetic play.',
        'Drop-shoulder tops and raglan tees provide comfortable shoulder room.',
        'Two-piece sets create balanced, adorable everyday silhouettes.'
      ],
      analyzedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    }
  }
];

export const initialWardrobe: WardrobeItem[] = [];

export const initialLookbooks: StylingLookbook[] = [];

export const mockCurrentWeather: WeatherSnapshot = {
  temp: 18,
  condition: 'Partly Sunny',
  highTemp: 21,
  lowTemp: 12,
  description: 'Pleasant with light afternoon breeze'
};
