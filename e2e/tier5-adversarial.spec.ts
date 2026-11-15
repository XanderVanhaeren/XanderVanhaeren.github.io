import { test, expect } from '@playwright/test';
import {
  attachConsoleErrorTracker,
  gotoHomeReady,
  getNavTab,
  openGlassOpticsHud,
  getActiveGlassOpticsVars,
  selectCategorySegment,
  setSectionSearchQuery,
} from './helpers';

test.describe('Tier 5 — Adversarial Edge Cases & Hardening', () => {
  test('T5-01: Mobile nav drawer Escape closes drawer and returns focus to .nav-toggle, and Arrow/Home/End keys cycle links', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoHomeReady(page);

    const toggle = page.locator('#navbar .nav-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();

    const drawer = page.locator('#mobile-nav-drawer');
    await expect(drawer).toHaveClass(/open/);

    const links = drawer.locator('a');
    await expect(links.first()).toBeVisible();
    await links.first().focus();
    await expect(links.first()).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(links.nth(1)).toBeFocused();

    await page.keyboard.press('End');
    await expect(links.nth(3)).toBeFocused();

    await page.keyboard.press('Home');
    await expect(links.first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(drawer).not.toHaveClass(/open/);
    await expect(toggle).toBeFocused();

    tracker.assertClean();
  });

  test('T5-02: Navbar resize from mobile (drawer open) to desktop hides mobile drawer and restores desktop TabBar', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoHomeReady(page);

    await page.locator('#navbar .nav-toggle').click();
    await expect(page.locator('#mobile-nav-drawer')).toHaveClass(/open/);

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('#mobile-nav-drawer')).toBeHidden();
    await expect(getNavTab(page, 'Projects')).toBeVisible();

    tracker.assertClean();
  });

  test('T5-03: Scroll-spy updates active TabBar tab when scrolling to #projects and #skills', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoHomeReady(page);

    await page.locator('#projects').evaluate((el) =>
      el.scrollIntoView({ block: 'start', behavior: 'instant' })
    );
    await expect(getNavTab(page, 'Projects')).toHaveAttribute('aria-selected', 'true', {
      timeout: 5000,
    });

    await page.locator('#skills').evaluate((el) =>
      el.scrollIntoView({ block: 'start', behavior: 'instant' })
    );
    await expect(getNavTab(page, 'Skills')).toHaveAttribute('aria-selected', 'true', {
      timeout: 5000,
    });

    tracker.assertClean();
  });

  test('T5-04: GlassOpticsHud presets Menu, outside-click dismissal, and Escape focus return', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page);
    await gotoHomeReady(page);

    await openGlassOpticsHud(page);
    const trigger = page.locator('#navbar .optics-hud-trigger');
    const presetsBtn = page.getByRole('button', { name: 'Optics presets' });
    await presetsBtn.click();

    await page.getByText('High Refraction').click();
    let vars = await getActiveGlassOpticsVars(page);
    expect(vars.blur).toBe('22px');
    expect(vars.bend).toBe('2.6');
    expect(vars.dispersion).toBe('1.2');

    await presetsBtn.click();
    await page.getByText('Subtle Frosted').click();
    vars = await getActiveGlassOpticsVars(page);
    expect(vars.blur).toBe('8px');
    expect(vars.bend).toBe('0.6');

    // Escape closes popover and returns focus to trigger
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Liquid Glass Optics' })).toBeHidden();
    await expect(trigger).toBeFocused();

    // Outside click dismisses popover
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'Liquid Glass Optics' })).toBeVisible();
    await page.locator('#hero-heading').click({ force: true });
    await expect(page.getByRole('dialog', { name: 'Liquid Glass Optics' })).toBeHidden();

    tracker.assertClean();
  });

  test('T5-05: App URL query-param preservation (foo=bar) on modal close and live hashchange/popstate sync', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page);
    await gotoHomeReady(page, '/?project=typhoon&foo=bar');

    const modal = page.locator('#project-modal');
    await expect(modal).toBeVisible();

    await page.locator('#project-modal-close').click();
    await expect(modal).toBeHidden();
    expect(page.url()).toContain('foo=bar');
    expect(page.url()).not.toContain('project=typhoon');

    // Live hashchange opens and closes modal
    await page.evaluate(() => {
      window.location.hash = '#projects/typhoon';
    });
    await expect(modal).toBeVisible();

    await page.evaluate(() => {
      window.location.hash = '#about';
    });
    await expect(modal).toBeHidden();

    // Popstate sync
    await page.evaluate(() => {
      window.history.pushState(null, '', '/?project=typhoon&foo=bar');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(modal).toBeVisible();

    tracker.assertClean();
  });

  test('T5-06: ProjectsSection & SkillsSection .filter-empty Clear Filters recovery restores all items', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page);
    await gotoHomeReady(page);

    // ProjectsSection Clear Filters
    await selectCategorySegment(page, '#projects', 'Robotics');
    await setSectionSearchQuery(page, '#projects', 'xyznonexistent999');
    const projectsEmpty = page.locator('#projects .filter-empty');
    await expect(projectsEmpty).toBeVisible();
    await projectsEmpty.getByRole('button', { name: 'Clear Filters' }).click();
    await expect(page.locator('#projects .project-card')).toHaveCount(3);

    // SkillsSection Clear Filters
    await selectCategorySegment(page, '#skills', 'Programming');
    await setSectionSearchQuery(page, '#skills', 'xyznonexistent999');
    const skillsEmpty = page.locator('#skills .filter-empty');
    await expect(skillsEmpty).toBeVisible();
    await skillsEmpty.getByRole('button', { name: 'Clear Filters' }).click();
    await expect(page.locator('#skills .skill-category')).toHaveCount(5);
    await expect(page.locator('#skills .skill-item')).toHaveCount(16);

    tracker.assertClean();
  });

  test('T5-07: Project card keyboard activation (Enter & Space) and inner link guard', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page);
    await gotoHomeReady(page);

    const card = page.getByRole('button', {
      name: 'Open Project Typhoon engineering article',
    });
    const modal = page.locator('#project-modal');

    await card.focus();
    await expect(card).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(modal).toBeVisible();
    await page.locator('#project-modal-close').click();
    await expect(modal).toBeHidden();

    await card.focus();
    await expect(card).toBeFocused();
    await card.press('Space');
    await expect(modal).toBeVisible();
    await page.locator('#project-modal-close').click();
    await expect(modal).toBeHidden();

    // Inner link guard: Ctrl+Click on read-more link does not open in-page modal
    const readMore = page.getByRole('link', {
      name: 'Read full engineering article →',
    });
    await readMore.evaluate((el) => {
      const ev = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        button: 0,
      });
      el.dispatchEvent(ev);
    });
    await expect(modal).toBeHidden();

    tracker.assertClean();
  });

  test('T5-08: Header-only and duplicate-category skills.csv payloads are handled cleanly', async ({
    page,
  }) => {
    const tracker = attachConsoleErrorTracker(page);

    // Header-only CSV falls back to DEFAULT_SKILLS_DATA (5 categories, 16 skills)
    await page.route('**/assets/data/skills.csv', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: 'category;skill;level\n',
      });
    });
    await gotoHomeReady(page);
    await expect(page.locator('#skills .skill-category')).toHaveCount(5);
    await expect(page.locator('#skills .skill-item')).toHaveCount(16);

    // Duplicate-category CSV merges non-adjacent rows into single category
    await page.unroute('**/assets/data/skills.csv');
    await page.route('**/assets/data/skills.csv', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: [
          'category;skill;level',
          'Programming;Rust;advanced',
          'Tools;Docker;intermediate',
          'Programming;Go;beginner',
        ].join('\n'),
      });
    });
    await gotoHomeReady(page);
    await expect(page.locator('#skills .skill-category')).toHaveCount(2);
    await expect(page.locator('#skills .skill-item')).toHaveCount(3);
    const progCard = page
      .locator('#skills .skill-category')
      .filter({ hasText: 'Programming' });
    await expect(progCard.locator('.skill-item')).toHaveCount(2);

    tracker.assertClean();
  });
});
