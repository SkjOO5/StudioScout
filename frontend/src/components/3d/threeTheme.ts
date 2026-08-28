import { ResolvedTheme } from '../../context/ThemeContext';

export interface ThreeThemeConfig {
  ambientIntensity: number;
  ambientColor: string;
  keyLightIntensity: number;
  keyLightColor: string;
  fillLightIntensity: number;
  fillLightColor: string;
  directionalLightIntensity: number;
  directionalLightColor: string;
  particleColor: string;
  particleOpacity: number;
  particleSize: number;
  filmRingEmissiveIntensity: number;
  coreOpticEmissiveIntensity: number;
  mapLineColor: string;
  mapNodeSelectedColor: string;
  mapNodeAvailableColor: string;
  mapNodeResearchingColor: string;
  mapNodePendingColor: string;
}

export const getThreeThemeConfig = (theme: ResolvedTheme): ThreeThemeConfig => {
  if (theme === 'dark') {
    return {
      ambientIntensity: 0.4,
      ambientColor: '#ffffff',
      keyLightIntensity: 1.3,
      keyLightColor: '#38bdf8',
      fillLightIntensity: 0.9,
      fillLightColor: '#a78bfa',
      directionalLightIntensity: 0.6,
      directionalLightColor: '#fbbf24',
      particleColor: '#38bdf8',
      particleOpacity: 0.65,
      particleSize: 0.06,
      filmRingEmissiveIntensity: 0.9,
      coreOpticEmissiveIntensity: 1.5,
      mapLineColor: '#475569',
      mapNodeSelectedColor: '#38bdf8',
      mapNodeAvailableColor: '#34d399',
      mapNodeResearchingColor: '#fbbf24',
      mapNodePendingColor: '#818cf8',
    };
  }

  // Light theme
  return {
    ambientIntensity: 0.85,
    ambientColor: '#ffffff',
    keyLightIntensity: 0.9,
    keyLightColor: '#0284c7',
    fillLightIntensity: 0.6,
    fillLightColor: '#7c3aed',
    directionalLightIntensity: 0.7,
    directionalLightColor: '#f59e0b',
    particleColor: '#0284c7',
    particleOpacity: 0.45,
    particleSize: 0.05,
    filmRingEmissiveIntensity: 0.4,
    coreOpticEmissiveIntensity: 0.8,
    mapLineColor: '#94a3b8',
    mapNodeSelectedColor: '#0284c7',
    mapNodeAvailableColor: '#059669',
    mapNodeResearchingColor: '#d97706',
    mapNodePendingColor: '#6366f1',
  };
};
