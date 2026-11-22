import { expect, test } from '@playwright/test';
import {
  PROJECTS_CONTRACT,
  VIEWPORTS,
  assertAllImagesLoaded,
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

test.describe('Tier 2 — F1 Boundaries: Routing, Landmarks & Viewport Bounds', () => {
  test('T2-F1-01: direct /index.html navigation matches / home layout', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopLarge, '/index.html');
    const boxes = await getTileBoxes(page);
    assertDesktopEvenGrid(boxes);
    diag.assertClean();
  });

  test('T2-F1-02: all 4 tiles are <button> elements with accessible project titles', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    for (const project of PROJECTS_CONTRACT) {
      const tile = getTile(page, project.slug);
      const tagName = await tile.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe('button');
      const label = await tile.evaluate((el) => el.getAttribute('aria-label') || el.textContent || '');
      expect(label.toLowerCase()).toContain(project.title.toLowerCase());
    }
  });

  test('T2-F1-03: all 4 tiles remain strictly within viewport bounds on 1440x900 and 1280x800', async ({ page }) => {
    for (const vp of [VIEWPORTS.desktopLarge, VIEWPORTS.desktopStandard]) {
      await gotoHomeReady(page, vp);
      const boxes = await getTileBoxes(page);
      for (const { slug } of PROJECTS_CONTRACT) {
        const b = boxes[slug];
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.y).toBeGreaterThanOrEqual(0);
        expect(b.right).toBeLessThanOrEqual(vp.width + 1);
        expect(b.bottom).toBeLessThanOrEqual(vp.height + 1);
      }
    }
  });

  test('T2-F1-04: non-empty document title and zero horizontal overflow on desktop', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
    await assertNoHorizontalOverflow(page);

    await page.setViewportSize(VIEWPORTS.desktopStandard);
    await waitForTilesSettled(page);
    await assertNoHorizontalOverflow(page);
  });

  test('T2-F1-05: legacy query/hash URLs do not auto-open modals or legacy views', async ({ page }) => {
    const diag = attachDiagnostics(page);
    for (const path of ['/?project=typhoon', '/#skills', '/#about']) {
      await page.goto('about:blank');
      await gotoHomeReady(page, VIEWPORTS.desktopLarge, path);
      await expect(page.locator('dialog[open]')).toHaveCount(0);
      await expect(page.locator('#navbar')).toHaveCount(0);
      await expect(page.locator('#skills')).toHaveCount(0);
    }
    diag.assertClean();
  });

  test('T2-F1-06: semantic landmark and identity completeness at 1024x768', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopMin);

    await expect(page.locator('h1')).toHaveCount(1);
    const h1 = page.locator('h1').first();
    await expect(h1).toContainText(/Xander/i);
    await expect(h1).toContainText(/Vanhaeren\./i);

    const engStudent = page.getByText(/Engineering Student/i).first();
    const kuLeuven = page.getByText(/KU Leuven/i).first();
    await expect(engStudent).toBeVisible();
    await expect(kuLeuven).toBeVisible();

    const h1Box = await h1.boundingBox();
    const subBox = await kuLeuven.boundingBox();
    expect(h1Box).not.toBeNull();
    expect(subBox).not.toBeNull();
    if (h1Box && subBox) {
      expect(subBox.y).toBeGreaterThan(h1Box.y + h1Box.height);
    }

    await assertNoHorizontalOverflow(page);
    diag.assertClean();
  });
});

