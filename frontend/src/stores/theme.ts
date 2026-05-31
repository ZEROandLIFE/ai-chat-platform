import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { ThemeState } from '../types';

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeState['mode']>(
    (localStorage.getItem('theme-mode') as ThemeState['mode']) || 'light'
  );

  const toggleTheme = () => {
    mode.value = mode.value === 'light' ? 'dark' : 'light';
  };

  const setTheme = (newMode: ThemeState['mode']) => {
    mode.value = newMode;
  };

  watch(
    mode,
    (newMode) => {
      localStorage.setItem('theme-mode', newMode);
      document.documentElement.setAttribute('data-theme', newMode);
    },
    { immediate: true }
  );

  return {
    mode,
    toggleTheme,
    setTheme
  };
});
