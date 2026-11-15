import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { ProjectModal } from '../components/projects/ProjectModal';
import { ProjectsSection } from '../components/projects/ProjectsSection';
import { TyphoonArticle } from '../components/projects/TyphoonArticle';
import { SkillsSection } from '../components/skills/SkillsSection';
import {
  DEFAULT_SKILLS_DATA,
  SKILLS_FALLBACK_CSV,
} from '../data/skillsData';
import { TyphoonStandalonePage } from '../typhoonMain';

beforeAll(() => {
  if (typeof Element !== 'undefined') {
    if (!Element.prototype.hasPointerCapture) {
      Element.prototype.hasPointerCapture = () => false;
    }
    if (!Element.prototype.setPointerCapture) {
      Element.prototype.setPointerCapture = () => {};
    }
    if (!Element.prototype.releasePointerCapture) {
      Element.prototype.releasePointerCapture = () => {};
    }
  }
});

describe('M3 ProjectsSection & ProjectDiagrams', () => {
  it('renders all 3 projects, inline SVG diagrams for RCXD & BikeySens, and proof-of-work grid', () => {
    const onOpen = vi.fn();
    const { container } = render(
      <ProjectsSection onOpenProjectArticle={onOpen} />
    );

    const grid = container.querySelector('#projects-grid')!;
    expect(within(grid as HTMLElement).getByText('Project Typhoon')).toBeInTheDocument();
    expect(within(grid as HTMLElement).getByText('RCXD')).toBeInTheDocument();
    expect(within(grid as HTMLElement).getByText('BikeySens')).toBeInTheDocument();

    expect(
      screen.getByRole('img', { name: /RCXD autonomous rover terrain contour/i })
    ).toBeInTheDocument();
    expect(screen.getByText('TERRAIN CONTOUR // WAYPOINT NAV')).toBeInTheDocument();

    expect(
      screen.getByRole('img', { name: /BikeySens elevation ridge/i })
    ).toBeInTheDocument();
    expect(screen.getByText('ELEVATION RIDGE // BLE TELEMETRY')).toBeInTheDocument();

    const proofSlots = container.querySelectorAll('.proof-grid .proof-slot.lg-glass');
    expect(proofSlots).toHaveLength(2);
  });

  it('filters projects by SegmentedControl category and SearchField, showing empty state on no match', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ProjectsSection onOpenProjectArticle={vi.fn()} />
    );

    const roboticsTab = screen.getByRole('radio', { name: 'Robotics' });
    await user.click(roboticsTab);

    const grid = container.querySelector('#projects-grid') as HTMLElement;
    expect(within(grid).getByText('RCXD')).toBeInTheDocument();
    expect(within(grid).queryByText('Project Typhoon')).not.toBeInTheDocument();
    expect(within(grid).queryByText('BikeySens')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'All' }));
    expect(within(grid).getByText('Project Typhoon')).toBeInTheDocument();

    const searchInput = screen.getByRole('searchbox', { name: 'Search projects' });
    await user.type(searchInput, 'BLE Telemetry');
    expect(within(grid).getByText('BikeySens')).toBeInTheDocument();
    expect(within(grid).queryByText('RCXD')).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'NonExistentQuantumThruster');
    expect(container.querySelector('.filter-empty')).toBeInTheDocument();
  });

  it('opens Project Typhoon article when clicking the featured card or read-more link', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ProjectsSection onOpenProjectArticle={onOpen} />);

    const readMore = screen.getByRole('link', {
      name: 'Read full engineering article →',
    });
    await user.click(readMore);
    expect(onOpen).toHaveBeenCalledWith('projects/typhoon.html');

    await user.click(screen.getByText('Project Typhoon'));
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('activates clickable project card with Enter and Space, and preserves modifier-clicks on read-more link', () => {
    const onOpen = vi.fn();
    render(<ProjectsSection onOpenProjectArticle={onOpen} />);

    const card = screen.getByRole('button', {
      name: 'Open Project Typhoon engineering article',
    });
    expect(card).toHaveAttribute('tabindex', '0');

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onOpen).toHaveBeenNthCalledWith(1, 'projects/typhoon.html');

    fireEvent.keyDown(card, { key: ' ' });
    expect(onOpen).toHaveBeenNthCalledWith(2, 'projects/typhoon.html');

    const readMore = screen.getByRole('link', {
      name: 'Read full engineering article →',
    });
    // Pressing Enter on the inner link should not trigger the card's onKeyDown handler
    fireEvent.keyDown(readMore, { key: 'Enter' });
    expect(onOpen).toHaveBeenCalledTimes(2);

    // Ctrl+Click and Meta+Click should not call preventDefault() or open the modal
    const ctrlClickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      button: 0,
    });
    readMore.dispatchEvent(ctrlClickEvent);
    expect(ctrlClickEvent.defaultPrevented).toBe(false);
    expect(onOpen).toHaveBeenCalledTimes(2);

    const metaClickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      metaKey: true,
      button: 0,
    });
    readMore.dispatchEvent(metaClickEvent);
    expect(metaClickEvent.defaultPrevented).toBe(false);
    expect(onOpen).toHaveBeenCalledTimes(2);
  });
});

