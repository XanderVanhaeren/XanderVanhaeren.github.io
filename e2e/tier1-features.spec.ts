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
  getTile,
  getTileBoxes,
  gotoArticleReady,
  gotoHomeReady,
  hoverAndSettle,
  openProjectOverlay,
} from './helpers';

test.describe('Tier 1 — F1: Home Dark Minimal Layout & Identity', () => {
  test('T1-F1-01: root route returns HTTP 200, mounts #root, zero errors', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    diag.assertClean();
  });

  test('T1-F1-02: dark canvas #1B1B1B and primary #FFFFFF text tokens', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    await assertDarkMinimalTokens(page);
  });

  test('T1-F1-03: monospace font-family on h1 and KU Leuven subtitle', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const h1 = page.locator('h1').first();
    const subtitle = page.getByText(/Engineering Student/i).first();
    await expect(h1).toBeVisible();
    await expect(subtitle).toBeVisible();
    await expect(page.getByText(/KU Leuven/i).first()).toBeVisible();

    const fonts = await page.evaluate(() => {
      const findLeafTextEl = (pattern: RegExp): Element | undefined => {
        const all = Array.from(document.querySelectorAll('body *')).filter(
          (el) => !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName),
        );
        const matches = all.filter(
          (el) =>
            pattern.test(el.textContent ?? '') &&
            !Array.from(el.children).some((child) => pattern.test(child.textContent ?? '')),
        );
        return matches[matches.length - 1];
      };
      const h1El = document.querySelector('h1');
      const engEl = findLeafTextEl(/Engineering Student/i);
      const kuEl = findLeafTextEl(/KU Leuven/i);
      return {
        h1Font: h1El ? getComputedStyle(h1El).fontFamily : '',
        engFont: engEl ? getComputedStyle(engEl).fontFamily : '',
        kuFont: kuEl ? getComputedStyle(kuEl).fontFamily : '',
      };
    });

    expect(fonts.h1Font).toMatch(/mono|jetbrains|fira|consolas|courier/i);
    expect(fonts.engFont).toMatch(/mono|jetbrains|fira|consolas|courier/i);
    expect(fonts.kuFont).toMatch(/mono|jetbrains|fira|consolas|courier/i);
  });

  test('T1-F1-04: desktop left identity column sits left of 4-tile grid', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const h1 = page.locator('h1').first();
    const kuLeuven = page.getByText(/KU Leuven/i).first();
    await expect(h1).toContainText(/Xander/i);
    await expect(h1).toContainText(/Vanhaeren\./i);
    await expect(page.getByText(/Engineering Student/i).first()).toBeVisible();
    await expect(kuLeuven).toBeVisible();

    const h1Box = await h1.boundingBox();
    const subBox = await kuLeuven.boundingBox();
    const tiles = await getTileBoxes(page);

    expect(h1Box).not.toBeNull();
    expect(subBox).not.toBeNull();
    if (h1Box && subBox) {
      expect(h1Box.x + h1Box.width).toBeLessThanOrEqual(tiles.typhoon.x);
      expect(subBox.x + subBox.width).toBeLessThanOrEqual(tiles.rcxd.x);
      expect(subBox.y).toBeGreaterThan(h1Box.y + h1Box.height);
    }
  });

  test('T1-F1-05: all 4 project tiles have 8px border-radius and ~8px grid gaps', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    for (const { slug } of PROJECTS_CONTRACT) {
      const tile = getTile(page, slug);
      const radius = await tile.evaluate((el) => {
        const tileR = getComputedStyle(el).borderTopLeftRadius;
        const img = el.querySelector('img');
        const imgR = img ? getComputedStyle(img).borderTopLeftRadius : '0px';
        return { tileR, imgR };
      });
      expect(radius.tileR === '8px' || radius.imgR === '8px', `Tile ${slug} must have 8px border-radius`).toBe(true);
    }

    const boxes = await getTileBoxes(page);
    const colGap = boxes.bikeysens.x - boxes.typhoon.right;
    const rowGap = boxes.rcxd.y - boxes.typhoon.bottom;
    expect(colGap).toBeGreaterThanOrEqual(4);
    expect(colGap).toBeLessThanOrEqual(14);
    expect(rowGap).toBeGreaterThanOrEqual(4);
    expect(rowGap).toBeLessThanOrEqual(14);
  });

  test('T1-F1-06: legacy portfolio DOM, styles, nav links, and CSV assets are removed', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);

    await expect(page.locator('#navbar')).toHaveCount(0);
    await expect(page.locator('#about')).toHaveCount(0);
    await expect(page.locator('#skills')).toHaveCount(0);
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('.lg-glass')).toHaveCount(0);
    await expect(page.locator('style#glisse-styles')).toHaveCount(0);

    const legacyNavTextCount = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, header a, [role="tab"]'));
      return links.filter((el) => /^(Goodnotes|Skills|About)$/i.test((el.textContent ?? '').trim())).length;
    });
    expect(legacyNavTextCount).toBe(0);

    const skillsCsvRequested = diag.requestedUrls.some((url) => /skills\.csv/i.test(url));
    expect(skillsCsvRequested).toBe(false);
    diag.assertClean();
  });
});

