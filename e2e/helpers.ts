import { expect, type Locator, type Page } from '@playwright/test';

export type ProjectSlug = 'typhoon' | 'bikeysens' | 'rcxd' | 'team-214';

export interface ProjectContract {
  slug: ProjectSlug;
  title: string;
  route: string;
  position: 'TL' | 'TR' | 'BL' | 'BR';
}

export const PROJECTS_CONTRACT: readonly ProjectContract[] = [
  { slug: 'typhoon', title: 'Project Typhoon', route: '/projects/typhoon.html', position: 'TL' },
  { slug: 'bikeysens', title: 'Bikeysens', route: '/projects/bikeysens.html', position: 'TR' },
  { slug: 'rcxd', title: 'RCXD', route: '/projects/rcxd.html', position: 'BL' },
  { slug: 'team-214', title: 'Peno team 214', route: '/projects/team-214.html', position: 'BR' },
] as const;

export const VIEWPORTS = {
  desktopWide: { width: 1920, height: 1080 },
  desktopLarge: { width: 1440, height: 900 },
  desktopStandard: { width: 1280, height: 800 },
  desktopMin: { width: 1024, height: 768 },
  tabletMax: { width: 1023, height: 768 },
  tabletAir: { width: 820, height: 1180 },
  tabletPortrait: { width: 768, height: 1024 },
  tabletMin: { width: 640, height: 900 },
  phoneMax: { width: 639, height: 844 },
  phoneModern: { width: 390, height: 844 },
  phoneCompact: { width: 375, height: 812 },
  phoneNarrow: { width: 320, height: 568 },
} as const;

export type ViewportSize = { width: number; height: number };

export interface DiagnosticsTracker {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  httpErrors: Array<{ status: number; url: string }>;
  requestedUrls: string[];
  assertClean: (options?: { allowStatusesForUrls?: RegExp[]; allowFailedRequestsForUrls?: RegExp[] }) => void;
}

