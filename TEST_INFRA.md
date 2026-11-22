# E2E Test Infrastructure (`TEST_INFRA.md`)

## Application Type
`web-app` — Static multi-page **Vite 6 + React 19 + TypeScript** personal engineering showcase portfolio (`base: '/'`, built to `./dist`) with **5 HTML entry points**:
- `/` (`index.html` — Dark minimal `#1B1B1B` home view with left identity column `"Xander Vanhaeren."` / `"Engineering Student / KU Leuven"`, interactive 4-tile project grid, and native `<dialog>` article preview overlay)
- `/projects/typhoon.html` (`projects/typhoon.html` — Full-page Project Typhoon article)
- `/projects/bikeysens.html` (`projects/bikeysens.html` — Full-page Bikeysens article)
- `/projects/rcxd.html` (`projects/rcxd.html` — Full-page RCXD article)
- `/projects/team-214.html` (`projects/team-214.html` — Full-page Peno team 214 article)

## How to Start the Application
1. **Build & Preview (Production E2E Target — Port `4173`)**:
   - POSIX / CMD:
     ```bash
     npm run build && npm run preview -- --host 127.0.0.1 --port 4173
     ```
   - Windows PowerShell (when `npm.ps1` execution policy is restricted):
     ```powershell
     npm.cmd run build; npm.cmd run preview -- --host 127.0.0.1 --port 4173
     ```
2. **Development Server (Dev E2E Target — Port `5173`)**:
   ```bash
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
Playwright's `webServer` configuration in `playwright.config.ts` automatically launches `npm.cmd run preview -- --host 127.0.0.1 --port 4173` on Windows (`npm run preview -- --host 127.0.0.1 --port 4173` on POSIX) on `http://127.0.0.1:4173` if not already running (`reuseExistingServer: !process.env.CI`).

## How to Run E2E Tests
- **Type-Check E2E Suite**:
  - POSIX / CMD: `npx tsc -p e2e/tsconfig.json --noEmit`
  - Windows PowerShell: `npx.cmd tsc -p e2e/tsconfig.json --noEmit`
- **Full E2E Suite (Tiers 1–4)**:
  - POSIX / CMD: `npx playwright test` (or `npm run test:e2e`)
  - Windows PowerShell: `npx.cmd playwright test` (or `node ./node_modules/@playwright/test/cli.js test`)
- **Individual Tiers**:
  - Tier 1 (Feature Coverage — Category Partition): `npx playwright test e2e/tier1-features.spec.ts`
  - Tier 2 (Boundary & Corner Cases — BVA): `npx playwright test e2e/tier2-boundaries.spec.ts`
  - Tier 3 (Cross-Feature Combinations — Pairwise): `npx playwright test e2e/tier3-combinations.spec.ts`
  - Tier 4 (Real-World Scenarios & Asset Audit — Workload): `npx playwright test e2e/tier4-scenarios.spec.ts`

## Browser & Environment Configuration
- **Cross-Platform Chromium Resolution (`playwright.config.ts`)**:
  1. Uses `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if set and present on disk.
  2. On **Linux**, checks `/usr/bin/chromium`, `/usr/bin/chromium-browser`, `/usr/bin/google-chrome` with `['--no-sandbox', '--disable-setuid-sandbox']`.
  3. Uses Playwright's managed Chromium (`chromium.executablePath()`) if its headless shell or full binary exists on disk.
  4. Scans Playwright's cache directory (`PLAYWRIGHT_BROWSERS_PATH`, `%LOCALAPPDATA%\ms-playwright` on Windows, `~/.cache/ms-playwright` on Linux, `~/Library/Caches/ms-playwright` on macOS) sorted descending by revision for `chromium-*` / `chromium_headless_shell-*`.
  5. On **Windows** (`win32`), falls back to Microsoft Edge (`msedge.exe`) if no Playwright Chromium is found.
- **Headless Mode**: `true`
- **Base URL**: `http://127.0.0.1:4173`

## Feature Coverage & Methodology (4-Tier Matrix, N = 6)

| Feature | Scope |
|---|---|
| **F1** | Home Dark Minimal Layout & Identity (`#1B1B1B`, monospace `"Xander"`/`"Vanhaeren."`, `"Engineering Student"`/`"KU Leuven"`, `8px` rounded tiles, legacy removal) |
| **F2** | High-Res Bundled Tile Imagery & Zero Errors (`typhoon`, `bikeysens`, `rcxd`, `team-214`, `naturalWidth > 0`, 0 failed requests/404s, 0 console/page errors) |
| **F3** | Desktop Even 2×2 Grid & Hover Grow/Shrink Geometry (`1440×900`, `1280×800`: even 2×2 at rest; hovering any tile strictly increases its area while all 3 others strictly decrease; `prefers-reduced-motion`) |
| **F4** | Tablet Reference Proportions & Phone Single-Column Stack (`640–1023px`: `56:44` cols, `52:48` rows; `< 640px`: vertical stack, zero horizontal overflow) |
| **F5** | Interactive `<dialog>` Article Overlay (click & keyboard activation on all 4 tiles, title/summary, close via `×`/`Escape`/backdrop, `<a href="/projects/<slug>.html">` link) |
| **F6** | Four Full-Page Project Articles (`/projects/{typhoon,bikeysens,rcxd,team-214}.html`: rich technical write-up, bundled `<img>` media `naturalWidth > 0`, zero 404s/errors, back-to-home `<a href="/">` link) |

## Test Directory Structure
```text
e2e/
├── tsconfig.json               # TypeScript project config validating playwright.config.ts and e2e/**/*.ts
├── helpers.ts                  # Shared opaque-box locators, deterministic settling, geometry & diagnostics helpers
├── tier1-features.spec.ts      # Tier 1 (Category-Partition): 36 tests across F1–F6 (6 per feature)
├── tier2-boundaries.spec.ts    # Tier 2 (BVA): 36 boundary & edge-case tests across F1–F6 (6 per feature)
├── tier3-combinations.spec.ts  # Tier 3 (Pairwise): 10 cross-feature combination tests (>= 6 min)
└── tier4-scenarios.spec.ts     # Tier 4 (Workload): 7 real-world scenario & full asset/error audit tests (>= 5 min)
```
*(Total Tiers 1–4: **89 tests**, exceeding the `>= 71` threshold; `e2e/tier5-adversarial.spec.ts` is reserved for M4 Phase 2.)*
