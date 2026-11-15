import { Page, Locator, expect } from '@playwright/test';

export interface ConsoleTracker {
  consoleErrors: string[];
  pageErrors: string[];
  assertClean: () => void;
}

/**
 * Attaches listeners for console.error and uncaught pageerror events.
 * Filters out intentional network abort errors only when explicitly requested.
 */
export function attachConsoleErrorTracker(
  page: Page,
  options: { ignoreNetworkErrors?: boolean } = {}
): ConsoleTracker {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (
        options.ignoreNetworkErrors &&
        (text.includes('Failed to load resource') ||
          text.includes('ERR_FAILED') ||
          text.includes('fetch') ||
          text.includes('500') ||
          text.includes('skills.csv'))
      ) {
        return;
      }
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message || String(err));
  });

  return {
    consoleErrors,
    pageErrors,
    assertClean: () => {
      expect(consoleErrors, `Unexpected console.error: ${consoleErrors.join(' | ')}`).toEqual([]);
      expect(pageErrors, `Unexpected pageerror: ${pageErrors.join(' | ')}`).toEqual([]);
    },
  };
}

/**
 * Navigates to the home portfolio and waits for React + glisse + skills hydration.
 */
export async function gotoHomeReady(page: Page, urlPath = '/'): Promise<void> {
  await page.goto(urlPath, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#root')).not.toBeEmpty();
  await expect(page.locator('#navbar')).toBeVisible();
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('.lg-glass').first()).toBeVisible();
}

/**
 * Locates a navigation item inside the Navbar (supports glisse .lg-tab-bar, role=tab, role=link, or #nav-links).
 */
export function getNavTab(page: Page, label: 'Home' | 'About' | 'Projects' | 'Skills'): Locator {
  const navbar = page.locator('#navbar');
  const pattern = new RegExp(`^\\s*${escapeRegExp(label)}\\s*$`, 'i');
  return navbar
    .locator(
      '.lg-tab-bar a:visible, .lg-tab-bar button:visible, .lg-tab-bar [role="tab"]:visible, #mobile-nav-drawer a:visible, .mobile-drawer a:visible, .nav-links a:visible, #nav-links a:visible, nav a:visible, nav button:visible'
    )
    .filter({ hasText: pattern })
    .first();
}

/**
 * Clicks a navigation item on desktop or mobile (automatically opens .nav-toggle if needed on mobile).
 */
export async function navigateViaNavbar(
  page: Page,
  label: 'Home' | 'About' | 'Projects' | 'Skills'
): Promise<void> {
  const tab = getNavTab(page, label);
  if (!(await tab.isVisible().catch(() => false))) {
    const toggle = page
      .locator('#navbar .nav-toggle')
      .or(
        page.locator(
          '#navbar button[aria-label*="menu" i], #navbar button[aria-label*="navigation" i]'
        )
      )
      .first();
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click();
    }
  }
  await expect(tab).toBeVisible();
  await tab.click();
}

/**
 * Selects a segment inside a section's glisse SegmentedControl (#projects or #skills).
 */
