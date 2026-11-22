import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChildProfile, WardrobeItem, StylingLookbook, WeatherSnapshot, LocationInfo } from '../types';
import { DataService } from '../services/dataService';
import { fetchWeatherForLocation } from '../services/weatherService';

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
  refreshWeather: () => Promise<void>;
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
  const [currentWeather, setCurrentWeather] = useState<WeatherSnapshot>({
    temp: 18,
    condition: 'Partly Sunny',
    highTemp: 21,
    lowTemp: 12,
    description: 'Pleasant with light afternoon breeze',
    humidity: 50,
    source: 'AccuWeather (Simulated Seasonal)',
    attributionLink: 'https://www.accuweather.com/',
  });
  const [activeTab, setActiveTab] = useState<'home' | 'wardrobe' | 'profiles' | 'lookbook'>('home');

  // Auto-migrate legacy adult items on mount
  useEffect(() => {
    const currentWardrobe = DataService.getWardrobe();
    setWardrobe(currentWardrobe);
  }, []);

  const refreshWeather = async () => {
    try {
      const w = await fetchWeatherForLocation(currentLocation);
      setCurrentWeather(w);
    } catch (e) {
      console.warn('Weather fetch error:', e);
    }
  };

  useEffect(() => {
    refreshWeather();
  }, [currentLocation]);

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
        refreshWeather,
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
