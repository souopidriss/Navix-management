import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import config from '@/config';
import { STORAGE_KEYS, THEME_MODES } from '@/config';

const getSystemTheme = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? THEME_MODES.DARK
    : THEME_MODES.LIGHT;

const useThemeStore = create(
  persist(
    (set) => ({
      theme: config.theme.defaultMode,
      resolvedTheme: getSystemTheme(),

      setTheme: (theme) =>
        set((state) => {
          const next = Object.values(THEME_MODES).includes(theme) ? theme : state.theme;
          return {
            theme: next,
            resolvedTheme: next === THEME_MODES.SYSTEM ? getSystemTheme() : next,
          };
        }),

      toggleTheme: () =>
        set((state) => {
          const next = state.resolvedTheme === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK;
          return { theme: next, resolvedTheme: next };
        }),

      initializeTheme: () =>
        set((state) => ({
          resolvedTheme: state.theme === THEME_MODES.SYSTEM ? getSystemTheme() : state.theme,
        })),
    }),
    {
      name: STORAGE_KEYS.THEME,
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);

export default useThemeStore;
