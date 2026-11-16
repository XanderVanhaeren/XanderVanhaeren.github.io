import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
export const THEME_EVENT_NAME = 'xv-themechange';

export const THEME_COLORS: Record<Theme, string> = {
  dark: '#1b1b1b',
  light: '#f5f7fa',
};

export function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Ignore storage access errors in restricted environments.
    }
  }

  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') {
      return attr;
    }
  }

  return 'dark';
}

export function applyTheme(theme: Theme, persist = true): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', THEME_COLORS[theme]);
    }
  }

  if (persist && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage access errors in restricted environments.
    }
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  const setTheme = useCallback((nextTheme: Theme) => {
    applyTheme(nextTheme, true);
    setThemeState(nextTheme);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<Theme>(THEME_EVENT_NAME, { detail: nextTheme })
      );
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme, true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent<Theme>(THEME_EVENT_NAME, { detail: nextTheme })
        );
      }
      return nextTheme;
    });
  }, []);

  useEffect(() => {
    applyTheme(theme, false);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === THEME_STORAGE_KEY &&
        (event.newValue === 'light' || event.newValue === 'dark')
      ) {
        applyTheme(event.newValue, false);
        setThemeState(event.newValue);
      }
    };

    const handleThemeEvent = (event: Event) => {
      const detail = (event as CustomEvent<Theme>).detail;
      if (detail === 'light' || detail === 'dark') {
        setThemeState(detail);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(THEME_EVENT_NAME, handleThemeEvent);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(THEME_EVENT_NAME, handleThemeEvent);
    };
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };
}
