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
  getTileBoxes,
  gotoArticleReady,
  gotoHomeReady,
  hoverAndSettle,
  openProjectOverlay,
  resetHoverToRest,
  waitForTilesSettled,
} from './helpers';

test.describe('Tier 4 — Real-World Application Scenarios', () => {
  test('T4-01: desktop engineering recruiter walkthrough (identity, hover physics, Typhoon overlay & article)', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    await assertDarkMinimalTokens(page);

    await expect(page.locator('h1').first()).toContainText(/Xander/i);
    await expect(page.locator('h1').first()).toContainText(/Vanhaeren\./i);
    await expect(page.getByText(/Engineering Student/i).first()).toBeVisible();
    await expect(page.getByText(/KU Leuven/i).first()).toBeVisible();

    const rest = await getTileBoxes(page);
    assertDesktopEvenGrid(rest);

    for (const { slug } of PROJECTS_CONTRACT) {
      const hovered = await hoverAndSettle(page, slug);
      assertHoverGrowShrink(rest, hovered, slug);
      await resetHoverToRest(page);
    }

    const dialog = await openProjectOverlay(page, 'typhoon', 'click');
    await expect(dialog).toContainText('Project Typhoon');
    await dialog.locator('a[href="/projects/typhoon.html"]').first().click();

    await page.waitForURL('**/projects/typhoon.html');
    const article = page.locator('[data-article="typhoon"]');
    await expect(article).toBeVisible();
    await expect(article.locator('h1').first()).toContainText('Project Typhoon');
    await assertAllImagesLoaded(article);

    await article.locator('a[href="/"]').first().click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/index.html');
    await expect(page.locator('[data-project]')).toHaveCount(4);
    diag.assertClean();
  });

  test('T4-02: complete 4-project portfolio tour via overlay -> full article -> home', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopStandard);

    for (const project of PROJECTS_CONTRACT) {
      const dialog = await openProjectOverlay(page, project.slug, 'click');
      await expect(dialog).toContainText(project.title);
      await dialog.locator(`a[href="${project.route}"]`).first().click();

      await page.waitForURL(`**${project.route}`);
      const article = page.locator(`[data-article="${project.slug}"]`);
      await expect(article).toBeVisible();
      await expect(article.locator('h1').first()).toContainText(project.title);
      await assertAllImagesLoaded(article);

      await article.locator('a[href="/"]').first().click();
      await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/index.html');
      await expect(page.locator('[data-project]')).toHaveCount(4);
    }

    diag.assertClean();
  });

  test('T4-03: smartphone 390x844 commuter browsing (stacked feed, backdrop dismiss, article, zero overflow)', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.phoneModern);
    await assertPhoneSingleColumnStack(page, await getTileBoxes(page));

    await openProjectOverlay(page, 'bikeysens', 'click');
    await closeProjectOverlay(page, 'backdrop');

    const dialog = await openProjectOverlay(page, 'typhoon', 'click');
    await dialog.locator('a[href="/projects/typhoon.html"]').first().click();
    await page.waitForURL('**/projects/typhoon.html');
    await expect(page.locator('[data-article="typhoon"]')).toBeVisible();
    await assertAllImagesLoaded(page.locator('[data-article="typhoon"]'));
    await assertNoHorizontalOverflow(page);

    await page.locator('[data-article="typhoon"] a[href="/"]').first().click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/index.html');
    await assertPhoneSingleColumnStack(page, await waitForTilesSettled(page));
    diag.assertClean();
  });

  test('T4-04: tablet 820x1180 reference-layout inspection, Escape dismiss, and team-214 article', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.tabletAir);
    assertTabletReferenceGrid(await getTileBoxes(page));
    await assertNoHorizontalOverflow(page);

    await openProjectOverlay(page, 'rcxd', 'click');
    await closeProjectOverlay(page, 'escape');

    const dialog = await openProjectOverlay(page, 'team-214', 'click');
    await dialog.locator('a[href="/projects/team-214.html"]').first().click();
    await page.waitForURL('**/projects/team-214.html');
    const article = page.locator('[data-article="team-214"]');
    await expect(article).toBeVisible();
    await assertAllImagesLoaded(article);
    await assertNoHorizontalOverflow(page);
    diag.assertClean();
  });

  test('T4-05: full-site asset, route & media integrity audit across /, 4 overlays, and 4 articles', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    await assertAllImagesLoaded(page);

    for (const project of PROJECTS_CONTRACT) {
      await openProjectOverlay(page, project.slug, 'click');
      await closeProjectOverlay(page, 'button');
    }

    for (const project of PROJECTS_CONTRACT) {
      await gotoArticleReady(page, project.slug, VIEWPORTS.desktopLarge);
      await assertAllImagesLoaded(page.locator(`[data-article="${project.slug}"]`));
    }

    const legacyRequested = diag.requestedUrls.some((url) => /skills\.csv|Logo\.af|\.agents\//i.test(url));
    expect(legacyRequested).toBe(false);
    diag.assertClean();
  });

  test('T4-06: keyboard and semantic accessibility audit across home, overlay, and articles', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);

    await expect(page.locator('h1')).toHaveCount(1);
    for (const project of PROJECTS_CONTRACT) {
      const tile = page.locator(`[data-project="${project.slug}"]`);
      const tag = await tile.evaluate((el) => el.tagName.toLowerCase());
      expect(tag).toBe('a');
      await expect(tile).toHaveAttribute('href', project.route);
      const ariaLabel = await tile.getAttribute('aria-label');
      expect((ariaLabel ?? '').toLowerCase()).toContain(project.title.toLowerCase());
    }

    const dialog = await openProjectOverlay(page, 'typhoon', 'enter');
    const labelledBy = await dialog.getAttribute('aria-labelledby');
    expect(labelledBy && labelledBy.trim().length > 0).toBe(true);
    await closeProjectOverlay(page, 'escape');

    for (const project of PROJECTS_CONTRACT) {
      await gotoArticleReady(page, project.slug, VIEWPORTS.desktopLarge);
      const article = page.locator(`[data-article="${project.slug}"]`);
      await expect(article.locator('h1')).toHaveCount(1);
      await expect(article.locator('a[href="/"]').first()).toBeVisible();
      await assertAllImagesLoaded(article);
    }

    diag.assertClean();
  });

  test('T4-07: shared deep-link arrival on /projects/rcxd.html -> back home -> explore typhoon overlay', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await gotoArticleReady(page, 'rcxd', VIEWPORTS.desktopLarge);
    const article = page.locator('[data-article="rcxd"]');
    await expect(article.locator('h1').first()).toContainText('RCXD');
    await assertAllImagesLoaded(article);

    await article.locator('a[href="/"]').first().click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/index.html');
    await waitForTilesSettled(page);
    assertDesktopEvenGrid(await getTileBoxes(page));

    const dialog = await openProjectOverlay(page, 'typhoon', 'click');
    await expect(dialog).toContainText('Project Typhoon');
    await closeProjectOverlay(page, 'button');
    diag.assertClean();
  });

  test('T4-08: upgraded usability flow (GitHub link, hover caption, ?preview URL & Back sync, Prev/Next stepper, TOC & figure lightbox)', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);

    // 1. Sidebar profile & tool links
    const ghLink = page.getByRole('link', { name: 'GitHub' });
    await expect(ghLink).toBeVisible();
    await expect(ghLink).toHaveAttribute('href', 'https://github.com/XanderVanhaeren');
    await expect(page.getByRole('link', { name: 'PDF Converter' })).toBeVisible();

    // 2. Pure photography at rest, title caption revealed on desktop hover
    const bikeysensTile = page.locator('[data-project="bikeysens"]');
    const caption = bikeysensTile.locator('.project-tile__caption');
    const restOpacity = await caption.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
    expect(restOpacity).toBe(0);

    await hoverAndSettle(page, 'bikeysens');
    await expect
      .poll(async () => caption.evaluate((el) => parseFloat(getComputedStyle(el).opacity)))
      .toBeGreaterThan(0.95);
    await resetHoverToRest(page);

    // 3. Preview overlay URL sync, Prev/Next switching, and Browser Back dismissal
    const dialog = await openProjectOverlay(page, 'typhoon', 'click');
    await expect(page).toHaveURL(/\/\?preview=typhoon$/);
    await expect(dialog).toContainText('1 / 4');

    await dialog.locator('[data-overlay-step="next"]').click();
    await expect(page).toHaveURL(/\/\?preview=bikeysens$/);
    await expect(dialog.locator('#project-overlay-title')).toHaveText('Bikeysens');
    await expect(dialog).toContainText('2 / 4');

    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/\/\?preview=typhoon$/);
    await expect(dialog.locator('#project-overlay-title')).toHaveText('Project Typhoon');

    await page.goBack();
    await expect(page.locator('dialog[open]')).toHaveCount(0);

    // 4. Direct deep-link to ?preview=rcxd
    await page.goto('/?preview=rcxd', { waitUntil: 'load' });
    await expect(page.locator('dialog.project-overlay[open] #project-overlay-title')).toHaveText('RCXD');
    await closeProjectOverlay(page, 'escape');
    await expect(page).toHaveURL(/\/$/);

    // 5. Article Table of Contents & Figure Lightbox zoom
    await gotoArticleReady(page, 'typhoon', VIEWPORTS.desktopLarge);
    const toc = page.getByRole('navigation', { name: 'On this page' });
    await expect(toc).toBeVisible();
    const tocLinks = toc.locator('a[href^="#"]');
    expect(await tocLinks.count()).toBeGreaterThanOrEqual(4);

    const firstZoomBtn = page.locator('[data-lightbox-src]').first();
    await firstZoomBtn.click();
    const lightbox = page.locator('dialog.figure-lightbox[open]');
    await expect(lightbox).toBeVisible();
    await expect(lightbox.locator('img.figure-lightbox__img')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog.figure-lightbox[open]')).toHaveCount(0);

    diag.assertClean();
  });
});