describe('M3 TyphoonArticle & TyphoonStandalonePage', () => {
  it('renders all 5 sections, 6 specs in Glisse Glass, 5 tags, and 4 figures with resolved asset paths', () => {
    const { container } = render(<TyphoonArticle />);

    expect(
      screen.getByRole('heading', { name: 'Project Typhoon', level: 1 })
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.project-tags .tag')).toHaveLength(5);

    const specsGlass = container.querySelector('.article-specs.lg-glass');
    expect(specsGlass).toBeInTheDocument();
    expect(specsGlass!.querySelectorAll('dt')).toHaveLength(6);

    const headings = container.querySelectorAll('.project-article section h2');
    expect(headings).toHaveLength(5);

    const images = Array.from(container.querySelectorAll('img')).map((img) =>
      img.getAttribute('src')
    );
    expect(images).toEqual([
      '/assets/images/projects/Typhoon/typhoon-v3.jpg',
      '/assets/images/projects/Typhoon/VelocitySolidworks.png',
      '/assets/images/projects/Typhoon/Fuselage Flowsim.png',
      '/assets/images/projects/Typhoon/tars-v2.jpg',
    ]);
  });

  it('renders TyphoonStandalonePage with Back to Portfolio link and TyphoonArticle', () => {
    render(<TyphoonStandalonePage />);
    const backLink = screen.getByRole('link', { name: '← Back to Portfolio' });
    expect(backLink).toHaveAttribute('href', '../index.html#projects');
    expect(
      screen.getByRole('heading', { name: 'Test Campaign & First Flight', level: 2 })
    ).toBeInTheDocument();
  });
});

describe('M3 ProjectModal', () => {
  it('opens via showModal and closes via close button, backdrop click, and cancel/Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container, rerender } = render(
      <ProjectModal isOpen={false} onClose={onClose} />
    );

    const dialog = container.querySelector('#project-modal') as HTMLDialogElement;
    expect(dialog).not.toHaveAttribute('open');

    rerender(<ProjectModal isOpen={true} onClose={onClose} />);
    expect(dialog).toHaveAttribute('open');
    expect(container.querySelector('.project-modal-glass.lg-glass')).toBeInTheDocument();

    const standaloneLink = screen.getByRole('link', {
      name: 'Open full page ↗',
    });
    expect(standaloneLink).toHaveAttribute('href', 'projects/typhoon.html');

    expect(
      within(dialog).getByRole('heading', { name: 'Project Typhoon', level: 1 })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close article' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});

describe('M3 SkillsSection', () => {
  it('renders all 5 categories, 16 skills, and 3-dot proficiency indicators', () => {
    const { container } = render(
      <SkillsSection skillsData={DEFAULT_SKILLS_DATA} />
    );

    const categories = container.querySelectorAll('.skill-category.lg-glass');
    expect(categories).toHaveLength(5);

    const items = container.querySelectorAll('.skill-item');
    expect(items).toHaveLength(16);

    const pythonItem = screen.getByText('Python').closest('.skill-item')!;
    expect(pythonItem.querySelectorAll('.skill-dot.is-active')).toHaveLength(3);

    const cppItem = screen.getByText('C/C++').closest('.skill-item')!;
    expect(cppItem.querySelectorAll('.skill-dot.is-active')).toHaveLength(2);

    const jsItem = screen.getByText('JavaScript').closest('.skill-item')!;
    expect(jsItem.querySelectorAll('.skill-dot.is-active')).toHaveLength(1);
  });

  it('filters skills by category tab and search query with empty state', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SkillsSection skillsData={DEFAULT_SKILLS_DATA} />
    );

    await user.click(
      screen.getByRole('radio', { name: 'CAD & Mechanical Design' })
    );
    expect(container.querySelectorAll('.skill-category')).toHaveLength(1);
    expect(screen.getByText('Fusion 360')).toBeInTheDocument();
    expect(screen.queryByText('Python')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'All' }));
    const searchInput = screen.getByRole('searchbox', { name: 'Search skills' });
    await user.type(searchInput, 'MATLAB');
    expect(screen.getByText('MATLAB')).toBeInTheDocument();
    expect(screen.getByText('MATLAB Simulink')).toBeInTheDocument();
    expect(screen.queryByText('LaTeX')).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'NoSuchSkillXYZ');
    expect(container.querySelector('.filter-empty')).toBeInTheDocument();
  });
});