test.describe('Tier 2 — F2 Boundaries: Asset Integrity, Reloads & Direct Fetch', () => {
  test('T2-F2-01: tile images fill >= 95% of tile containers without letterboxing', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    for (const { slug } of PROJECTS_CONTRACT) {
      const tile = getTile(page, slug);
      const tileBox = await tile.boundingBox();
      const img = tile.locator('img').first();
      const imgBox = await img.boundingBox();
      const objectFit = await img.evaluate((el) => getComputedStyle(el).objectFit);
      expect(
        ['cover', 'fill'],
        `Tile ${slug} image object-fit "${objectFit}" must be cover or fill to avoid letterboxing`,
      ).toContain(objectFit);
      expect(tileBox).not.toBeNull();
      expect(imgBox).not.toBeNull();
      if (tileBox && imgBox) {
        expect(imgBox.width).toBeGreaterThanOrEqual(tileBox.width * 0.95);
        expect(imgBox.height).toBeGreaterThanOrEqual(tileBox.height * 0.95);
      }
    }
  });

  test('T2-F2-02: tile images maintain non-zero rendered boxes across desktop, tablet, and phone', async ({ page }) => {
    for (const vp of [VIEWPORTS.desktopLarge, VIEWPORTS.tabletPortrait, VIEWPORTS.phoneCompact]) {
      await gotoHomeReady(page, vp);
      for (const { slug } of PROJECTS_CONTRACT) {
        const imgBox = await getTile(page, slug).locator('img').first().boundingBox();
        expect(imgBox).not.toBeNull();
        if (imgBox) {
          expect(imgBox.width).toBeGreaterThan(100);
          expect(imgBox.height).toBeGreaterThan(80);
        }
      }
    }
  });

  test('T2-F2-03: hard reload keeps all 4 tile images loaded with zero errors', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('[data-project] img'));
      return imgs.length === 4 && imgs.every((img) => img.complete && img.naturalWidth > 0);
    });
    diag.assertClean();
  });

  test('T2-F2-04: article images on 375x812 fit within 375px width and have non-empty alt', async ({ page }) => {
    for (const { slug } of PROJECTS_CONTRACT) {
      await gotoArticleReady(page, slug, VIEWPORTS.phoneCompact);
      const imgs = page.locator(`[data-article="${slug}"] img`);
      const count = await imgs.count();
      expect(count).toBeGreaterThanOrEqual(1);
      for (let i = 0; i < count; i++) {
        const box = await imgs.nth(i).boundingBox();
        const alt = (await imgs.nth(i).getAttribute('alt')) ?? '';
        expect(alt.trim().length).toBeGreaterThan(0);
        expect(box).not.toBeNull();
        if (box) {
          expect(box.width).toBeGreaterThan(0);
          expect(box.width).toBeLessThanOrEqual(375);
        }
      }
    }
  });

  test('T2-F2-05: zero external hotlinked images and zero HEIC/AVI sources across all routes', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    await assertAllImagesLoaded(page);
    for (const { slug } of PROJECTS_CONTRACT) {
      await gotoArticleReady(page, slug, VIEWPORTS.desktopLarge);
      await assertAllImagesLoaded(page.locator(`[data-article="${slug}"]`));
    }
  });

  test('T2-F2-06: all <img> assets (and any <video>/<source>) across / and 4 articles respond HTTP 200 with valid MIME', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    const imageUrls = new Set<string>();
    const videoUrls = new Set<string>();

    const collectMedia = async () => {
      const urls = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img')).map((el) => el.currentSrc || el.src);
        const vids = [
          ...Array.from(document.querySelectorAll<HTMLVideoElement>('video')).map((el) => el.currentSrc || el.src),
          ...Array.from(document.querySelectorAll<HTMLSourceElement>('video source')).map((el) => el.src),
        ].filter(Boolean);
        return { imgs, vids };
      });
      for (const u of urls.imgs) {
        if (u && !u.startsWith('data:')) imageUrls.add(u);
      }
      for (const v of urls.vids) {
        videoUrls.add(v);
      }
    };

    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    await collectMedia();

    for (const { slug } of PROJECTS_CONTRACT) {
      await gotoArticleReady(page, slug, VIEWPORTS.desktopLarge);
      await collectMedia();
    }

    expect(imageUrls.size).toBeGreaterThanOrEqual(4);
    for (const url of imageUrls) {
      const res = await page.request.get(url);
      expect(res.status(), `GET ${url} must return 200`).toBe(200);
      const ct = res.headers()['content-type'] ?? '';
      expect(ct, `GET ${url} content-type "${ct}" must be image/*`).toMatch(/^image\//i);
    }

    for (const url of videoUrls) {
      const res = await page.request.get(url);
      expect(res.status(), `GET ${url} must succeed`).toBeGreaterThanOrEqual(200);
      expect(res.status(), `GET ${url} must not error`).toBeLessThan(400);
    }

    diag.assertClean();
  });
});

