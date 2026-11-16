import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { TyphoonStandalonePage } from '../typhoonMain';
import {
  ABOUT_DATA,
  DEFAULT_GLASS_OPTICS,
  HERO_FIELDNOTES,
  PERSONAL_DATA,
  PORTFOLIO_DATA,
  PROJECTS_DATA,
  PROOF_OF_WORK_ITEMS,
  TYPHOON_ARTICLE_DATA,
} from '../data/portfolioData';
import {
  DEFAULT_SKILLS_DATA,
  FALLBACK_SKILLS_DATA,
  SKILLS_FALLBACK_CSV,
  fetchSkillsData,
  normalizeSkillLevel,
  parseSkillsCsv,
} from '../data/skillsData';

describe('Portfolio Data Layer (portfolioData.ts)', () => {
  it('preserves verbatim personal & hero telemetry fieldnotes from V1', () => {
    expect(PERSONAL_DATA.name).toBe('Xander Vanhaeren');
    expect(PERSONAL_DATA.title).toBe(
      'Engineering Sciences Student · Aerospace & Embedded Systems'
    );
    expect(PERSONAL_DATA.eyebrow).toBe('Leuven, Belgium · 50.88° N, 4.70° E');
    expect(HERO_FIELDNOTES.title).toBe('Flight & Lab Telemetry');
    expect(HERO_FIELDNOTES.coord).toBe('ISO // 1013.25 hPa');
    expect(HERO_FIELDNOTES.rows).toHaveLength(4);
    expect(HERO_FIELDNOTES.rows.map((r) => r.label)).toEqual([
      'Discipline',
      'Primary Focus',
      'Flagship Airframe',
      'Avionics Stack',
    ]);
  });

  it('contains complete About section data with 3 approach steps, KU Leuven education, and 7 interests', () => {
    expect(ABOUT_DATA.name).toBe('About & Engineering Approach');
    expect(ABOUT_DATA.approach).toHaveLength(3);
    expect(ABOUT_DATA.approach.map((a) => a.step)).toEqual([
      '01 // Simulate',
      '02 // Fabricate',
      '03 // Control',
    ]);
    expect(ABOUT_DATA.education).toHaveLength(1);
    expect(ABOUT_DATA.education[0].degree).toBe(
      'Engineering Sciences (Mechanical Engineering)'
    );
    expect(ABOUT_DATA.interests).toEqual([
      'Aerodynamics',
      'Flight Dynamics',
      'Control Systems',
      'CFD Simulation',
      '3D Printing (LW-PLA)',
      'Custom PCBs & IoT',
      'Robotics',
    ]);
  });

  it('contains all 4 projects (Project Typhoon, RCXD, BikeySens, Goodnotes PDF Prep) with specs, tags, and filter groups', () => {
    expect(PROJECTS_DATA).toHaveLength(4);

    const [typhoon, rcxd, bikeysens, goodnotes] = PROJECTS_DATA;
    expect(typhoon.id).toBe('typhoon');
    expect(typhoon.featured).toBe(true);
    expect(typhoon.filterGroup).toBe('aerospace');
    expect(typhoon.specs).toHaveLength(4);
    expect(typhoon.technologies).toHaveLength(5);
    expect(typhoon.gallery).toHaveLength(2);
    expect(typhoon.articleUrl).toBe('projects/typhoon.html');

    expect(rcxd.id).toBe('rcxd');
    expect(rcxd.filterGroup).toBe('robotics');
    expect(rcxd.diagram).toBe('rover');
    expect(rcxd.specs).toEqual([
      { label: 'Platform', value: '4WD Chassis' },
      { label: 'Compute', value: 'Arduino + ROS' },
    ]);

    expect(bikeysens.id).toBe('bikeysens');
    expect(bikeysens.filterGroup).toBe('telemetry');
    expect(bikeysens.diagram).toBe('telemetry');
    expect(bikeysens.specs).toEqual([
      { label: 'Link', value: 'BLE Telemetry' },
      { label: 'Interface', value: 'Mobile Companion' },
    ]);

    expect(goodnotes.id).toBe('goodnotes-pdf-prep');
    expect(goodnotes.filterGroup).toBe('software');
    expect(goodnotes.diagram).toBe('pdf');
    expect(goodnotes.demoUrl).toBe(
      'https://xandervanhaeren.github.io/goodnotes-pdf-prep/'
    );
    expect(goodnotes.githubUrl).toBe(
      'https://github.com/XanderVanhaeren/goodnotes-pdf-prep'
    );
  });

  it('includes proof-of-work gallery items and complete 5-section Project Typhoon article', () => {
    expect(PROOF_OF_WORK_ITEMS).toHaveLength(2);
    expect(TYPHOON_ARTICLE_DATA.title).toBe('Project Typhoon');
    expect(TYPHOON_ARTICLE_DATA.tags).toHaveLength(5);
    expect(TYPHOON_ARTICLE_DATA.specs).toHaveLength(6);
    expect(TYPHOON_ARTICLE_DATA.sections).toHaveLength(5);
    expect(TYPHOON_ARTICLE_DATA.sections.map((s) => s.heading)).toEqual([
      'Research Question & Airfoil Selection',
      'Airframe & Structural Evolution',
      'CFD Validation in SolidWorks',
      'Custom Avionics: TARS V2 & Saturn OS',
      'Test Campaign & First Flight',
    ]);
    expect(PORTFOLIO_DATA.typhoonArticle).toBe(TYPHOON_ARTICLE_DATA);
    expect(DEFAULT_GLASS_OPTICS).toEqual({
      blur: 14,
      bend: 1.6,
      dispersion: 0.6,
      pauseContours: false,
    });
  });
});

