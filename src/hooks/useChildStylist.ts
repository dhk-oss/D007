import { useMemo } from 'react';
import { ChildProfile, WardrobeItem, WeatherSnapshot, OccasionType } from '../types';

export const useChildStylist = (
  child: ChildProfile,
  weather: WeatherSnapshot,
  wardrobe: WardrobeItem[]
) => {
  const stylingScore = useMemo(() => {
    // Proportional balance scoring
    const legRatio = child.bodyProportionAnalysis.legRatio;
    return Math.round(legRatio * 100 + 40);
  }, [child]);

  const recommendedCategories = useMemo(() => {
    const list = ['tops', 'bottoms', 'shoes'];
    if (weather.temp < 20) {
      list.push('outerwear');
    }
    return list;
  }, [weather.temp]);

  const availableItemsForChild = useMemo(() => {
    return wardrobe.filter((item) => item.childId === child.id);
  }, [wardrobe, child.id]);

  const getProportionTip = (occasion: OccasionType) => {
    const isLongLegs = child.bodyProportionAnalysis.legRatio > 0.55;
    if (isLongLegs) {
      return `For ${occasion}, tuck-in tops or slightly cropped outer layers highlight ${child.name}'s long leg proportion.`;
    }
    return `For ${occasion}, monochromatic or vertical silhouettes offer a balanced, elongated look for ${child.name}.`;
  };

  return {
    stylingScore,
    recommendedCategories,
    availableItemsForChild,
    getProportionTip,
  };
};
