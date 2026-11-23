import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { PROJECTS } from '../data/projects';

describe('Home view & project overlay', () => {
  let showModalSpy: ReturnType<typeof vi.spyOn>;
  let closeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    showModalSpy = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    closeSpy = vi.spyOn(HTMLDialogElement.prototype, 'close');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the dark minimal identity landmarks and excludes legacy sections', () => {
    render(<App />);

    expect(screen.getByRole('main')).toBeInTheDocument();

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Xander/);
    expect(heading).toHaveTextContent(/Vanhaeren\./);

    expect(screen.getByText(/Engineering Student/i)).toBeInTheDocument();
    expect(screen.getByText(/KU Leuven/i)).toBeInTheDocument();

    const pdfLink = screen.getByRole('link', { name: 'PDF Converter' });
    expect(pdfLink).toHaveAttribute(
      'href',
      'https://xandervanhaeren.github.io/goodnotes-pdf-prep/'
    );

    expect(screen.queryByText(/Goodnotes/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders the 4 project tiles in TL, TR, BL, BR order with clean accessible images', () => {
    const { container } = render(<App />);

    const tiles = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[data-project]')
    );
    expect(tiles).toHaveLength(4);
    expect(tiles.map((tile) => tile.dataset.project)).toEqual([
      'typhoon',
      'bikeysens',
      'rcxd',
      'team-214',
    ]);

    PROJECTS.forEach((project, index) => {
      const tile = tiles[index];
      expect(tile.type).toBe('button');
      expect(tile).toHaveAccessibleName(new RegExp(project.title, 'i'));

      const img = within(tile).getByRole('img', { name: project.tileAlt });
      expect(img).toHaveAttribute('src', project.tileImage);
      expect(img).toHaveAttribute('width', String(project.tileWidth));
      expect(img).toHaveAttribute('height', String(project.tileHeight));

      if (index === 0) {
        expect(img).toHaveAttribute('fetchpriority', 'high');
      } else {
        expect(img).not.toHaveAttribute('fetchpriority');
      }
    });
  });

  it('keeps the overlay dialog closed on initial load', () => {
    render(<App />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens an accessible modal dialog for each of the 4 projects with complete metadata and CTA', async () => {
    const user = userEvent.setup();
    render(<App />);

    for (const project of PROJECTS) {
      const tileButton = screen.getByRole('button', {
        name: new RegExp(project.title, 'i'),
      });
      await user.click(tileButton);

      expect(showModalSpy).toHaveBeenCalled();

      const dialog = screen.getByRole('dialog', { name: project.title });
      expect(dialog).toHaveAttribute('open');
      expect(dialog).toHaveAttribute('closedby', 'any');
      expect(dialog).not.toHaveAttribute('role');
      expect(dialog).not.toHaveAttribute('aria-modal');

      const labelledById = dialog.getAttribute('aria-labelledby');
      expect(labelledById).toBeTruthy();
      const titleHeading = within(dialog).getByRole('heading', {
        level: 2,
        name: project.title,
      });
      expect(titleHeading).toHaveAttribute('id', labelledById!);

      expect(within(dialog).getByText(project.period)).toBeInTheDocument();
      expect(within(dialog).getByText(project.context)).toBeInTheDocument();
      expect(within(dialog).getByText(project.overlaySummary)).toBeInTheDocument();

      if (project.status === 'in-progress' && project.statusLabel) {
        expect(within(dialog).getByText(project.statusLabel)).toBeInTheDocument();
      }

      for (const highlight of project.highlights) {
        expect(within(dialog).getByText(highlight)).toBeInTheDocument();
      }

      for (const tag of project.tags) {
        expect(within(dialog).getByText(tag)).toBeInTheDocument();
      }

      const previewImg = within(dialog).getByRole('img', { name: project.tileAlt });
      expect(previewImg).toHaveAttribute('src', project.tileImage);

      const articleLink = within(dialog).getByRole('link', {
        name: /Read full article/i,
      });
      expect(articleLink).toHaveAttribute('href', project.route);

      const closeButton = within(dialog).getByRole('button', { name: 'Close' });
      await user.click(closeButton);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
  });

  it('closes via the Close button and restores focus to the invoking tile', async () => {
    const user = userEvent.setup();
    render(<App />);

    const typhoonTile = screen.getByRole('button', { name: /Project Typhoon/i });
    await user.click(typhoonTile);

    const dialog = screen.getByRole('dialog', { name: 'Project Typhoon' });
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(closeSpy).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(typhoonTile).toHaveFocus();
  });

  it('closes on native cancel event (Escape path) and restores focus to the invoking tile', async () => {
    const user = userEvent.setup();
    render(<App />);

    const rcxdTile = screen.getByRole('button', { name: /RCXD/i });
    await user.click(rcxdTile);

    const dialog = screen.getByRole('dialog', { name: 'RCXD' });
    fireEvent(dialog, new Event('cancel', { cancelable: true }));

    expect(closeSpy).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(rcxdTile).toHaveFocus();
  });

  it('supports backdrop light-dismiss with drag-guard on non-zero rects and safe unmocked 0x0 jsdom rects', async () => {
    const user = userEvent.setup();
    render(<App />);

    const bikeysens = PROJECTS[1];
    const bikeysensTile = screen.getByRole('button', { name: /Bikeysens/i });
    await user.click(bikeysensTile);

    const dialog = screen.getByRole('dialog', {
      name: bikeysens.title,
    }) as HTMLDialogElement;

    const rectSpy = vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 80,
      right: 700,
      bottom: 600,
      width: 600,
      height: 520,
      x: 100,
      y: 80,
      toJSON: () => ({}),
    });

    // Clicking inside dialog content keeps it open
    const summaryEl = within(dialog).getByText(bikeysens.overlaySummary);
    await user.click(summaryEl);
    expect(screen.getByRole('dialog', { name: bikeysens.title })).toBeInTheDocument();

    // Pointer-down inside and pointer-up outside (text selection drag) does NOT dismiss
    await user.pointer([
      { keys: '[MouseLeft>]', target: summaryEl, coords: { x: 200, y: 200 } },
      { keys: '[/MouseLeft]', target: dialog, coords: { x: 10, y: 10 } },
    ]);
    expect(screen.getByRole('dialog', { name: bikeysens.title })).toBeInTheDocument();

    // Pointer-down + pointer-up outside dialog rect dismisses and restores focus
    await user.pointer([
      { keys: '[MouseLeft>]', target: dialog, coords: { x: 10, y: 10 } },
      { keys: '[/MouseLeft]', target: dialog, coords: { x: 10, y: 10 } },
    ]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(bikeysensTile).toHaveFocus();

    // Unmocked 0x0 jsdom rect fallback when e.target === dialog
    rectSpy.mockRestore();
    await user.click(bikeysensTile);
    const reopenedDialog = screen.getByRole('dialog', { name: bikeysens.title });
    fireEvent.pointerDown(reopenedDialog);
    fireEvent.pointerUp(reopenedDialog);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(bikeysensTile).toHaveFocus();
  });

  it('switches cleanly between projects without stale content', async () => {
    const user = userEvent.setup();
    render(<App />);

    const typhoon = PROJECTS[0];
    const team214 = PROJECTS[3];

    await user.click(screen.getByRole('button', { name: /Project Typhoon/i }));
    let dialog = screen.getByRole('dialog', { name: typhoon.title });
    expect(within(dialog).getByText(typhoon.overlaySummary)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));

    await user.click(screen.getByRole('button', { name: /Peno team 214/i }));
    dialog = screen.getByRole('dialog', { name: team214.title });
    expect(within(dialog).queryByText(typhoon.overlaySummary)).not.toBeInTheDocument();
    expect(within(dialog).getByText(team214.overlaySummary)).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: /Read full article/i })).toHaveAttribute(
      'href',
      '/projects/team-214.html'
    );
  });
});
