import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TabBar } from 'glisse';
import { ThemeSwitch } from './ThemeSwitch';

const NAV_ITEMS = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'projects', label: 'Projects' },
  { value: 'skills', label: 'Skills' },
] as const;

type NavSectionId = (typeof NAV_ITEMS)[number]['value'];

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Navbar() {
  const [activeSection, setActiveSection] = useState<NavSectionId>('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLUListElement | null>(null);
  const tabBarWrapperRef = useRef<HTMLDivElement | null>(null);

  const navigateToSection = useCallback((sectionId: string) => {
    const valid = NAV_ITEMS.find((item) => item.value === sectionId);
    if (!valid) return;
    setActiveSection(valid.value);
    setMobileOpen(false);
    const target = document.getElementById(valid.value);
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) =>
      document.getElementById(item.value)
    ).filter((el): el is HTMLElement => el !== null);

    const updateFromScroll = () => {
      setScrolled(window.scrollY > 24);
      if (sections.length === 0) return;

      const docHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      if (
        docHeight > viewportHeight + 10 &&
        window.scrollY + viewportHeight >= docHeight - 4
      ) {
        setActiveSection(sections[sections.length - 1].id as NavSectionId);
        return;
      }

      const threshold = Math.max(140, viewportHeight * 0.35);
      let current: NavSectionId = sections[0].id as NavSectionId;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.height === 0 && rect.top === 0) continue;
        if (rect.top <= threshold) {
          current = section.id as NavSectionId;
        }
      }
      setActiveSection(current);
    };

    let rafId: number | null = null;
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateFromScroll();
      });
    };

    updateFromScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined' && sections.length > 0) {
      observer = new IntersectionObserver(
        () => {
          handleScroll();
        },
        {
          rootMargin: '-25% 0px -55% 0px',
          threshold: [0, 0.25, 0.5],
        }
      );
      sections.forEach((section) => observer!.observe(section));
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    const wrapper = tabBarWrapperRef.current;
    if (!wrapper) return;

    let pending: {
      id: number;
      x: number;
      y: number;
      pointerType: string;
      target: EventTarget;
    } | null = null;
    let bypassing = false;

    const clearPending = (event?: PointerEvent) => {
      if (!pending) return;
      if (event && event.pointerId !== pending.id) return;
      pending = null;
    };

    const onBlur = () => {
      pending = null;
    };

    const onPointerDownCapture = (event: PointerEvent) => {
      if (bypassing || !event.isTrusted) return;
      if (!event.isPrimary || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('.lg-tab')) return;

      pending = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        pointerType: event.pointerType,
        target,
      };
      event.stopPropagation();
    };

    const onPointerMoveCapture = (event: PointerEvent) => {
      if (!pending || event.pointerId !== pending.id) return;
      if (Math.abs(event.clientX - pending.x) <= 6) return;

      const info = pending;
      pending = null;
      if (typeof PointerEvent !== 'function') return;

      bypassing = true;
      try {
        info.target.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            pointerId: info.id,
            pointerType: info.pointerType,
            isPrimary: true,
            button: 0,
            buttons: 1,
            clientX: info.x,
            clientY: info.y,
          })
        );
      } finally {
        bypassing = false;
      }
    };

    wrapper.addEventListener('pointerdown', onPointerDownCapture, { capture: true });
    window.addEventListener('pointermove', onPointerMoveCapture, { capture: true });
    window.addEventListener('pointerup', clearPending, { capture: true });
    window.addEventListener('pointercancel', clearPending, { capture: true });
    window.addEventListener('blur', onBlur);

    return () => {
      wrapper.removeEventListener('pointerdown', onPointerDownCapture, { capture: true });
      window.removeEventListener('pointermove', onPointerMoveCapture, { capture: true });
      window.removeEventListener('pointerup', clearPending, { capture: true });
      window.removeEventListener('pointercancel', clearPending, { capture: true });
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const handleNavKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    selector: string
  ) => {
    if (event.key === 'Escape' && mobileOpen) {
      event.preventDefault();
      setMobileOpen(false);
      toggleRef.current?.focus();
      return;
    }

    const container = event.currentTarget;
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(selector)
    );
    if (focusables.length === 0) return;

    const currentIndex = focusables.findIndex(
      (el) => el === document.activeElement
    );
    if (currentIndex === -1) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % focusables.length;
      focusables[nextIndex]?.focus();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex =
        (currentIndex - 1 + focusables.length) % focusables.length;
      focusables[prevIndex]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusables[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      focusables[focusables.length - 1]?.focus();
    }
  };

  return (
    <header className={scrolled ? 'navbar scrolled' : 'navbar'} id="navbar">
      <a
        href="#home"
        className="logo"
        aria-label="Xander Vanhaeren home"
        onClick={(e) => {
          e.preventDefault();
          navigateToSection('home');
        }}
      >
        XV<span className="logo-accent">.</span>
      </a>

      <nav className="nav-actions" aria-label="Primary">
        <ThemeSwitch />

        <div
          ref={tabBarWrapperRef}
          onKeyDown={(e) => handleNavKeyDown(e, '[role="tab"], button')}
        >
          <TabBar
            className="nav-tabbar"
            items={NAV_ITEMS.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            value={activeSection}
            onValueChange={navigateToSection}
          />
        </div>

        <button
          ref={toggleRef}
          className="nav-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      <ul
        ref={drawerRef}
        id="mobile-nav-drawer"
        className={`nav-links mobile-drawer${mobileOpen ? ' open' : ''}`}
        aria-label="Mobile navigation"
        onKeyDown={(e) => handleNavKeyDown(e, 'a')}
      >
        {NAV_ITEMS.map((item) => (
          <li key={item.value}>
            <a
              href={`#${item.value}`}
              className={activeSection === item.value ? 'active' : undefined}
              aria-current={activeSection === item.value ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigateToSection(item.value);
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
}