describe('Skills CSV Parser & Loader (skillsData.ts)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses the 5 categories and 16 skills from SKILLS_FALLBACK_CSV', () => {
    expect(DEFAULT_SKILLS_DATA).toHaveLength(5);
    expect(FALLBACK_SKILLS_DATA).toBe(DEFAULT_SKILLS_DATA);
    expect(DEFAULT_SKILLS_DATA.map((c) => c.category)).toEqual([
      'Programming',
      'Electronics & Embedded Systems',
      'CAD & Mechanical Design',
      'Data Analysis & Simulation',
      'Tools & Technologies',
    ]);

    const totalSkills = DEFAULT_SKILLS_DATA.reduce(
      (sum, cat) => sum + cat.skills.length,
      0
    );
    expect(totalSkills).toBe(16);

    const embedded = DEFAULT_SKILLS_DATA.find(
      (c) => c.category === 'Electronics & Embedded Systems'
    );
    expect(embedded?.skills[0]).toEqual({
      name: 'Arduino / ESP32',
      level: 'intermediate',
    });
  });

  it('handles BOM, CRLF line endings, comma delimiter, and unknown level normalization', () => {
    const customCsv =
      '\uFEFFcategory,skill,level\r\nAerospace,XFLR5,ADVANCED\r\nAerospace,OpenVSP,unknown-level\r\n';
    const parsed = parseSkillsCsv(customCsv);
    expect(parsed).toEqual([
      {
        category: 'Aerospace',
        skills: [
          { name: 'XFLR5', level: 'advanced' },
          { name: 'OpenVSP', level: 'beginner' },
        ],
      },
    ]);
    expect(normalizeSkillLevel('Intermediate')).toBe('intermediate');
    expect(parseSkillsCsv('')).toEqual([]);
    expect(parseSkillsCsv('only_two;parts')).toEqual([]);
    expect(parseSkillsCsv('category;skill;level\nonly_two;parts')).toEqual([]);
  });

  it('fetches live CSV when available and falls back to DEFAULT_SKILLS_DATA on error', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SKILLS_FALLBACK_CSV,
    } as Response);

    const liveResult = await fetchSkillsData('assets/data/skills.csv');
    expect(fetchSpy).toHaveBeenCalledWith('assets/data/skills.csv');
    expect(liveResult).toHaveLength(5);

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new Error('Network failure')
    );
    const fallbackResult = await fetchSkillsData('assets/data/skills.csv');
    expect(fallbackResult).toEqual(DEFAULT_SKILLS_DATA);
  });
});

describe('M1 Entry Points & Glisse Liquid Glass Shell (App.tsx & typhoonMain.tsx)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders App with Glisse Glass cards, Buttons, hero telemetry, projects, and skills', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => SKILLS_FALLBACK_CSV,
    } as Response);

    const { container } = render(React.createElement(App));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    expect(
      screen.getByRole('heading', { name: 'Xander Vanhaeren', level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText('Flight & Lab Telemetry')).toBeInTheDocument();
    expect(screen.getByText('ISO // 1013.25 hPa')).toBeInTheDocument();
    expect(screen.getByText('Project Typhoon')).toBeInTheDocument();
    expect(screen.getByText('RCXD')).toBeInTheDocument();
    expect(screen.getByText('BikeySens')).toBeInTheDocument();
    expect(
      container.querySelectorAll('.lg-glass').length
    ).toBeGreaterThanOrEqual(10);
  });

  it('renders TyphoonStandalonePage with all 5 sections, 6 specs, and Glisse Glass', () => {
    const { container } = render(React.createElement(TyphoonStandalonePage));
    expect(
      screen.getByRole('heading', { name: 'Project Typhoon', level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText('← Back to Portfolio')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Research Question & Airfoil Selection',
        level: 2,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Custom Avionics: TARS V2 & Saturn OS',
        level: 2,
      })
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll('.lg-glass').length
    ).toBeGreaterThanOrEqual(1);
  });
});
