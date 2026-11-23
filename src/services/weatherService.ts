import { LocationInfo, WeatherSnapshot } from '../types';

export interface LocationOption {
  country: string;
  province: string;
  city: string;
  label: string;
  latitude: number;
  longitude: number;
}

export const PRESET_LOCATIONS: LocationOption[] = [
  // South Korea - Seoul Districts
  { country: 'South Korea', province: 'Seoul', city: 'Gangnam-gu', label: 'Seoul (Gangnam)', latitude: 37.5172, longitude: 127.0473 },
  { country: 'South Korea', province: 'Seoul', city: 'Mapo-gu', label: 'Seoul (Mapo)', latitude: 37.5663, longitude: 126.9015 },
  { country: 'South Korea', province: 'Seoul', city: 'Songpa-gu', label: 'Seoul (Songpa)', latitude: 37.5145, longitude: 127.1066 },
  { country: 'South Korea', province: 'Seoul', city: 'Jongno-gu', label: 'Seoul (Jongno)', latitude: 37.5730, longitude: 126.9794 },
  { country: 'South Korea', province: 'Seoul', city: 'Yongsan-gu', label: 'Seoul (Yongsan)', latitude: 37.5326, longitude: 126.9900 },

  // South Korea - Gyeonggi & Major Metros
  { country: 'South Korea', province: 'Gyeonggi-do', city: 'Goyang-si', label: 'Goyang (Gyeonggi)', latitude: 37.6584, longitude: 126.8320 },
  { country: 'South Korea', province: 'Gyeonggi-do', city: 'Seongnam-si', label: 'Seongnam / Bundang', latitude: 37.4200, longitude: 127.1265 },
  { country: 'South Korea', province: 'Gyeonggi-do', city: 'Suwon-si', label: 'Suwon (Gyeonggi)', latitude: 37.2636, longitude: 127.0286 },
  { country: 'South Korea', province: 'Incheon', city: 'Yeonsu-gu', label: 'Incheon (Songdo)', latitude: 37.3828, longitude: 126.6573 },
  { country: 'South Korea', province: 'Busan', city: 'Haeundae-gu', label: 'Busan (Haeundae)', latitude: 35.1631, longitude: 129.1636 },
  { country: 'South Korea', province: 'Daegu', city: 'Suseong-gu', label: 'Daegu (Suseong)', latitude: 35.8580, longitude: 128.6306 },
  { country: 'South Korea', province: 'Daejeon', city: 'Yuseong-gu', label: 'Daejeon (Yuseong)', latitude: 36.3622, longitude: 127.3563 },
  { country: 'South Korea', province: 'Gwangju', city: 'Seo-gu', label: 'Gwangju', latitude: 35.1595, longitude: 126.8526 },
  { country: 'South Korea', province: 'Jeju-do', city: 'Jeju-si', label: 'Jeju Island', latitude: 33.4996, longitude: 126.5312 },

  // Global Presets
  { country: 'Japan', province: 'Tokyo', city: 'Shinjuku', label: 'Tokyo, Japan', latitude: 35.6895, longitude: 139.6917 },
  { country: 'Japan', province: 'Osaka', city: 'Kita-ku', label: 'Osaka, Japan', latitude: 34.6937, longitude: 135.5023 },
  { country: 'United States', province: 'California', city: 'Los Angeles', label: 'Los Angeles, USA', latitude: 34.0522, longitude: -118.2437 },
  { country: 'United States', province: 'New York', city: 'New York City', label: 'New York, USA', latitude: 40.7128, longitude: -74.0060 },
  { country: 'United Kingdom', province: 'England', city: 'London', label: 'London, UK', latitude: 51.5074, longitude: -0.1278 },
  { country: 'France', province: 'Île-de-France', city: 'Paris', label: 'Paris, France', latitude: 48.8566, longitude: 2.3522 },
];

export const DEFAULT_LOCATION: LocationInfo = {
  country: 'South Korea',
  province: 'Seoul',
  city: 'Gangnam-gu',
  displayName: 'Seoul (Gangnam), South Korea',
  latitude: 37.5172,
  longitude: 127.0473,
};

/**
 * Finds the closest preset location given GPS latitude/longitude
 */
