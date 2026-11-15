import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { AboutSection } from '../components/about/AboutSection';
import { HeroSection } from '../components/hero/HeroSection';
import { TopoCanvas } from '../components/hero/TopoCanvas';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';

describe('M2: Navbar & Skip-to-Content (F5)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders XV. logo, TabBar tabs, mobile drawer toggle, and skip-link', () => {
    const { container } = render(<App />);

    const skipLink = container.querySelector('.skip-link');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main');
    expect(container.querySelector('main#main')).toBeInTheDocument();

    const header = container.querySelector('header#navbar.navbar');
    expect(header).toBeInTheDocument();
    expect(header?.querySelector('.logo')).toHaveTextContent('XV.');

    const tabBar = container.querySelector('.nav-tabbar');
    expect(tabBar).toBeInTheDocument();
    expect(tabBar).toHaveTextContent('Home');
    expect(tabBar).toHaveTextContent('About');
    expect(tabBar).toHaveTextContent('Projects');
    expect(tabBar).toHaveTextContent('Skills');

    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
    const drawer = container.querySelector('#mobile-nav-drawer');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(drawer).not.toHaveClass('open');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(drawer).toHaveClass('open');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(drawer).not.toHaveClass('open');
  });

  it('supports keyboard Arrow, Home, and End navigation on nav drawer links and scroll state', () => {
    const { container } = render(<Navbar />);

    const drawer = container.querySelector('#mobile-nav-drawer') as HTMLElement;
    const links = Array.from(drawer.querySelectorAll('a'));
    expect(links).toHaveLength(4);

    links[0].focus();
    expect(document.activeElement).toBe(links[0]);

    fireEvent.keyDown(drawer, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(links[1]);

    fireEvent.keyDown(drawer, { key: 'End' });
    expect(document.activeElement).toBe(links[3]);

    fireEvent.keyDown(drawer, { key: 'Home' });
    expect(document.activeElement).toBe(links[0]);

    fireEvent.keyDown(drawer, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(links[3]);

    Object.defineProperty(window, 'scrollY', { value: 60, configurable: true });
    fireEvent.scroll(window);
    expect(container.querySelector('#navbar')).toHaveClass('scrolled');
  });
});

describe('M2: HeroSection & TopoCanvas (F7, F8)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders hero backdrop, marching-squares canvas draws, CTAs, and Flight & Lab Telemetry', () => {
    const beginPathSpy = vi.fn();
    const strokeSpy = vi.fn();
    const moveToSpy = vi.fn();
    const lineToSpy = vi.fn();

    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      clearRect: vi.fn(),
      beginPath: beginPathSpy,
      moveTo: moveToSpy,
      lineTo: lineToSpy,
      stroke: strokeSpy,
      setTransform: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    const { container, unmount } = render(<HeroSection pauseContours={false} />);

    const hero = container.querySelector('section#home.hero');
    expect(hero).toHaveAttribute('data-glisse-backdrop');

    const canvas = container.querySelector('canvas#topo-canvas.topo-canvas');
    expect(canvas).toBeInTheDocument();
    expect(beginPathSpy).toHaveBeenCalledTimes(14);
    expect(strokeSpy).toHaveBeenCalledTimes(14);
    expect(moveToSpy).toHaveBeenCalled();
    expect(lineToSpy).toHaveBeenCalled();

    expect(
      screen.getByRole('heading', { name: 'Xander Vanhaeren', level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Leuven, Belgium · 50.88° N, 4.70° E')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Explore Projects' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'About & Workbench' })
    ).toBeInTheDocument();

    expect(screen.getByText('Flight & Lab Telemetry')).toBeInTheDocument();
    expect(screen.getByText('ISO // 1013.25 hPa')).toBeInTheDocument();
    expect(
      screen.getByText('B.Sc. Engineering Sciences · KU Leuven')
    ).toBeInTheDocument();

    unmount();
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it('draws a static frame without scheduling animation loop when paused', () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    const { unmount } = render(<TopoCanvas paused={true} />);
    expect(rafSpy).not.toHaveBeenCalled();
    unmount();
  });
});

describe('M2: AboutSection & Footer (F9)', () => {
  it('renders bio, 3 approach cards, KU Leuven education, 7 interest tags, and footer', () => {
    const { container } = render(
      <>
        <AboutSection />
        <Footer />
      </>
    );

    expect(
      screen.getByRole('heading', {
        name: 'About & Engineering Approach',
        level: 2,
      })
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.approach-card')).toHaveLength(3);
    expect(screen.getByText('01 // Simulate')).toBeInTheDocument();
    expect(screen.getByText('02 // Fabricate')).toBeInTheDocument();
    expect(screen.getByText('03 // Control')).toBeInTheDocument();

    expect(
      screen.getByText('Engineering Sciences (Mechanical Engineering)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('KU Leuven · Leuven, Belgium · Expected 2027')
    ).toBeInTheDocument();

    expect(container.querySelectorAll('.interest-tag')).toHaveLength(7);

    expect(
      screen.getByText('© 2026 Xander Vanhaeren · Built in Leuven, Belgium')
    ).toBeInTheDocument();
    expect(
      screen.getByText('50.8798° N, 4.7005° E · KU Leuven Engineering Sciences')
    ).toBeInTheDocument();
    const footerLinks = container.querySelectorAll('.footer-links a');
    expect(footerLinks).toHaveLength(4);
  });
});