test.describe('Tier 1 — F2: High-Res Bundled Tile Imagery & Zero Errors', () => {
  for (const [idx, project] of PROJECTS_CONTRACT.entries()) {
    const num = String(idx + 1).padStart(2, '0');
    test(`T1-F2-${num}: ${project.slug} tile image is loaded with descriptive alt`, async ({ page }) => {
      await gotoHomeReady(page, VIEWPORTS.desktopLarge);
      const tile = getTile(page, project.slug);
      await assertAllImagesLoaded(tile);
    });
  }

  test('T1-F2-05: all 4 tile images are high-res local bundled assets', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    for (const { slug } of PROJECTS_CONTRACT) {
      const img = getTile(page, slug).locator('img').first();
      const dims = await img.evaluate((el: HTMLImageElement) => ({
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
        src: el.getAttribute('src') ?? '',
      }));
      expect(dims.naturalWidth, `${slug} naturalWidth should be >= 400`).toBeGreaterThanOrEqual(400);
      expect(dims.naturalHeight, `${slug} naturalHeight should be >= 300`).toBeGreaterThanOrEqual(300);
      expect(dims.src).not.toMatch(/\.(heic|avi)(\?.*)?$/i);
    }
  });

  test('T1-F2-06: home load produces zero 404s, failed requests, console errors, or page errors', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    diag.assertClean();
  });
});

test.describe('Tier 1 — F3: Desktop Even 2x2 Grid & Hover Grow/Shrink Geometry', () => {
  test('T1-F3-01: 1440x900 renders even 2x2 grid at rest in TL/TR/BL/BR order', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const boxes = await getTileBoxes(page);
    assertDesktopEvenGrid(boxes);
  });

  test('T1-F3-02: 1280x800 renders even 2x2 grid at rest with zero horizontal overflow', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopStandard);
    const boxes = await getTileBoxes(page);
    assertDesktopEvenGrid(boxes);
    await assertNoHorizontalOverflow(page);
  });

  test('T1-F3-03: hover typhoon at 1440x900 strictly grows typhoon and shrinks all 3 others', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const rest = await getTileBoxes(page);
    const hovered = await hoverAndSettle(page, 'typhoon');
    assertHoverGrowShrink(rest, hovered, 'typhoon');
  });

  test('T1-F3-04: hover bikeysens at 1440x900 strictly grows bikeysens and shrinks all 3 others', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const rest = await getTileBoxes(page);
    const hovered = await hoverAndSettle(page, 'bikeysens');
    assertHoverGrowShrink(rest, hovered, 'bikeysens');
  });

  test('T1-F3-05: hover rcxd at 1440x900 strictly grows rcxd and shrinks all 3 others', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const rest = await getTileBoxes(page);
    const hovered = await hoverAndSettle(page, 'rcxd');
    assertHoverGrowShrink(rest, hovered, 'rcxd');
  });

  test('T1-F3-06: hover team-214 at 1440x900 strictly grows team-214 and shrinks all 3 others', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const rest = await getTileBoxes(page);
    const hovered = await hoverAndSettle(page, 'team-214');
    assertHoverGrowShrink(rest, hovered, 'team-214');
  });
});