test.describe('Tier 2 — F3 Boundaries: Desktop Hover Physics & Reduced Motion', () => {
  test('T2-F3-01: exact desktop lower breakpoint 1024x768 renders even 2x2 grid at rest', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopMin);
    const boxes = await getTileBoxes(page);
    assertDesktopEvenGrid(boxes);
    await assertNoHorizontalOverflow(page);
  });

  test('T2-F3-02: wide desktop 1920x1080 preserves even 2x2 rest grid and hover grow/shrink', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopWide);
    const rest = await getTileBoxes(page);
    assertDesktopEvenGrid(rest);

    const hovered = await hoverAndSettle(page, 'typhoon');
    assertHoverGrowShrink(rest, hovered, 'typhoon');
  });

  test('T2-F3-03: unhovering restores tiles to resting 2x2 dimensions within 4px', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const rest = await getTileBoxes(page);
    await hoverAndSettle(page, 'bikeysens');
    const afterReset = await resetHoverToRest(page);

    for (const { slug } of PROJECTS_CONTRACT) {
      expect(Math.abs(afterReset[slug].width - rest[slug].width)).toBeLessThanOrEqual(4);
      expect(Math.abs(afterReset[slug].height - rest[slug].height)).toBeLessThanOrEqual(4);
    }
  });

  test('T2-F3-04: rapid sequential hover across all 4 tiles settles accurately on final tile', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const rest = await getTileBoxes(page);

    await getTile(page, 'typhoon').hover();
    await getTile(page, 'bikeysens').hover();
    await getTile(page, 'team-214').hover();
    const finalBoxes = await hoverAndSettle(page, 'rcxd');
    assertHoverGrowShrink(rest, finalBoxes, 'rcxd');
  });

  test('T2-F3-05: prefers-reduced-motion: reduce uses instant transition (<=50ms) OR disables hover-resize while keeping grid & overlay functional', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const rest = await getTileBoxes(page);
    assertDesktopEvenGrid(rest);

    const durationsMs = await page.evaluate(() => {
      const parseTimeMs = (val: string): number => {
        if (val.endsWith('ms')) return parseFloat(val) || 0;
        if (val.endsWith('s')) return (parseFloat(val) || 0) * 1000;
        return 0;
      };

      const effectiveTransitionMs = (el: Element): number => {
        const cs = getComputedStyle(el);
        const props = cs.transitionProperty.split(',').map((p) => p.trim().toLowerCase());
        const durs = cs.transitionDuration.split(',').map((d) => d.trim());
        let maxMs = 0;
        for (let i = 0; i < props.length; i++) {
          const prop = props[i];
          if (!prop || prop === 'none') continue;
          const dur = parseTimeMs(durs[i % durs.length] ?? '0s');
          if (dur > maxMs) maxMs = dur;
        }
        return maxMs;
      };

      const elements = new Set<Element>();
      for (const tile of Array.from(document.querySelectorAll('[data-project]'))) {
        let cur: Element | null = tile;
        while (cur && cur !== document.documentElement) {
          elements.add(cur);
          cur = cur.parentElement;
        }
        for (const desc of Array.from(tile.querySelectorAll('*'))) {
          elements.add(desc);
        }
      }

      return Array.from(elements).map(effectiveTransitionMs);
    });

    await getTile(page, 'typhoon').hover();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        }),
    );
    const activeAnimDurationsMs = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((anim) => anim.playState === 'running' || anim.pending)
        .map((anim) => {
          const timing = anim.effect?.getComputedTiming();
          const dur = typeof timing?.duration === 'number' ? timing.duration : 0;
          return Number.isFinite(dur) ? dur : 0;
        }),
    );
    const hovered = await waitForTilesSettled(page);

    const maxDuration = Math.max(0, ...durationsMs, ...activeAnimDurationsMs);
    const hoverDisabled = Math.abs(hovered.typhoon.area - rest.typhoon.area) < 1;
    expect(
      maxDuration <= 50 || hoverDisabled,
      `Expected transition/animation duration <= 50ms (got ${maxDuration}ms) or disabled hover resize`,
    ).toBe(true);

    await openProjectOverlay(page, 'typhoon', 'click');
    await closeProjectOverlay(page, 'button');
  });

  test('T2-F3-06: touch context tap + close does not leave tile stuck expanded', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: VIEWPORTS.desktopLarge,
      hasTouch: true,
    });
    const page = await context.newPage();
    try {
      await gotoHomeReady(page);
      const rest = await getTileBoxes(page);
      await getTile(page, 'typhoon').tap();
      await expect(page.locator('dialog[open]')).toBeVisible();
      await closeProjectOverlay(page, 'escape');
      const after = await waitForTilesSettled(page);
      for (const { slug } of PROJECTS_CONTRACT) {
        expect(Math.abs(after[slug].width - rest[slug].width)).toBeLessThanOrEqual(4);
        expect(Math.abs(after[slug].height - rest[slug].height)).toBeLessThanOrEqual(4);
      }
    } finally {
      await context.close();
    }
  });
});

