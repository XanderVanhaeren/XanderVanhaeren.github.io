import fs from 'node:fs';
import path from 'node:path';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveArticleSlug } from '../articleMain';
import ArticlePage from '../components/ArticlePage';
import { PROJECTS, getProjectBySlug } from '../data/projects';
import type { ProjectData } from '../types/project';

afterEach(() => {
  cleanup();
});

describe('ArticlePage and multi-page article wiring', () => {
  it.each(PROJECTS)(
    'renders full article content, metadata, navigation, and specs for $slug',
    (project) => {
      const { container } = render(<ArticlePage project={project} />);

      const root = container.querySelector('.article-root');
      expect(root).toHaveAttribute('data-article', project.slug);

      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent(project.title);

      expect(screen.getByText(project.subtitle)).toBeInTheDocument();
      expect(screen.getByText(project.period)).toBeInTheDocument();
      expect(screen.getByText(project.context)).toBeInTheDocument();
      expect(screen.getByText(project.role)).toBeInTheDocument();
      expect(screen.getByText(project.sourcesNote)).toBeInTheDocument();

      if (project.team) {
        expect(screen.getByText('Team')).toBeInTheDocument();
        expect(screen.getByText(project.team)).toBeInTheDocument();
      } else {
        expect(screen.queryByText('Team')).not.toBeInTheDocument();
      }

      if (project.statusLabel) {
        expect(screen.getByText(project.statusLabel)).toBeInTheDocument();
      }

      for (const tag of project.tags) {
        expect(screen.getByText(tag)).toBeInTheDocument();
      }

      const backLinks = screen.getAllByRole('link', { name: /back to projects/i });
      expect(backLinks.length).toBeGreaterThanOrEqual(2);
      for (const link of backLinks) {
        expect(link).toHaveAttribute('href', '/');
      }

      const heroImg = screen.getByRole('img', { name: project.heroFigure.alt });
      expect(heroImg).toHaveAttribute('src', project.heroFigure.src);
      expect(heroImg).toHaveAttribute('fetchpriority', 'high');
      expect(heroImg).not.toHaveAttribute('loading', 'lazy');
      expect(screen.getByText(project.heroFigure.caption)).toBeInTheDocument();

      const tables = screen.getAllByRole('table');
      expect(tables.length).toBeGreaterThanOrEqual(1);
      const topSpecsTable = tables[0];
      for (const spec of project.specs) {
        expect(within(topSpecsTable).getByText(spec.label)).toBeInTheDocument();
        expect(within(topSpecsTable).getByText(spec.value)).toBeInTheDocument();
      }

      for (const section of project.sections) {
        expect(
          screen.getByRole('heading', { level: 2, name: section.heading })
        ).toBeInTheDocument();
        expect(screen.getByText(section.paragraphs[0])).toBeInTheDocument();

        if (section.callout) {
          expect(screen.getByText(section.callout.label)).toBeInTheDocument();
          expect(
            container.querySelector('.article-callout__content')?.textContent
          ).toBe(section.callout.content);
        }

        if (section.bullets) {
          for (const bullet of section.bullets) {
            expect(screen.getByText(`${bullet.lead}:`)).toBeInTheDocument();
            expect(screen.getByText(bullet.body, { exact: false })).toBeInTheDocument();
          }
        }

        if (section.figures) {
          for (const figure of section.figures) {
            const img = screen.getByRole('img', { name: figure.alt });
            expect(img).toHaveAttribute('src', figure.src);
            expect(img).toHaveAttribute('loading', 'lazy');
          }
        }
      }
    }
  );

  it('renders section-level BOM specs table on bikeysens', () => {
    const bikeysens = getProjectBySlug('bikeysens');
    expect(bikeysens).toBeDefined();

    render(<ArticlePage project={bikeysens} />);

    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(2);
    expect(within(tables[1]).getByText('Compute & Storage')).toBeInTheDocument();
    expect(
      within(tables[1]).getByText('Raspberry Pi Zero 2 W (€20.00) + Canyon Frame Bag (€35.00)')
    ).toBeInTheDocument();
  });

  it('applies dark, light, and neutral surface classes and attributes to figures', () => {
    const typhoon = getProjectBySlug('typhoon')!;
    const { unmount } = render(<ArticlePage project={typhoon} />);

    const darkImg = screen.getByRole('img', {
      name: /Saturn OS flight controller software architecture diagram/i,
    });
    const darkFigure = darkImg.closest('figure');
    expect(darkFigure).toHaveClass('article-figure', 'surface-dark');
    expect(darkFigure).toHaveAttribute('data-surface', 'dark');

    const lightImg = screen.getByRole('img', {
      name: /TARS V2 flight controller inside its 3D-printed protective enclosure/i,
    });
    const lightFigure = lightImg.closest('figure');
    expect(lightFigure).toHaveClass('article-figure', 'surface-light');
    expect(lightFigure).toHaveAttribute('data-surface', 'light');

    const neutralImg = screen.getByRole('img', {
      name: /Cardboard Murphy glider/i,
    });
    const neutralFigure = neutralImg.closest('figure');
    expect(neutralFigure).toHaveClass('article-figure', 'surface-neutral');
    expect(neutralFigure).toHaveAttribute('data-surface', 'neutral');

    unmount();

    const bikeysens = getProjectBySlug('bikeysens')!;
    render(<ArticlePage project={bikeysens} />);
    const bomFigure = screen
      .getByRole('img', { name: /Bikeysens bill of materials spreadsheet/i })
      .closest('figure');
    expect(bomFigure).toHaveClass('article-figure', 'surface-light');
    expect(bomFigure).toHaveAttribute('data-surface', 'light');
  });

  it('renders the embedded video element only on team-214', () => {
    for (const project of PROJECTS) {
      const { container, unmount } = render(<ArticlePage project={project} />);
      const videos = container.querySelectorAll('video');

      if (project.slug === 'team-214') {
        expect(videos).toHaveLength(1);
        const video = videos[0];
        expect(video).toHaveAttribute('src', project.video!.src);
        expect(video).toHaveAttribute('poster', project.video!.poster);
        expect(video).toHaveAttribute('controls');
        expect(video).toHaveAttribute('playsinline');
        expect(video).toHaveAttribute('loop');
        expect(video).toHaveAttribute('preload', 'metadata');
        expect(video).toHaveAttribute('width', '1500');
        expect(video).toHaveAttribute('height', '1000');
        expect(video).toHaveAttribute('aria-label', project.video!.title);
        expect(screen.getByText(project.video!.caption)).toBeInTheDocument();
      } else {
        expect(videos).toHaveLength(0);
      }

      unmount();
    }
  });

  it('renders orderedList items, spec.note, and default neutral figure surface when provided', () => {
    const base = getProjectBySlug('typhoon')!;
    const synthetic: ProjectData = {
      ...base,
      specs: [
        {
          label: 'Calibration Check',
          value: '1.97 N·m/rad',
          note: 'Measured across 3 loading runs',
        },
      ],
      heroFigure: {
        src: base.heroFigure.src,
        alt: 'Synthetic hero image',
        caption: 'Synthetic hero caption',
      },
      sections: [
        {
          id: 'assembly-sequence',
          heading: 'Assembly Sequence',
          paragraphs: ['Ordered verification steps.'],
          orderedList: [
            { lead: 'Step One', body: 'Mount carbon rod in base fixture.' },
            { lead: 'Step Two', body: 'Torque clamp bolts to spec.' },
          ],
        },
      ],
    };

    const { container } = render(<ArticlePage project={synthetic} />);

    expect(screen.getByText('Measured across 3 loading runs')).toBeInTheDocument();
    const ordered = container.querySelector('ol');
    expect(ordered).not.toBeNull();
    expect(within(ordered!).getByText('Step One:')).toBeInTheDocument();
    expect(
      within(ordered!).getByText('Mount carbon rod in base fixture.', { exact: false })
    ).toBeInTheDocument();

    const heroFig = screen
      .getByRole('img', { name: 'Synthetic hero image' })
      .closest('figure');
    expect(heroFig).toHaveClass('article-figure', 'surface-neutral');
    expect(heroFig).toHaveAttribute('data-surface', 'neutral');
  });

  it('renders sibling project navigation links in PROJECTS order', () => {
    const bikeysens = getProjectBySlug('bikeysens')!;
    render(<ArticlePage project={bikeysens} />);

    const siblingsNav = screen.getByRole('navigation', { name: /adjacent projects/i });
    const prevLink = within(siblingsNav).getByRole('link', { name: /project typhoon/i });
    const nextLink = within(siblingsNav).getByRole('link', { name: /rcxd/i });

    expect(prevLink).toHaveAttribute('href', '/projects/typhoon.html');
    expect(nextLink).toHaveAttribute('href', '/projects/rcxd.html');
  });

  it('resolves article slug from data-article attribute first, then pathname fallback', () => {
    const withAttr = document.createElement('div');
    withAttr.setAttribute('data-article', 'bikeysens');
    expect(resolveArticleSlug(withAttr, '/projects/rcxd.html')).toBe('bikeysens');

    const emptyAttr = document.createElement('div');
    emptyAttr.setAttribute('data-article', '   ');
    expect(resolveArticleSlug(emptyAttr, '/projects/rcxd.html')).toBe('rcxd');

    expect(resolveArticleSlug(null, '/projects/team-214.html')).toBe('team-214');
    expect(resolveArticleSlug(null, '/projects/typhoon')).toBe('typhoon');
    expect(resolveArticleSlug(null, '/projects/typhoon.html/')).toBe('typhoon');
    expect(resolveArticleSlug(null, '/')).toBe('');
    expect(resolveArticleSlug(null, '/projects/')).toBe('');
    expect(resolveArticleSlug(null, '/index.html')).toBe('');
  });

  it('resolves project via slug prop when project prop is omitted', () => {
    const { container } = render(<ArticlePage slug="rcxd" />);
    expect(container.querySelector('.article-root')).toHaveAttribute('data-article', 'rcxd');
    expect(screen.getByRole('heading', { level: 1, name: 'RCXD' })).toBeInTheDocument();
  });

  it('renders an accessible fallback view for invalid or empty slugs', () => {
    const { unmount } = render(<ArticlePage slug="nonexistent-project" />);
    expect(
      screen.getByRole('heading', { level: 1, name: /project not found/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/nonexistent-project/i)).toBeInTheDocument();
    const backLinks = screen.getAllByRole('link', { name: /back to projects/i });
    expect(backLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of backLinks) {
      expect(link).toHaveAttribute('href', '/');
    }

    unmount();
    render(<ArticlePage slug="" />);
    expect(
      screen.getByRole('heading', { level: 1, name: /project not found/i })
    ).toBeInTheDocument();
  });

  it('verifies all four projects/*.html entry shells declare data-article and load articleMain.tsx', () => {
    const slugs = ['typhoon', 'bikeysens', 'rcxd', 'team-214'] as const;
    for (const slug of slugs) {
      const htmlPath = path.resolve(process.cwd(), 'projects', `${slug}.html`);
      expect(fs.existsSync(htmlPath), `Missing ${htmlPath}`).toBe(true);
      const html = fs.readFileSync(htmlPath, 'utf8');
      expect(html).toContain(`data-article="${slug}"`);
      expect(html).toContain('<script type="module" src="/src/articleMain.tsx"></script>');
    }
  });
});
