/**
 * Common formatting helpers for Kids AI Stylist
 */

export const formatTemperature = (celsius: number): string => {
  return `${Math.round(celsius)}°C`;
};

export const formatChildAge = (age: number): string => {
  return `${age} years old`;
};

export const formatRatioPercent = (ratio: number): string => {
  return `${Math.round(ratio * 100)}%`;
};

export const formatDate = (timestamp: number | string): string => {
  const d = new Date(Number(timestamp));
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
