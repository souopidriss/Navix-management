import { useEffect } from 'react';
import useThemeStore from '@/store/theme.store';
import { THEME_MODES } from '@/config';

const SYSTEM_QUERY = '(prefers-color-scheme: dark)';

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-bs-theme', theme);
};

/**
 * ThemeProvider — gestion globale du thème.
 *
 * Responsabilités :
 *   - lire le thème depuis le store (persisté)
 *   - appliquer `data-bs-theme` sur <html>
 *   - écouter les changements de préférence système en mode "system"
 *
 * Monté au plus haut niveau de l'application (main.jsx).
 */
const ThemeProvider = ({ children }) => {
  const theme = useThemeStore((state) => state.theme);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (theme !== THEME_MODES.SYSTEM) return undefined;

    const mediaQueryList = window.matchMedia(SYSTEM_QUERY);
    const handleChange = () => initializeTheme();
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [theme, initializeTheme]);

  return children;
};

export default ThemeProvider;