export function attachDiagnostics(page: Page): DiagnosticsTracker {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: Array<{ status: number; url: string }> = [];
  const requestedUrls: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message || String(err));
  });

  page.on('request', (req) => {
    requestedUrls.push(req.url());
  });

  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText ?? 'failed'})`);
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      httpErrors.push({ status: res.status(), url: res.url() });
    }
  });

  return {
    consoleErrors,
    pageErrors,
    failedRequests,
    httpErrors,
    requestedUrls,
    assertClean(options) {
      const allowedStatusPatterns = options?.allowStatusesForUrls ?? [];
      const allowedFailedPatterns = options?.allowFailedRequestsForUrls ?? [];

      const unexpectedHttp = httpErrors.filter(
        (entry) => !allowedStatusPatterns.some((pattern) => pattern.test(entry.url)),
      );
      const unexpectedFailed = failedRequests.filter(
        (entry) => !allowedFailedPatterns.some((pattern) => pattern.test(entry)),
      );

      expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toEqual([]);
      expect(pageErrors, `Unexpected page errors: ${pageErrors.join('; ')}`).toEqual([]);
      expect(unexpectedFailed, `Unexpected failed requests: ${unexpectedFailed.join('; ')}`).toEqual([]);
      expect(
        unexpectedHttp,
        `Unexpected HTTP >= 400 responses: ${unexpectedHttp.map((e) => `${e.status} ${e.url}`).join('; ')}`,
      ).toEqual([]);
    },
  };
}

export async function gotoHomeReady(
  page: Page,
  viewport?: ViewportSize,
  urlPath = '/',
): Promise<void> {
  if (viewport) {
    await page.setViewportSize(viewport);
  }
  const res = await page.goto(urlPath, { waitUntil: 'load' });
  expect(res?.status(), `Expected HTTP 200 for ${urlPath}`).toBe(200);

  const root = page.locator('#root');
  await expect(root).toBeVisible();
  const rootEmpty = await root.evaluate((el) => el.innerHTML.trim().length === 0);
  expect(rootEmpty, '#root must be mounted and non-empty').toBe(false);

  const h1 = page.locator('h1').first();
  await expect(h1).toBeVisible();
  await expect(h1).toContainText(/Xander/i);

  const tiles = page.locator('[data-project]');
  await expect(tiles).toHaveCount(4);
  for (const project of PROJECTS_CONTRACT) {
    await expect(page.locator(`[data-project="${project.slug}"]`)).toBeVisible();
  }

  await page.waitForFunction(() => {
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('[data-project] img'));
    return imgs.length === 4 && imgs.every((img) => img.complete && img.naturalWidth > 0);
  });

  await waitForTilesSettled(page);
}

export async function gotoArticleReady(
  page: Page,
  slug: ProjectSlug,
  viewport?: ViewportSize,
): Promise<void> {
  if (viewport) {
    await page.setViewportSize(viewport);
  }
  const route = `/projects/${slug}.html`;
  const res = await page.goto(route, { waitUntil: 'load' });
  expect(res?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  const articleRoot = page.locator(`[data-article="${slug}"]`);
  await expect(articleRoot).toBeVisible();

  const heading = articleRoot.locator('h1').first();
  await expect(heading).toBeVisible();

  await page.waitForFunction(
    (s) => {
      const root = document.querySelector(`[data-article="${s}"]`);
      if (!root) return false;
      const imgs = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
      return imgs.length >= 1 && imgs.every((img) => img.complete);
    },
    slug,
  );

  const imgCheck = await articleRoot.evaluate((root) => {
    const imgs = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
    return imgs.map((img) => ({
      src: img.getAttribute('src') ?? '',
      complete: img.complete,
      naturalWidth: img.naturalWidth,
    }));
  });

  expect(imgCheck.length, `${route} must contain >= 1 image`).toBeGreaterThanOrEqual(1);
  for (const img of imgCheck) {
    expect(img.complete, `Image ${img.src} did not finish loading`).toBe(true);
    expect(img.naturalWidth, `Image ${img.src} failed to load (naturalWidth === 0)`).toBeGreaterThan(0);
  }
}

export async function assertAllImagesLoaded(scope: Page | Locator): Promise<void> {
  const imgs = scope.locator('img');
  const count = await imgs.count();
  expect(count, 'Expected at least 1 <img> element in scope').toBeGreaterThanOrEqual(1);

  for (let i = 0; i < count; i++) {
    const img = imgs.nth(i);
    const info = await img.evaluate((el: HTMLImageElement) => ({
      src: el.getAttribute('src') ?? '',
      currentSrc: el.currentSrc,
      alt: el.getAttribute('alt') ?? '',
      complete: el.complete,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
    }));

    expect(info.complete, `Image #${i} (${info.src}) must be complete`).toBe(true);
    expect(info.naturalWidth, `Image #${i} (${info.src}) naturalWidth must be > 0`).toBeGreaterThan(0);
    expect(info.naturalHeight, `Image #${i} (${info.src}) naturalHeight must be > 0`).toBeGreaterThan(0);
    expect(info.alt.trim().length, `Image #${i} (${info.src}) must have non-empty alt`).toBeGreaterThan(0);
    expect(info.src, `Image #${i} must not use raw HEIC/AVI (${info.src})`).not.toMatch(/\.(heic|avi)(\?.*)?$/i);

    const isExternal = /^https?:\/\//i.test(info.src) && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//i.test(info.src);
    expect(isExternal, `Image #${i} (${info.src}) must be bundled locally, not external`).toBe(false);
  }
}

export async function getCanvasBackgroundColor(page: Page): Promise<string> {
  return page.evaluate(() => {
    const fullViewportRoots = Array.from(document.querySelectorAll('#root, #root > *')).filter((el) => {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width >= window.innerWidth * 0.9 && rect.height >= window.innerHeight * 0.9;
    });
    const candidates = [...fullViewportRoots.reverse(), document.body, document.documentElement];
    for (const el of candidates) {
      if (!el) continue;
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        return bg;
      }
    }
    return getComputedStyle(document.body).backgroundColor;
  });
}

export async function assertDarkMinimalTokens(page: Page): Promise<void> {
  const bg = await getCanvasBackgroundColor(page);
  expect(bg, 'Canvas background must be #1B1B1B').toBe('rgb(27, 27, 27)');

  const h1 = page.locator('h1').first();
  await expect(h1).toBeVisible();
  const h1Styles = await h1.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, fontFamily: cs.fontFamily };
  });
  expect(h1Styles.color, 'Primary heading text must be #FFFFFF').toBe('rgb(255, 255, 255)');
  expect(h1Styles.fontFamily, 'Heading must use monospace font stack').toMatch(/mono|jetbrains|fira|consolas|courier/i);
}

export function getTile(page: Page, slug: ProjectSlug): Locator {
  return page.locator(`[data-project="${slug}"]`).first();
}

