import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PROJECTS, getProjectBySlug } from '../data/projects';
import type { ProjectSlug } from '../types/project';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const PROJECTS_MEDIA_DIR = path.join(PUBLIC_DIR, 'assets', 'images', 'projects');
const EXPECTED_ORDER: readonly ProjectSlug[] = [
  'typhoon',
  'bikeysens',
  'rcxd',
  'team-214',
];

function collectAssetPaths(project: (typeof PROJECTS)[number]): string[] {
  const paths = [project.tileImage, project.heroFigure.src];
  for (const section of project.sections) {
    if (section.figures) {
      for (const figure of section.figures) {
        paths.push(figure.src);
      }
    }
  }
  if (project.video) {
    paths.push(project.video.src);
    if (project.video.poster) {
      paths.push(project.video.poster);
    }
  }
  return paths;
}

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

describe('Portfolio projects data contract (src/data/projects.ts)', () => {
  it('exports exactly 4 projects in TL, TR, BL, BR order', () => {
    expect(PROJECTS).toHaveLength(4);
    expect(PROJECTS.map((p) => p.slug)).toEqual(EXPECTED_ORDER);
  });

  it('resolves every valid slug via getProjectBySlug and returns undefined for unknown slugs', () => {
    for (const slug of EXPECTED_ORDER) {
      const found = getProjectBySlug(slug);
      expect(found).toBeDefined();
      expect(found?.slug).toBe(slug);
      expect(found?.route).toBe(`/projects/${slug}.html`);
    }

    expect(getProjectBySlug('')).toBeUndefined();
    expect(getProjectBySlug('unknown')).toBeUndefined();
    expect(getProjectBySlug('goodnotes-pdf-prep')).toBeUndefined();
  });

  it('populates required M2 overlay and M3 article fields for all 4 projects', () => {
    for (const project of PROJECTS) {
      expect(project.title.trim().length).toBeGreaterThan(0);
      expect(project.subtitle.trim().length).toBeGreaterThan(0);
      expect(project.period.trim().length).toBeGreaterThan(0);
      expect(project.context.trim().length).toBeGreaterThan(0);
      expect(project.role.trim().length).toBeGreaterThan(0);
      expect(project.tileImage).toMatch(
        new RegExp(`^/assets/images/projects/${project.slug}/`)
      );
      expect(project.tileAlt.trim().length).toBeGreaterThan(0);
      expect(project.tileWidth).toBeGreaterThan(0);
      expect(project.tileHeight).toBeGreaterThan(0);
      expect(project.overlaySummary.trim().length).toBeGreaterThan(0);
      expect(project.highlights.length).toBeGreaterThanOrEqual(3);
      expect(project.tags.length).toBeGreaterThanOrEqual(3);
      expect(project.specs.length).toBeGreaterThanOrEqual(4);
      expect(project.sections.length).toBeGreaterThanOrEqual(3);
      expect(project.heroFigure.caption.trim().length).toBeGreaterThan(0);
      expect(project.sourcesNote.trim().length).toBeGreaterThan(0);

      for (const section of project.sections) {
        expect(section.id.trim().length).toBeGreaterThan(0);
        expect(section.heading.trim().length).toBeGreaterThan(0);
        expect(section.paragraphs.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('frames Peno team 214 accurately as an active Fall 2026 in-progress project', () => {
    const peno = getProjectBySlug('team-214');
    expect(peno?.status).toBe('in-progress');
    expect(peno?.period).toContain('2026');
  });

  it('verifies every referenced /assets/... path exists as a non-empty file in public/ with zero .HEIC or .avi', () => {
    const referencedDiskPaths = new Set<string>();

    for (const project of PROJECTS) {
      const assetPaths = collectAssetPaths(project);
      expect(assetPaths.length).toBeGreaterThanOrEqual(2);

      for (const assetPath of assetPaths) {
        expect(assetPath.startsWith('/assets/')).toBe(true);
        expect(assetPath.toLowerCase()).not.toMatch(/\.(heic|avi)$/);

        const relativeToPublic = assetPath.replace(/^\/+/, '');
        const diskPath = path.join(PUBLIC_DIR, relativeToPublic);
        expect(
          fs.existsSync(diskPath),
          `Missing bundled asset on disk: ${diskPath}`
        ).toBe(true);
        expect(fs.statSync(diskPath).size).toBeGreaterThan(0);
        referencedDiskPaths.add(path.resolve(diskPath));
      }
    }

    // Verify all 43 bundled files under public/assets/images/projects are valid and non-empty
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
