# E2E Test Infrastructure (`TEST_INFRA.md`)

## Application Type
`web-app` — Multi-page **Vite 6 + React 19 + TypeScript** application powered by **`glisse@0.6.0`** (Apple iOS 26 Liquid Glass UI library), with two HTML entry points:
- `/` (`index.html` — Main Engineering Portfolio with Hero, Topographic Isobar Canvas, About, Projects, In-Page Typhoon Modal, Skills Matrix, and Liquid Glass Optics HUD)
- `/projects/typhoon.html` (`projects/typhoon.html` — Standalone Project Typhoon Engineering Case Study)

## How to Start the Application
1. **Build & Preview (Production E2E Target — Port `4173`)**:
   ```bash
   npm run build && npm run preview -- --host 127.0.0.1 --port 4173
   ```
2. **Development Server (Dev E2E Target — Port `5173`)**:
   ```bash
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
Playwright's `webServer` configuration in `playwright.config.ts` automatically launches the server on `http://127.0.0.1:4173` if not already running.

## How to Run E2E Tests
- **Full E2E Suite (Tiers 1–4)**:
  ```bash
  npx playwright test
  ```
  or via npm script:
  ```bash
  npm run test:e2e
  ```
- **Individual Tiers**:
  - Tier 1 (Feature Coverage): `npx playwright test e2e/tier1-features.spec.ts`
  - Tier 2 (Boundary & Corner Cases): `npx playwright test e2e/tier2-boundaries.spec.ts`
  - Tier 3 (Cross-Feature Combinations): `npx playwright test e2e/tier3-combinations.spec.ts`
  - Tier 4 (Real-World Scenarios & Asset Audit): `npx playwright test e2e/tier4-scenarios.spec.ts`

## Browser & Environment Configuration
- **Browser Binary**: Pre-installed system Chromium 156 at `/usr/bin/chromium`
- **Launch Flags**: `['--no-sandbox', '--disable-setuid-sandbox']`
- **Headless Mode**: `true`
- **Base URL**: `http://127.0.0.1:4173`

## Test Directory Structure
```text
e2e/
├── helpers.ts                  # Shared opaque-box locators, console tracker & glisse interaction helpers
├── tier1-features.spec.ts      # Tier 1: Feature coverage across F1–F12 (>= 60 tests)
├── tier2-boundaries.spec.ts    # Tier 2: Boundary, viewport, keyboard & edge cases (>= 60 tests)
├── tier3-combinations.spec.ts  # Tier 3: Cross-feature combinations (>= 15 tests)
└── tier4-scenarios.spec.ts     # Tier 4: Real-world user journeys & asset integrity audit (>= 8 tests)
```
