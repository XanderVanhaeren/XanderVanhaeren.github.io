# E2E Test Suite Ready

## Test Runner
- Command (POSIX / CMD): `npm run build && npx playwright test`
- Command (Windows PowerShell): `npm.cmd run build; npx.cmd playwright test`
- Individual Tier Commands:
  - Tier 1: `npx.cmd playwright test e2e/tier1-features.spec.ts`
  - Tier 2: `npx.cmd playwright test e2e/tier2-boundaries.spec.ts`
  - Tier 3: `npx.cmd playwright test e2e/tier3-combinations.spec.ts`
  - Tier 4: `npx.cmd playwright test e2e/tier4-scenarios.spec.ts`
- Expected: all 89 tests pass with exit code 0

## Coverage Summary
| Tier | Count | Description |
|------|------:|-------------|
| 1. Feature Coverage | 36 | 6 per feature across F1–F6 (`>= 30` min) |
| 2. Boundary & Corner | 36 | 6 per feature across F1–F6 (`>= 30` min) |
| 3. Cross-Feature | 10 | Pairwise cross-feature combinations (`>= 6` min) |
| 4. Real-World Application | 7 | End-to-end recruiter/mobile/tablet/keyboard/media scenarios (`>= 5` min) |
| **Total** | **89** | **Tiers 1–4 complete (`>= 71` min)** |

## Feature Checklist
| Feature | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---------|:------:|:------:|:------:|:------:|
| F1: Home Dark Minimal Layout & Identity + Legacy Removal | 6 | 6 | ✓ | ✓ |
| F2: Bundled High-Res Tile Imagery & Zero Errors | 6 | 6 | ✓ | ✓ |
| F3: Desktop Even 2×2 Grid & Hover Grow/Shrink Geometry | 6 | 6 | ✓ | ✓ |
| F4: Tablet Reference Proportions (`56:44` / `52:48`) & Phone 1-Col Stack | 6 | 6 | ✓ | ✓ |
| F5: Interactive `<dialog>` Article Overlay (`×` / `Escape` / backdrop / link) | 6 | 6 | ✓ | ✓ |
| F6: Four Full-Page Project Articles (`/projects/{typhoon,bikeysens,rcxd,team-214}.html`) | 6 | 6 | ✓ | ✓ |

## Verification Gate Summary
- `npx.cmd tsc -p e2e/tsconfig.json --noEmit` -> exit `0`
- `npx.cmd playwright test --list` -> `Total: 89 tests in 4 files` (`36 + 36 + 10 + 7`), exit `0`
- `npm.cmd run typecheck` -> exit `0`
- Cross-platform `playwright.config.ts` headless Chromium launch (`chromium-1254`, `158.0.8127.18`) -> exit `0`
- Contract-compliant mock DOM full-suite run (`e2e_challenger_r2_1`): `89 passed, 0 failed` (`32.0s`), plus `9 / 9` adversarial mutants rejected
- `TEST_INFRA.md` (repo root & shared scratch root) SHA-256 byte-identical (`E0CA939F649AEE04BEDAE558C7968FADCC8D71B43A9AF92301D6AE317DB8F0F7`)
- Forensic Audit (`e2e_auditor_r2`): **CLEAN**; Reviewers (`e2e_reviewer_r2_1`, `e2e_reviewer_r2_2`): **APPROVE**; Challengers (`e2e_challenger_r2_1`, `e2e_challenger_r2_2`): **APPROVE**