test.describe('Tier 1 — F4: Tablet Reference Proportions & Phone Single-Column Stack', () => {
  test('T1-F4-01: tablet 768x1024 renders 2x2 grid with ~56:44 cols and ~52:48 rows', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.tabletPortrait);
    const boxes = await getTileBoxes(page);
    assertTabletReferenceGrid(boxes);
    await assertNoHorizontalOverflow(page);
  });

  test('T1-F4-02: tablet 820x1180 renders 2x2 grid matching reference proportions', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.tabletAir);
    const boxes = await getTileBoxes(page);
    assertTabletReferenceGrid(boxes);
    await assertNoHorizontalOverflow(page);
  });

  test('T1-F4-03: tablet 1023x768 renders 2x2 grid matching reference proportions', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.tabletMax);
    const boxes = await getTileBoxes(page);
    assertTabletReferenceGrid(boxes);
    await assertNoHorizontalOverflow(page);
  });

  test('T1-F4-04: phone 375x812 stacks all 4 tiles in single vertical column', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.phoneCompact);
    const boxes = await getTileBoxes(page);
    await assertPhoneSingleColumnStack(page, boxes);
  });

  test('T1-F4-05: phone 390x844 stacks cleanly with zero horizontal overflow', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.phoneModern);
    const boxes = await getTileBoxes(page);
    await assertPhoneSingleColumnStack(page, boxes);
  });

  test('T1-F4-06: phone 375x812 displays compact identity header above stacked tiles', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.phoneCompact);
    const h1 = page.locator('h1').first();
    const kuLeuven = page.getByText(/KU Leuven/i).first();
    await expect(h1).toContainText(/Xander/i);
    await expect(kuLeuven).toBeVisible();

    const h1Box = await h1.boundingBox();
    const tiles = await getTileBoxes(page);
    expect(h1Box).not.toBeNull();
    if (h1Box) {
      expect(h1Box.y + h1Box.height).toBeLessThanOrEqual(tiles.typhoon.y + 4);
    }
    await assertNoHorizontalOverflow(page);
  });
});

test.describe('Tier 1 — F5: Interactive <dialog> Article Overlay', () => {
  for (const [idx, project] of PROJECTS_CONTRACT.entries()) {
    const num = String(idx + 1).padStart(2, '0');
    test(`T1-F5-${num}: clicking ${project.slug} tile opens <dialog> with title, summary, close button, and article link`, async ({
      page,
    }) => {
      await gotoHomeReady(page, VIEWPORTS.desktopLarge);
      const dialog = await openProjectOverlay(page, project.slug, 'click');
      await expect(dialog).toContainText(project.title);

      const textLen = await dialog.evaluate((el) => (el.textContent ?? '').trim().length);
      expect(textLen).toBeGreaterThan(40);

      const closeBtn = dialog
        .locator('button[aria-label*="close" i], button:has-text("×"), button:has-text("Close")')
        .first();
      await expect(closeBtn).toBeVisible();

      const articleLink = dialog.locator(`a[href="${project.route}"]`).first();
      await expect(articleLink).toBeVisible();
    });
  }

  test('T1-F5-05: overlay closes cleanly via close button', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    await openProjectOverlay(page, 'typhoon', 'click');
    await closeProjectOverlay(page, 'button');
  });

  test('T1-F5-06: overlay closes cleanly via Escape key and backdrop click', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    await openProjectOverlay(page, 'bikeysens', 'click');
    await closeProjectOverlay(page, 'escape');

    await openProjectOverlay(page, 'rcxd', 'click');
    await closeProjectOverlay(page, 'backdrop');
  });
});

test.describe('Tier 1 — F6: Four Full-Page Project Articles', () => {
  for (const [idx, project] of PROJECTS_CONTRACT.entries()) {
    const num = String(idx + 1).padStart(2, '0');
    test(`T1-F6-${num}: ${project.route} renders rich article, bundled images, and back-to-home link`, async ({
      page,
    }) => {
      const diag = attachDiagnostics(page);
      await gotoArticleReady(page, project.slug, VIEWPORTS.desktopLarge);

      const root = page.locator(`[data-article="${project.slug}"]`);
      await expect(root.locator('h1').first()).toContainText(project.title);

      const sectionCount = await root.locator('h2, section').count();
      expect(sectionCount).toBeGreaterThanOrEqual(2);

      const textLen = await root.evaluate((el) => (el.textContent ?? '').trim().length);
      expect(textLen).toBeGreaterThanOrEqual(400);

      await assertAllImagesLoaded(root);
      await expect(root.locator('a[href="/"]').first()).toBeVisible();
      diag.assertClean();
    });
  }

  test('T1-F6-05: clicking <a href="/"> from each article navigates back to home 4-tile grid', async ({ page }) => {
    for (const project of PROJECTS_CONTRACT) {
      await gotoArticleReady(page, project.slug, VIEWPORTS.desktopLarge);
      const backLink = page.locator(`[data-article="${project.slug}"] a[href="/"]`).first();
      await backLink.click();
      await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/index.html');
      await expect(page.locator('[data-project]')).toHaveCount(4);
    }
  });

  test('T1-F6-06: all images across all 4 articles load cleanly with zero 404s or errors', async ({ page }) => {
    const diag = attachDiagnostics(page);
    for (const project of PROJECTS_CONTRACT) {
      await gotoArticleReady(page, project.slug, VIEWPORTS.desktopLarge);
      await assertAllImagesLoaded(page.locator(`[data-article="${project.slug}"]`));
    }
    diag.assertClean();
  });
});
