import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChildProfile, WardrobeItem, StylingLookbook, WeatherSnapshot, LocationInfo } from '../types';
import { DataService } from '../services/dataService';
import { fetchWeatherForLocation, findClosestPresetLocation } from '../services/weatherService';

interface AppContextType {
  childrenList: ChildProfile[];
  activeChildId: string;
  activeChild: ChildProfile;
  setActiveChildId: (id: string) => void;
  wardrobe: WardrobeItem[];
  lookbooks: StylingLookbook[];
  currentLocation: LocationInfo;
  setCurrentLocation: (loc: LocationInfo) => void;
  currentWeather: WeatherSnapshot;
  isWeatherLoading: boolean;
  refreshWeather: (targetLocation?: LocationInfo) => Promise<void>;
  detectCurrentLocation: () => Promise<void>;
  addChildProfile: (profile: Omit<ChildProfile, 'id'>) => boolean;
  updateChildProfile: (profile: ChildProfile) => void;
  deleteChildProfile: (id: string) => void;
  addWardrobeItem: (item: Omit<WardrobeItem, 'id' | 'createdAt'>) => void;
  deleteWardrobeItem: (id: string) => void;
  saveLookbook: (lookbook: Omit<StylingLookbook, 'id' | 'createdAt'>) => void;
  deleteLookbook: (id: string) => void;
  activeTab: 'home' | 'wardrobe' | 'profiles' | 'lookbook';
  setActiveTab: (tab: 'home' | 'wardrobe' | 'profiles' | 'lookbook') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childrenList, setChildrenList] = useState<ChildProfile[]>(() => DataService.getChildren());
  const [activeChildId, setActiveChildIdState] = useState<string>(() => DataService.getActiveChildId());
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(() => DataService.getWardrobe());
  const [lookbooks, setLookbooks] = useState<StylingLookbook[]>(() => DataService.getLookbooks());
  const [currentLocation, setCurrentLocationState] = useState<LocationInfo>(() => DataService.getLocation());
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherSnapshot>({
    temp: 12,
    condition: 'Partly Cloudy',
    highTemp: 15,
    lowTemp: 5,
    description: 'Refreshing real-time weather update',
    humidity: 60,
    source: 'Open-Meteo Live',
    attributionLink: 'https://open-meteo.com/',
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isLive: true,
  });
  const [activeTab, setActiveTab] = useState<'home' | 'wardrobe' | 'profiles' | 'lookbook'>('home');

  // Auto-migrate legacy adult items on mount
  useEffect(() => {
    const currentWardrobe = DataService.getWardrobe();
    setWardrobe(currentWardrobe);
  }, []);

  const refreshWeather = async (targetLocation?: LocationInfo) => {
    const loc = targetLocation || currentLocation;
    setIsWeatherLoading(true);
    try {
      const w = await fetchWeatherForLocation(loc);
      setCurrentWeather(w);
    } catch (e) {
      console.warn('Weather fetch error:', e);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const detectCurrentLocation = async () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsWeatherLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const closest = findClosestPresetLocation(lat, lon);
          const detectedLoc: LocationInfo = {
            country: closest.country,
            province: closest.province,
            city: closest.city,
            displayName: closest.label,
            latitude: lat,
            longitude: lon,
          };
          setCurrentLocationState(detectedLoc);
          DataService.saveLocation(detectedLoc);
          await refreshWeather(detectedLoc);
        },
        async (err) => {
          console.info('Geolocation not available, using stored location:', err.message);
          await refreshWeather();
        },
        { timeout: 7000 }
      );
    } else {
      await refreshWeather();
    }
  };

  // Initial mount: attempt geolocation or fetch live weather for saved location immediately
  useEffect(() => {
    detectCurrentLocation();
  }, []);

  // Whenever user manually changes location, re-fetch weather
  useEffect(() => {
    refreshWeather();
  }, [currentLocation.city, currentLocation.province, currentLocation.latitude]);

  const setCurrentLocation = (loc: LocationInfo) => {
    setCurrentLocationState(loc);
    DataService.saveLocation(loc);
  };

  const setActiveChildId = (id: string) => {
    setActiveChildIdState(id);
    DataService.setActiveChildId(id);
  };

  const activeChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0] || DataService.getChildren()[0];

  const addChildProfile = (newProfileData: Omit<ChildProfile, 'id'>): boolean => {
    if (childrenList.length >= 5) {
      alert('Maximum of 5 children profiles can be managed per parent account.');
      return false;
    }
    const newId = `child-${Date.now()}`;
    const newProfile: ChildProfile = {
      ...newProfileData,
      id: newId,
    };
    const nextList = [...childrenList, newProfile];
    setChildrenList(nextList);
    DataService.saveChildren(nextList);
    setActiveChildId(newId);
    return true;
  };

  const updateChildProfile = (updated: ChildProfile) => {
    const nextList = childrenList.map((c) => (c.id === updated.id ? updated : c));
    setChildrenList(nextList);
    DataService.saveChildren(nextList);
  };

  const deleteChildProfile = (id: string) => {
    if (childrenList.length <= 1) {
      alert('At least one child profile must be kept.');
      return;
    }
    const nextList = childrenList.filter((c) => c.id !== id);
    setChildrenList(nextList);
    DataService.saveChildren(nextList);
    if (activeChildId === id) {
      setActiveChildId(nextList[0].id);
    }
  };

  const addWardrobeItem = (itemData: Omit<WardrobeItem, 'id' | 'createdAt'>) => {
    const newItem: WardrobeItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      createdAt: Date.now(),
    };
    const nextItems = [newItem, ...wardrobe];
    setWardrobe(nextItems);
    DataService.saveWardrobe(nextItems);
  };

  const deleteWardrobeItem = (id: string) => {
    const nextItems = wardrobe.filter((i) => i.id !== id);
    setWardrobe(nextItems);
    DataService.saveWardrobe(nextItems);
  };

  const saveLookbook = (lookData: Omit<StylingLookbook, 'id' | 'createdAt'>) => {
    const newLook: StylingLookbook = {
      ...lookData,
      id: `look-${Date.now()}`,
      createdAt: Date.now(),
    };
    const nextLookbooks = [newLook, ...lookbooks];
    setLookbooks(nextLookbooks);
    DataService.saveLookbooks(nextLookbooks);
  };

  const deleteLookbook = (id: string) => {
    const nextLookbooks = DataService.deleteLookbook(id);
    setLookbooks(nextLookbooks);
  };

  return (
    <AppContext.Provider
      value={{
        childrenList,
        activeChildId,
        activeChild,
        setActiveChildId,
        wardrobe,
        lookbooks,
        currentLocation,
        setCurrentLocation,
        currentWeather,
        isWeatherLoading,
        refreshWeather,
        detectCurrentLocation,
        addChildProfile,
        updateChildProfile,
        deleteChildProfile,
        addWardrobeItem,
        deleteWardrobeItem,
        saveLookbook,
        deleteLookbook,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
