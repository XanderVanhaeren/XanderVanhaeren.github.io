# Xander Vanhaeren — Engineering Portfolio

Personal engineering portfolio for **Xander Vanhaeren** (Engineering Sciences Student at KU Leuven — Aerospace & Embedded Systems), built with **React 19**, **TypeScript**, **Vite 6**, and **`glisse`** (Liquid Glass UI).

Live site: [xandervanhaeren.github.io](https://xandervanhaeren.github.io)

## Features

- **Liquid Glass UI (`glisse`)**: Refractive glass surfaces, spring-physics `TabBar` navigation with scroll-spy, `SegmentedControl` filters, `SearchField`, and an interactive **Liquid Glass Optics HUD** to tune blur, glass bend, dispersion, and motion settings live.
- **Interactive Topographic Isobar Canvas**: Marching-squares 14-level contour field in the hero section with pointer-reactive ridge physics, `IntersectionObserver` off-screen pausing, and `prefers-reduced-motion` support.
- **Projects Showcase & Case Study**: Filterable project cards (**Project Typhoon**, **RCXD**, **BikeySens**), proof-of-work CAD/CFD gallery, and a full 5-section **Project Typhoon** engineering case study accessible both as an in-page modal and as a standalone page (`/projects/typhoon.html`).
- **Skills & Instruments Matrix**: Interactive matrix of 16 skills across 5 categories loaded from `public/assets/data/skills.csv` with category filtering, search, and proficiency indicators.

## Tech Stack

- **Framework**: React 19, TypeScript 5.8
- **Build Tool**: Vite 6 (multi-page build: `index.html` & `projects/typhoon.html`)
- **UI / Styling**: `glisse` (`^0.6.0`), custom CSS design tokens
- **Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E)
- **Deployment**: GitHub Pages

## Project Structure

```text
├── public/assets/          # Static images, logos, and skills.csv
├── projects/typhoon.html   # Standalone Project Typhoon case-study entry
├── src/
│   ├── components/
│   │   ├── hero/           # HeroSection, TopoCanvas
│   │   ├── layout/         # Navbar, GlassOpticsHud, Footer
│   │   ├── projects/       # ProjectsSection, ProjectModal, TyphoonArticle, ProjectDiagrams
│   │   └── skills/         # SkillsSection
│   ├── data/               # portfolioData.ts, skillsData.ts
│   ├── styles/             # styles.css
│   ├── test/               # Vitest unit & component tests
│   ├── types/              # TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── typhoonMain.tsx
├── e2e/                    # Playwright end-to-end test suites
├── index.html
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 20+ (24 LTS recommended)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build & Preview

```bash
npm run build
npm run preview
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking (`tsc --noEmit`) |
| `npm test` | Run unit and component tests with Vitest |
| `npm run test:e2e` | Build and run Playwright end-to-end tests |
| `npm run deploy` | Deploy to GitHub Pages via `gh-pages` |
