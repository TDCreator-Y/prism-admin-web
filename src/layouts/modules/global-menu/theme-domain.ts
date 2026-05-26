import { ref, watch } from 'vue';
import type { ThemeConfig } from './types';
import { readJsonStorage, STORAGE_KEYS, STORAGE_KEY_CANDIDATES } from '@/utils/storage-keys';

const DEFAULT_THEME: ThemeConfig = {
  layout: 'side',
  primaryColor: '#3b82f6',
  darkMode: false,
  siderWidth: 220,
  showTabs: true,
  showBreadcrumb: true,
  showFooter: false,
  showWatermark: false,
  watermarkText: 'Dashboard LightWeight',
  preserveHomeTab: true,
};

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, (num >> 16) + amt);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const b = Math.min(255, (num & 0x0000ff) + amt);
  return `rgba(${r}, ${g}, ${b}, 0.2)`;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, (num >> 16) - amt);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const b = Math.max(0, (num & 0x0000ff) - amt);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function loadThemeFromStorage(): Partial<ThemeConfig> {
  try {
    return readJsonStorage<Partial<ThemeConfig>>(STORAGE_KEY_CANDIDATES.theme, {});
  } catch (error) {
    console.warn('Failed to load theme from storage:', error);
  }
  return {};
}

function createThemeConfig(savedTheme: Partial<ThemeConfig>): ThemeConfig {
  return {
    layout: savedTheme.layout || DEFAULT_THEME.layout,
    primaryColor: savedTheme.primaryColor || DEFAULT_THEME.primaryColor,
    darkMode: savedTheme.darkMode ?? DEFAULT_THEME.darkMode,
    siderWidth: DEFAULT_THEME.siderWidth,
    showTabs: savedTheme.showTabs ?? DEFAULT_THEME.showTabs,
    showBreadcrumb: savedTheme.showBreadcrumb ?? DEFAULT_THEME.showBreadcrumb,
    showFooter: savedTheme.showFooter ?? DEFAULT_THEME.showFooter,
    showWatermark: savedTheme.showWatermark ?? DEFAULT_THEME.showWatermark,
    watermarkText: savedTheme.watermarkText || DEFAULT_THEME.watermarkText,
    preserveHomeTab: savedTheme.preserveHomeTab ?? DEFAULT_THEME.preserveHomeTab,
  };
}

function applyDarkMode(darkMode: boolean) {
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function applyThemeColor(color: string) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', color);
  root.style.setProperty('--color-primary-light', lightenColor(color, 40));
  root.style.setProperty('--color-primary-dark', darkenColor(color, 10));
  root.style.setProperty('--color-primary-hover', darkenColor(color, 5));
  root.style.setProperty('--color-primary-bg', hexToRgba(color, 0.1));
  root.style.setProperty('--color-primary-dark-mode-light', hexToRgba(color, 0.15));
  root.style.setProperty('--color-primary-dark-mode-bg', hexToRgba(color, 0.1));
  root.style.setProperty('--color-primary-dark-mode-hover', hexToRgba(color, 0.25));
}

function applyThemeToDom(theme: ThemeConfig) {
  applyDarkMode(theme.darkMode);
  applyThemeColor(theme.primaryColor);
}

function persistTheme(theme: ThemeConfig) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.theme,
      JSON.stringify({
        layout: theme.layout,
        primaryColor: theme.primaryColor,
        darkMode: theme.darkMode,
        showTabs: theme.showTabs,
        showBreadcrumb: theme.showBreadcrumb,
        showFooter: theme.showFooter,
        showWatermark: theme.showWatermark,
        watermarkText: theme.watermarkText,
        preserveHomeTab: theme.preserveHomeTab,
      })
    );
  } catch (error) {
    console.warn('Failed to save theme:', error);
  }
}

export function createThemeDomain() {
  const theme = ref<ThemeConfig>(createThemeConfig(loadThemeFromStorage()));

  applyThemeToDom(theme.value);

  watch(
    theme,
    value => {
      persistTheme(value);
    },
    { deep: true }
  );

  function setTheme(config: Partial<ThemeConfig>) {
    theme.value = { ...theme.value, ...config };
    applyThemeToDom(theme.value);
  }

  function toggleDarkMode() {
    theme.value.darkMode = !theme.value.darkMode;
    applyThemeToDom(theme.value);
  }

  function updateColorVariables(color: string) {
    applyThemeColor(color);
  }

  return {
    theme,
    setTheme,
    toggleDarkMode,
    updateColorVariables,
  };
}
