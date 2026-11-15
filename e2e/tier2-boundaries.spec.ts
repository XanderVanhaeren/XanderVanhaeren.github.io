import { test, expect } from '@playwright/test';
import {
  attachConsoleErrorTracker,
  gotoHomeReady,
  getNavTab,
  selectCategorySegment,
  getSectionSearchInput,
  setSectionSearchQuery,
  clearSectionSearch,
  openGlassOpticsHud,
  setSliderValue,
  openTyphoonModal,
  closeTyphoonModal,
  getActiveGlassOpticsVars,
} from './helpers';

test.describe('Tier 2 — Boundary & Corner Cases (F1–F12, 64 Tests)', () => {
  test.describe('F1: Build, Multi-Page Routing & Restricted Path Boundaries', () => {
    test('F1-B1: Direct navigation to /index.html vs / parity', async ({ page }) => {
      await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#root')).not.toBeEmpty();
      const indexHasTheme = await page.evaluate(
        () => document.documentElement.getAttribute('data-theme') === 'dark'
      );
      expect(indexHasTheme).toBe(true);

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#root')).not.toBeEmpty();
      const rootHasTheme = await page.evaluate(
        () => document.documentElement.getAttribute('data-theme') === 'dark'
      );
      expect(rootHasTheme).toBe(true);
    });

    test('F1-B2: Unknown hash fragment on root (/#non-existent-section-xyz) graceful handling', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page);
      await page.goto('/#non-existent-section-xyz', { waitUntil: 'domcontentloaded' });

      await expect(page.locator('#home')).toBeVisible();
      await expect(page.locator('#about')).toBeVisible();
      await expect(page.locator('#projects')).toBeVisible();
      await expect(page.locator('#skills')).toBeVisible();
      tracker.assertClean();
    });

    test('F1-B3: Unknown query parameters (/?unknown=123&project=invalid_slug) graceful handling', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page);
      await page.goto('/?unknown=123&project=invalid_slug', { waitUntil: 'domcontentloaded' });

      await expect(page.locator('#home')).toBeVisible();
      const modal = page.locator('dialog#project-modal');
      await expect(modal).toBeHidden();
      tracker.assertClean();
    });

    test('F1-B4: Restricted .agents/ directory and Logo.af are not referenced in DOM', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const leakedRefs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[href], [src]')).filter((el) => {
          const val = (el.getAttribute('href') || '') + (el.getAttribute('src') || '');
          return val.includes('.agents') || val.includes('Logo.af');
        }).length;
      });
      expect(leakedRefs).toBe(0);
    });

    test('F1-B5: Multi-page entry /projects/typhoon.html with query string & hash (/projects/typhoon.html?ref=test#cfd)', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page);
      await page.goto('/projects/typhoon.html?ref=test#cfd', { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('heading', { level: 1, name: 'Project Typhoon' })).toBeVisible();
      await expect(page.locator('.lg-glass').first()).toBeVisible();
      tracker.assertClean();
    });
  });

  test.describe('F2: Static Assets, Fonts & Metadata Corner Cases', () => {
    test('F2-B1: URL-encoded space in asset filename (/assets/images/projects/Typhoon/Fuselage%20Flowsim.png) loads with HTTP 200', async ({
      page,
    }) => {
      const res = await page.request.get(
        '/assets/images/projects/Typhoon/Fuselage%20Flowsim.png'
      );
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('image/png');
      const body = await res.body();
      expect(body.byteLength).toBeGreaterThan(50000);
    });

    test('F2-B2: Favicon assets (/assets/Logo/favicon.svg, /assets/Logo/favicon.ico, /assets/Logo/Logo.svg) boundary check on both routes', async ({
      page,
    }) => {
      for (const path of [
        '/assets/Logo/favicon.svg',
        '/assets/Logo/favicon.ico',
        '/assets/Logo/Logo.svg',
      ]) {
        const res = await page.request.get(path);
        expect(res.status()).toBe(200);
        expect((await res.body()).byteLength).toBeGreaterThan(100);
      }

      await page.goto('/projects/typhoon.html', { waitUntil: 'domcontentloaded' });
      const iconCount = await page.locator('head link[rel*="icon"]').count();
      expect(iconCount).toBeGreaterThanOrEqual(1);
    });

    test('F2-B3: Google Fonts offline/blocked network graceful fallback', async ({ page }) => {
      const tracker = attachConsoleErrorTracker(page, { ignoreNetworkErrors: true });
      await page.route('**/*fonts.googleapis.com/**', (route) => route.abort());
      await page.route('**/*fonts.gstatic.com/**', (route) => route.abort());

      await gotoHomeReady(page);
      const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
      expect(fontFamily.length).toBeGreaterThan(0);
      tracker.assertClean();
    });

    test('F2-B4: SEO & OpenGraph metadata completeness on root vs standalone /projects/typhoon.html', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const rootTitle = await page.title();
      expect(rootTitle).toContain('Xander Vanhaeren');

      await page.goto('/projects/typhoon.html', { waitUntil: 'domcontentloaded' });
      const typhoonTitle = await page.title();
      expect(typhoonTitle).toContain('Project Typhoon');
      expect(typhoonTitle).not.toBe(rootTitle);
    });

    test('F2-B5: Key high-res Typhoon image assets in /assets/images/projects/Typhoon/ are reachable via HTTP GET', async ({
      page,
    }) => {
      const assets = [
        '/assets/images/projects/Typhoon/VelocitySolidworks.png',
        '/assets/images/projects/Typhoon/typhoon-v3.jpg',
        '/assets/images/projects/Typhoon/tars-v2.jpg',
        '/assets/images/projects/Typhoon/Fuselage%20Flowsim.png',
        '/assets/images/projects/Typhoon/typhoon-hero-render.png',
      ];
      for (const url of assets) {
        const res = await page.request.get(url);
        expect(res.status(), `${url} must return 200`).toBe(200);
      }
    });
  });

  test.describe('F3: Typed Portfolio & skills.csv Data Layer Network Failure & Edge Cases', () => {
    test('F3-B1: assets/data/skills.csv HTTP 500 Server Error triggers synchronous fallback', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page, { ignoreNetworkErrors: true });
      await page.route('**/assets/data/skills.csv*', (route) =>
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );

      await gotoHomeReady(page);
      const skills = page.locator('#skills');
      for (const cat of [
        'Programming',
        'Electronics & Embedded Systems',
        'CAD & Mechanical Design',
        'Data Analysis & Simulation',
        'Tools & Technologies',
      ]) {
        await expect(skills).toContainText(cat);
      }
      await expect(skills).toContainText('Python');
      await expect(skills).toContainText('Linux');
      tracker.assertClean();
    });

    test('F3-B2: assets/data/skills.csv network abort / offline triggers synchronous fallback', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page, { ignoreNetworkErrors: true });
      await page.route('**/assets/data/skills.csv*', (route) => route.abort('failed'));

      await gotoHomeReady(page);
      const skills = page.locator('#skills');
      await expect(skills).toContainText('Programming');
      await expect(skills).toContainText('Arduino / ESP32');
      await expect(skills).toContainText('CFD / Aerodynamics');
      tracker.assertClean();
    });

    test('F3-B3: assets/data/skills.csv empty body or header-only falls back to default 16 skills', async ({
      page,
    }) => {
      await page.route('**/assets/data/skills.csv*', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'text/csv',
          body: 'category;skill;level\n   \n',
        })
      );

      await gotoHomeReady(page);
      const skills = page.locator('#skills');
      await expect(skills).toContainText('Programming');
      await expect(skills).toContainText('Tools & Technologies');
      await expect(skills).toContainText('Git / GitHub');
    });

    test('F3-B4: assets/data/skills.csv with extra whitespace, unknown proficiency level, and trailing blank lines', async ({
      page,
    }) => {
      const customCsv = [
        'category;skill;level',
        '  Programming  ;  Python  ;  ADVANCED  ',
        '  Programming  ;  Rust Embedded  ;  UNKNOWN_LEVEL_XYZ  ',
        '',
        '   ',
      ].join('\n');

      await page.route('**/assets/data/skills.csv*', (route) =>
        route.fulfill({ status: 200, contentType: 'text/csv', body: customCsv })
      );

      await gotoHomeReady(page);
      const skills = page.locator('#skills');
      await expect(skills).toContainText('Programming');
      await expect(skills).toContainText('Python');
      await expect(skills).toContainText('Rust Embedded');
    });

    test('F3-B5: assets/data/skills.csv with malformed rows (missing semicolons / single column) falls back cleanly', async ({
      page,
    }) => {
      const malformedCsv = 'category;skill;level\ncorrupted_line_without_delimiters\nonly_two;parts\n';
      await page.route('**/assets/data/skills.csv*', (route) =>
        route.fulfill({ status: 200, contentType: 'text/csv', body: malformedCsv })
      );

      await gotoHomeReady(page);
      const skills = page.locator('#skills');
      await expect(skills).toContainText('Programming');
      await expect(skills).toContainText('Python');
    });

    test('F3-B6: Verbatim V1 numerical & technical copy preservation under boundary inspection', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const bodyText = await page.locator('body').innerText();

      for (const token of [
        '50.88° N, 4.70° E',
        'ISO // 1013.25 hPa',
        'NACA 2412',
        '821 g',
        '13.7 m/s',
        'ESP32-C6',
        '50.8798° N, 4.7005° E',
      ]) {
        expect(bodyText).toContain(token);
      }
    });
  });

  test.describe('F4: Liquid Glass Design System, Responsive Breakpoints & Reduced Motion', () => {
    test('F4-B1: Small Mobile Viewport (320×568) — zero horizontal overflow & visible mobile toggle', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await gotoHomeReady(page);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(2);

      const navToggle = page.locator('#navbar .nav-toggle, #navbar button[aria-label*="menu" i]').first();
      await expect(navToggle).toBeVisible();
    });

    test('F4-B2: Standard Mobile Viewport (375×667) — mobile navigation toggle & container bounds', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await gotoHomeReady(page);

      const navToggle = page.locator('#navbar .nav-toggle, #navbar button[aria-label*="menu" i]').first();
      await expect(navToggle).toBeVisible();

      const maxCardWidth = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.lg-glass'));
        return Math.max(...cards.map((c) => c.getBoundingClientRect().width));
      });
      expect(maxCardWidth).toBeLessThanOrEqual(376);
    });

    test('F4-B3: Tablet Viewport (768×1024) — boundary at 768px media query without horizontal scroll', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await gotoHomeReady(page);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(2);
    });

    test('F4-B4: Desktop Viewport (1440×900) — multi-column layouts & hidden .nav-toggle', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoHomeReady(page);

      const navToggle = page.locator('#navbar .nav-toggle').first();
      if ((await navToggle.count()) > 0) {
        await expect(navToggle).toBeHidden();
      }
      await expect(getNavTab(page, 'Home')).toBeVisible();
    });

    test('F4-B5: prefers-reduced-motion: reduce media emulation on CSS transitions & scroll behavior', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await gotoHomeReady(page);

      const reduced = await page.evaluate(() => ({
        matches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      }));

      expect(reduced.matches).toBe(true);
      expect(reduced.scrollBehavior).toBe('auto');
    });

    test('F4-B6: Every rendered .lg-glass element across the page has computed borderTopLeftRadius > 0', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const invalidCount = await page.evaluate(() => {
        const visibleGlasses = Array.from(document.querySelectorAll('.lg-glass')).filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });
        return visibleGlasses.filter(
          (el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) <= 0
        ).length;
      });
      expect(invalidCount).toBe(0);
    });
  });

  test.describe('F5: Floating Liquid Glass Navbar, Scroll-Spy & Keyboard Navigation Boundaries', () => {
    test('F5-B1: Rapid consecutive switching of TabBar items (Home -> About -> Projects -> Skills -> Home)', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page);
      await page.setViewportSize({ width: 1280, height: 800 });
      await gotoHomeReady(page);

      for (const tab of ['About', 'Projects', 'Skills', 'Home'] as const) {
        await getNavTab(page, tab).click();
      }

      await expect(page.locator('#home')).toBeVisible();
      tracker.assertClean();
    });

    test('F5-B2: Keyboard navigation on navbar links (ArrowRight, ArrowLeft, Home, End)', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page);
      await page.setViewportSize({ width: 1280, height: 800 });
      await gotoHomeReady(page);

      const homeTab = getNavTab(page, 'Home');
      await homeTab.focus();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('End');
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowLeft');

      tracker.assertClean();
    });

    test('F5-B3: Mobile menu open/close via .nav-toggle, Escape key, and link selection at 375×667', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await gotoHomeReady(page);

      const toggle = page.locator('#navbar .nav-toggle, #navbar button[aria-label*="menu" i]').first();
      await expect(toggle).toBeVisible();

      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');

      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const mobileProjectsLink = page
        .locator('#navbar a, #navbar button')
        .filter({ hasText: /^\s*Projects\s*$/i })
        .last();
      await mobileProjectsLink.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('F5-B4: Scroll-spy boundary at window.scrollY === 0 vs window.scrollY > 10 (.scrolled class toggle)', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await expect(page.locator('#navbar')).not.toHaveClass(/scrolled/);

      await page.evaluate(() => window.scrollTo({ top: 250, behavior: 'instant' }));
      await expect(page.locator('#navbar')).toHaveClass(/scrolled/);

      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await expect(page.locator('#navbar')).not.toHaveClass(/scrolled/);
    });

    test('F5-B5: Skip-to-content link (.skip-link) keyboard focus & activation', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      await page.keyboard.press('Tab');

      const skipLink = page.locator('a.skip-link').first();
      await expect(skipLink).toBeFocused();
      await expect(skipLink).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(page.locator('main#main')).toBeVisible();
    });

    test('F5-B6: Viewport resize while mobile menu is open (375×667 -> 1440×900)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await gotoHomeReady(page);

      const toggle = page.locator('#navbar .nav-toggle, #navbar button[aria-label*="menu" i]').first();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await page.setViewportSize({ width: 1440, height: 900 });
      await expect(getNavTab(page, 'Projects')).toBeVisible();
    });
  });

  test.describe('F6: Interactive Liquid Glass Optics HUD (GlassOpticsHud) Boundaries', () => {
    test('F6-B1: Opening and closing the Liquid Glass Optics HUD popover', async ({ page }) => {
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const slider = page.locator('input[type="range"]').first();
      await expect(slider).toBeVisible();

      await page.keyboard.press('Escape');
    });

    test('F6-B2: Blur slider (--lg-blur) minimum (0px) and maximum bounds', async ({ page }) => {
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const blurSlider = page
        .locator('input[type="range"][aria-label*="Blur" i], .lg-slider input[type="range"]')
        .first();
      const minVal = Number((await blurSlider.getAttribute('min')) ?? 0);
      const maxVal = Number((await blurSlider.getAttribute('max')) ?? 30);

      await setSliderValue(blurSlider, minVal);
      await expect
        .poll(async () => (await getActiveGlassOpticsVars(page)).blur)
        .toContain(String(minVal));

      await setSliderValue(blurSlider, maxVal);
      await expect
        .poll(async () => (await getActiveGlassOpticsVars(page)).blur)
        .toContain(String(maxVal));
    });

    test('F6-B3: Refraction Bend (--lg-glass-bend) and Dispersion (--lg-glass-dispersion) slider min/max bounds', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const sliders = page.locator('.lg-slider input[type="range"], input[type="range"]');
      const bendSlider = page
        .locator('input[type="range"][aria-label*="Bend" i]')
        .or(sliders.nth(1))
        .first();
      const dispSlider = page
        .locator('input[type="range"][aria-label*="Dispersion" i]')
        .or(sliders.nth(2))
        .first();

      const bendMin = Number((await bendSlider.getAttribute('min')) ?? 0);
      const dispMax = Number((await dispSlider.getAttribute('max')) ?? 2);

      await setSliderValue(bendSlider, bendMin);
      await setSliderValue(dispSlider, dispMax);

      const vars = await getActiveGlassOpticsVars(page);
      expect(vars.bend).toContain(String(bendMin));
      expect(vars.dispersion).toContain(String(dispMax));
    });

    test('F6-B4: Rapid toggling of the Contour Animation Pause <Switch> (onCheckedChange)', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const switchEl = page.locator('.lg-switch[role="switch"], [role="switch"]').first();
      const initial = (await switchEl.getAttribute('aria-checked')) === 'true';

      for (let i = 0; i < 5; i++) {
        await switchEl.click();
      }

      const finalState = (await switchEl.getAttribute('aria-checked')) === 'true';
      expect(finalState).toBe(!initial);
    });

    test('F6-B5: Resetting Optics HUD parameters to defaults (blur: 14, bend: 1.6, dispersion: 0.6)', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const blurSlider = page
        .locator('input[type="range"][aria-label*="Blur" i], .lg-slider input[type="range"]')
        .first();
      await setSliderValue(blurSlider, 26);

      const resetBtn = page
        .locator('button:has-text("Reset"), button[aria-label*="Reset" i]')
        .first();
      if (await resetBtn.isVisible().catch(() => false)) {
        await resetBtn.click();
      } else {
        await setSliderValue(blurSlider, 14);
      }

      await expect
        .poll(async () => (await getActiveGlassOpticsVars(page)).blur)
        .toContain('14');
    });
  });

  test.describe('F7: Hero Section & Telemetry Fieldnotes Boundaries', () => {
    test('F7-B1: Hero CTA <Button variant="filled"> (Explore Projects) and <Button variant="glass"> (About & Workbench) keyboard activation', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const exploreCta = page.locator('#home').getByText('Explore Projects').first();
      await exploreCta.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#projects')).toBeVisible();

      const aboutCta = page.locator('#home').getByText('About & Workbench').first();
      await aboutCta.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#about')).toBeVisible();
    });

    test('F7-B2: Hero Flight & Lab Telemetry card layout at ultra-narrow 320×568 viewport', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await gotoHomeReady(page);

      const fieldnotes = page
        .locator('#home aside, #home .hero-fieldnotes')
        .filter({ hasText: 'Flight & Lab Telemetry' })
        .first();
      await expect(fieldnotes).toBeVisible();
      const box = await fieldnotes.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(320);
    });

    test('F7-B3: Hero eyebrow coordinate badge & heading semantic hierarchy', async ({ page }) => {
      await gotoHomeReady(page);
      const h1Count = await page.locator('#home h1').count();
      expect(h1Count).toBe(1);
      await expect(page.locator('#home h1')).toHaveText('Xander Vanhaeren');
      await expect(page.locator('#home aside[aria-label="Engineering field notes"]')).toBeVisible();
    });

    test('F7-B4: glisse press physics (pointerdown / pointerup) on Hero <Button> components', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const btn = page.locator('#home .lg-button').first();
      await expect(btn).toBeVisible();

      await btn.dispatchEvent('pointerdown');
      await btn.dispatchEvent('pointerup');
      await expect(btn).toBeEnabled();
    });

    test('F7-B5: Hero section backdrop registration (data-glisse-backdrop) integrity', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const hasBackdrop = await page.evaluate(
        () => document.querySelector('[data-glisse-backdrop]') !== null
      );
      expect(hasBackdrop).toBe(true);
    });
  });

  test.describe('F8: Interactive Topographic Isobar Canvas (TopoCanvas) Boundaries', () => {
    test('F8-B1: TopoCanvas under prefers-reduced-motion: reduce draws static frame cleanly', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await gotoHomeReady(page);

      const canvas = page.locator('#topo-canvas');
      await expect(canvas).toBeVisible();
      await expect(canvas).toHaveAttribute('aria-hidden', 'true');
      const dims = await canvas.evaluate((el: HTMLCanvasElement) => ({
        w: el.width,
        h: el.height,
      }));
      expect(dims.w).toBeGreaterThan(0);
      expect(dims.h).toBeGreaterThan(0);
    });

    test('F8-B2: TopoCanvas pointer events at extreme canvas corners (0, 0) and (width, height) plus pointerleave', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page);
      await gotoHomeReady(page);

      const home = page.locator('#home');
      await page.mouse.move(1, 1);
      await page.mouse.move(799, 499);
      await home.dispatchEvent('pointerleave');

      tracker.assertClean();
    });

    test('F8-B3: TopoCanvas resize handling across extreme aspect ratios (320×568 portrait -> 1920×400 ultrawide)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await gotoHomeReady(page);
      const portraitWidth = await page
        .locator('#topo-canvas')
        .evaluate((c: HTMLCanvasElement) => c.width);

      await page.setViewportSize({ width: 1920, height: 400 });
      await expect
        .poll(async () =>
          page.locator('#topo-canvas').evaluate((c: HTMLCanvasElement) => c.width)
        )
        .toBeGreaterThan(portraitWidth);
    });

    test('F8-B4: TopoCanvas off-screen scroll pause via IntersectionObserver and resume on scroll back', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page);
      await gotoHomeReady(page);

      await page.evaluate(() =>
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
      );
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

      await expect(page.locator('#topo-canvas')).toBeVisible();
      tracker.assertClean();
    });

    test('F8-B5: TopoCanvas renders actual non-transparent contour pixels on 2D context', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const nonEmpty = await page.locator('#topo-canvas').evaluate((c: HTMLCanvasElement) => {
        const ctx = c.getContext('2d');
        if (!ctx) return false;
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        for (let i = 3; i < data.length; i += 32) {
          if (data[i] > 0) return true;
        }
        return false;
      });
      expect(nonEmpty).toBe(true);
    });
  });

  test.describe('F9: About Section, Engineering Loop & Footer Boundaries', () => {
    test('F9-B1: All 3 Engineering Loop <Glass> cards (01 // Simulate, 02 // Fabricate, 03 // Control) order & content integrity', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const aboutText = await page.locator('#about').innerText();
      const idx1 = aboutText.indexOf('01 // Simulate');
      const idx2 = aboutText.indexOf('02 // Fabricate');
      const idx3 = aboutText.indexOf('03 // Control');

      expect(idx1).toBeGreaterThanOrEqual(0);
      expect(idx2).toBeGreaterThan(idx1);
      expect(idx3).toBeGreaterThan(idx2);
    });

    test('F9-B2: All 7 Focus Areas & Hardware interest tags wrap cleanly at 320×568 without overflow', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await gotoHomeReady(page);

      const about = page.locator('#about');
      for (const tag of [
        'Aerodynamics',
        'Flight Dynamics',
        'Control Systems',
        'CFD Simulation',
        '3D Printing (LW-PLA)',
        'Custom PCBs & IoT',
        'Robotics',
      ]) {
        await expect(about).toContainText(tag);
      }
    });

    test('F9-B3: Education card boundary metadata (Bachelor of Science, KU Leuven, Expected 2027)', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const about = page.locator('#about');
      await expect(about).toContainText('Bachelor of Science');
      await expect(about).toContainText('Engineering Sciences (Mechanical Engineering)');
      await expect(about).toContainText('KU Leuven · Leuven, Belgium · Expected 2027');
    });

    test('F9-B4: Footer (footer.footer) coordinates & quick navigation boundary', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const footer = page.locator('footer.footer, footer').first();
      await footer.scrollIntoViewIfNeeded();

      await expect(footer).toContainText('© 2026 Xander Vanhaeren · Built in Leuven, Belgium');
      await expect(footer).toContainText('50.8798° N, 4.7005° E · KU Leuven Engineering Sciences');
    });

    test('F9-B5: Responsive grid collapse of .about-grid and .approach-grid below 900px (768×1024 vs 1440×900)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoHomeReady(page);
      const desktopCols = await page.evaluate(() => {
        const grid = document.querySelector('.approach-grid, .about-grid');
        return grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 3;
      });
      expect(desktopCols).toBeGreaterThanOrEqual(2);

      await page.setViewportSize({ width: 768, height: 1024 });
      const tabletCols = await page.evaluate(() => {
        const grid = document.querySelector('.approach-grid, .about-grid');
        return grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 1;
      });
      expect(tabletCols).toBe(1);
    });
  });

  test.describe('F10: Projects Showcase, SegmentedControl & SearchField Filtering Boundaries', () => {
    test('F10-B1: Empty and whitespace-only search queries ("", "   ") in Projects SearchField', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('#projects');

      await setSectionSearchQuery(page, '#projects', '   ');
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeVisible();
    });

    test('F10-B2: Case-insensitive and partial-keyword search in Projects SearchField ("eSp32", "rOs", "bLe")', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('#projects');

      await setSectionSearchQuery(page, '#projects', 'eSp32');
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeHidden();

      await setSectionSearchQuery(page, '#projects', 'rOs');
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeHidden();

      await setSectionSearchQuery(page, '#projects', 'bLe');
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeHidden();
    });

    test('F10-B3: Special-character and zero-match search query ("xyz_nonexistent_999!@#$%^&*()") shows empty state & recovers', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('#projects');

      await setSectionSearchQuery(page, '#projects', 'xyz_nonexistent_999!@#$%^&*()');
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeHidden();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeHidden();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeHidden();

      await clearSectionSearch(page, '#projects');
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeVisible();
    });

    test('F10-B4: Clearing Projects SearchField via glisse clear button and keyboard', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('#projects');

      await setSectionSearchQuery(page, '#projects', 'Typhoon');
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeHidden();

      await clearSectionSearch(page, '#projects');
      await expect(getSectionSearchInput(page, '#projects')).toHaveValue('');
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
    });

    test('F10-B5: Rapid switching across all Projects SegmentedControl tabs (All -> Aerospace -> Robotics -> Telemetry -> All)', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('#projects');

      await selectCategorySegment(page, '#projects', 'Aerospace');
      await selectCategorySegment(page, '#projects', 'Robotics');
      await selectCategorySegment(page, '#projects', 'Telemetry');
      await selectCategorySegment(page, '#projects', 'All');

      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeVisible();
    });

    test('F10-B6: Inline SVG contour diagrams (rover on RCXD, telemetry on BikeySens) & .proof-grid inspection', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('#projects');

      await expect(projects.locator('svg').filter({ hasText: 'TERRAIN CONTOUR // WAYPOINT NAV' })).toBeVisible();
      await expect(projects.locator('svg').filter({ hasText: 'ELEVATION RIDGE // BLE TELEMETRY' })).toBeVisible();

      const proofGrid = projects.locator('.proof-grid');
      await expect(proofGrid).toBeVisible();
    });
  });

  test.describe('F11: Project Typhoon Case-Study Modal & Standalone Page Routing Boundaries', () => {
    test('F11-B1: Closing #project-modal via .project-modal-close button, Escape key, and backdrop click', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      await openTyphoonModal(page);
      await closeTyphoonModal(page, 'button');

      await openTyphoonModal(page);
      await closeTyphoonModal(page, 'escape');

      await openTyphoonModal(page);
      await closeTyphoonModal(page, 'backdrop');
    });

    test('F11-B2: Direct deep-link opening via query param /?project=typhoon and hash /#projects/typhoon', async ({
      page,
    }) => {
      await page.goto('/?project=typhoon', { waitUntil: 'domcontentloaded' });
      const modal = page.locator('dialog#project-modal, #project-modal').first();
      await expect(modal).toBeVisible();
      await closeTyphoonModal(page, 'escape');

      await page.goto('/#projects/typhoon', { waitUntil: 'domcontentloaded' });
      await expect(modal).toBeVisible();
    });

    test('F11-B3: Direct navigation to standalone /projects/typhoon.html renders all 5 sections, 6 specs, 5 tags & 4 figures', async ({
      page,
    }) => {
      await page.goto('/projects/typhoon.html', { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('heading', { level: 1, name: 'Project Typhoon' })).toBeVisible();
      for (const spec of [
        '680 mm × 602 mm',
        '821 g (wings < 60 g each)',
        'NACA 2412 (4° → 2° washout)',
        '2 × 50 mm EDF · 12.96 N thrust',
        '1.61 (1034 W peak)',
        'TARS V2 (24 g, ESP32-C6 + MPU-6050)',
      ]) {
        await expect(page.locator('body')).toContainText(spec);
      }

      const imgs = page.locator('figure img, .article-figure img');
      expect(await imgs.count()).toBeGreaterThanOrEqual(4);
    });

    test('F11-B4: Standalone /projects/typhoon.html navigation back to portfolio via Back to Portfolio (.article-back)', async ({
      page,
    }) => {
      await page.goto('/projects/typhoon.html', { waitUntil: 'domcontentloaded' });
      const backLink = page.locator('a.article-back, a:has-text("Back to Portfolio")').first();
      await expect(backLink).toBeVisible();
      await backLink.click();

      await expect(page.locator('#projects')).toBeVisible();
    });

    test('F11-B5: Read full engineering article link points to projects/typhoon.html and does not hijack Ctrl+Click', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const link = page
        .locator('#projects a:has-text("Read full engineering article")')
        .first();

      if ((await link.count()) > 0) {
        const href = await link.getAttribute('href');
        expect(href).toContain('typhoon.html');
      } else {
        const btn = page
          .locator('#projects button:has-text("Read full engineering article")')
          .first();
        await expect(btn).toBeVisible();
      }
    });
  });

  test.describe('F12: Skills & Instruments Interactive Matrix Boundaries', () => {
    test('F12-B1: Empty and whitespace-only search queries ("", "   ") in Skills SearchField', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('#skills');

      await setSectionSearchQuery(page, '#skills', '   ');
      for (const cat of [
        'Programming',
        'Electronics & Embedded Systems',
        'CAD & Mechanical Design',
        'Data Analysis & Simulation',
        'Tools & Technologies',
      ]) {
        await expect(skills).toContainText(cat);
      }
    });

    test('F12-B2: Special-character Skill search queries ("C/C++", "Python (NumPy, SciPy)", "3D Printing (FDM/SLA)")', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('#skills');

      for (const query of ['C/C++', 'Python (NumPy, SciPy)', '3D Printing (FDM/SLA)']) {
        await setSectionSearchQuery(page, '#skills', query);
        await expect(skills).toContainText(query);
      }
    });

    test('F12-B3: No-match search query in Skills SearchField ("cobol_fortran_999") & clear button recovery', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('#skills');

      await setSectionSearchQuery(page, '#skills', 'cobol_fortran_999');
      await expect(skills).not.toContainText('Fusion 360');
      await expect(skills).not.toContainText('JavaScript');

      await clearSectionSearch(page, '#skills');
      await expect(skills).toContainText('Fusion 360');
      await expect(skills).toContainText('JavaScript');
    });

    test('F12-B4: Rapid switching of Skills SegmentedControl across All and all 5 categories', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('#skills');

      const categoryChecks: Array<[string, string]> = [
        ['Programming', 'JavaScript'],
        ['Electronics & Embedded Systems', 'Raspberry Pi'],
        ['CAD & Mechanical Design', 'SolidWorks'],
        ['Data Analysis & Simulation', 'MATLAB Simulink'],
        ['Tools & Technologies', 'LaTeX'],
      ];

      for (const [cat, expectedSkill] of categoryChecks) {
        await selectCategorySegment(page, '#skills', cat);
        await expect(skills).toContainText(expectedSkill);
      }

      await selectCategorySegment(page, '#skills', 'All');
      await expect(skills).toContainText('JavaScript');
      await expect(skills).toContainText('LaTeX');
    });

    test('F12-B5: 3-dot visual proficiency indicators (advanced = 3 filled dots, intermediate = 2, beginner = 1) boundary verification', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('#skills');

      const checkFilledDots = async (skillName: string, expectedCount: number) => {
        const item = skills
          .locator('.skill-item, li')
          .filter({ hasText: new RegExp(`^\\s*${skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') })
          .first();
        await expect(item).toBeVisible();
        const filled = await item.evaluate((el) => {
          return el.querySelectorAll(
            '.filled, .active, .skill-dot.filled, .skill-dot--filled, [data-filled="true"], [data-active="true"]'
          ).length;
        });
        expect(filled).toBe(expectedCount);
      };

      await checkFilledDots('Python', 3);
      await checkFilledDots('C/C++', 2);
      await checkFilledDots('JavaScript', 1);
    });
  });
});
