import { useEffect } from 'react';
import useThemeStore from '@/store/theme.store';

const useTheme = () => {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const toggleMode = useThemeStore((state) => state.toggleMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', mode);
  }, [mode]);

  return { mode, setMode, toggleMode };
};

export default useTheme;
