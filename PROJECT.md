# Project: Xander Vanhaeren Engineering Portfolio — React + Glisse Liquid Glass Rewrite

## Architecture

### Overview
Full rewrite of the `React` branch in `/home/antigravity/XanderVanhaeren/XanderVanhaeren.github.io` from vanilla HTML/CSS/JS (`V1` at commit `a14f65e`) to a modern **React 19 + TypeScript + Vite 6** application powered by **`glisse@0.6.0`** (Apple iOS 26 Liquid Glass for React with real Snell's-law SVG/WebGL chromatic refraction, specular rim lighting, and spring-physics lenses).

All content, engineering case-study narratives, telemetry figures, CAD/CFD imagery, CSV skill data, and interactive capabilities from `V1` are preserved and elevated with authentic `glisse` Liquid Glass components (`Glass`, `TabBar`, `SegmentedControl`, `Button`, `SearchField`, `Input`, `Switch`, `Slider`, `Menu`).

### Module Boundaries & Data Flow
1. **Build, Static Assets & Data Layer (`src/data/`, `src/types/`, `public/assets/`)**:
   - All static assets (`Logo/`, `images/projects/Typhoon/`, `data/skills.csv`) are served from `public/assets/` (and preserved at `/assets/...` in build output `dist/assets/`) so every `V1` asset URL works identically in dev, preview, and production builds. `assets/Affinity/Logo.af` and `.agents/` are excluded from production and git tracking.
   - Typed portfolio dataset (`src/data/portfolioData.ts`) containing verbatim `V1` personal metadata, hero telemetry fieldnotes, about bio, 3 engineering approach phases (`01 // Simulate`, `02 // Fabricate`, `03 // Control`), education, 7 focus-area tags, 3 projects (`Project Typhoon`, `RCXD`, `BikeySens`), proof-of-work gallery items (replacing placeholder SVGs with real high-res Typhoon renders while retaining captions and metadata), and the full 5-section `Project Typhoon` engineering case-study article data.
   - CSV parser & loader (`src/data/skillsData.ts`) that parses semicolon-delimited `assets/data/skills.csv` (with deterministic synchronous fallback matching all 5 categories and 16 skills) and normalizes proficiency levels (`advanced`, `intermediate`, `beginner`).

2. **App Shell, Liquid Glass Navigation, Theme/Glass Controls & Topographic Canvas (`src/components/layout/`, `src/components/hero/`)**:
   - **Floating Liquid Glass Navbar (`Navbar.tsx`)**: Built with `glisse` `<Glass>` and `<TabBar>` (for `Home`, `About`, `Projects`, `Skills` navigation with spring-physics refractive lens thumb + active scroll-spy tracking), brand logo (`XV.`), mobile responsive drawer toggle, and a `glisse` `<Menu>` / `<Switch>` / `<Slider>` Liquid Glass Optics HUD popover allowing users to inspect or tune live `glisse` refraction parameters (`--lg-blur`, `--lg-glass-bend`, `--lg-glass-dispersion`) and toggle reduced-motion / high-contrast telemetry mode.
   - **Hero Section (`HeroSection.tsx`) & Interactive Topographic Isobar Canvas (`TopoCanvas.tsx`)**:
     - Marked with `data-glisse-backdrop` so overlapping `glisse` `<Glass>` cards refract the live contour field.
     - Marching-squares 14-level isobar contour canvas with pointer-reactive Gaussian ridge, `IntersectionObserver` off-screen pause, and `prefers-reduced-motion` support.
     - Eyebrow coordinate badge (`Leuven, Belgium · 50.88° N, 4.70° E`), `h1` (`Xander Vanhaeren`), subtitle (`Engineering Sciences Student · Aerospace & Embedded Systems`), description, `glisse` `<Button variant="filled">` (`Explore Projects`) and `<Button variant="glass">` (`About & Workbench`), and `glisse` `<Glass>` `Flight & Lab Telemetry` (`ISO // 1013.25 hPa`) definition list card.
   - **About & Engineering Approach Section (`AboutSection.tsx`)**:
     - Bio card, 3 `glisse` `<Glass>` Engineering Loop cards (`01 // Simulate`, `02 // Fabricate`, `03 // Control`), KU Leuven B.Sc. Education card, and 7 Core Domains interest pills.
   - **Footer (`Footer.tsx`)**:
     - Copyright (`© 2026 Xander Vanhaeren · Built in Leuven, Belgium`), coordinates (`50.8798° N, 4.7005° E · KU Leuven Engineering Sciences`), and quick jump links.

3. **Projects Showcase, Interactive Filtering, Case-Study Modal & Standalone Route (`src/components/projects/`, `src/components/skills/`)**:
   - **Projects Section (`ProjectsSection.tsx`)**:
     - Interactive category filter using `glisse` `<SegmentedControl>` (`All`, `Aerospace`, `Robotics`, `Telemetry`) and `<SearchField>` for filtering projects by technology/keyword (defaulting to `"all"` and `""` so all 3 projects are visible initially).
     - Featured `Project Typhoon` card (`glisse` `<Glass>`) with `NACA 2412`, `821 g`, `13.7 m/s`, `TARS V2 (ESP32-C6)` specs, 5 technology tags, primary CFD image (`VelocitySolidworks.png`), 2-item subgallery (`typhoon-v3.jpg`, `tars-v2.jpg`), and `Read full engineering article →` action.
     - `RCXD` card (`glisse` `<Glass>`) with custom `rover` SVG contour diagram (`TERRAIN CONTOUR // WAYPOINT NAV`), specs, and tags.
     - `BikeySens` card (`glisse` `<Glass>`) with custom `telemetry` SVG elevation diagram (`ELEVATION RIDGE // BLE TELEMETRY`), specs, and tags.
     - Proof-of-Work Workbench Gallery (`.proof-grid`) showcasing real Typhoon V3 CAD & CFD renders with interactive lightbox/inspection.
   - **Project Typhoon Engineering Case-Study (`TyphoonArticle.tsx` & `ProjectModal.tsx`)**:
     - Full 5-section engineering article (`Research Question & Airfoil Selection`, `Airframe & Structural Evolution`, `CFD Validation in SolidWorks`, `Custom Avionics: TARS V2 & Saturn OS`, `Test Campaign & First Flight`), 6 article specs (`680 mm × 602 mm`, `821 g (wings < 60 g each)`, `NACA 2412 (4° → 2° washout)`, `2 × 50 mm EDF · 12.96 N thrust`, `1.61 (1034 W peak)`, `TARS V2 (24 g, ESP32-C6 + MPU-6050)`), 5 tags, and all 4 figures (`typhoon-v3.jpg`, `VelocitySolidworks.png`, `Fuselage Flowsim.png`, `tars-v2.jpg`).
     - Accessible both via the in-page `glisse` `<Glass>` `<dialog id="project-modal">` modal AND as a standalone page/route (`/projects/typhoon.html` and `?project=typhoon` / `#projects/typhoon`) with multi-page Vite build entry (`projects/typhoon.html`) so direct navigation to `/projects/typhoon.html` works identically to `V1`.
   - **Skills & Instruments Section (`SkillsSection.tsx`)**:
     - Category filter via `glisse` `<SegmentedControl>` (`All` + 5 categories) and `<SearchField>` skill search.
     - Renders all 5 categories (`Programming`, `Electronics & Embedded Systems`, `CAD & Mechanical Design`, `Data Analysis & Simulation`, `Tools & Technologies`) and all 16 skills inside `glisse` `<Glass>` cards with visual 3-dot proficiency indicators (`advanced`, `intermediate`, `beginner`) and live CSV sync from `assets/data/skills.csv`.

---

## Feature Inventory

Every feature from the Phase 0 Survey appears below with its assigned milestone.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Vite 6 + React 19 + TypeScript + `glisse@0.6.0` Build & Multi-Page Config | Project scaffolding, `glisse@0.6.0` installation, `import "glisse/styles.css"`, multi-page Vite build (`index.html` and `projects/typhoon.html`), `.gitignore` (excluding `.agents/`, `node_modules/`, `dist/`), and `.github/workflows/deploy.yml` | M1 | survey_2, survey_3 |
| F2 | Static Assets & SEO/Meta Preservation | All 16 brand & Typhoon assets under `public/assets/`, `assets/data/skills.csv`, favicons (`favicon.svg`, `favicon.ico`, `Logo.svg`), OpenGraph/Twitter meta tags, canonical URL, and Google Fonts (`Inter`, `JetBrains Mono`) | M1 | survey_1, survey_3 |
| F3 | Typed Portfolio & Skills Data Layer | Structured TypeScript data module (`portfolioData.ts`) with all V1 copy/specs/articles and semicolon-CSV parser (`skillsData.ts`) with fetch + fallback for all 16 skills across 5 categories | M1 | survey_1 |
| F4 | Liquid Glass Design System & CSS Tokens | Vanilla CSS architecture integrating V1 dark aerospace tokens (`#0B0D11`, `#3A95D8`, `#5EB0EC`) with `glisse@0.6.0` CSS custom properties (`--lg-blur`, `--lg-glass-bend`, `--lg-glass-dispersion`, `--lg-rim-shine`), explicit `border-radius` on all `<Glass>` surfaces, and responsive breakpoints (`900px`, `768px`, `480px`, `prefers-reduced-motion`) | M1 | survey_1, survey_2 |
| F5 | Floating Liquid Glass Navbar & Navigation Controls | Fixed `header#navbar` using `glisse` `<Glass>`, `<TabBar>` navigation (`Home`, `About`, `Projects`, `Skills`) with spring-physics lens & scroll-spy, `XV.` brand logo, mobile menu toggle (`.nav-toggle`), keyboard navigation (`Arrow`, `Home`, `End`, `Escape`), and Skip-to-Content link (`.skip-link`) | M2 | survey_1, survey_2 |
| F6 | Interactive Liquid Glass Optics HUD (`glisse` Controls) | Interactive popover/panel using `glisse` `<Menu>`, `<Switch>`, and `<Slider>` (`onCheckedChange`, `onValueChange`) allowing live adjustment of `--lg-blur`, `--lg-glass-bend`, `--lg-glass-dispersion`, and contour animation toggle | M2 | survey_2 |
| F7 | Hero Section & Telemetry Fieldnotes | Hero layout (`section#home`) with eyebrow (`Leuven, Belgium · 50.88° N, 4.70° E`), `h1` (`Xander Vanhaeren`), subtitle, description, `glisse` `<Button variant="filled">` & `<Button variant="glass">` CTAs, and `glisse` `<Glass>` `Flight & Lab Telemetry` (`ISO // 1013.25 hPa`) definition list | M2 | survey_1, survey_2 |
| F8 | Interactive Topographic Isobar Canvas | `<canvas id="topo-canvas" class="topo-canvas">` rendering 14 marching-squares isobar contours over a Gaussian + wave scalar field with cursor-reactive pointer ridge, `data-glisse-backdrop` registration, `IntersectionObserver` pause, and `prefers-reduced-motion` support | M2 | survey_1, survey_2 |
| F9 | About & Engineering Approach Section | `section#about` with profile kicker/title/subtitle, bio card, 3 `glisse` `<Glass>` Engineering Loop cards (`01 // Simulate`, `02 // Fabricate`, `03 // Control`), KU Leuven B.Sc. Education card, and 7 Focus Areas & Hardware tags, plus Footer (`footer.footer`) | M2 | survey_1, survey_2 |
| F10 | Projects Showcase & Interactive `glisse` Filtering | `section#projects` with `glisse` `<SegmentedControl>` category filter & `<SearchField>` search, featured `Project Typhoon` `<Glass>` card (specs, tags, primary image, 2-image subgallery), `RCXD` card (with `rover` SVG diagram), `BikeySens` card (with `telemetry` SVG diagram), and `.proof-grid` showcase | M3 | survey_1, survey_2 |
| F11 | Project Typhoon Article Modal & Standalone Page (`projects/typhoon.html`) | Full 5-section Project Typhoon engineering case study rendered inside `<dialog id="project-modal">` (open on card/button click, close on `.project-modal-close`, backdrop click, or `Escape`) AND on standalone `/projects/typhoon.html` with `← Back to Portfolio` link, all 6 specs, 5 tags, and 4 figures | M3 | survey_1, survey_3 |
| F12 | Skills & Instruments Interactive Matrix | `section#skills` with `glisse` `<SegmentedControl>` category selector and `<SearchField>` filter, rendering all 5 categories and 16 skills from `assets/data/skills.csv` in `glisse` `<Glass>` cards with 3-dot proficiency indicators (`advanced`, `intermediate`, `beginner`) | M3 | survey_1, survey_2 |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundation, Data Layer & Glisse Design System | F1, F2, F3, F4: Scaffold Vite 6 + React 19 + TS + `glisse@0.6.0`, configure multi-page build (`index.html` + `projects/typhoon.html`), set up `public/assets/`, `.gitignore` (ignoring `.agents/`, `node_modules/`, `dist/`), `.github/workflows/deploy.yml`, typed `portfolioData.ts` & `skillsData.ts`, global `styles.css` with `glisse` tokens, and unit tests for data/CSV parsing. | none | DONE (`package.json`, `vite.config.ts`, `playwright.config.ts`, `src/types/portfolio.ts`, `src/data/portfolioData.ts`, `src/data/skillsData.ts`, `src/styles/styles.css`, `src/test/data.test.ts` — 9/9 unit tests pass, auditor CLEAN) |
| M2 | App Shell, Liquid Glass Navbar, Optics HUD, Hero & About | F5, F6, F7, F8, F9: Implement `Navbar.tsx` (`Glass`, `TabBar`, mobile drawer, keyboard nav, scroll-spy), `GlassOpticsHud.tsx` (`Menu`, `Switch`, `Slider`), `TopoCanvas.tsx` (marching-squares canvas + `data-glisse-backdrop`), `HeroSection.tsx` (`Button`, `Glass` telemetry), `AboutSection.tsx` (`Glass` approach/education/interests), and `Footer.tsx`, with unit tests. | M1 | DONE (`Navbar.tsx`, `GlassOpticsHud.tsx`, `Footer.tsx`, `HeroSection.tsx`, `TopoCanvas.tsx`, `AboutSection.tsx`, `App.tsx`, `src/test/m2.test.tsx` — 16/16 unit tests pass, auditor CLEAN) |
| M3 | Projects Showcase, Typhoon Modal/Standalone Page & Skills Matrix | F10, F11, F12: Implement `ProjectsSection.tsx` (`Glass`, `SegmentedControl`, `SearchField`, `RCXD` & `BikeySens` SVG diagrams, `.proof-grid`), `TyphoonArticle.tsx` & `ProjectModal.tsx` (in-page modal `<dialog id="project-modal">` + standalone `projects/typhoon.html` entry), and `SkillsSection.tsx` (`Glass`, `SegmentedControl`, `SearchField`, 5 categories / 16 skills from CSV), wired into `App.tsx` and `typhoonMain.tsx` with unit tests. | M1, M2 | DONE (`ProjectDiagrams.tsx`, `TyphoonArticle.tsx`, `ProjectModal.tsx`, `ProjectsSection.tsx`, `SkillsSection.tsx`, `typhoonMain.tsx`, `App.tsx`, `styles.css`, `src/test/m3.test.tsx` — 28/28 unit tests pass, 2 Reviewers APPROVE, 2 Challengers APPROVE, auditor CLEAN) |
| M4 | Final Milestone: Full E2E Suite Pass (Tiers 1-4) & Adversarial Coverage Hardening (Tier 5) | Phase 1: Wait for `TEST_READY.md` from E2E Testing Track and pass 100% of E2E tests across Tiers 1–4. Phase 2: White-box Tier 5 adversarial coverage hardening (Challenger → Worker → Reviewer loop until zero gaps remain). | M1, M2, M3, E2E Track | DONE (`sub_orch_m4_r2` — `npx tsc --noEmit` 0, `npm run build` 0; `npm test` 4 files / 33/33 passed (`data.test.ts` 9, `m2.test.tsx` 7, `m3.test.tsx` 12, `tier5.test.tsx` 5); Playwright E2E 157/157 passed across all 5 specs (`tier1` 60/60, `tier2` 64/64, `tier3` 16/16, `tier4` 9/9, `tier5` 8/8); 2 Reviewers APPROVE, 2 Challengers APPROVE, Forensic Auditor CLEAN) |

---

## Interface Contracts

### `src/types/portfolio.ts` ↔ All Components
```ts
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SkillItem {
  name: string;
  level: SkillLevel;
}

export interface SkillCategory {
  category: string;
  skills: SkillItem[];
}

export interface ProjectSpec {
  label: string;
  value: string;
}

export interface ProjectGalleryItem {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  filterGroup: 'aerospace' | 'robotics' | 'telemetry';
  featured?: boolean;
  description: string;
  technologies: string[];
  specs: ProjectSpec[];
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  diagram?: 'rover' | 'telemetry';
  gallery?: ProjectGalleryItem[];
  articleUrl?: string;
}

export interface GlassOpticsSettings {
  blur: number;        // --lg-blur in px (default 14)
  bend: number;        // --lg-glass-bend (default 1.6)
  dispersion: number;  // --lg-glass-dispersion (default 0.6)
  pauseContours: boolean;
}
```

### `glisse@0.6.0` Component Contracts
- Always import `"glisse/styles.css"` in entry points (`src/main.tsx`, `src/typhoonMain.tsx`).
- Every `<Glass>` element MUST have an explicit `border-radius` via CSS class or inline style (`borderRadius`) so `glisse`'s `shapeOf()` computes a rounded bezel and specular rim (`--lg-rim`).
- Use `onValueChange` (NOT `onChange`) on `TabBar`, `SegmentedControl`, `SearchField`, `Input`, and `Slider`.
- Use `onCheckedChange` (NOT `onChange`) on `Switch`.
- Set `data-theme="dark"` on `document.documentElement` (`<html>`) and `data-glisse-backdrop` on the hero/background canvas wrapper.

---

## Code Layout

```
/home/antigravity/XanderVanhaeren/XanderVanhaeren.github.io/
├── .gitignore                        # Must ignore .agents, node_modules, dist, coverage, test-results, playwright-report
├── .github/workflows/deploy.yml      # GitHub Pages build & deployment workflow
├── index.html                        # Main Vite HTML entry point (Portfolio home)
├── projects/
│   └── typhoon.html                  # Standalone Vite HTML entry point (Project Typhoon article)
├── package.json                      # Dependencies (react, react-dom, glisse) & scripts (dev, build, preview, test, test:e2e)
├── tsconfig.json                     # TypeScript config
├── vite.config.ts                    # Multi-page Vite + Vitest configuration (base: '/')
├── playwright.config.ts              # Playwright config using /usr/bin/chromium (--no-sandbox)
├── public/
│   └── assets/                       # Public static assets served at /assets/...
│       ├── Logo/
│       │   ├── Logo.svg
│       │   ├── favicon.ico
│       │   └── favicon.svg
│       ├── data/
│       │   └── skills.csv
│       └── images/projects/Typhoon/  # All Typhoon JPG/PNG renders
├── src/
│   ├── main.tsx                      # Main portfolio React entry
│   ├── typhoonMain.tsx               # Standalone Project Typhoon page React entry
│   ├── App.tsx                       # Root portfolio component
│   ├── styles/
│   │   └── styles.css                # Global Liquid Glass + aerospace design system CSS
│   ├── types/
│   │   └── portfolio.ts              # Shared TypeScript interfaces & CSSProperties augmentation
│   ├── data/
│   │   ├── portfolioData.ts          # Verbatim V1 portfolio + Typhoon article data
│   │   └── skillsData.ts             # Semicolon CSV parser, fetcher & fallback skills data
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Glisse Glass + TabBar + mobile menu + GlassOpticsHud
│   │   │   ├── GlassOpticsHud.tsx    # Glisse Menu/Slider/Switch live refraction tuner
│   │   │   └── Footer.tsx            # Footer with copyright & Leuven coordinates
│   │   ├── hero/
│   │   │   ├── HeroSection.tsx       # Hero content, Glisse Buttons, Flight & Lab Telemetry Glass card
│   │   │   └── TopoCanvas.tsx        # Interactive marching-squares isobar contour canvas
│   │   ├── about/
│   │   │   └── AboutSection.tsx      # Bio, 3 Engineering Loop Glass cards, Education & Focus tags
│   │   ├── projects/
│   │   │   ├── ProjectsSection.tsx   # Glisse SegmentedControl + SearchField, Project cards, Proof grid
│   │   │   ├── ProjectDiagrams.tsx   # Rover & Telemetry inline SVG contour diagrams
│   │   │   ├── ProjectModal.tsx      # Native <dialog id="project-modal"> wrapped with Glisse Glass
│   │   │   └── TyphoonArticle.tsx    # Full 5-section Project Typhoon engineering case-study component
│   │   └── skills/
│   │       └── SkillsSection.tsx     # Glisse SegmentedControl + SearchField + 5-category / 16-skill Glass grid
│   └── test/
│       ├── setup.ts                  # Vitest + jsdom setup (ResizeObserver, matchMedia, Canvas mocks)
│       └── *.test.tsx                # Unit & component tests
└── e2e/                              # Owned by E2E Testing Track (Tiers 1-5 Playwright suite)
```