export async function selectCategorySegment(
  page: Page,
  sectionSelector: '#projects' | '#skills',
  segmentLabel: string
): Promise<void> {
  const section = page.locator(sectionSelector);
  const segmented = section
    .locator('.lg-segmented, [role="radiogroup"], [aria-label*="filter" i], [aria-label*="category" i]')
    .first();
  await expect(segmented).toBeVisible();

  const option = segmented
    .locator('[role="radio"], button, label, span, div')
    .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(segmentLabel)}\\s*$`, 'i') })
    .first();

  await expect(option).toBeVisible();
  await option.click();
}

/**
 * Finds the SearchField <input> inside #projects or #skills.
 */
export function getSectionSearchInput(
  page: Page,
  sectionSelector: '#projects' | '#skills'
): Locator {
  const section = page.locator(sectionSelector);
  return section
    .locator(
      '.lg-input input, input[type="search"], input[placeholder*="Search" i], input[placeholder*="Filter" i]'
    )
    .first();
}

/**
 * Sets the query value in #projects or #skills SearchField.
 */
export async function setSectionSearchQuery(
  page: Page,
  sectionSelector: '#projects' | '#skills',
  query: string
): Promise<void> {
  const input = getSectionSearchInput(page, sectionSelector);
  await expect(input).toBeVisible();
  await input.fill(query);
}

/**
 * Clears the SearchField in #projects or #skills using either the glisse clear button or fill('').
 */
export async function clearSectionSearch(
  page: Page,
  sectionSelector: '#projects' | '#skills'
): Promise<void> {
  const section = page.locator(sectionSelector);
  const clearBtn = section
    .locator('.lg-input button, button[aria-label*="clear" i], button[title*="clear" i]')
    .first();
  if (await clearBtn.isVisible().catch(() => false)) {
    await clearBtn.click();
  } else {
    const input = getSectionSearchInput(page, sectionSelector);
    await input.fill('');
  }
}

/**
 * Opens the Liquid Glass Optics HUD panel/popover if it is not already open.
 */
export async function openGlassOpticsHud(page: Page): Promise<Locator> {
  const existingSlider = page.locator('.lg-slider input[type="range"], input[type="range"]').first();
  if (await existingSlider.isVisible().catch(() => false)) {
    return page
      .locator(
        '[aria-label*="Optics" i], [data-testid*="optics" i], .optics-hud, .glass-optics-hud, #navbar'
      )
      .first();
  }

  const trigger = page
    .locator(
      '#navbar button[aria-label*="Optics" i], #navbar button[aria-label*="Glass" i], #navbar button[aria-label*="HUD" i], #navbar button[aria-label*="Tune" i], #navbar button[aria-label*="Settings" i], #navbar .lg-menu button, button:has-text("Optics"), button:has-text("Glass")'
    )
    .first();

  await expect(trigger).toBeVisible();
  await trigger.click();

  await expect(
    page.locator('input[type="range"], .lg-switch[role="switch"], [role="switch"]').first()
  ).toBeVisible();
  return page.locator('body');
}

/**
 * Adjusts a range slider (glisse <Slider>) inside the Optics HUD and dispatches React-compatible events.
 */
export async function setSliderValue(sliderInput: Locator, value: number): Promise<void> {
  await expect(sliderInput).toBeVisible();
  await sliderInput.evaluate((el: HTMLInputElement, val: number) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(el, String(val));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

/**
 * Opens the Project Typhoon case-study modal (#project-modal) from #projects.
 */
export async function openTyphoonModal(page: Page): Promise<Locator> {
  const projects = page.locator('#projects');
  const trigger = projects
    .locator(
      'button:has-text("Read full engineering article"), a:has-text("Read full engineering article"), [data-project="typhoon"], article:has-text("Project Typhoon"), .project-card:has-text("Project Typhoon")'
    )
    .first();
  await expect(trigger).toBeVisible();
  await trigger.click();

  const modal = page.locator('dialog#project-modal, #project-modal, [role="dialog"]').first();
  await expect(modal).toBeVisible();
  return modal;
}

/**
 * Closes the Project Typhoon modal via close button, Escape key, or backdrop click.
 */
export async function closeTyphoonModal(
  page: Page,
  method: 'button' | 'escape' | 'backdrop' = 'button'
): Promise<void> {
  const modal = page.locator('dialog#project-modal, #project-modal, [role="dialog"]').first();
  await expect(modal).toBeVisible();

  if (method === 'button') {
    const closeBtn = modal
      .locator('.project-modal-close, button[aria-label*="Close" i], button:has-text("Close")')
      .first();
    await closeBtn.click();
  } else if (method === 'escape') {
    await page.keyboard.press('Escape');
  } else {
    // Click top-left corner of dialog backdrop outside the modal content container
    await page.mouse.click(5, 5);
  }

  await expect(modal).toBeHidden();
}

/**
 * Reads live CSS custom properties (--lg-blur, --lg-glass-bend, --lg-glass-dispersion)
 * from document.documentElement, document.body, #root, or the first .lg-glass element.
 */
export async function getActiveGlassOpticsVars(page: Page): Promise<{
  blur: string;
  bend: string;
  dispersion: string;
}> {
  return page.evaluate(() => {
    const candidates = [
      document.documentElement,
      document.body,
      document.getElementById('root'),
      document.querySelector('.lg-glass') as HTMLElement | null,
    ].filter(Boolean) as HTMLElement[];

    const readVar = (name: string): string => {
      for (const el of candidates) {
        const inlineVal = el.style.getPropertyValue(name).trim();
        if (inlineVal) return inlineVal;
      }
      for (const el of candidates) {
        const computedVal = getComputedStyle(el).getPropertyValue(name).trim();
        if (computedVal) return computedVal;
      }
      return '';
    };

    return {
      blur: readVar('--lg-blur'),
      bend: readVar('--lg-glass-bend'),
      dispersion: readVar('--lg-glass-dispersion'),
    };
  });
}

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
