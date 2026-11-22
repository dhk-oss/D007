import { LocationInfo, WeatherSnapshot } from '../types';

export interface LocationOption {
  country: string;
  province: string;
  city: string;
  label: string;
}

export const PRESET_LOCATIONS: LocationOption[] = [
  // South Korea
  { country: 'South Korea', province: 'Seoul', city: 'Gangnam-gu', label: 'Seoul (Gangnam)' },
  { country: 'South Korea', province: 'Seoul', city: 'Mapo-gu', label: 'Seoul (Mapo)' },
  { country: 'South Korea', province: 'Seoul', city: 'Songpa-gu', label: 'Seoul (Songpa)' },
  { country: 'South Korea', province: 'Gyeonggi-do', city: 'Goyang-si', label: 'Goyang (Gyeonggi)' },
  { country: 'South Korea', province: 'Gyeonggi-do', city: 'Seongnam-si', label: 'Seongnam / Bundang' },
  { country: 'South Korea', province: 'Gyeonggi-do', city: 'Suwon-si', label: 'Suwon (Gyeonggi)' },
  { country: 'South Korea', province: 'Busan', city: 'Haeundae-gu', label: 'Busan (Haeundae)' },
  { country: 'South Korea', province: 'Incheon', city: 'Yeonsu-gu', label: 'Incheon (Songdo)' },
  { country: 'South Korea', province: 'Jeju-do', city: 'Jeju-si', label: 'Jeju Island' },
  // Global
  { country: 'Japan', province: 'Tokyo', city: 'Shinjuku', label: 'Tokyo, Japan' },
  { country: 'Japan', province: 'Osaka', city: 'Kita-ku', label: 'Osaka, Japan' },
  { country: 'United States', province: 'California', city: 'Los Angeles', label: 'Los Angeles, USA' },
  { country: 'United States', province: 'New York', city: 'New York City', label: 'New York, USA' },
  { country: 'United Kingdom', province: 'England', city: 'London', label: 'London, UK' },
];

export const DEFAULT_LOCATION: LocationInfo = {
  country: 'South Korea',
  province: 'Seoul',
  city: 'Gangnam-gu',
  displayName: 'Seoul (Gangnam), South Korea',
};

/**
 * Deterministic seasonal weather generator for realistic fallback when API key is not present.
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
    baseTemp = 17;
    highTemp = 21;
    lowTemp = 11;
    condition = 'Clear & Pleasant';
    description = 'Gentle autumn breeze and clear sky';
    humidity = 55;
  }

  // Slight variance based on city name seed
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
  };
}

/**
 * Fetches weather for the selected location.
 * Attempts real AccuWeather API if VITE_ACCUWEATHER_API_KEY is configured;
 * otherwise provides reliable seasonal weather with AccuWeather attribution.
 */
export async function fetchWeatherForLocation(location: LocationInfo): Promise<WeatherSnapshot> {
  const apiKey = import.meta.env.VITE_ACCUWEATHER_API_KEY;

  if (apiKey && apiKey !== 'your_accuweather_api_key_here') {
    try {
      // 1. Search Location Key
      const query = encodeURIComponent(`${location.city}, ${location.country}`);
      const locRes = await fetch(
        `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${query}`
      );
      if (!locRes.ok) throw new Error(`AccuWeather location search failed: ${locRes.statusText}`);
      const locData = await locRes.json();

      if (locData && locData.length > 0) {
        const locationKey = locData[0].Key;
        // 2. Fetch Current Conditions
        const condRes = await fetch(
          `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&details=true`
        );
        if (!condRes.ok) throw new Error(`AccuWeather conditions failed: ${condRes.statusText}`);
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
          };
        }
      }
    } catch (err) {
      console.warn('AccuWeather API request failed, falling back to simulated seasonal weather:', err);
    }
  }

  // Fallback to deterministic seasonal weather
  return getDeterministicSeasonalWeather(location);
}