export function findClosestPresetLocation(lat: number, lon: number): LocationOption {
  let closest = PRESET_LOCATIONS[0];
  let minDistance = Infinity;

  for (const loc of PRESET_LOCATIONS) {
    const dLat = loc.latitude - lat;
    const dLon = loc.longitude - lon;
    const dist = dLat * dLat + dLon * dLon;
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  return closest;
}

/**
 * Resolves latitude and longitude for a given LocationInfo
 */
export function getCoordinatesForLocation(loc: LocationInfo): { lat: number; lon: number } {
  if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
    return { lat: loc.latitude, lon: loc.longitude };
  }

  const cityLower = (loc.city || '').toLowerCase();
  const provLower = (loc.province || '').toLowerCase();

  const matched = PRESET_LOCATIONS.find(
    (p) =>
      p.city.toLowerCase() === cityLower ||
      cityLower.includes(p.city.toLowerCase()) ||
      p.label.toLowerCase().includes(cityLower)
  );
  if (matched) return { lat: matched.latitude, lon: matched.longitude };

  // Fallback defaults by region
  if (provLower.includes('seoul') || cityLower.includes('seoul')) return { lat: 37.5665, lon: 126.9780 };
  if (provLower.includes('busan') || cityLower.includes('busan')) return { lat: 35.1796, lon: 129.0756 };
  if (provLower.includes('gyeonggi')) return { lat: 37.4138, lon: 127.5183 };
  if (cityLower.includes('tokyo')) return { lat: 35.6895, lon: 139.6917 };
  if (cityLower.includes('osaka')) return { lat: 34.6937, lon: 135.5023 };
  if (cityLower.includes('new york')) return { lat: 40.7128, lon: -74.0060 };
  if (cityLower.includes('los angeles')) return { lat: 34.0522, lon: -118.2437 };
  if (cityLower.includes('london')) return { lat: 51.5074, lon: -0.1278 };
  if (cityLower.includes('paris')) return { lat: 48.8566, lon: 2.3522 };

  // Default Seoul City Center
  return { lat: 37.5665, lon: 126.9780 };
}

/**
 * Maps WMO weather interpretation code to standard condition, description
 */