test.describe('Tier 2 — F4 Boundaries: Breakpoint Edges & Dynamic Resize', () => {
  test('T2-F4-01: exact tablet lower breakpoint 640x900 renders 2x2 asymmetric grid with zero overflow', async ({
    page,
  }) => {
    await gotoHomeReady(page, VIEWPORTS.tabletMin);
    const boxes = await getTileBoxes(page);
    assertTabletReferenceGrid(boxes);
    await assertNoHorizontalOverflow(page);
  });

  test('T2-F4-02: exact phone upper breakpoint 639x844 renders 1-column stack with zero overflow', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.phoneMax);
    const boxes = await getTileBoxes(page);
    await assertPhoneSingleColumnStack(page, boxes);
  });

  test('T2-F4-03: narrow phone 320x568 stacks cleanly in 1 column with scrollWidth <= clientWidth', async ({
    page,
  }) => {
    await gotoHomeReady(page, VIEWPORTS.phoneNarrow);
    const boxes = await getTileBoxes(page);
    await assertPhoneSingleColumnStack(page, boxes);
  });

  test('T2-F4-04: tablet portrait (768x1024) and landscape (1023x768) both keep left col > right col', async ({
    page,
  }) => {
    await gotoHomeReady(page, VIEWPORTS.tabletPortrait);
    assertTabletReferenceGrid(await getTileBoxes(page));
    await assertNoHorizontalOverflow(page);

    await page.setViewportSize(VIEWPORTS.tabletMax);
    const landscapeBoxes = await waitForTilesSettled(page);
    assertTabletReferenceGrid(landscapeBoxes);
    await assertNoHorizontalOverflow(page);
  });

  test('T2-F4-05: live viewport resize Desktop -> Tablet -> Phone -> Desktop adapts cleanly', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    assertDesktopEvenGrid(await getTileBoxes(page));

    await page.setViewportSize(VIEWPORTS.tabletPortrait);
    assertTabletReferenceGrid(await waitForTilesSettled(page));
    await assertNoHorizontalOverflow(page);

    await page.setViewportSize(VIEWPORTS.phoneCompact);
    await assertPhoneSingleColumnStack(page, await waitForTilesSettled(page));

    await page.setViewportSize(VIEWPORTS.desktopLarge);
    assertDesktopEvenGrid(await waitForTilesSettled(page));
    await assertNoHorizontalOverflow(page);
  });

  test('T2-F4-06: phone 375x812 stacked tiles have usable tap height (>= 120px) and zero overlap', async ({
    page,
  }) => {
    await gotoHomeReady(page, VIEWPORTS.phoneCompact);
    const boxes = await getTileBoxes(page);
    for (const { slug } of PROJECTS_CONTRACT) {
      expect(boxes[slug].height).toBeGreaterThanOrEqual(120);
    }
    await assertPhoneSingleColumnStack(page, boxes);
  });
});

test.describe('Tier 2 — F5 Boundaries: Keyboard Activation, Focus & Modal Dismissal', () => {
  test('T2-F5-01: keyboard Tab + Enter opens typhoon <dialog> overlay', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const dialog = await openProjectOverlay(page, 'typhoon', 'enter');
    await expect(dialog).toContainText('Project Typhoon');
    await closeProjectOverlay(page, 'escape');
  });

  test('T2-F5-02: keyboard Space opens bikeysens <dialog> overlay', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const dialog = await openProjectOverlay(page, 'bikeysens', 'space');
    await expect(dialog).toContainText('Bikeysens');
    await closeProjectOverlay(page, 'escape');
  });

  test('T2-F5-03: focus moves inside open <dialog> and leaves hidden <dialog> on close', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    await openProjectOverlay(page, 'rcxd', 'enter');
    const focusedInsideDialog = await page.evaluate(() => {
      const dlg = document.querySelector('dialog[open]');
      return Boolean(dlg && document.activeElement && (dlg === document.activeElement || dlg.contains(document.activeElement)));
    });
    expect(focusedInsideDialog).toBe(true);

    await closeProjectOverlay(page, 'escape');
    const openCount = await page.locator('dialog[open]').count();
    expect(openCount).toBe(0);
  });

  test('T2-F5-04: rapid open/close across all 4 projects never leaks stale title or article href', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    for (const project of PROJECTS_CONTRACT) {
      const dialog = await openProjectOverlay(page, project.slug, 'click');
      await expect(dialog).toContainText(project.title);
      await expect(dialog.locator(`a[href="${project.route}"]`).first()).toBeVisible();
      await closeProjectOverlay(page, 'button');
    }
  });

  test('T2-F5-05: overlay on 375x812 fits within 375px width with zero horizontal overflow', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.phoneCompact);
    const dialog = await openProjectOverlay(page, 'team-214', 'click');
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
    await assertNoHorizontalOverflow(page);
    await closeProjectOverlay(page, 'button');
  });

  test('T2-F5-06: clicking inside <dialog> content card does NOT dismiss the modal', async ({ page }) => {
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const dialog = await openProjectOverlay(page, 'typhoon', 'click');
    const heading = dialog.locator('h2, h1, h3').first();
    await expect(heading).toBeVisible();
    await heading.click();
    await expect(page.locator('dialog[open]')).toHaveCount(1);
    await closeProjectOverlay(page, 'button');
  });
});

