import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import config from '@/config';
import { STORAGE_KEYS, THEME_MODES } from '@/config';

const useThemeStore = create(
  persist(
    (set, get) => ({
      mode: config.theme.defaultMode === THEME_MODES.DARK ? THEME_MODES.DARK : THEME_MODES.LIGHT,

      setMode: (mode) => set({ mode }),

      toggleMode: () =>
        set({
          mode: get().mode === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK,
        }),
    }),
    {
      name: STORAGE_KEYS.THEME,
    },
  ),
);

export default useThemeStore;
