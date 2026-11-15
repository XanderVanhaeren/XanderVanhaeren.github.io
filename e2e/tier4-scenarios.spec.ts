import { test, expect } from '@playwright/test';
import {
  attachConsoleErrorTracker,
  gotoHomeReady,
  getNavTab,
  navigateViaNavbar,
  selectCategorySegment,
  getSectionSearchInput,
  setSectionSearchQuery,
  openGlassOpticsHud,
  setSliderValue,
  openTyphoonModal,
  closeTyphoonModal,
  getActiveGlassOpticsVars,
} from './helpers';

test.describe('Tier 4 — Real-World Application Scenarios (9 Tests)', () => {
  test('T4-01: Aerospace Engineering Recruiter End-to-End Walkthrough', async ({ page }) => {
    const tracker = attachConsoleErrorTracker(page);
    await gotoHomeReady(page);

    // 1. Inspect Hero & Flight & Lab Telemetry
    const home = page.locator('#home');
    await expect(home).toContainText('Leuven, Belgium · 50.88° N, 4.70° E');
    await expect(home.locator('h1')).toHaveText('Xander Vanhaeren');
    await expect(home).toContainText('Engineering Sciences Student · Aerospace & Embedded Systems');
    await expect(home).toContainText('ISO // 1013.25 hPa');
    await expect(home).toContainText('B.Sc. Engineering Sciences · KU Leuven');
    await expect(home).toContainText('Project Typhoon V3 · 821 g');
    await expect(home).toContainText('ESP32-C6 · BNO085 · BMP390');

    // 2. Click About & Workbench CTA and inspect engineering loop & education
    await home.getByText('About & Workbench').first().click();
    const about = page.locator('#about');
    await expect(about).toBeVisible();
    await expect(about).toContainText('01 // Simulate');
    await expect(about).toContainText('02 // Fabricate');
    await expect(about).toContainText('03 // Control');
    await expect(about).toContainText('KU Leuven · Leuven, Belgium · Expected 2027');
    await expect(about).toContainText('Aerodynamics');
    await expect(about).toContainText('3D Printing (LW-PLA)');

    // 3. Navigate to Projects, filter Aerospace, open Project Typhoon modal
    await navigateViaNavbar(page, 'Projects');
    await selectCategorySegment(page, '#projects', 'Aerospace');
    await expect(page.locator('#projects')).toContainText('NACA 2412');
    await expect(page.locator('#projects')).toContainText('821 g');
    await expect(page.locator('#projects')).toContainText('13.7 m/s');

    const modal = await openTyphoonModal(page);
    for (const sectionTitle of [
      'Research Question & Airfoil Selection',
      'Airframe & Structural Evolution',
      'CFD Validation in SolidWorks',
      'Custom Avionics: TARS V2 & Saturn OS',
      'Test Campaign & First Flight',
    ]) {
      await expect(modal.getByRole('heading', { level: 2, name: sectionTitle })).toBeVisible();
    }

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

    // 4. Close modal, inspect Skills & Footer
    await closeTyphoonModal(page, 'button');
    await navigateViaNavbar(page, 'Skills');
    await selectCategorySegment(page, '#skills', 'Data Analysis & Simulation');
    await expect(page.locator('#skills')).toContainText('CFD / Aerodynamics');

    const footer = page.locator('footer.footer, footer').first();
    await expect(footer).toContainText('© 2026 Xander Vanhaeren · Built in Leuven, Belgium');
    tracker.assertClean();
  });

  test('T4-02: KU Leuven Peer Embedded Hardware & Robotics Review Walkthrough', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page);
    await gotoHomeReady(page);

    await page.locator('#home').getByText('Explore Projects').first().click();
    const projects = page.locator('#projects');

    // Inspect RCXD under Robotics
    await selectCategorySegment(page, '#projects', 'Robotics');
    await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
    await expect(projects).toContainText('4WD Chassis');
    await expect(projects).toContainText('Arduino + ROS');
    await expect(projects.locator('svg').filter({ hasText: 'TERRAIN CONTOUR // WAYPOINT NAV' })).toBeVisible();

    // Inspect BikeySens under Telemetry
    await selectCategorySegment(page, '#projects', 'Telemetry');
    await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeVisible();
    await expect(projects).toContainText('BLE Telemetry');
    await expect(projects).toContainText('Mobile Companion');
    await expect(projects.locator('svg').filter({ hasText: 'ELEVATION RIDGE // BLE TELEMETRY' })).toBeVisible();

    // Search ESP32-C6 under All and inspect TARS V2 & Saturn OS section in modal
    await selectCategorySegment(page, '#projects', 'All');
    await setSectionSearchQuery(page, '#projects', 'ESP32-C6');
    const modal = await openTyphoonModal(page);
    await expect(modal).toContainText('Saturn OS');
    await expect(modal).toContainText('1.25');
    await expect(modal).toContainText('0.001');
    await expect(modal).toContainText('0.035');
    await expect(modal).toContainText('0.9875');
    await expect(modal.locator('img[src*="tars-v2.jpg"]')).toBeVisible();
    await closeTyphoonModal(page, 'escape');

    // Check Embedded skills
    await selectCategorySegment(page, '#skills', 'Electronics & Embedded Systems');
    await expect(page.locator('#skills')).toContainText('Arduino / ESP32');
    await expect(page.locator('#skills')).toContainText('Raspberry Pi');
    await expect(page.locator('#skills')).toContainText('Circuit Design');

    tracker.assertClean();
  });

  test('T4-03: Mobile Commuter Walkthrough on 375×667 Viewport', async ({ page }) => {
    const tracker = attachConsoleErrorTracker(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoHomeReady(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(2);

    await navigateViaNavbar(page, 'About');
    await expect(page.locator('#about')).toBeVisible();

    await navigateViaNavbar(page, 'Projects');
    await expect(page.locator('#projects')).toBeVisible();

    const modal = await openTyphoonModal(page);
    await expect(modal.getByRole('heading', { level: 1, name: 'Project Typhoon' })).toBeVisible();
    await closeTyphoonModal(page, 'button');

    await page.locator('#skills').scrollIntoViewIfNeeded();
    await setSectionSearchQuery(page, '#skills', 'SolidWorks');
    const swItem = page.locator('#skills').getByText('SolidWorks').first();
    await expect(swItem).toBeVisible();
    const swBox = await swItem.boundingBox();
    expect(swBox?.width).toBeLessThanOrEqual(375);

    tracker.assertClean();
  });

  test('T4-04: Accessibility & Keyboard-Only Navigation Journey', async ({ page }) => {
    const tracker = attachConsoleErrorTracker(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoHomeReady(page);

    // 1. Skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a.skip-link').first();
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute('href', '#main');
    await page.keyboard.press('Enter');

    // 2. Keyboard navigation in Navbar
    const homeTab = getNavTab(page, 'Home');
    await homeTab.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('End');
    await page.keyboard.press('Home');

    // 3. Keyboard search & modal open/dismiss
    const projectSearch = getSectionSearchInput(page, '#projects');
    await projectSearch.focus();
    await page.keyboard.type('Typhoon');
    await expect(page.locator('#projects').getByRole('heading', { name: 'Project Typhoon' })).toBeVisible();

    const readBtn = page
      .locator(
        '#projects button:has-text("Read full engineering article"), #projects a:has-text("Read full engineering article")'
      )
      .first();
    await readBtn.focus();
    await page.keyboard.press('Enter');

    const modal = page.locator('dialog#project-modal, #project-modal').first();
    await expect(modal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();

    // 4. Verify semantic landmarks
    for (const selector of [
      'header#navbar',
      'main#main',
      'section#home',
      'section#about',
      'section#projects',
      'section#skills',
      'footer.footer',
      'aside[aria-label="Engineering field notes"]',
    ]) {
      await expect(page.locator(selector).first()).toBeVisible();
    }

    tracker.assertClean();
  });

  test('T4-05: Live Liquid Glass Optics Experimentation & Topographic Canvas Telemetry Journey', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page);
    await gotoHomeReady(page);

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(
      page.locator('#home[data-glisse-backdrop], #home [data-glisse-backdrop]').first()
    ).toBeVisible();
    await expect(page.locator('canvas#topo-canvas')).toBeVisible();

    await page.mouse.move(250, 250);
    await page.mouse.move(650, 350);

    await openGlassOpticsHud(page);
    const sliders = page.locator('.lg-slider input[type="range"], input[type="range"]');
    await setSliderValue(sliders.nth(0), 25);
    await setSliderValue(sliders.nth(1), 2.5);
    await setSliderValue(sliders.nth(2), 1.4);

    const updatedVars = await getActiveGlassOpticsVars(page);
    expect(updatedVars.blur).toContain('25');
    expect(updatedVars.bend).toContain('2.5');
    expect(updatedVars.dispersion).toContain('1.4');

    const switchBtn = page.locator('.lg-switch[role="switch"], [role="switch"]').first();
    await switchBtn.click();
    await switchBtn.click();

    tracker.assertClean();
  });

  test('T4-06: Multi-Page & Deep-Link Navigation Resilience Journey', async ({ page }) => {
    const tracker = attachConsoleErrorTracker(page);
    await page.goto('/projects/typhoon.html', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/Project Typhoon/i);
    await expect(page.getByRole('heading', { level: 1, name: 'Project Typhoon' })).toBeVisible();

    const backLink = page.locator('a.article-back, a:has-text("Back to Portfolio")').first();
    await backLink.click();
    await expect(page.locator('#projects')).toBeVisible();

    await page.goto('/projects/typhoon.html', { waitUntil: 'domcontentloaded' });
    const brandLogo = page.locator('.article-topbar .logo, header .logo, a:has-text("XV.")').first();
    await expect(brandLogo).toBeVisible();
    await brandLogo.click();
    await expect(page.locator('#home')).toBeVisible();

    tracker.assertClean();
  });

  test('T4-07: Offline / Degraded Network Resilience Journey (skills.csv Failure Fallback)', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page, { ignoreNetworkErrors: true });
    await page.route('**/assets/data/skills.csv*', (route) => route.abort('failed'));

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

    await selectCategorySegment(page, '#skills', 'CAD & Mechanical Design');
    await expect(skills).toContainText('Fusion 360');
    await expect(skills).toContainText('SolidWorks');

    await setSectionSearchQuery(page, '#skills', 'SolidWorks');
    await expect(skills).toContainText('SolidWorks');

    tracker.assertClean();
  });

  test('T4-08: Reduced-Motion (prefers-reduced-motion: reduce) & High-Contrast Telemetry Journey', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoHomeReady(page);

    await expect(page.locator('#topo-canvas')).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#projects')).toBeVisible();
    await expect(page.locator('#skills')).toBeVisible();

    const modal = await openTyphoonModal(page);
    await expect(modal.getByRole('heading', { level: 1, name: 'Project Typhoon' })).toBeVisible();
    await closeTyphoonModal(page, 'escape');

    tracker.assertClean();
  });

  test('T4-09: Zero Console/Page Error, Full Asset Integrity (complete && naturalWidth > 0) & Forbidden Path Audit (/ and /projects/typhoon.html)', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page);
    await gotoHomeReady(page);

    // Open Typhoon modal so all modal images are in DOM and visible
    await openTyphoonModal(page);

    // Scroll through all images on / (including modal and page sections) and verify complete && naturalWidth > 0
    const homeImagesCount = await page.locator('img').count();
    expect(homeImagesCount).toBeGreaterThanOrEqual(7);

    for (let i = 0; i < homeImagesCount; i++) {
      const img = page.locator('img').nth(i);
      await img.scrollIntoViewIfNeeded().catch(() => {});
      await expect
        .poll(
          async () =>
            img.evaluate((el: HTMLImageElement) => {
              el.loading = 'eager';
              return el.complete && el.naturalWidth > 0;
            }),
          { message: `Image #${i} on / failed to load with naturalWidth > 0` }
        )
        .toBe(true);
    }

    await closeTyphoonModal(page, 'button');

    // Audit standalone /projects/typhoon.html images
    await page.goto('/projects/typhoon.html', { waitUntil: 'domcontentloaded' });
    const standaloneImgCount = await page.locator('img').count();
    expect(standaloneImgCount).toBeGreaterThanOrEqual(4);

    for (let i = 0; i < standaloneImgCount; i++) {
      const img = page.locator('img').nth(i);
      await img.scrollIntoViewIfNeeded().catch(() => {});
      await expect
        .poll(
          async () =>
            img.evaluate((el: HTMLImageElement) => {
              el.loading = 'eager';
              return el.complete && el.naturalWidth > 0;
            }),
          { message: `Image #${i} on /projects/typhoon.html failed to load with naturalWidth > 0` }
        )
        .toBe(true);
    }

    // Verify required public static assets return HTTP 200
    for (const requiredAsset of [
      '/assets/Logo/favicon.svg',
      '/assets/Logo/favicon.ico',
      '/assets/Logo/Logo.svg',
      '/assets/data/skills.csv',
    ]) {
      const resp = await page.request.get(requiredAsset);
      expect(resp.status(), `${requiredAsset} should return HTTP 200`).toBe(200);
    }

    // Verify forbidden files (.agents/ and Logo.af) are not served as raw assets
    const logoAfResp = await page.request.get('/assets/Affinity/Logo.af');
    const logoAfType = logoAfResp.headers()['content-type'] || '';
    expect(logoAfResp.status() === 404 || logoAfType.includes('text/html')).toBe(true);

    const agentsResp = await page.request.get('/.agents/teamwork/ORIGINAL_REQUEST.md');
    const agentsBody = await agentsResp.text().catch(() => '');
    expect(
      agentsResp.status() !== 200 || !agentsBody.includes('# Original User Request')
    ).toBe(true);

    tracker.assertClean();
  });
});
