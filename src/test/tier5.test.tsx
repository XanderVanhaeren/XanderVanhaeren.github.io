import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroSection } from '../components/hero/HeroSection';
import { TopoCanvas } from '../components/hero/TopoCanvas';
import { ProjectModal } from '../components/projects/ProjectModal';
import { TyphoonArticle } from '../components/projects/TyphoonArticle';
import {
  DEFAULT_SKILLS_DATA,
  fetchSkillsData,
  parseSkillsCsv,
} from '../data/skillsData';
import { TyphoonStandalonePage } from '../typhoonMain';

describe('Tier 5 Adversarial Unit & Component Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('TopoCanvas lifecycle, IntersectionObserver, MediaQueryList, and unmount cleanup', () => {
    it('pauses/resumes animation on IntersectionObserver and live MediaQueryList changes, and cleans up on unmount', () => {
      const callbacks: {
        intersection: IntersectionObserverCallback | null;
        mediaChange: ((e: MediaQueryListEvent) => void) | null;
      } = {
        intersection: null,
        mediaChange: null,
      };
      const observeSpy = vi.fn();
      const disconnectIoSpy = vi.fn();
      class MockIntersectionObserver {
        constructor(cb: IntersectionObserverCallback) {
          callbacks.intersection = cb;
        }
        observe = observeSpy;
        disconnect = disconnectIoSpy;
        unobserve = vi.fn();
        takeRecords = () => [];
        root = null;
        rootMargin = '';
        thresholds = [0.01];
      }
      vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

      const disconnectRoSpy = vi.fn();
      class MockResizeObserver {
        observe = vi.fn();
        disconnect = disconnectRoSpy;
        unobserve = vi.fn();
      }
      vi.stubGlobal('ResizeObserver', MockResizeObserver);

      const removeMediaListenerSpy = vi.fn();
      vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (_type: string, handler: EventListenerOrEventListenerObject) => {
          callbacks.mediaChange = handler as (e: MediaQueryListEvent) => void;
        },
        removeEventListener: removeMediaListenerSpy,
        dispatchEvent: vi.fn(),
      }));

      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        setTransform: vi.fn(),
      })) as unknown as typeof HTMLCanvasElement.prototype.getContext;

      let rafId = 100;
      const rafSpy = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation(() => ++rafId);
      const cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<TopoCanvas paused={false} />);
      expect(rafSpy).toHaveBeenCalledTimes(1);
      expect(observeSpy).toHaveBeenCalled();

      // Out of view -> stops loop
      callbacks.intersection?.(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
      expect(cancelRafSpy).toHaveBeenCalledWith(101);

      // Back in view -> restarts loop
      callbacks.intersection?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
      expect(rafSpy).toHaveBeenCalledTimes(2);

      // Live prefers-reduced-motion: reduce -> stops loop
      callbacks.mediaChange?.({ matches: true } as MediaQueryListEvent);
      expect(cancelRafSpy).toHaveBeenCalledWith(102);

      // Live prefers-reduced-motion: no-preference -> restarts loop
      callbacks.mediaChange?.({ matches: false } as MediaQueryListEvent);
      expect(rafSpy).toHaveBeenCalledTimes(3);

      unmount();
      expect(cancelRafSpy).toHaveBeenCalledWith(103);
      expect(disconnectIoSpy).toHaveBeenCalledTimes(1);
      expect(disconnectRoSpy).toHaveBeenCalledTimes(1);
      expect(removeMediaListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'pointermove',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'pointerleave',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );

      HTMLCanvasElement.prototype.getContext = originalGetContext;
      vi.unstubAllGlobals();
    });
  });

  describe('HeroSection prefers-reduced-motion scrollIntoView behavior', () => {
    it('uses behavior: "auto" when prefers-reduced-motion: reduce and "smooth" otherwise', () => {
      const target = document.createElement('section');
      target.id = 'projects';
      const scrollSpy = vi.fn();
      target.scrollIntoView = scrollSpy;
      document.body.appendChild(target);

      const matchMediaSpy = vi.spyOn(window, 'matchMedia');
      matchMediaSpy.mockReturnValue({ matches: true } as MediaQueryList);

      const { unmount } = render(<HeroSection pauseContours={true} />);
      fireEvent.click(screen.getByRole('button', { name: 'Explore Projects' }));
      expect(scrollSpy).toHaveBeenNthCalledWith(1, { behavior: 'auto' });

      matchMediaSpy.mockReturnValue({ matches: false } as MediaQueryList);
      fireEvent.click(screen.getByRole('button', { name: 'Explore Projects' }));
      expect(scrollSpy).toHaveBeenNthCalledWith(2, { behavior: 'smooth' });

      unmount();
      target.remove();
    });
  });

  describe('TyphoonArticle standalone vs modal modes', () => {
    it('renders Back to Portfolio link in TyphoonStandalonePage but not inside ProjectModal', () => {
      const { unmount: unmountStandalone } = render(<TyphoonStandalonePage />);
      expect(
        screen.getByRole('link', { name: '← Back to Portfolio' })
      ).toHaveAttribute('href', '../index.html#projects');
      unmountStandalone();

      const { unmount: unmountModal } = render(
        <ProjectModal isOpen={true} onClose={vi.fn()} />
      );
      expect(
        screen.queryByRole('link', { name: '← Back to Portfolio' })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Open full page ↗' })
      ).toHaveAttribute('href', 'projects/typhoon.html');
      unmountModal();

      render(<TyphoonArticle />);
      expect(
        screen.getByRole('heading', { name: 'Project Typhoon', level: 1 })
      ).toBeInTheDocument();
    });
  });

  describe('skillsData.ts duplicate category merging, comma CSV, and non-OK HTTP fallback', () => {
    it('merges non-adjacent duplicate categories and parses comma-delimited CSV', () => {
      const csv = [
        'category,skill,level',
        'Programming,Rust,advanced',
        'Tools,Docker,intermediate',
        'Programming,Go,beginner',
      ].join('\n');

      expect(parseSkillsCsv(csv)).toEqual([
        {
          category: 'Programming',
          skills: [
            { name: 'Rust', level: 'advanced' },
            { name: 'Go', level: 'beginner' },
          ],
        },
        {
          category: 'Tools',
          skills: [{ name: 'Docker', level: 'intermediate' }],
        },
      ]);
    });

    it('falls back to DEFAULT_SKILLS_DATA on non-OK HTTP status (500 / 404)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => '',
      } as Response);

      const result = await fetchSkillsData('assets/data/skills.csv');
      expect(result).toEqual(DEFAULT_SKILLS_DATA);
    });
  });
});