describe('M3 App URL Deep-Linking', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
    vi.restoreAllMocks();
  });

  it('opens ProjectModal automatically when ?project=typhoon is in the URL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => SKILLS_FALLBACK_CSV,
    } as Response);

    window.history.replaceState({}, '', '/?project=typhoon');
    const { container } = render(<App />);

    await waitFor(() => {
      const dialog = container.querySelector('#project-modal') as HTMLDialogElement;
      expect(dialog).toHaveAttribute('open');
    });

    expect(
      within(container.querySelector('#project-modal-body') as HTMLElement).getByRole(
        'heading',
        { name: 'Project Typhoon', level: 1 }
      )
    ).toBeInTheDocument();
  });

  it('opens ProjectModal automatically when #projects/typhoon hash is in the URL and cleans up URL state on close', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => SKILLS_FALLBACK_CSV,
    } as Response);

    window.history.replaceState({}, '', '/#projects/typhoon');
    const { container } = render(<App />);

    await waitFor(() => {
      const dialog = container.querySelector('#project-modal') as HTMLDialogElement;
      expect(dialog).toHaveAttribute('open');
    });

    await user.click(screen.getByRole('button', { name: 'Close article' }));
    await waitFor(() => {
      expect(container.querySelector('#project-modal')).not.toHaveAttribute('open');
    });
    expect(window.location.hash).toBe('#projects');
  });

  it('removes ?project=typhoon query param when closing the modal and syncs on hashchange', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => SKILLS_FALLBACK_CSV,
    } as Response);

    window.history.replaceState({}, '', '/?project=typhoon&ref=hero');
    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.querySelector('#project-modal')).toHaveAttribute('open');
    });

    await user.click(screen.getByRole('button', { name: 'Close article' }));
    await waitFor(() => {
      expect(container.querySelector('#project-modal')).not.toHaveAttribute('open');
    });
    expect(window.location.search).toBe('?ref=hero');

    // Navigating to #projects/typhoon opens modal, and navigating away closes it
    window.history.replaceState({}, '', '/#projects/typhoon');
    fireEvent(window, new Event('hashchange'));
    await waitFor(() => {
      expect(container.querySelector('#project-modal')).toHaveAttribute('open');
    });

    window.history.replaceState({}, '', '/#about');
    fireEvent(window, new Event('hashchange'));
    await waitFor(() => {
      expect(container.querySelector('#project-modal')).not.toHaveAttribute('open');
    });
  });
});
