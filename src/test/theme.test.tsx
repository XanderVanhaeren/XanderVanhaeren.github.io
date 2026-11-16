import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FilterBar } from '../components/common/FilterBar';
import { Navbar } from '../components/layout/Navbar';
import { ThemeSwitch } from '../components/layout/ThemeSwitch';
import {
  THEME_COLORS,
  THEME_STORAGE_KEY,
  applyTheme,
  getInitialTheme,
} from '../utils/theme';

describe('ThemeSwitch & Theme Persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = '';
  });

  it('renders ThemeSwitch immediately to the left of the nav TabBar inside Navbar', () => {
    const { container } = render(<Navbar />);
    const navActions = container.querySelector('.nav-actions');
    expect(navActions).toBeInTheDocument();

    const children = Array.from(navActions!.children);
    const switchEl = navActions!.querySelector('#theme-switch');
    const tabBar = navActions!.querySelector('.nav-tabbar');
    expect(switchEl).toBeInTheDocument();
    expect(tabBar).toBeInTheDocument();

    const switchIdx = children.indexOf(switchEl as Element);
    const tabBarWrapperIdx = children.findIndex((el) => el.contains(tabBar));
    expect(switchIdx).toBeGreaterThanOrEqual(0);
    expect(tabBarWrapperIdx).toBeGreaterThan(switchIdx);
  });

  it('toggles between dark and light mode, updates data-theme, meta theme-color, and localStorage', () => {
    let meta = document.querySelector('meta[name="theme-color"]');
    let createdMeta = false;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', THEME_COLORS.dark);
      document.head.appendChild(meta);
      createdMeta = true;
    }

    render(<ThemeSwitch />);
    const toggle = screen.getByRole('switch', { name: 'Switch to light mode' });

    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveAttribute('data-theme-mode', 'dark');
    expect(toggle.querySelector('.is-sun')).toBeInTheDocument();
    expect(toggle.querySelector('.is-moon')).toHaveClass('is-active');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(toggle).toHaveAttribute('data-theme-mode', 'light');
    expect(toggle.querySelector('.is-sun')).toHaveClass('is-active');
    expect(toggle.querySelector('.is-moon')).not.toHaveClass('is-active');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(meta.getAttribute('content')).toBe(THEME_COLORS.light);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(meta.getAttribute('content')).toBe(THEME_COLORS.dark);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    if (createdMeta) {
      meta.remove();
    }
  });

  it('restores saved theme from localStorage via getInitialTheme and applyTheme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(getInitialTheme()).toBe('light');

    applyTheme('light', false);
    render(<ThemeSwitch />);
    const toggle = screen.getByRole('switch', { name: 'Switch to dark mode' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

describe('FilterBar responsive radiogroup', () => {
  it('supports click and Arrow/Home/End keyboard navigation across filter pills', () => {
    const onValueChange = vi.fn();
    render(
      <FilterBar
        items={[
          { value: 'all', label: 'All' },
          { value: 'aerospace', label: 'Aerospace' },
          { value: 'robotics', label: 'Robotics' },
        ]}
        value="all"
        onValueChange={onValueChange}
        aria-label="Filter items"
      />
    );

    const group = screen.getByRole('radiogroup', { name: 'Filter items' });
    const allRadio = screen.getByRole('radio', { name: 'All' });
    const aeroRadio = screen.getByRole('radio', { name: 'Aerospace' });
    const roboRadio = screen.getByRole('radio', { name: 'Robotics' });

    expect(allRadio).toHaveAttribute('aria-checked', 'true');
    expect(aeroRadio).toHaveAttribute('aria-checked', 'false');

    allRadio.focus();
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onValueChange).toHaveBeenLastCalledWith('aerospace');
    expect(document.activeElement).toBe(aeroRadio);

    fireEvent.keyDown(group, { key: 'End' });
    expect(onValueChange).toHaveBeenLastCalledWith('robotics');
    expect(document.activeElement).toBe(roboRadio);

    fireEvent.keyDown(group, { key: 'Home' });
    expect(onValueChange).toHaveBeenLastCalledWith('all');
    expect(document.activeElement).toBe(allRadio);

    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(onValueChange).toHaveBeenLastCalledWith('robotics');
    expect(document.activeElement).toBe(roboRadio);
  });
});
