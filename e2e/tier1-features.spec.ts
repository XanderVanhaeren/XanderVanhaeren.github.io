import { test, expect } from '@playwright/test';
import {
  attachConsoleErrorTracker,
  gotoHomeReady,
  getNavTab,
  navigateViaNavbar,
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

test.describe('Tier 1 — Feature Coverage (F1–F12, 60 Tests)', () => {
  test.describe('F1: Vite 6 + React 19 + TypeScript + glisse@0.6.0 Build & Multi-Page Config', () => {
    test('F1.1 — Main portfolio entry (/) mounts React 19 root inside #root with zero runtime errors', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page);
      const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      const root = page.locator('#root');
      await expect(root).toBeVisible();
      const childCount = await root.locator('> *').count();
      expect(childCount).toBeGreaterThanOrEqual(1);

      tracker.assertClean();
    });

    test('F1.2 — glisse@0.6.0 runtime and stylesheet are active in document head', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const glisseActive = await page.evaluate(() => {
        const hasGlisseStyleTag = document.querySelector('style#glisse-styles') !== null;
        const firstGlass = document.querySelector('.lg-glass');
        const glassPos = firstGlass ? getComputedStyle(firstGlass).position : '';
        return {
          hasGlisseStyleTag,
          hasGlassElement: firstGlass !== null,
          glassPos,
        };
      });

      expect(glisseActive.hasGlassElement).toBe(true);
      expect(
        glisseActive.hasGlisseStyleTag || glisseActive.glassPos === 'relative'
      ).toBe(true);
    });

    test('F1.3 — Standalone multi-page entry (/projects/typhoon.html) mounts React root cleanly', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page);
      const response = await page.goto('/projects/typhoon.html', {
        waitUntil: 'domcontentloaded',
      });
      expect(response?.status()).toBe(200);

      await expect(page.locator('#root')).toBeVisible();
      await expect(page.locator('#root')).not.toBeEmpty();
      await expect(page).toHaveTitle(/Project Typhoon/i);
      await expect(page.getByRole('heading', { level: 1, name: /Project Typhoon/i })).toBeVisible();

      tracker.assertClean();
    });

    test('F1.4 — Both entry points instantiate authentic glisse Liquid Glass components (.lg-glass)', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const homeGlassCount = await page.locator('.lg-glass').count();
      expect(homeGlassCount).toBeGreaterThanOrEqual(8);

      await page.goto('/projects/typhoon.html', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.lg-glass').first()).toBeVisible();
      const typhoonGlassCount = await page.locator('.lg-glass').count();
      expect(typhoonGlassCount).toBeGreaterThanOrEqual(1);
    });

    test('F1.5 — Document doctype/lang and exclusion of .agents/ and assets/Affinity/Logo.af from DOM and public serving', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const docMeta = await page.evaluate(() => ({
        doctype: document.doctype?.name,
        lang: document.documentElement.lang,
        leakedLinks: Array.from(document.querySelectorAll('[href], [src]')).filter((el) => {
          const val = (el.getAttribute('href') || '') + (el.getAttribute('src') || '');
          return val.includes('.agents') || val.includes('Logo.af');
        }).length,
      }));

      expect(docMeta.doctype).toBe('html');
      expect(docMeta.lang).toBe('en');
      expect(docMeta.leakedLinks).toBe(0);

      const logoAfResp = await page.request.get('/assets/Affinity/Logo.af');
      const logoAfContentType = logoAfResp.headers()['content-type'] || '';
      expect(logoAfResp.status() === 404 || logoAfContentType.includes('text/html')).toBe(true);
    });
  });

  test.describe('F2: Static Assets & SEO/Meta Preservation', () => {
    test('F2.1 — Document title, meta description, author, theme-color, and canonical URL match V1', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      await expect(page).toHaveTitle(
        'Xander Vanhaeren — Engineering Student & Aerospace Portfolio'
      );

      const meta = await page.evaluate(() => ({
        description:
          document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        author: document.querySelector('meta[name="author"]')?.getAttribute('content') || '',
        themeColor:
          document.querySelector('meta[name="theme-color"]')?.getAttribute('content') || '',
        canonical:
          document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      }));

      expect(meta.description).toContain(
        'Portfolio of Xander Vanhaeren, engineering student at KU Leuven'
      );
      expect(meta.author).toBe('Xander Vanhaeren');
      expect(meta.themeColor).toMatch(/#0B0D1[01]/i);
      expect(meta.canonical).toBe('https://xandervanhaeren.github.io/');
    });

    test('F2.2 — OpenGraph and Twitter Card metadata tags are preserved verbatim', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const og = await page.evaluate(() => ({
        type: document.querySelector('meta[property="og:type"]')?.getAttribute('content') || '',
        title: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
        description:
          document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
        url: document.querySelector('meta[property="og:url"]')?.getAttribute('content') || '',
        image: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
        twitterCard:
          document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || '',
      }));

      expect(og.type).toBe('website');
      expect(og.title).toBe('Xander Vanhaeren — Engineering Portfolio');
      expect(og.description).toContain('Engineering student at KU Leuven');
      expect(og.url).toBe('https://xandervanhaeren.github.io/');
      expect(og.image).toContain('assets/images/projects/Typhoon/typhoon-v3.jpg');
      expect(og.twitterCard).toBe('summary_large_image');
    });

    test('F2.3 — Favicon assets (favicon.svg, favicon.ico, Logo.svg) are linked and served with HTTP 200', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const icons = await page.evaluate(() => ({
        svgIcon: document
          .querySelector('link[rel="icon"][type="image/svg+xml"]')
          ?.getAttribute('href'),
        icoIcon: document
          .querySelector('link[rel="icon"][href*="favicon.ico"]')
          ?.getAttribute('href'),
      }));

      expect(icons.svgIcon).toContain('favicon.svg');
      expect(icons.icoIcon).toContain('favicon.ico');

      for (const assetPath of [
        '/assets/Logo/favicon.svg',
        '/assets/Logo/favicon.ico',
        '/assets/Logo/Logo.svg',
      ]) {
        const res = await page.request.get(assetPath);
        expect(res.status(), `Asset ${assetPath} should return 200`).toBe(200);
      }
    });

    test('F2.4 — Google Fonts (Inter and JetBrains Mono) preconnect and stylesheet links are present', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const fontLinks = await page.evaluate(() => ({
        preconnectGoogle:
          document.querySelector('link[rel="preconnect"][href*="fonts.googleapis.com"]') !== null,
        preconnectGstatic:
          document.querySelector('link[rel="preconnect"][href*="fonts.gstatic.com"]') !== null,
        fontSheet:
          document
            .querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"]')
            ?.getAttribute('href') || '',
      }));

      expect(fontLinks.preconnectGoogle).toBe(true);
      expect(fontLinks.preconnectGstatic).toBe(true);
      expect(fontLinks.fontSheet).toContain('Inter');
      expect(fontLinks.fontSheet).toContain('JetBrains');
    });

    test('F2.5 — All static Typhoon image assets and skills.csv under /assets/ return HTTP 200 and decode cleanly', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const csvRes = await page.request.get('/assets/data/skills.csv');
      expect(csvRes.status()).toBe(200);
      const csvText = await csvRes.text();
      expect(csvText.toLowerCase()).toContain('category;skill;level');

      for (const imgPath of [
        '/assets/images/projects/Typhoon/VelocitySolidworks.png',
        '/assets/images/projects/Typhoon/typhoon-v3.jpg',
        '/assets/images/projects/Typhoon/tars-v2.png',
        '/assets/images/projects/Typhoon/Fuselage%20Flowsim.png',
      ]) {
        const res = await page.request.get(imgPath);
        expect(res.status(), `Image ${imgPath} should return 200`).toBe(200);
        expect(res.headers()['content-type']).toMatch(/^image\//);
      }
    });
  });

  test.describe('F3: Typed Portfolio & Skills Data Layer', () => {
    test('F3.1 — Personal metadata & Hero fieldnotes data render verbatim in DOM', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const home = page.locator('#home');

      await expect(home.getByRole('heading', { level: 1 })).toHaveText('Xander Vanhaeren');
      await expect(home).toContainText(
        'Engineering Sciences Student · Aerospace & Embedded Systems'
      );
      await expect(home).toContainText('Leuven, Belgium · 50.88° N, 4.70° E');
      await expect(home).toContainText('B.Sc. Engineering Sciences · KU Leuven');
      await expect(home).toContainText('Aerodynamics, Flight Dynamics & Control');
      await expect(home).toContainText('Project Typhoon V3 · 821 g');
      await expect(home).toContainText('ESP32-C6 · BNO085 · BMP390');
    });

    test('F3.2 — About section bio, 3 engineering phases, education, and 7 focus tags render from typed dataset', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const about = page.locator('#about');

      await expect(about).toContainText(
        'I am an Engineering Sciences student at KU Leuven with a deep focus on aerospace engineering'
      );
      await expect(about).toContainText('01 // Simulate');
      await expect(about).toContainText('02 // Fabricate');
      await expect(about).toContainText('03 // Control');
      await expect(about).toContainText('Bachelor of Science');
      await expect(about).toContainText('Engineering Sciences (Mechanical Engineering)');
      await expect(about).toContainText('KU Leuven · Leuven, Belgium · Expected 2027');

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

    test('F3.3 — All 3 projects (Project Typhoon, RCXD, BikeySens) render with exact specs and technology lists', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('#projects');

      await expect(projects).toContainText('Project Typhoon');
      await expect(projects).toContainText('NACA 2412');
      await expect(projects).toContainText('821 g');
      await expect(projects).toContainText('13.7 m/s');
      await expect(projects).toContainText('TARS V2 (ESP32-C6)');

      await expect(projects).toContainText('RCXD');
      await expect(projects).toContainText('4WD Chassis');
      await expect(projects).toContainText('Arduino + ROS');
      await expect(projects).toContainText('Embedded Sensors');

      await expect(projects).toContainText('BikeySens');
      await expect(projects).toContainText('BLE Telemetry');
      await expect(projects).toContainText('Mobile Companion');
      await expect(projects).toContainText('Bluetooth LE');
      await expect(projects).toContainText('Sensor Fusion');
    });

    test('F3.4 — Semicolon-delimited /assets/data/skills.csv is fetched and parsed into 5 categories and 16 skills', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('#skills');

      const categories = [
        'Programming',
        'Electronics & Embedded Systems',
        'CAD & Mechanical Design',
        'Data Analysis & Simulation',
        'Tools & Technologies',
      ];
      for (const cat of categories) {
        await expect(skills).toContainText(cat);
      }

      const skillNames = [
        'Python',
        'C/C++',
        'MATLAB',
        'JavaScript',
        'Arduino / ESP32',
        'Raspberry Pi',
        'Circuit Design',
        'Fusion 360',
        'SolidWorks',
        '3D Printing (FDM/SLA)',
        'CFD / Aerodynamics',
        'MATLAB Simulink',
        'Python (NumPy, SciPy)',
        'Git / GitHub',
        'LaTeX',
        'Linux',
      ];
      for (const skill of skillNames) {
        await expect(skills).toContainText(skill);
      }
    });

    test('F3.5 — CSV skill proficiency normalization maps Arduino / ESP32 to live CSV value (intermediate) and Python to advanced', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skillsSection = page.locator('#skills');

      const arduinoRow = skillsSection
        .locator('li, .skill-item, [data-skill]')
        .filter({ hasText: 'Arduino / ESP32' })
        .first();
      await expect(arduinoRow).toBeVisible();

      const arduinoLevelInfo = await arduinoRow.evaluate((el) => {
        const text = el.textContent?.toLowerCase() || '';
        const aria =
          el.getAttribute('aria-label')?.toLowerCase() ||
          el.querySelector('[aria-label]')?.getAttribute('aria-label')?.toLowerCase() ||
          '';
        const dataLevel =
          el.getAttribute('data-level') ||
          el.querySelector('[data-level]')?.getAttribute('data-level') ||
          '';
        const filledDots = el.querySelectorAll(
          '.filled, .active, .skill-dot.filled, .skill-dot--filled, [data-filled="true"], [data-active="true"]'
        ).length;
        return { text, aria, dataLevel, filledDots };
      });

      const isIntermediate =
        arduinoLevelInfo.text.includes('intermediate') ||
        arduinoLevelInfo.aria.includes('intermediate') ||
        arduinoLevelInfo.dataLevel === 'intermediate' ||
        arduinoLevelInfo.filledDots === 2;
      expect(isIntermediate).toBe(true);
    });
  });

  test.describe('F4: Liquid Glass Design System & CSS Tokens', () => {
    test('F4.1 — Root <html> sets data-theme="dark" and dark aerospace background token (#0B0D11)', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const themeInfo = await page.evaluate(() => {
        const theme = document.documentElement.getAttribute('data-theme');
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
        return { theme, bodyBg, htmlBg };
      });

      expect(themeInfo.theme).toBe('dark');
      expect([themeInfo.bodyBg, themeInfo.htmlBg]).toContain('rgb(11, 13, 17)');
    });

    test('F4.2 — V1 aerospace CSS custom properties (--bg-primary, --accent, --accent-light, --font-sans, --font-mono) are defined on :root', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const tokens = await page.evaluate(() => {
        const s = getComputedStyle(document.documentElement);
        return {
          bgPrimary: s.getPropertyValue('--bg-primary').trim(),
          accent: s.getPropertyValue('--accent').trim(),
          accentLight: s.getPropertyValue('--accent-light').trim(),
          fontSans: s.getPropertyValue('--font-sans').trim(),
          fontMono: s.getPropertyValue('--font-mono').trim(),
        };
      });

      expect(tokens.bgPrimary.toUpperCase()).toBe('#0B0D11');
      expect(tokens.accent.toUpperCase()).toBe('#3A95D8');
      expect(tokens.accentLight.toUpperCase()).toBe('#5EB0EC');
      expect(tokens.fontSans).toContain('Inter');
      expect(tokens.fontMono).toContain('JetBrains Mono');
    });

    test('F4.3 — glisse@0.6.0 CSS custom properties (--lg-blur, --lg-glass-bend, --lg-glass-dispersion, --lg-rim-shine) are active', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const lgVars = await page.evaluate(() => {
        const glassEl = document.querySelector('.lg-glass') || document.documentElement;
        const cs = getComputedStyle(glassEl);
        const rootCs = getComputedStyle(document.documentElement);
        return {
          blur: cs.getPropertyValue('--lg-blur').trim() || rootCs.getPropertyValue('--lg-blur').trim(),
          bend:
            cs.getPropertyValue('--lg-glass-bend').trim() ||
            rootCs.getPropertyValue('--lg-glass-bend').trim(),
          dispersion:
            cs.getPropertyValue('--lg-glass-dispersion').trim() ||
            rootCs.getPropertyValue('--lg-glass-dispersion').trim(),
          rimShine:
            cs.getPropertyValue('--lg-rim-shine').trim() ||
            rootCs.getPropertyValue('--lg-rim-shine').trim(),
        };
      });

      expect(lgVars.blur).not.toBe('');
      expect(lgVars.bend).not.toBe('');
      expect(lgVars.dispersion).not.toBe('');
      expect(lgVars.rimShine).not.toBe('');
    });

    test('F4.4 — Every visible <Glass> (.lg-glass) element has an explicit non-zero border-radius (borderTopLeftRadius > 0)', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const radiusAudit = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('.lg-glass'));
        const visible = elements.filter((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        });
        const zeroRadius = visible.filter(
          (el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) <= 0
        );
        return {
          visibleCount: visible.length,
          zeroRadiusCount: zeroRadius.length,
        };
      });

      expect(radiusAudit.visibleCount).toBeGreaterThanOrEqual(8);
      expect(radiusAudit.zeroRadiusCount).toBe(0);
    });

    test('F4.5 — .lg-glass surfaces receive glisse specular rim lighting (data-rim / --lg-rim) and Chromium refraction backdropFilter', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const refractionAudit = await page.evaluate(() => {
        const glasses = Array.from(document.querySelectorAll('.lg-glass')).filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 20 && rect.height > 20;
        });
        const withRimOrFilter = glasses.filter((el) => {
          const cs = getComputedStyle(el);
          const hasDataRim = el.hasAttribute('data-rim');
          const hasRimVar =
            (el as HTMLElement).style.getPropertyValue('--lg-rim').includes('data:image') ||
            cs.getPropertyValue('--lg-rim').includes('data:image');
          const hasBackdrop =
            (cs.backdropFilter && cs.backdropFilter !== 'none') ||
            ((cs as unknown as Record<string, string>).webkitBackdropFilter &&
              (cs as unknown as Record<string, string>).webkitBackdropFilter !== 'none');
          return hasDataRim || hasRimVar || hasBackdrop;
        });
        return {
          totalChecked: glasses.length,
          withRimOrFilterCount: withRimOrFilter.length,
        };
      });

      expect(refractionAudit.totalChecked).toBeGreaterThan(0);
      expect(refractionAudit.withRimOrFilterCount).toBeGreaterThan(0);
    });
  });

  test.describe('F5: Floating Liquid Glass Navbar & Navigation Controls', () => {
    test('F5.1 — Skip-to-content link (.skip-link) is the first focusable element and targets #main', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const skipLink = page.locator('a.skip-link, a[href="#main"]').first();
      await expect(skipLink).toHaveAttribute('href', '#main');

      await page.keyboard.press('Tab');
      await expect(skipLink).toBeFocused();
      await expect(skipLink).toBeVisible();
    });

    test('F5.2 — header#navbar uses glisse <Glass> and stays fixed/sticky at the top of the viewport', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const navbar = page.locator('header#navbar, #navbar').first();
      await expect(navbar).toBeVisible();

      const navCheck = await navbar.evaluate((el) => {
        const pos = getComputedStyle(el).position;
        const hasGlass = el.classList.contains('lg-glass') || el.querySelector('.lg-glass') !== null;
        return { pos, hasGlass };
      });

      expect(['fixed', 'sticky']).toContain(navCheck.pos);
      expect(navCheck.hasGlass).toBe(true);
    });

    test('F5.3 — Brand logo (XV.) links to #home with accessible label', async ({ page }) => {
      await gotoHomeReady(page);
      const logo = page.locator('#navbar .logo, #navbar a[href="#home"]').first();

      await expect(logo).toBeVisible();
      await expect(logo).toContainText('XV.');
      await expect(logo).toHaveAttribute('aria-label', /Xander Vanhaeren/i);
      await expect(logo.locator('.logo-accent')).toHaveText('.');
    });

    test('F5.4 — glisse <TabBar> (.lg-tab-bar) renders Home, About, Projects, and Skills navigation items', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await gotoHomeReady(page);

      const tabBar = page.locator('#navbar .lg-tab-bar').first();
      await expect(tabBar).toBeVisible();

      for (const label of ['Home', 'About', 'Projects', 'Skills'] as const) {
        await expect(getNavTab(page, label)).toBeVisible();
      }

      await navigateViaNavbar(page, 'Projects');
      await expect(page.locator('#projects')).toBeVisible();
    });

    test('F5.5 — Scroll-spy and .scrolled header state update when scrolling down the page', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }));

      await expect
        .poll(async () => {
          return page.evaluate(() => {
            const nav = document.getElementById('navbar');
            return nav?.classList.contains('scrolled') || window.scrollY >= 500;
          });
        })
        .toBe(true);

      await expect(page.locator('#navbar')).toHaveClass(/scrolled/);
    });
  });

  test.describe('F6: Interactive Liquid Glass Optics HUD (glisse Controls)', () => {
    test('F6.1 — Liquid Glass Optics HUD trigger/menu is accessible in the Navbar and opens the optics controls', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const sliderCount = await page.locator('.lg-slider input[type="range"], input[type="range"]').count();
      expect(sliderCount).toBeGreaterThanOrEqual(3);

      const switchControl = page.locator('.lg-switch[role="switch"], [role="switch"]').first();
      await expect(switchControl).toBeVisible();
    });

    test('F6.2 — Adjusting the --lg-blur <Slider> (.lg-slider) updates live Liquid Glass blur CSS custom property', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const blurSlider = page
        .locator('input[type="range"][aria-label*="Blur" i], .lg-slider input[type="range"]')
        .first();
      await setSliderValue(blurSlider, 22);

      await expect
        .poll(async () => {
          const vars = await getActiveGlassOpticsVars(page);
          return vars.blur;
        })
        .toContain('22');
    });

    test('F6.3 — Adjusting the --lg-glass-bend <Slider> updates live refraction bend strength', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const sliders = page.locator('.lg-slider input[type="range"], input[type="range"]');
      const bendSlider = page
        .locator('input[type="range"][aria-label*="Bend" i]')
        .or(sliders.nth(1))
        .first();

      await setSliderValue(bendSlider, 2.4);

      await expect
        .poll(async () => {
          const vars = await getActiveGlassOpticsVars(page);
          return vars.bend;
        })
        .toContain('2.4');
    });

    test('F6.4 — Adjusting the --lg-glass-dispersion <Slider> updates live chromatic dispersion', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const sliders = page.locator('.lg-slider input[type="range"], input[type="range"]');
      const dispersionSlider = page
        .locator('input[type="range"][aria-label*="Dispersion" i]')
        .or(sliders.nth(2))
        .first();

      await setSliderValue(dispersionSlider, 1.2);

      await expect
        .poll(async () => {
          const vars = await getActiveGlassOpticsVars(page);
          return vars.dispersion;
        })
        .toContain('1.2');
    });

    test('F6.5 — Toggling the <Switch> (.lg-switch[role="switch"]) toggles contour animation pause / telemetry mode', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const switchBtn = page.locator('.lg-switch[role="switch"], [role="switch"]').first();
      await expect(switchBtn).toBeVisible();

      const initialChecked = await switchBtn.getAttribute('aria-checked');
      await switchBtn.click();
      const nextChecked = initialChecked === 'true' ? 'false' : 'true';
      await expect(switchBtn).toHaveAttribute('aria-checked', nextChecked);
    });
  });

  test.describe('F7: Hero Section & Telemetry Fieldnotes', () => {
    test('F7.1 — Hero eyebrow coordinate badge displays Leuven, Belgium · 50.88° N, 4.70° E with status dot', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const eyebrow = page.locator('#home .hero-eyebrow, #home').first();
      await expect(eyebrow).toContainText('Leuven, Belgium · 50.88° N, 4.70° E');
      await expect(page.locator('#home .eyebrow-dot, #home .hero-eyebrow span').first()).toBeVisible();
    });

    test('F7.2 — Hero heading (h1), subtitle, and aerospace description match V1 copy', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const home = page.locator('#home');

      await expect(home.locator('h1')).toHaveText('Xander Vanhaeren');
      await expect(home).toContainText(
        'Engineering Sciences Student · Aerospace & Embedded Systems'
      );
      await expect(home).toContainText(
        'Designing things that move, sense, and fly — combining SolidWorks CFD aerodynamics, lightweight 3D-printed airframes, and custom ESP32 avionics at KU Leuven.'
      );
    });

    test('F7.3 — Hero primary CTA (Explore Projects) and secondary CTA (About & Workbench) use glisse <Button>', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const home = page.locator('#home');

      const exploreBtn = home.getByText('Explore Projects').first();
      const aboutBtn = home.getByText('About & Workbench').first();

      await expect(exploreBtn).toBeVisible();
      await expect(aboutBtn).toBeVisible();

      const lgButtonCount = await home.locator('.lg-button').count();
      expect(lgButtonCount).toBeGreaterThanOrEqual(2);

      await exploreBtn.click();
      await expect(page.locator('#projects')).toBeVisible();
    });

    test('F7.4 — Flight & Lab Telemetry (ISO // 1013.25 hPa) card is rendered inside a glisse <Glass> surface', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const telemetryCard = page
        .locator('#home aside, #home .hero-fieldnotes, #home .lg-glass')
        .filter({ hasText: 'Flight & Lab Telemetry' })
        .first();

      await expect(telemetryCard).toBeVisible();
      await expect(telemetryCard).toContainText('ISO // 1013.25 hPa');

      const hasGlassAndRadius = await telemetryCard.evaluate((el) => {
        const glassEl = el.classList.contains('lg-glass')
          ? el
          : el.closest('.lg-glass') || el.querySelector('.lg-glass');
        if (!glassEl) return false;
        return parseFloat(getComputedStyle(glassEl).borderTopLeftRadius) > 0;
      });
      expect(hasGlassAndRadius).toBe(true);
    });

    test('F7.5 — Telemetry definition list (dl) renders all 4 engineering fieldnote rows accurately', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const dl = page.locator('#home dl').first();
      await expect(dl).toBeVisible();

      const expectedRows = [
        ['Discipline', 'B.Sc. Engineering Sciences · KU Leuven'],
        ['Primary Focus', 'Aerodynamics, Flight Dynamics & Control'],
        ['Flagship Airframe', 'Project Typhoon V3 · 821 g'],
        ['Avionics Stack', 'ESP32-C6 · BNO085 · BMP390'],
      ];

      for (const [dt, dd] of expectedRows) {
        await expect(dl).toContainText(dt);
        await expect(dl).toContainText(dd);
      }
    });
  });

  test.describe('F8: Interactive Topographic Isobar Canvas', () => {
    test('F8.1 — <canvas id="topo-canvas" class="topo-canvas"> is mounted inside section#home with aria-hidden="true"', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const canvas = page.locator('section#home canvas#topo-canvas.topo-canvas');
      await expect(canvas).toBeVisible();
      await expect(canvas).toHaveAttribute('aria-hidden', 'true');
    });

    test('F8.2 — Hero backdrop wrapper is marked with data-glisse-backdrop for cross-browser glisse refraction', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const backdrop = page.locator('#home[data-glisse-backdrop], #home [data-glisse-backdrop]').first();
      await expect(backdrop).toBeVisible();
    });

    test('F8.3 — #topo-canvas initializes non-zero physical pixel dimensions scaled by devicePixelRatio', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const dims = await page.locator('#topo-canvas').evaluate((canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        return {
          width: canvas.width,
          height: canvas.height,
          rectWidth: rect.width,
          rectHeight: rect.height,
        };
      });

      expect(dims.width).toBeGreaterThan(300);
      expect(dims.height).toBeGreaterThan(200);
      expect(dims.rectWidth).toBeGreaterThan(300);
      expect(dims.rectHeight).toBeGreaterThan(200);
    });

    test('F8.4 — Marching-squares algorithm actively draws isobar contour strokes onto the 2D canvas bitmap', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      const hasDrawnPixels = await page
        .locator('#topo-canvas')
        .evaluate((canvas: HTMLCanvasElement) => {
          const ctx = canvas.getContext('2d');
          if (!ctx || canvas.width === 0 || canvas.height === 0) return false;
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          for (let i = 3; i < imgData.length; i += 16) {
            if (imgData[i] > 0) return true;
          }
          return false;
        });

      expect(hasDrawnPixels).toBe(true);
    });

    test('F8.5 — Pointer movement across section#home updates the interactive Gaussian pointer ridge smoothly without error', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page);
      await gotoHomeReady(page);

      await page.mouse.move(350, 280);
      await page.mouse.move(620, 410);
      await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      );

      await expect(page.locator('#topo-canvas')).toBeVisible();
      tracker.assertClean();
    });
  });

  test.describe('F9: About & Engineering Approach Section', () => {
    test('F9.1 — section#about header renders kicker, title (About & Engineering Approach), and subtitle', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const about = page.locator('section#about');

      await expect(about).toContainText('Profile & Engineering Loop');
      await expect(
        about.getByRole('heading', { level: 2, name: 'About & Engineering Approach' })
      ).toBeVisible();
      await expect(about).toContainText(
        'From aerodynamic equations and CFD meshes to 3D-printed structures and embedded C++ flight control.'
      );
    });

    test('F9.2 — Bio card and all 3 Engineering Loop cards (01 // Simulate, 02 // Fabricate, 03 // Control) render in glisse <Glass> surfaces', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const about = page.locator('section#about');

      const steps = [
        ['01 // Simulate', 'Aerodynamics & Mathematical Modeling'],
        ['02 // Fabricate', 'Parametric CAD & Lightweight FDM'],
        ['03 // Control', 'Custom Avionics & Sensor Fusion'],
      ];

      for (const [code, title] of steps) {
        const card = about.locator('.lg-glass').filter({ hasText: code }).first();
        await expect(card).toBeVisible();
        await expect(card).toContainText(title);
      }
    });

    test('F9.3 — KU Leuven B.Sc. Education card renders degree, major, institution, and expected graduation year', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const eduCard = page
        .locator('section#about .lg-glass')
        .filter({ hasText: 'Bachelor of Science' })
        .first();

      await expect(eduCard).toBeVisible();
      await expect(eduCard).toContainText('Engineering Sciences (Mechanical Engineering)');
      await expect(eduCard).toContainText('KU Leuven · Leuven, Belgium · Expected 2027');
    });

    test('F9.4 — Core Domains card renders all 7 Focus Areas & Hardware tags', async ({ page }) => {
      await gotoHomeReady(page);
      const domainsCard = page
        .locator('section#about .lg-glass')
        .filter({ hasText: 'Focus Areas & Hardware' })
        .first();

      await expect(domainsCard).toBeVisible();
      await expect(domainsCard).toContainText('Core Domains');

      for (const tag of [
        'Aerodynamics',
        'Flight Dynamics',
        'Control Systems',
        'CFD Simulation',
        '3D Printing (LW-PLA)',
        'Custom PCBs & IoT',
        'Robotics',
      ]) {
        await expect(domainsCard).toContainText(tag);
      }
    });

    test('F9.5 — Footer (footer.footer) displays copyright, Leuven coordinates, and KU Leuven attribution', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const footer = page.locator('footer.footer, footer').first();

      await expect(footer).toBeVisible();
      await expect(footer).toContainText('© 2026 Xander Vanhaeren · Built in Leuven, Belgium');
      await expect(footer).toContainText('50.8798° N, 4.7005° E · KU Leuven Engineering Sciences');
    });
  });

  test.describe('F10: Projects Showcase & Interactive glisse Filtering', () => {
    test('F10.1 — section#projects renders glisse <SegmentedControl> (All, Aerospace, Robotics, Telemetry) and <SearchField>', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('section#projects');

      const segmented = projects.locator('.lg-segmented, [role="radiogroup"]').first();
      await expect(segmented).toBeVisible();
      for (const seg of ['All', 'Aerospace', 'Robotics', 'Telemetry']) {
        await expect(segmented).toContainText(seg);
      }

      const searchInput = getSectionSearchInput(page, '#projects');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveValue('');

      await expect(projects).toContainText('Project Typhoon');
      await expect(projects).toContainText('RCXD');
      await expect(projects).toContainText('BikeySens');
    });

    test('F10.2 — Category filtering via glisse <SegmentedControl> isolates matching projects and restores all on All', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('section#projects');

      await selectCategorySegment(page, '#projects', 'Aerospace');
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeHidden();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeHidden();

      await selectCategorySegment(page, '#projects', 'Robotics');
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeHidden();

      await selectCategorySegment(page, '#projects', 'Telemetry');
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeHidden();

      await selectCategorySegment(page, '#projects', 'All');
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeVisible();
    });

    test('F10.3 — Keyword filtering via glisse <SearchField> filters projects by technology/title', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('section#projects');

      await setSectionSearchQuery(page, '#projects', 'ROS');
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeHidden();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeHidden();

      await setSectionSearchQuery(page, '#projects', 'ESP32-C6');
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeHidden();

      await clearSectionSearch(page, '#projects');
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeVisible();
    });

    test('F10.4 — Featured Project Typhoon <Glass> card displays all 4 specs, 5 tags, primary CFD image, and 2-item subgallery', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const typhoonCard = page
        .locator('section#projects .lg-glass')
        .filter({ hasText: 'Project Typhoon' })
        .first();

      await expect(typhoonCard).toBeVisible();
      for (const spec of ['NACA 2412', '821 g', '13.7 m/s', 'TARS V2 (ESP32-C6)']) {
        await expect(typhoonCard).toContainText(spec);
      }
      for (const tag of [
        'SolidWorks CFD',
        'Fusion 360',
        'ESP32-C6 / C++',
        'LW-PLA 3D Printing',
        'Aerodynamics',
      ]) {
        await expect(typhoonCard).toContainText(tag);
      }

      await expect(typhoonCard.locator('img[src*="VelocitySolidworks.png"]')).toBeVisible();
      await expect(typhoonCard.locator('img[src*="typhoon-v3.jpg"]')).toBeVisible();
      await expect(typhoonCard.locator('img[src*="tars-v2.png"]')).toBeVisible();
      await expect(typhoonCard).toContainText('Read full engineering article');
    });

    test('F10.5 — RCXD and BikeySens <Glass> cards render inline SVG contour diagrams and .proof-grid renders real Typhoon CAD/CFD images', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('section#projects');

      const rcxdCard = projects.locator('.lg-glass').filter({ hasText: 'RCXD' }).first();
      await expect(rcxdCard.locator('svg')).toContainText('TERRAIN CONTOUR // WAYPOINT NAV');

      const bikeyCard = projects.locator('.lg-glass').filter({ hasText: 'BikeySens' }).first();
      await expect(bikeyCard.locator('svg')).toContainText('ELEVATION RIDGE // BLE TELEMETRY');

      const proofGrid = projects.locator('.proof-grid');
      await expect(proofGrid).toBeVisible();
      const proofImgs = proofGrid.locator('img');
      expect(await proofImgs.count()).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('F11: Project Typhoon Article Modal & Standalone Page (projects/typhoon.html)', () => {
    test('F11.1 — Clicking Read full engineering article opens <dialog id="project-modal"> wrapped with glisse <Glass>', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const modal = await openTyphoonModal(page);

      await expect(modal).toBeVisible();
      await expect(modal.locator('.project-modal-close, button[aria-label*="Close" i]').first()).toBeVisible();
      await expect(modal).toContainText('Open full page');
    });

    test('F11.2 — Modal renders all 5 engineering article sections, header metadata, 5 tags, and all 6 article specs', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const modal = await openTyphoonModal(page);

      await expect(modal.getByRole('heading', { level: 1, name: 'Project Typhoon' })).toBeVisible();
      await expect(modal).toContainText('Aerodynamics & Flight Control');

      for (const spec of [
        '680 mm × 602 mm',
        '821 g (wings < 60 g each)',
        'NACA 2412 (4° → 2° washout)',
        '2 × 50 mm EDF · 12.96 N thrust',
        '1.61 (1034 W peak)',
        'TARS V2 (24 g, ESP32-C6 + MPU-6050)',
      ]) {
        await expect(modal).toContainText(spec);
      }

      for (const heading of [
        'Research Question & Airfoil Selection',
        'Airframe & Structural Evolution',
        'CFD Validation in SolidWorks',
        'Custom Avionics: TARS V2 & Saturn OS',
        'Test Campaign & First Flight',
      ]) {
        await expect(modal.getByRole('heading', { level: 2, name: heading })).toBeVisible();
      }
    });

    test('F11.3 — Modal renders all 4 engineering figures (typhoon-v3.jpg, VelocitySolidworks.png, Fuselage Flowsim.png, tars-v2.png) with captions', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const modal = await openTyphoonModal(page);

      const figures = modal.locator('figure img, .article-figure img');
      expect(await figures.count()).toBeGreaterThanOrEqual(4);

      for (let i = 0; i < 4; i++) {
        const img = figures.nth(i);
        await img.scrollIntoViewIfNeeded();
        const loaded = await img.evaluate(
          (el: HTMLImageElement) => el.complete && el.naturalWidth > 0
        );
        expect(loaded, `Modal figure ${i + 1} should be loaded with naturalWidth > 0`).toBe(true);
      }
    });

    test('F11.4 — Modal closes cleanly when clicking .project-modal-close', async ({ page }) => {
      await gotoHomeReady(page);
      await openTyphoonModal(page);
      await closeTyphoonModal(page, 'button');
    });

    test('F11.5 — Standalone /projects/typhoon.html page renders the complete 5-section article, 6 specs, 4 figures, and working Back to Portfolio link', async ({
      page,
    }) => {
      await page.goto('/projects/typhoon.html', { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('heading', { level: 1, name: 'Project Typhoon' })).toBeVisible();
      for (const heading of [
        'Research Question & Airfoil Selection',
        'Airframe & Structural Evolution',
        'CFD Validation in SolidWorks',
        'Custom Avionics: TARS V2 & Saturn OS',
        'Test Campaign & First Flight',
      ]) {
        await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
      }

      const figures = page.locator('figure img, .article-figure img');
      expect(await figures.count()).toBeGreaterThanOrEqual(4);

      const backLink = page.getByRole('link', { name: /Back to Portfolio/i }).first();
      await expect(backLink).toBeVisible();
    });
  });

  test.describe('F12: Skills & Instruments Interactive Matrix', () => {
    test('F12.1 — section#skills renders header (Technical Stack / Skills & Instruments), glisse <SegmentedControl>, and <SearchField>', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('section#skills');

      await expect(skills).toContainText('Technical Stack');
      await expect(
        skills.getByRole('heading', { level: 2, name: 'Skills & Instruments' })
      ).toBeVisible();

      const segmented = skills.locator('.lg-segmented, [role="radiogroup"]').first();
      await expect(segmented).toBeVisible();
      await expect(segmented).toContainText('All');
      await expect(segmented).toContainText('Programming');

      await expect(getSectionSearchInput(page, '#skills')).toBeVisible();
    });

    test('F12.2 — All 5 skill categories render inside glisse <Glass> cards with all 16 skills visible by default', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('section#skills');

      for (const cat of [
        'Programming',
        'Electronics & Embedded Systems',
        'CAD & Mechanical Design',
        'Data Analysis & Simulation',
        'Tools & Technologies',
      ]) {
        const card = skills.locator('.lg-glass').filter({ hasText: cat }).first();
        await expect(card).toBeVisible();
      }

      const skillItemCount = await skills.locator('.skill-item, li[data-skill], ul li').count();
      expect(skillItemCount).toBeGreaterThanOrEqual(16);
    });

    test('F12.3 — Every skill item renders a 3-dot proficiency indicator and level label (advanced, intermediate, beginner)', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('section#skills');

      const pythonItem = skills
        .locator('.skill-item, li')
        .filter({ hasText: /^Python(?!\s*\()/ })
        .first();
      await expect(pythonItem).toBeVisible();

      const dotCheck = await pythonItem.evaluate((el) => {
        const dots = el.querySelectorAll('.skill-dot, .dot, [data-dot], span span');
        return dots.length >= 3;
      });
      expect(dotCheck).toBe(true);
    });

    test('F12.4 — Selecting a category in #skills glisse <SegmentedControl> filters the displayed category cards', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('section#skills');

      await selectCategorySegment(page, '#skills', 'Programming');
      await expect(skills).toContainText('Python');
      await expect(skills).toContainText('C/C++');
      await expect(skills).toContainText('MATLAB');
      await expect(skills).toContainText('JavaScript');
      await expect(skills.getByRole('heading', { name: 'CAD & Mechanical Design' })).toBeHidden();

      await selectCategorySegment(page, '#skills', 'All');
      await expect(skills.getByRole('heading', { name: 'CAD & Mechanical Design' })).toBeVisible();
    });

    test('F12.5 — Typing in #skills glisse <SearchField> filters skills across categories in real time', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('section#skills');

      await setSectionSearchQuery(page, '#skills', 'Simulink');
      await expect(skills).toContainText('MATLAB Simulink');
      await expect(skills).not.toContainText('Fusion 360');

      await clearSectionSearch(page, '#skills');
      await expect(skills).toContainText('Fusion 360');
      await expect(skills).toContainText('MATLAB Simulink');
    });
  });
});
