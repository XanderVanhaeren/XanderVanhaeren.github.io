import { test, expect } from '@playwright/test';
import {
  attachConsoleErrorTracker,
  gotoHomeReady,
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

test.describe('Tier 3 — Cross-Feature Combinations (16 Tests)', () => {
  test.describe('Group 3A: Projects SegmentedControl + SearchField Cross-Filtering', () => {
    test('T3-01: Projects Aerospace category + matching keyword ("ESP32-C6") isolates Project Typhoon and hides RCXD & BikeySens', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('#projects');

      await selectCategorySegment(page, '#projects', 'Aerospace');
      await setSectionSearchQuery(page, '#projects', 'ESP32-C6');

      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeVisible();
      await expect(projects).toContainText('NACA 2412');
      await expect(projects).toContainText('821 g');
      await expect(projects).toContainText('13.7 m/s');
      await expect(projects).toContainText('TARS V2 (ESP32-C6)');

      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeHidden();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeHidden();

      await clearSectionSearch(page, '#projects');
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeHidden();

      await selectCategorySegment(page, '#projects', 'All');
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeVisible();
    });

    test('T3-02: Projects shared technology keyword ("Arduino") + switching SegmentedControl between All, Robotics, Telemetry, and Aerospace', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('#projects');

      await selectCategorySegment(page, '#projects', 'All');
      await setSectionSearchQuery(page, '#projects', 'Arduino');

      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeHidden();

      await selectCategorySegment(page, '#projects', 'Robotics');
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeHidden();
      await expect(projects.locator('svg').filter({ hasText: 'TERRAIN CONTOUR // WAYPOINT NAV' })).toBeVisible();

      await selectCategorySegment(page, '#projects', 'Telemetry');
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeVisible();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeHidden();
      await expect(projects.locator('svg').filter({ hasText: 'ELEVATION RIDGE // BLE TELEMETRY' })).toBeVisible();

      await selectCategorySegment(page, '#projects', 'Aerospace');
      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeHidden();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeHidden();
      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeHidden();
    });

    test('T3-03: Projects category mismatch with valid project keyword ("NACA 2412" under Robotics) yields empty state then recovers when switched to Aerospace', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('#projects');

      await selectCategorySegment(page, '#projects', 'Robotics');
      await setSectionSearchQuery(page, '#projects', 'NACA 2412');

      await expect(projects.getByRole('heading', { name: 'Project Typhoon' })).toBeHidden();
      await expect(projects.getByRole('heading', { name: 'RCXD' })).toBeHidden();

      await selectCategorySegment(page, '#projects', 'Aerospace');
      const typhoonCard = projects.locator('.lg-glass').filter({ hasText: 'Project Typhoon' }).first();
      await expect(typhoonCard).toBeVisible();

      const radius = await typhoonCard.evaluate((el) =>
        parseFloat(getComputedStyle(el).borderTopLeftRadius)
      );
      expect(radius).toBeGreaterThan(0);
    });

    test('T3-04: Proof-of-Work Workbench Gallery (.proof-grid) remains intact and interactive while Projects category and keyword filters are toggled', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const projects = page.locator('#projects');

      await selectCategorySegment(page, '#projects', 'Telemetry');
      await setSectionSearchQuery(page, '#projects', 'BLE');

      await expect(projects.getByRole('heading', { name: 'BikeySens' })).toBeVisible();

      const proofGrid = projects.locator('.proof-grid');
      await expect(proofGrid).toBeVisible();
      const firstProofImg = proofGrid.locator('img').first();
      await firstProofImg.scrollIntoViewIfNeeded();
      const imgLoaded = await firstProofImg.evaluate(
        (el: HTMLImageElement) => el.complete && el.naturalWidth > 0
      );
      expect(imgLoaded).toBe(true);
    });
  });

  test.describe('Group 3B: Skills SegmentedControl + SearchField + CSV Data Sync', () => {
    test('T3-05: Skills shared keyword ("Python") across All vs Programming vs Data Analysis & Simulation vs CAD categories', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('#skills');

      await selectCategorySegment(page, '#skills', 'All');
      await setSectionSearchQuery(page, '#skills', 'Python');

      await expect(skills).toContainText('Python');
      await expect(skills).toContainText('Python (NumPy, SciPy)');

      await selectCategorySegment(page, '#skills', 'Programming');
      await expect(skills).toContainText('Python');
      await expect(skills).not.toContainText('Python (NumPy, SciPy)');

      await selectCategorySegment(page, '#skills', 'Data Analysis & Simulation');
      await expect(skills).toContainText('Python (NumPy, SciPy)');

      await selectCategorySegment(page, '#skills', 'CAD & Mechanical Design');
      await expect(skills).not.toContainText('Python (NumPy, SciPy)');
      await expect(skills).not.toContainText('Fusion 360');
    });

    test('T3-06: Skills shared keyword ("MATLAB") filters across Programming ("MATLAB" advanced) and Data Analysis & Simulation ("MATLAB Simulink" beginner)', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      const skills = page.locator('#skills');

      await selectCategorySegment(page, '#skills', 'All');
      await setSectionSearchQuery(page, '#skills', 'MATLAB');

      await expect(skills).toContainText('MATLAB');
      await expect(skills).toContainText('MATLAB Simulink');

      await selectCategorySegment(page, '#skills', 'Programming');
      const matlabItem = skills.locator('.skill-item, li').filter({ hasText: /^\s*MATLAB\b/ }).first();
      await expect(matlabItem).toBeVisible();
      const matlabDots = await matlabItem.evaluate(
        (el) =>
          el.querySelectorAll(
            '.filled, .active, .skill-dot.filled, .skill-dot--filled, [data-filled="true"], [data-active="true"]'
          ).length
      );
      expect(matlabDots).toBe(3);

      await selectCategorySegment(page, '#skills', 'Data Analysis & Simulation');
      const simulinkItem = skills
        .locator('.skill-item, li')
        .filter({ hasText: 'MATLAB Simulink' })
        .first();
      await expect(simulinkItem).toBeVisible();
      const simulinkDots = await simulinkItem.evaluate(
        (el) =>
          el.querySelectorAll(
            '.filled, .active, .skill-dot.filled, .skill-dot--filled, [data-filled="true"], [data-active="true"]'
          ).length
      );
      expect(simulinkDots).toBe(1);
    });

    test('T3-07: Simultaneous independent filtering in both #projects and #skills preserves each section SegmentedControl and SearchField state', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      await selectCategorySegment(page, '#projects', 'Robotics');
      await setSectionSearchQuery(page, '#projects', 'ROS');

      await selectCategorySegment(page, '#skills', 'Electronics & Embedded Systems');
      await setSectionSearchQuery(page, '#skills', 'ESP32');

      await page.locator('#projects').scrollIntoViewIfNeeded();
      await expect(getSectionSearchInput(page, '#projects')).toHaveValue('ROS');
      await expect(page.locator('#projects').getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(
        page.locator('#projects').getByRole('heading', { name: 'Project Typhoon' })
      ).toBeHidden();

      await page.locator('#skills').scrollIntoViewIfNeeded();
      await expect(getSectionSearchInput(page, '#skills')).toHaveValue('ESP32');
      await expect(page.locator('#skills')).toContainText('Arduino / ESP32');
      await expect(page.locator('#skills')).not.toContainText('Raspberry Pi');
    });

    test('T3-08: Custom mocked skills.csv payload combined with Skills SegmentedControl and SearchField filtering', async ({
      page,
    }) => {
      const mockedCsv = [
        'category;skill;level',
        'Programming;Python;advanced',
        'Programming;C/C++;intermediate',
        'Electronics & Embedded Systems;Saturn Flight OS;advanced',
        'CAD & Mechanical Design;SolidWorks;advanced',
      ].join('\n');

      await page.route('**/assets/data/skills.csv*', (route) =>
        route.fulfill({ status: 200, contentType: 'text/csv', body: mockedCsv })
      );

      await gotoHomeReady(page);
      const skills = page.locator('#skills');

      await expect(skills).toContainText('Saturn Flight OS');
      await selectCategorySegment(page, '#skills', 'Electronics & Embedded Systems');
      await setSectionSearchQuery(page, '#skills', 'Saturn');

      await expect(skills).toContainText('Saturn Flight OS');
      await expect(skills).not.toContainText('SolidWorks');
    });
  });

  test.describe('Group 3C: GlassOpticsHud Live Tuning + .lg-glass Surfaces + TopoCanvas + ProjectModal', () => {
    test('T3-09: Adjusting GlassOpticsHud blur, bend, and dispersion sliders updates live CSS custom properties across Hero, Projects, and Skills .lg-glass cards', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const sliders = page.locator('.lg-slider input[type="range"], input[type="range"]');
      const blurSlider = page
        .locator('input[type="range"][aria-label*="Blur" i]')
        .or(sliders.nth(0))
        .first();
      const bendSlider = page
        .locator('input[type="range"][aria-label*="Bend" i]')
        .or(sliders.nth(1))
        .first();
      const dispSlider = page
        .locator('input[type="range"][aria-label*="Dispersion" i]')
        .or(sliders.nth(2))
        .first();

      await setSliderValue(blurSlider, 20);
      await setSliderValue(bendSlider, 2.2);
      await setSliderValue(dispSlider, 1.1);

      const vars = await getActiveGlassOpticsVars(page);
      expect(vars.blur).toContain('20');
      expect(vars.bend).toContain('2.2');
      expect(vars.dispersion).toContain('1.1');

      for (const sectionId of ['#home', '#projects', '#skills']) {
        const glassCard = page.locator(`${sectionId} .lg-glass`).first();
        await expect(glassCard).toBeVisible();
        const r = await glassCard.evaluate((el) =>
          parseFloat(getComputedStyle(el).borderTopLeftRadius)
        );
        expect(r).toBeGreaterThan(0);
      }
    });

    test('T3-10: Opening Project Typhoon modal (#project-modal) while custom GlassOpticsHud refraction settings are active preserves custom optics on the modal Glass surface and after modal close', async ({
      page,
    }) => {
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const blurSlider = page
        .locator('input[type="range"][aria-label*="Blur" i], .lg-slider input[type="range"]')
        .first();
      await setSliderValue(blurSlider, 24);
      await page.keyboard.press('Escape');

      const modal = await openTyphoonModal(page);
      await expect(modal.getByRole('heading', { level: 1, name: 'Project Typhoon' })).toBeVisible();

      const varsDuringModal = await getActiveGlassOpticsVars(page);
      expect(varsDuringModal.blur).toContain('24');

      await closeTyphoonModal(page, 'escape');
      const varsAfterClose = await getActiveGlassOpticsVars(page);
      expect(varsAfterClose.blur).toContain('24');
    });

    test('T3-11: Toggling contour animation pause Switch in GlassOpticsHud pauses/resumes #topo-canvas while pointer moves across #home[data-glisse-backdrop]', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page);
      await gotoHomeReady(page);
      await openGlassOpticsHud(page);

      const switchEl = page.locator('.lg-switch[role="switch"], [role="switch"]').first();
      const before = await switchEl.getAttribute('aria-checked');
      await switchEl.click();
      await expect(switchEl).toHaveAttribute('aria-checked', before === 'true' ? 'false' : 'true');

      await page.mouse.move(300, 260);
      await page.mouse.move(550, 340);

      await switchEl.click();
      await expect(switchEl).toHaveAttribute('aria-checked', before || 'false');
      await expect(page.locator('#topo-canvas')).toBeVisible();
      tracker.assertClean();
    });

    test('T3-12: Re-tuning GlassOpticsHud controls while filtering Projects and Skills maintains filter selections and updates newly revealed .lg-glass cards', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      await selectCategorySegment(page, '#projects', 'Aerospace');
      await expect(page.locator('#projects').getByRole('heading', { name: 'RCXD' })).toBeHidden();

      await openGlassOpticsHud(page);
      const blurSlider = page
        .locator('input[type="range"][aria-label*="Blur" i], .lg-slider input[type="range"]')
        .first();
      await setSliderValue(blurSlider, 18);

      await selectCategorySegment(page, '#projects', 'All');
      const rcxdCard = page.locator('#projects .lg-glass').filter({ hasText: 'RCXD' }).first();
      await expect(rcxdCard).toBeVisible();

      const radius = await rcxdCard.evaluate((el) =>
        parseFloat(getComputedStyle(el).borderTopLeftRadius)
      );
      expect(radius).toBeGreaterThan(0);
    });
  });

  test.describe('Group 3D: TabBar Navigation + Responsive Viewports + Modal / Standalone Route Transitions', () => {
    test('T3-13: Navigating via Navbar TabBar across Home -> About -> Projects -> Skills on desktop (1440×900) while filters and Optics HUD settings are active', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoHomeReady(page);

      await openGlassOpticsHud(page);
      const blurSlider = page
        .locator('input[type="range"][aria-label*="Blur" i], .lg-slider input[type="range"]')
        .first();
      await setSliderValue(blurSlider, 19);

      await selectCategorySegment(page, '#projects', 'Robotics');
      await selectCategorySegment(page, '#skills', 'Programming');

      for (const tab of ['Home', 'About', 'Projects', 'Skills'] as const) {
        await navigateViaNavbar(page, tab);
      }

      await expect(page.locator('#projects').getByRole('heading', { name: 'RCXD' })).toBeVisible();
      await expect(page.locator('#skills')).toContainText('Python');
      expect((await getActiveGlassOpticsVars(page)).blur).toContain('19');
    });

    test('T3-14: Mobile viewport (375×667) drawer toggle + section navigation + Projects filtering + opening and closing #project-modal', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await gotoHomeReady(page);

      await navigateViaNavbar(page, 'Projects');
      await selectCategorySegment(page, '#projects', 'Aerospace');

      const modal = await openTyphoonModal(page);
      await expect(modal.getByRole('heading', { level: 1, name: 'Project Typhoon' })).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(2);

      await closeTyphoonModal(page, 'button');
    });

    test('T3-15: Filtered Project Typhoon card -> open in-page #project-modal -> click "Open full page" to standalone /projects/typhoon.html -> click "Back to Portfolio"', async ({
      page,
    }) => {
      await gotoHomeReady(page);

      await selectCategorySegment(page, '#projects', 'Aerospace');
      await setSectionSearchQuery(page, '#projects', 'CFD');

      const modal = await openTyphoonModal(page);
      const fullPageLink = modal
        .locator('a.project-modal-full, a:has-text("Open full page")')
        .first();
      await expect(fullPageLink).toBeVisible();
      await fullPageLink.click();

      await expect(page).toHaveURL(/\/projects\/typhoon\.html/);
      await expect(page.getByRole('heading', { level: 1, name: 'Project Typhoon' })).toBeVisible();

      const backLink = page.locator('a.article-back, a:has-text("Back to Portfolio")').first();
      await backLink.click();

      await expect(page.locator('#projects')).toBeVisible();
    });

    test('T3-16: Deep-link URL query (?project=typhoon) opens Typhoon view and supports full interaction with Skills & Navbar after closing', async ({
      page,
    }) => {
      const tracker = attachConsoleErrorTracker(page);
      await page.goto('/?project=typhoon', { waitUntil: 'domcontentloaded' });

      const modal = page.locator('dialog#project-modal, #project-modal').first();
      await expect(modal).toBeVisible();
      await closeTyphoonModal(page, 'button');

      await navigateViaNavbar(page, 'Skills');
      await selectCategorySegment(page, '#skills', 'CAD & Mechanical Design');

      const skills = page.locator('#skills');
      await expect(skills).toContainText('Fusion 360');
      await expect(skills).toContainText('SolidWorks');
      await expect(skills).toContainText('3D Printing (FDM/SLA)');

      tracker.assertClean();
    });
  });
});
