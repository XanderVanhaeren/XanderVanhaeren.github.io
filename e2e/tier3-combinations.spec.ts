import { expect, test } from '@playwright/test';
import {
  PROJECTS_CONTRACT,
  VIEWPORTS,
  assertAllImagesLoaded,
  assertDarkMinimalTokens,
  assertDesktopEvenGrid,
  assertHoverGrowShrink,
  assertNoHorizontalOverflow,
  assertPhoneSingleColumnStack,
  assertTabletReferenceGrid,
  attachDiagnostics,
  closeProjectOverlay,
  getCanvasBackgroundColor,
  getTile,
  getTileBoxes,
  gotoArticleReady,
  gotoHomeReady,
  hoverAndSettle,
  openProjectOverlay,
  resetHoverToRest,
  waitForTilesSettled,
} from './helpers';

test.describe('Tier 3 — Cross-Feature Combinations', () => {
  test('T3-01: desktop hover grow/shrink -> click typhoon -> overlay -> article -> back to rest grid', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const rest = await getTileBoxes(page);
    const hovered = await hoverAndSettle(page, 'typhoon');
    assertHoverGrowShrink(rest, hovered, 'typhoon');

    await getTile(page, 'typhoon').click();
    const dialog = page.locator('dialog[open]').first();
    await expect(dialog).toBeVisible();
    await dialog.locator('a[href="/projects/typhoon.html"]').first().click();

    await page.waitForURL('**/projects/typhoon.html');
    await expect(page.locator('[data-article="typhoon"]')).toBeVisible();
    await assertAllImagesLoaded(page.locator('[data-article="typhoon"]'));

    await page.locator('[data-article="typhoon"] a[href="/"]').first().click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/index.html');
    await waitForTilesSettled(page);
    assertDesktopEvenGrid(await getTileBoxes(page));
    diag.assertClean();
  });

  test('T3-02: tablet 768x1024 reference grid -> bikeysens overlay -> article -> back preserves tablet ratios', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.tabletPortrait);
    assertTabletReferenceGrid(await getTileBoxes(page));

    const dialog = await openProjectOverlay(page, 'bikeysens', 'click');
    await dialog.locator('a[href="/projects/bikeysens.html"]').first().click();
    await page.waitForURL('**/projects/bikeysens.html');
    await expect(page.locator('[data-article="bikeysens"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.locator('[data-article="bikeysens"] a[href="/"]').first().click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/index.html');
    await waitForTilesSettled(page);
    assertTabletReferenceGrid(await getTileBoxes(page));
    diag.assertClean();
  });

  test('T3-03: phone 375x812 stack -> scroll to rcxd -> overlay -> article -> back with zero overflow', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.phoneCompact);
    await assertPhoneSingleColumnStack(page, await getTileBoxes(page));

    const rcxdTile = getTile(page, 'rcxd');
    await rcxdTile.scrollIntoViewIfNeeded();
    const dialog = await openProjectOverlay(page, 'rcxd', 'click');
    await dialog.locator('a[href="/projects/rcxd.html"]').first().click();

    await page.waitForURL('**/projects/rcxd.html');
    await expect(page.locator('[data-article="rcxd"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.locator('[data-article="rcxd"] a[href="/"]').first().click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/index.html');
    await assertPhoneSingleColumnStack(page, await waitForTilesSettled(page));
    diag.assertClean();
  });

  test('T3-04: keyboard-only flow (Enter -> Escape -> Enter -> full article link -> back link)', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopStandard);

    await openProjectOverlay(page, 'typhoon', 'enter');
    await closeProjectOverlay(page, 'escape');

    const dialog = await openProjectOverlay(page, 'rcxd', 'enter');
    const articleLink = dialog.locator('a[href="/projects/rcxd.html"]').first();
    await articleLink.focus();
    await page.keyboard.press('Enter');

    await page.waitForURL('**/projects/rcxd.html');
    await expect(page.locator('[data-article="rcxd"]')).toBeVisible();

    const backLink = page.locator('[data-article="rcxd"] a[href="/"]').first();
    await backLink.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/index.html');
    await expect(page.locator('[data-project]')).toHaveCount(4);
    diag.assertClean();
  });

  test('T3-05: prefers-reduced-motion: reduce + hover team-214 + overlay + article navigation', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);

    await hoverAndSettle(page, 'team-214');
    const dialog = await openProjectOverlay(page, 'team-214', 'click');
    await dialog.locator('a[href="/projects/team-214.html"]').first().click();

    await page.waitForURL('**/projects/team-214.html');
    await expect(page.locator('[data-article="team-214"]')).toBeVisible();
    await assertAllImagesLoaded(page.locator('[data-article="team-214"]'));
    diag.assertClean();
  });

  test('T3-06: open overlay at 1440x900, resize to 375x812 while open, close overlay, verify phone stack', async ({
    page,
  }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const dialog = await openProjectOverlay(page, 'typhoon', 'click');

    await page.setViewportSize(VIEWPORTS.phoneCompact);
    await expect(dialog).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await closeProjectOverlay(page, 'button');
    const phoneBoxes = await waitForTilesSettled(page);
    await assertPhoneSingleColumnStack(page, phoneBoxes);
  });

  test('T3-07: open & close all 4 overlays via button, Escape, backdrop, button, then re-verify hover physics', async ({
    page,
  }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);

    await openProjectOverlay(page, 'typhoon', 'click');
    await closeProjectOverlay(page, 'button');

    await openProjectOverlay(page, 'bikeysens', 'click');
    await closeProjectOverlay(page, 'escape');

    await openProjectOverlay(page, 'rcxd', 'click');
    await closeProjectOverlay(page, 'backdrop');

    await openProjectOverlay(page, 'team-214', 'click');
    await closeProjectOverlay(page, 'button');

    const rest = await resetHoverToRest(page);
    assertDesktopEvenGrid(rest);
    const hovered = await hoverAndSettle(page, 'bikeysens');
    assertHoverGrowShrink(rest, hovered, 'bikeysens');
  });

  test('T3-08: 1280x800 hover all 4 tiles sequentially and verify imagery & zero network errors', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopStandard);
    const rest = await getTileBoxes(page);
    assertDesktopEvenGrid(rest);

    for (const { slug } of PROJECTS_CONTRACT) {
      const hovered = await hoverAndSettle(page, slug);
      assertHoverGrowShrink(rest, hovered, slug);
      await resetHoverToRest(page);
    }

    await assertAllImagesLoaded(page);
    diag.assertClean();
  });

  test('T3-09: direct load /projects/typhoon.html -> back home -> team-214 overlay -> /projects/team-214.html', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await gotoArticleReady(page, 'typhoon', VIEWPORTS.desktopLarge);
    await page.locator('[data-article="typhoon"] a[href="/"]').first().click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/index.html');
    await expect(page.locator('[data-project]')).toHaveCount(4);

    const dialog = await openProjectOverlay(page, 'team-214', 'click');
    await dialog.locator('a[href="/projects/team-214.html"]').first().click();
    await page.waitForURL('**/projects/team-214.html');
    await expect(page.locator('[data-article="team-214"]')).toBeVisible();
    diag.assertClean();
  });

  test('T3-10: dark minimal #1B1B1B / #FFFFFF visual consistency across /, open <dialog>, and all 4 articles', async ({
    page,
  }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    await assertDarkMinimalTokens(page);

    const dialog = await openProjectOverlay(page, 'typhoon', 'click');
    const dlgStyles = await dialog.evaluate((el) => {
      const isNonTransparent = (bg: string): boolean => Boolean(bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent');
      const parseRgb = (color: string): [number, number, number] | null => {
        const m = color.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/i);
        return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
      };

      const surfaceEls = [el, ...Array.from(el.children)].filter((node) => {
        if (['BUTTON', 'A', 'IMG', 'SVG'].includes(node.tagName)) return false;
        const rect = node.getBoundingClientRect();
        return rect.width > 50 && rect.height > 50 && isNonTransparent(getComputedStyle(node).backgroundColor);
      });
      const surfaceBgs =
        surfaceEls.length > 0
          ? surfaceEls.map((node) => getComputedStyle(node).backgroundColor)
          : [getComputedStyle(el).backgroundColor];
      const surfaceRgbs = surfaceBgs.map(parseRgb);

      const primaryTextEl = el.querySelector('h1, h2, h3') ?? el.querySelector('p, div, span');
      const textColors = [
        getComputedStyle(el).color,
        ...(primaryTextEl ? [getComputedStyle(primaryTextEl).color] : []),
      ];

      return { surfaceBgs, surfaceRgbs, textColors };
    });

    expect(dlgStyles.surfaceRgbs.every(Boolean), `Dialog surface backgrounds must be valid RGB`).toBe(true);
    for (let i = 0; i < dlgStyles.surfaceRgbs.length; i++) {
      const rgb = dlgStyles.surfaceRgbs[i];
      if (rgb) {
        const [r, g, b] = rgb;
        expect(
          Math.max(r, g, b),
          `Dialog surface "${dlgStyles.surfaceBgs[i]}" must be dark (#1B1B1B/#222222)`,
        ).toBeLessThanOrEqual(64);
      }
    }
    expect(
      dlgStyles.textColors.includes('rgb(255, 255, 255)'),
      `Expected #FFFFFF primary text color on <dialog> or its visible heading/content (got ${dlgStyles.textColors.join(', ')})`,
    ).toBe(true);
    await closeProjectOverlay(page, 'button');

    for (const { slug } of PROJECTS_CONTRACT) {
      await gotoArticleReady(page, slug, VIEWPORTS.desktopLarge);
      const bg = await getCanvasBackgroundColor(page);
      expect(bg).toBe('rgb(27, 27, 27)');
      const h1Color = await page.locator(`[data-article="${slug}"] h1`).first().evaluate((el) => getComputedStyle(el).color);
      expect(h1Color).toBe('rgb(255, 255, 255)');
    }
  });
});