export interface TileBox {
  slug: ProjectSlug;
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
  right: number;
  bottom: number;
}

export type TileBoxMap = Record<ProjectSlug, TileBox>;

export async function getTileBoxes(page: Page): Promise<TileBoxMap> {
  const entries = await Promise.all(
    PROJECTS_CONTRACT.map(async ({ slug }) => {
      const box = await getTile(page, slug).boundingBox();
      if (!box || box.width <= 0 || box.height <= 0) {
        throw new Error(`Tile "${slug}" has invalid boundingBox: ${JSON.stringify(box)}`);
      }
      const tileBox: TileBox = {
        slug,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        area: box.width * box.height,
        right: box.x + box.width,
        bottom: box.y + box.height,
      };
      return [slug, tileBox] as const;
    }),
  );
  return Object.fromEntries(entries) as TileBoxMap;
}

export async function waitForTilesSettled(page: Page, timeoutMs = 2500): Promise<TileBoxMap> {
  const deadline = Date.now() + timeoutMs;

  await page.evaluate(async (maxWait) => {
    const anims = document.getAnimations().filter((a) => a.playState === 'running');
    if (anims.length === 0) return;
    await Promise.race([
      Promise.allSettled(anims.map((a) => a.finished)),
      new Promise<void>((resolve) => setTimeout(resolve, maxWait)),
    ]);
  }, timeoutMs);

  let prev = await getTileBoxes(page);
  while (Date.now() < deadline) {
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => setTimeout(resolve, 50));
        }),
    );
    const next = await getTileBoxes(page);
    const maxDelta = Math.max(
      ...PROJECTS_CONTRACT.flatMap(({ slug }) => [
        Math.abs(next[slug].x - prev[slug].x),
        Math.abs(next[slug].y - prev[slug].y),
        Math.abs(next[slug].width - prev[slug].width),
        Math.abs(next[slug].height - prev[slug].height),
      ]),
    );
    if (maxDelta < 0.5) {
      return next;
    }
    prev = next;
  }

  return prev;
}

export async function hoverAndSettle(page: Page, slug: ProjectSlug): Promise<TileBoxMap> {
  const tile = getTile(page, slug);
  await tile.hover();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  return waitForTilesSettled(page);
}

export async function resetHoverToRest(page: Page): Promise<TileBoxMap> {
  const boxes = await getTileBoxes(page);
  const boxList = Object.values(boxes);
  const isOutsideAllTiles = (x: number, y: number): boolean =>
    boxList.every((b) => x < b.x || x > b.right || y < b.y || y > b.bottom);

  const vp = page.viewportSize();
  const h1Box = await page.locator('h1').first().boundingBox();
  let safePoint: { x: number; y: number } | null = null;

  if (h1Box) {
    const cx = Math.floor(h1Box.x + h1Box.width / 2);
    const cy = Math.floor(h1Box.y + h1Box.height / 2);
    if (isOutsideAllTiles(cx, cy)) {
      safePoint = { x: cx, y: cy };
    }
  }

  if (!safePoint) {
    const minTileY = Math.min(...boxList.map((b) => b.y));
    const minTileX = Math.min(...boxList.map((b) => b.x));
    const maxTileRight = Math.max(...boxList.map((b) => b.right));
    const maxTileBottom = Math.max(...boxList.map((b) => b.bottom));

    if (minTileY >= 4) {
      safePoint = { x: 2, y: Math.max(1, Math.floor(minTileY / 2)) };
    } else if (minTileX >= 4) {
      safePoint = { x: Math.floor(minTileX / 2), y: 10 };
    } else if (vp && vp.width - maxTileRight >= 4) {
      safePoint = { x: Math.floor(maxTileRight + (vp.width - maxTileRight) / 2), y: 10 };
    } else if (vp && vp.height - maxTileBottom >= 4) {
      safePoint = { x: 10, y: Math.floor(maxTileBottom + (vp.height - maxTileBottom) / 2) };
    } else {
      safePoint = { x: 0, y: 0 };
    }
  }

  await page.mouse.move(safePoint.x, safePoint.y);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  return waitForTilesSettled(page);
}

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, `Horizontal overflow: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`).toBeLessThanOrEqual(
    clientWidth,
  );
}

