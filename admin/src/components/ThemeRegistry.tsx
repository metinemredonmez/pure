'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme, lightTheme } from '@/lib/theme';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ mode: 'dark', toggleTheme: () => {} });

export function useThemeMode() {
  return useContext(ThemeContext);
}

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('themeMode') as ThemeMode | null;
    if (saved && (saved === 'dark' || saved === 'light')) {
      setMode(saved);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('themeMode', next);
      return next;
    });
  }, []);

  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
