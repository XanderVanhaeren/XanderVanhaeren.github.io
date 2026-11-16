import React from 'react';
import { useTheme } from '../../utils/theme';

export function ThemeSwitch() {
  const { theme, isDark, toggleTheme } = useTheme();
  const nextLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      role="switch"
      id="theme-switch"
      className="theme-switch lg-glass"
      data-theme-mode={theme}
      aria-checked={isDark}
      aria-label={nextLabel}
      title={nextLabel}
      style={{ borderRadius: 'var(--radius-pill)' }}
      onClick={toggleTheme}
    >
      <span className="theme-switch-thumb" aria-hidden="true" />
      <span
        className={`theme-switch-icon is-sun${!isDark ? ' is-active' : ''}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </span>
      <span
        className={`theme-switch-icon is-moon${isDark ? ' is-active' : ''}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </span>
    </button>
  );
}
