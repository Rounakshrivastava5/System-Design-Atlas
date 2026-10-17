import { useState, useEffect } from 'react';
import { ThemeMode } from '../types/user';
import { storage } from '../storage/localStorage';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => storage.getTheme());

  useEffect(() => {
    storage.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme, setTheme: setThemeState };
}