export function assertDesktopEvenGrid(boxes: TileBoxMap): void {
  const tl = boxes.typhoon;
  const tr = boxes.bikeysens;
  const bl = boxes.rcxd;
  const br = boxes['team-214'];

  expect(Math.abs(tl.y - tr.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(bl.y - br.y)).toBeLessThanOrEqual(2);
  expect(bl.y).toBeGreaterThan(tl.bottom + 2);

  expect(Math.abs(tl.x - bl.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(tr.x - br.x)).toBeLessThanOrEqual(2);
  expect(tr.x).toBeGreaterThan(tl.right + 2);

  expect(Math.abs(tl.width - tr.width)).toBeLessThanOrEqual(4);
  expect(Math.abs(bl.width - br.width)).toBeLessThanOrEqual(4);
  expect(Math.abs(tl.width - bl.width)).toBeLessThanOrEqual(4);

  expect(Math.abs(tl.height - bl.height)).toBeLessThanOrEqual(4);
  expect(Math.abs(tr.height - br.height)).toBeLessThanOrEqual(4);
  expect(Math.abs(tl.height - tr.height)).toBeLessThanOrEqual(4);

  const colGap = tr.x - tl.right;
  const rowGap = bl.y - tl.bottom;
  expect(colGap).toBeGreaterThanOrEqual(4);
  expect(colGap).toBeLessThanOrEqual(14);
  expect(rowGap).toBeGreaterThanOrEqual(4);
  expect(rowGap).toBeLessThanOrEqual(14);
}

export function assertHoverGrowShrink(
  restBoxes: TileBoxMap,
  hoveredBoxes: TileBoxMap,
  hoveredSlug: ProjectSlug,
): void {
  expect(
    hoveredBoxes[hoveredSlug].area,
    `Hovered tile "${hoveredSlug}" area must strictly increase`,
  ).toBeGreaterThan(restBoxes[hoveredSlug].area);

  for (const { slug } of PROJECTS_CONTRACT) {
    if (slug === hoveredSlug) continue;
    expect(
      hoveredBoxes[slug].area,
      `Non-hovered tile "${slug}" area must strictly decrease when "${hoveredSlug}" is hovered`,
    ).toBeLessThan(restBoxes[slug].area);
  }

  const tl = hoveredBoxes.typhoon;
  const tr = hoveredBoxes.bikeysens;
  const bl = hoveredBoxes.rcxd;
  const br = hoveredBoxes['team-214'];

  expect(tl.right).toBeLessThan(tr.x);
  expect(bl.right).toBeLessThan(br.x);
  expect(tl.bottom).toBeLessThan(bl.y);
  expect(tr.bottom).toBeLessThan(br.y);
}

export function assertTabletReferenceGrid(boxes: TileBoxMap): void {
  const tl = boxes.typhoon;
  const tr = boxes.bikeysens;
  const bl = boxes.rcxd;
  const br = boxes['team-214'];

  expect(Math.abs(tl.y - tr.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(bl.y - br.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(tl.x - bl.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(tr.x - br.x)).toBeLessThanOrEqual(2);
  expect(tr.x).toBeGreaterThan(tl.right + 2);
  expect(bl.y).toBeGreaterThan(tl.bottom + 2);

  const colRatio = tl.width / (tl.width + tr.width);
  const rowRatio = tl.height / (tl.height + bl.height);

  expect(tl.width).toBeGreaterThan(tr.width);
  expect(bl.width).toBeGreaterThan(br.width);
  expect(colRatio, `Tablet col ratio ${colRatio.toFixed(3)} should be near 56:44 [0.52, 0.60]`).toBeGreaterThanOrEqual(
    0.52,
  );
  expect(colRatio, `Tablet col ratio ${colRatio.toFixed(3)} should be near 56:44 [0.52, 0.60]`).toBeLessThanOrEqual(
    0.6,
  );

  expect(tl.height).toBeGreaterThanOrEqual(bl.height);
  expect(tr.height).toBeGreaterThanOrEqual(br.height);
  expect(rowRatio, `Tablet row ratio ${rowRatio.toFixed(3)} should be near 52:48 [0.49, 0.56]`).toBeGreaterThanOrEqual(
    0.49,
  );
  expect(rowRatio, `Tablet row ratio ${rowRatio.toFixed(3)} should be near 52:48 [0.49, 0.56]`).toBeLessThanOrEqual(
    0.56,
  );
}

export async function assertPhoneSingleColumnStack(page: Page, boxes: TileBoxMap): Promise<void> {
  const order: ProjectSlug[] = ['typhoon', 'bikeysens', 'rcxd', 'team-214'];
  for (let i = 0; i < order.length - 1; i++) {
    const upper = boxes[order[i]];
    const lower = boxes[order[i + 1]];
    expect(
      lower.y,
      `Tile "${order[i + 1]}" (y=${lower.y}) must stack below "${order[i]}" (bottom=${upper.bottom})`,
    ).toBeGreaterThan(upper.bottom - 1);
  }

  const xs = order.map((s) => boxes[s].x);
  const widths = order.map((s) => boxes[s].width);
  expect(Math.max(...xs) - Math.min(...xs)).toBeLessThanOrEqual(4);
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(4);

  const h1Box = await page.locator('h1').first().boundingBox();
  expect(h1Box).not.toBeNull();
  if (h1Box) {
    expect(h1Box.y + h1Box.height).toBeLessThanOrEqual(boxes.typhoon.y + 4);
  }

  await assertNoHorizontalOverflow(page);
}

export async function openProjectOverlay(
  page: Page,
  slug: ProjectSlug,
  method: 'click' | 'enter' | 'space' = 'click',
): Promise<Locator> {
  const tile = getTile(page, slug);
  await expect(tile).toBeVisible();

  if (method === 'click') {
    await tile.click();
  } else if (method === 'enter') {
    await tile.focus();
    await page.keyboard.press('Enter');
  } else {
    await tile.focus();
    await page.keyboard.press('Space');
  }

  const dialog = page.locator('dialog[open]').first();
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('dialog').first()).toBeVisible();
  return dialog;
}

export async function closeProjectOverlay(
  page: Page,
  method: 'button' | 'escape' | 'backdrop' = 'button',
): Promise<void> {
  const dialog = page.locator('dialog[open]').first();
  await expect(dialog).toBeVisible();

  if (method === 'button') {
    const closeBtn = dialog
      .locator('button[aria-label*="close" i], button:has-text("×"), button:has-text("Close")')
      .first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
  } else if (method === 'escape') {
    await page.keyboard.press('Escape');
  } else {
    const box = await dialog.boundingBox();
    const vp = page.viewportSize();
    const pickBackdropPoint = (
      targetBox: { x: number; y: number; width: number; height: number },
      viewport: { width: number; height: number },
    ): { x: number; y: number } | null => {
      const leftGap = targetBox.x;
      const rightGap = viewport.width - (targetBox.x + targetBox.width);
      const topGap = targetBox.y;
      const bottomGap = viewport.height - (targetBox.y + targetBox.height);

      const candidates = [
        { gap: leftGap, x: Math.max(1, Math.floor(leftGap / 2)), y: Math.floor(viewport.height / 2) },
        {
          gap: rightGap,
          x: Math.min(viewport.width - 1, Math.floor(targetBox.x + targetBox.width + rightGap / 2)),
          y: Math.floor(viewport.height / 2),
        },
        { gap: topGap, x: Math.floor(viewport.width / 2), y: Math.max(1, Math.floor(topGap / 2)) },
        {
          gap: bottomGap,
          x: Math.floor(viewport.width / 2),
          y: Math.min(viewport.height - 1, Math.floor(targetBox.y + targetBox.height + bottomGap / 2)),
        },
      ].filter((c) => c.gap >= 2);

      if (candidates.length === 0) return null;
      candidates.sort((a, b) => b.gap - a.gap);
      return { x: candidates[0].x, y: candidates[0].y };
    };

    if (!box || !vp) {
      await page.mouse.click(1, 1);
    } else {
      let pt = pickBackdropPoint(box, vp);
      if (!pt) {
        const innerBox = await dialog.evaluate((el) => {
          const children = Array.from(el.children).filter((child) => {
            const r = child.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          });
          if (children.length === 0) return null;
          let minX = Infinity;
          let minY = Infinity;
          let maxR = -Infinity;
          let maxB = -Infinity;
          for (const child of children) {
            const r = child.getBoundingClientRect();
            minX = Math.min(minX, r.left);
            minY = Math.min(minY, r.top);
            maxR = Math.max(maxR, r.right);
            maxB = Math.max(maxB, r.bottom);
          }
          return { x: minX, y: minY, width: maxR - minX, height: maxB - minY };
        });
        if (innerBox) {
          pt = pickBackdropPoint(innerBox, vp);
        }
      }
      await page.mouse.click(pt?.x ?? 1, pt?.y ?? 1);
    }
  }

  await expect(page.locator('dialog[open]')).toHaveCount(0);
}