test.describe('Tier 2 — F6 Boundaries: Articles Responsive & History Navigation', () => {
  test('T2-F6-01: all 4 articles have zero horizontal overflow at 1440x900, 768x1024, and 375x812', async ({
    page,
  }) => {
    for (const vp of [VIEWPORTS.desktopLarge, VIEWPORTS.tabletPortrait, VIEWPORTS.phoneCompact]) {
      for (const { slug } of PROJECTS_CONTRACT) {
        await gotoArticleReady(page, slug, vp);
        await assertNoHorizontalOverflow(page);
      }
    }
  });

  test('T2-F6-02: all 4 articles maintain #1B1B1B dark canvas and readable font size (>= 14px)', async ({ page }) => {
    for (const { slug } of PROJECTS_CONTRACT) {
      await gotoArticleReady(page, slug, VIEWPORTS.desktopLarge);
      const bg = await getCanvasBackgroundColor(page);
      expect(bg).toBe('rgb(27, 27, 27)');

      const bodyFontPx = await page.evaluate(() => {
        const p = document.querySelector('article p, main p, [data-article] p') ?? document.body;
        return parseFloat(getComputedStyle(p).fontSize || '0');
      });
      expect(bodyFontPx).toBeGreaterThanOrEqual(14);
    }
  });

  test('T2-F6-03: each article has 1 <h1>, >= 2 <h2> sections, >= 400 chars prose, and >= 1 image', async ({ page }) => {
    for (const { slug } of PROJECTS_CONTRACT) {
      await gotoArticleReady(page, slug, VIEWPORTS.desktopLarge);
      const root = page.locator(`[data-article="${slug}"]`);
      await expect(root.locator('h1')).toHaveCount(1);
      expect(await root.locator('h2').count()).toBeGreaterThanOrEqual(2);
      const textLen = await root.evaluate((el) => (el.textContent ?? '').trim().length);
      expect(textLen).toBeGreaterThanOrEqual(400);
      expect(await root.locator('img').count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('T2-F6-04: browser goBack() from article navigated via overlay returns cleanly to /', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await gotoHomeReady(page, VIEWPORTS.desktopLarge);
    const dialog = await openProjectOverlay(page, 'bikeysens', 'click');
    await dialog.locator('a[href="/projects/bikeysens.html"]').first().click();
    await page.waitForURL('**/projects/bikeysens.html');
    await expect(page.locator('[data-article="bikeysens"]')).toBeVisible();

    await page.goBack({ waitUntil: 'load' });
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/index.html');
    await expect(page.locator('[data-project]')).toHaveCount(4);
    diag.assertClean();
  });

  test('T2-F6-05: direct page.reload() on each article preserves content with zero 404s', async ({ page }) => {
    for (const { slug } of PROJECTS_CONTRACT) {
      const diag = attachDiagnostics(page);
      await gotoArticleReady(page, slug, VIEWPORTS.desktopLarge);
      await page.reload({ waitUntil: 'load' });
      await expect(page.locator(`[data-article="${slug}"] h1`)).toBeVisible();
      await assertAllImagesLoaded(page.locator(`[data-article="${slug}"]`));
      diag.assertClean();
    }
  });

  test('T2-F6-06: article tables/spec grids on 375x812 do not cause page-level horizontal overflow', async ({
    page,
  }) => {
    for (const { slug } of PROJECTS_CONTRACT) {
      await gotoArticleReady(page, slug, VIEWPORTS.phoneCompact);
      await assertNoHorizontalOverflow(page);
    }
  });
});
