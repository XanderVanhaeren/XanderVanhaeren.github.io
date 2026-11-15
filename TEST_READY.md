# E2E Test Suite Ready (`TEST_READY.md`)

- **Status**: `READY`
- **Published At**: `2026-11-14T23:52:00Z`
- **Orchestrator**: `sub_orch_e2e`
- **Total E2E Tests (Tiers 1–4)**: **149 Playwright E2E tests**

## Suite Breakdown

| Tier | File | Test Count | Scope & Coverage |
|------|------|-----------:|------------------|
| Shared Helpers | `e2e/helpers.ts` | — | Opaque-box locators (`getNavTab`, `navigateViaNavbar`, `selectCategorySegment`, `setSectionSearchQuery`, `clearSectionSearch`, `openGlassOpticsHud`, `setSliderValue`, `openTyphoonModal`, `closeTyphoonModal`, `getActiveGlassOpticsVars`, `attachConsoleErrorTracker`) |
| **Tier 1** | `e2e/tier1-features.spec.ts` | **60** | 5 tests per feature across all 12 features (`F1`–`F12`: Build/Multi-Page, Static Assets & SEO/Meta, Typed Portfolio & `skills.csv` Data Layer, Liquid Glass Design Tokens & `border-radius > 0`, Floating Navbar & `TabBar`, `GlassOpticsHud` Sliders/Switch, Hero & Telemetry Fieldnotes, Interactive `TopoCanvas`, About & Engineering Loop + Footer, Projects Showcase & `SegmentedControl`/`SearchField` + SVG Diagrams, `ProjectModal` & `/projects/typhoon.html`, Skills & Instruments 3-dot Matrix) |
| **Tier 2** | `e2e/tier2-boundaries.spec.ts` | **64** | 5–6 boundary & corner-case tests per feature across `F1`–`F12` (empty/whitespace/special-char/no-match queries, clear button, rapid `SegmentedControl` & `TabBar` switching, `Escape` & backdrop clicks on `#project-modal` and mobile menu, viewports `320×568`, `375×667`, `768×1024`, `1440×900`, `1920×400`, `prefers-reduced-motion: reduce`, slider min/max bounds, direct `/projects/typhoon.html` & deep links, HTTP 500/offline/malformed `skills.csv` fallback, keyboard navigation) |
| **Tier 3** | `e2e/tier3-combinations.spec.ts` | **16** | Cross-feature combinations (`SegmentedControl` + `SearchField` in Projects & Skills, `GlassOpticsHud` live tuning across `.lg-glass` cards + `#project-modal` + `#topo-canvas`, desktop/mobile `TabBar` navigation with active filters, filtered card → modal → standalone `/projects/typhoon.html` → `← Back to Portfolio`) |
| **Tier 4** | `e2e/tier4-scenarios.spec.ts` | **9** | Real-world end-to-end journeys (Aerospace Recruiter walkthrough, KU Leuven Peer Hardware/Robotics walkthrough, Mobile `375×667` Commuter walkthrough, Keyboard-only Accessibility journey, Live Liquid Glass Optics & TopoCanvas telemetry journey, Multi-page resilience, Offline `skills.csv` resilience, Reduced-motion journey, and Full Asset Integrity `complete && naturalWidth > 0` + Zero Console/Page Error + `.agents/` & `Logo.af` Exclusion Audit) |

## Execution Command
```bash
npx playwright test
```
(See `TEST_INFRA.md` for full server and configuration details.)
