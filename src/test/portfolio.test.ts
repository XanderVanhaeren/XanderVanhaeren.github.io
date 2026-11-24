import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  VALID_PROJECT_SLUGS,
  buildPreviewUrl,
  getPreviewSlugFromSearch,
  isProjectSlug,
  stepProjectSlug,
} from '../lib/previewUrl';

const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.join(ROOT_DIR, 'src', 'content', 'projects');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PROJECTS_MEDIA_DIR = path.join(PUBLIC_DIR, 'assets', 'images', 'projects');

function listAllFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listAllFiles(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

describe('Preview URL & stepper state helpers (src/lib/previewUrl.ts)', () => {
  it('validates canonical project slugs strictly', () => {
    for (const slug of VALID_PROJECT_SLUGS) {
      expect(isProjectSlug(slug)).toBe(true);
    }
    expect(isProjectSlug('')).toBe(false);
    expect(isProjectSlug(null)).toBe(false);
    expect(isProjectSlug(undefined)).toBe(false);
    expect(isProjectSlug('unknown')).toBe(false);
    expect(isProjectSlug('goodnotes-pdf-prep')).toBe(false);
  });

  it('extracts valid ?preview=<slug> and ignores legacy ?project= or invalid values', () => {
    expect(getPreviewSlugFromSearch('?preview=typhoon')).toBe('typhoon');
    expect(getPreviewSlugFromSearch('?preview=team-214&utm_source=gh')).toBe('team-214');
    expect(getPreviewSlugFromSearch('?preview=%20rcxd%20')).toBe('rcxd');
    expect(getPreviewSlugFromSearch('')).toBeNull();
    expect(getPreviewSlugFromSearch('?project=typhoon')).toBeNull();
    expect(getPreviewSlugFromSearch('?preview=invalid')).toBeNull();
  });

  it('builds clean preview URLs while preserving unrelated query parameters', () => {
    expect(buildPreviewUrl('/', '', 'bikeysens')).toBe('/?preview=bikeysens');
    expect(buildPreviewUrl('/', '?preview=bikeysens', null)).toBe('/');
    expect(buildPreviewUrl('/', '?ref=cv&preview=typhoon', 'rcxd')).toBe('/?ref=cv&preview=rcxd');
    expect(buildPreviewUrl('/', '?ref=cv&preview=typhoon', null)).toBe('/?ref=cv');
  });

  it('cycles forward and backward across all 4 projects with wrap-around', () => {
    expect(stepProjectSlug('typhoon', 'next')).toBe('bikeysens');
    expect(stepProjectSlug('bikeysens', 'next')).toBe('rcxd');
    expect(stepProjectSlug('rcxd', 'next')).toBe('team-214');
    expect(stepProjectSlug('team-214', 'next')).toBe('typhoon');

    expect(stepProjectSlug('typhoon', 'prev')).toBe('team-214');
    expect(stepProjectSlug('team-214', 'prev')).toBe('rcxd');
  });
});

describe('Astro MDX project content collection & asset integrity', () => {
  it('contains all 4 MDX project entries ordered TL, TR, BL, BR', () => {
    const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));
    expect(files.sort()).toEqual(['bikeysens.mdx', 'rcxd.mdx', 'team-214.mdx', 'typhoon.mdx']);

    const entries = files.map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
      const orderMatch = raw.match(/^order:\s*(\d+)/m);
      const slugMatch = raw.match(/^slug:\s*([a-z0-9-]+)/m);
      expect(orderMatch, `Missing order in ${file}`).not.toBeNull();
      expect(slugMatch, `Missing slug in ${file}`).not.toBeNull();
      return {
        order: Number(orderMatch![1]),
        slug: slugMatch![1],
        raw,
      };
    });

    entries.sort((a, b) => a.order - b.order);
    expect(entries.map((e) => e.slug)).toEqual([...VALID_PROJECT_SLUGS]);

    const team214 = entries.find((e) => e.slug === 'team-214')!;
    expect(team214.raw).toMatch(/^status:\s*in-progress/m);
    expect(team214.raw).toContain('/assets/images/projects/team-214/animation.mp4');
  });

  it('verifies every /assets/... reference across all MDX files exists in public/ with zero orphans', () => {
    const referencedDiskPaths = new Set<string>();
    const assetPattern = /\/assets\/images\/projects\/[a-z0-9/-]+\.[a-z0-9]+/gi;

    for (const slug of VALID_PROJECT_SLUGS) {
      const mdxPath = path.join(CONTENT_DIR, `${slug}.mdx`);
      const content = fs.readFileSync(mdxPath, 'utf8');
      const matches = content.match(assetPattern) ?? [];
      expect(matches.length, `${slug}.mdx should reference >= 2 project media files`).toBeGreaterThanOrEqual(2);

      for (const assetUrl of matches) {
        expect(assetUrl.toLowerCase()).not.toMatch(/\.(heic|avi)$/);
        const diskPath = path.join(PUBLIC_DIR, assetUrl.replace(/^\/+/, ''));
        expect(fs.existsSync(diskPath), `Missing asset on disk: ${diskPath}`).toBe(true);
        expect(fs.statSync(diskPath).size).toBeGreaterThan(0);
        referencedDiskPaths.add(path.resolve(diskPath));
      }
    }

    const bundledFiles = listAllFiles(PROJECTS_MEDIA_DIR);
    expect(bundledFiles).toHaveLength(43);
    for (const filePath of bundledFiles) {
      expect(filePath.toLowerCase()).not.toMatch(/\.(heic|avi)$/);
      expect(fs.statSync(filePath).size).toBeGreaterThan(0);
      expect(
        referencedDiskPaths.has(path.resolve(filePath)),
        `Unreferenced bundled asset: ${filePath}`
      ).toBe(true);
    }
  });
});