export function parseWmoWeatherCode(code: number): { condition: string; description: string } {
  switch (code) {
    case 0:
      return { condition: 'Sunny', description: 'Clear sunny sky with bright daylight' };
    case 1:
      return { condition: 'Mainly Sunny', description: 'Mostly sunny with light passing clouds' };
    case 2:
      return { condition: 'Partly Cloudy', description: 'Partly cloudy with pleasant mild breeze' };
    case 3:
      return { condition: 'Overcast', description: 'Overcast sky with cool shade' };
    case 45:
    case 48:
      return { condition: 'Foggy', description: 'Foggy conditions, dress with visibility & warmth in mind' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Drizzle', description: 'Light passing drizzle, waterproof outer layer recommended' };
    case 56:
    case 57:
      return { condition: 'Freezing Drizzle', description: 'Chilly freezing drizzle, warm insulated boots needed' };
    case 61:
    case 63:
    case 65:
      return { condition: 'Rainy', description: 'Rain showers, ensure rain boots and waterproof outerwear' };
    case 66:
    case 67:
      return { condition: 'Freezing Rain', description: 'Icy freezing rain, thermal insulation and non-slip boots' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { condition: 'Snowy', description: 'Snowfall, warm padded puffer jacket and beanie essential' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', description: 'Sudden rain showers, hooded outerwear recommended' };
    case 85:
    case 86:
      return { condition: 'Snow Showers', description: 'Cold snow showers, winter boots and gloves needed' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', description: 'Thunderstorm warning, prioritize indoor activities' };
    default:
      return { condition: 'Partly Cloudy', description: 'Mild weather with variable clouds' };
  }
}

/**
 * Fetches real-time weather using Open-Meteo API (keyless, high-precision)
 */
async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const data = await res.json();

    const current = data.current;
    const daily = data.daily;
    const temp = Math.round(current.temperature_2m);
    const humidity = Math.round(current.relative_humidity_2m);
    const wmoInfo = parseWmoWeatherCode(current.weather_code);

    const highTemp =
      daily?.temperature_2m_max && daily.temperature_2m_max.length > 0
        ? Math.round(daily.temperature_2m_max[0])
        : temp + 3;

    const lowTemp =
      daily?.temperature_2m_min && daily.temperature_2m_min.length > 0
        ? Math.round(daily.temperature_2m_min[0])
        : temp - 4;

    const now = new Date();
    const updatedAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      temp,
      condition: wmoInfo.condition,
      highTemp,
      lowTemp,
      description: wmoInfo.description,
      humidity,
      source: 'Open-Meteo Live',
      attributionLink: 'https://open-meteo.com/',
      updatedAt,
      isLive: true,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Deterministic seasonal weather generator for realistic fallback when offline
 */
function getDeterministicSeasonalWeather(location: LocationInfo): WeatherSnapshot {
  const now = new Date();
  const month = now.getMonth(); // 0 to 11

  // Base seasonal temperatures for Korea/Mid-latitudes
  let baseTemp = 18;
  let condition = 'Partly Cloudy';
  let description = 'Mild with pleasant breeze';
  let highTemp = 21;
  let lowTemp = 13;
  let humidity = 55;

  if (month === 11 || month === 0 || month === 1) {
    // Winter (Dec - Feb)
    baseTemp = 2;
    highTemp = 6;
    lowTemp = -3;
    condition = 'Cold & Clear';
    description = 'Crisp winter chill with chilly wind';
    humidity = 40;
  } else if (month >= 2 && month <= 4) {
    // Spring (Mar - May)
    baseTemp = 16;
    highTemp = 20;
    lowTemp = 10;
    condition = 'Sunny';
    description = 'Warm sunshine with mild afternoon breeze';
    humidity = 50;
  } else if (month >= 5 && month <= 7) {
    // Summer (Jun - Aug)
    baseTemp = 27;
    highTemp = 30;
    lowTemp = 23;
    condition = 'Sunny & Warm';
    description = 'High UV and warm summer temperature';
    humidity = 70;
  } else {
    // Autumn (Sep - Nov)
    baseTemp = 13;
    highTemp = 16;
    lowTemp = 6;
    condition = 'Clear & Pleasant';
    description = 'Gentle autumn breeze and clear sky';
    humidity = 55;
  }

  const cityCode = (location.city || '').charCodeAt(0) || 70;
  const tempOffset = (cityCode % 5) - 2;
  const finalTemp = baseTemp + tempOffset;

  return {
    temp: finalTemp,
    condition,
    highTemp: highTemp + tempOffset,
    lowTemp: lowTemp + tempOffset,
    description,
    humidity,
    source: 'AccuWeather (Simulated Seasonal)',
    attributionLink: 'https://www.accuweather.com/',
    updatedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isLive: false,
  };
}

/**
 * Fetches real-time weather for the selected location.
 * Priority:
 * 1. AccuWeather if valid VITE_ACCUWEATHER_API_KEY is configured
 * 2. Keyless Open-Meteo Live API for high-precision real-time temperature, high/low, humidity, and WMO condition
 * 3. Deterministic seasonal simulation fallback when network is completely offline
 */
export async function fetchWeatherForLocation(location: LocationInfo): Promise<WeatherSnapshot> {
  const apiKey = import.meta.env.VITE_ACCUWEATHER_API_KEY;

  // 1. AccuWeather if key is explicitly configured
  if (apiKey && apiKey !== 'your_accuweather_api_key_here') {
    try {
      const query = encodeURIComponent(`${location.city}, ${location.country}`);
      const locRes = await fetch(
        `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${query}`
      );
      if (locRes.ok) {
        const locData = await locRes.json();
        if (locData && locData.length > 0) {
          const locationKey = locData[0].Key;
          const condRes = await fetch(
            `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&details=true`
          );
          if (condRes.ok) {
            const condData = await condRes.json();
            if (condData && condData.length > 0) {
              const current = condData[0];
              const tempC = Math.round(current.Temperature?.Metric?.Value ?? 18);
              const conditionText = current.WeatherText || 'Sunny';
              const humidity = current.RelativeHumidity || 50;

              return {
                temp: tempC,
                condition: conditionText,
                highTemp: tempC + 3,
                lowTemp: tempC - 4,
                description: current.HasPrecipitation ? 'Precipitation expected' : 'Favorable outdoor weather',
                humidity,
                source: 'AccuWeather Live',
                attributionLink: current.Link || 'https://www.accuweather.com/',
                updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isLive: true,
              };
            }
          }
        }
      }
    } catch (err) {
      console.warn('AccuWeather API failed, switching to Open-Meteo:', err);
    }
  }

  // 2. Open-Meteo Keyless Real-Time API (Primary live source)
  try {
    const coords = getCoordinatesForLocation(location);
    const liveWeather = await fetchOpenMeteoWeather(coords.lat, coords.lon);
    return liveWeather;
  } catch (err) {
    console.warn('Open-Meteo fetch failed, falling back to seasonal model:', err);
  }

  // 3. Seasonal Fallback
  return getDeterministicSeasonalWeather(location);
}
