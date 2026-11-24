# Xander Vanhaeren — Engineering Portfolio

Static engineering showcase portfolio for **Xander Vanhaeren** (Engineering Student at KU Leuven), built with **Astro 5**, **MDX Content Collections**, and **TypeScript**.

Live site: [xandervanhaeren.github.io](https://xandervanhaeren.github.io)

## Architecture

- **Static-First HTML & Zero-Framework Runtime**: Astro pre-renders `/` and `/projects/<slug>.html` to static HTML at build time with full OpenGraph metadata, canonical URLs, native cross-document View Transitions, and lightweight progressive enhancement scripts (~3 KB total JS vs. ~265 KB in the previous client-rendered React build).
- **MDX Content Collection (`src/content/projects/*.mdx`)**: Each engineering case study lives in its own Markdown/MDX file validated by a strict Zod schema in `src/content.config.ts`. Headings (`##`) automatically populate an on-page **Contents** jump bar, and `<Figure />` diagrams support full-resolution click-to-zoom inspection.
- **Interactive Home Grid & Preview Overlay**:
  - 4-tile responsive grid (`typhoon`, `bikeysens`, `rcxd`, `team-214`) using semantic `<a href="/projects/<slug>.html">` links so middle-click / Cmd+click opens full articles in a new tab while normal click / Enter / Space opens the quick-preview `<dialog>`.
  - Desktop hover/focus reveals subtle project title + period captions while keeping pure photography at rest.
  - Quick-preview `<dialog>` syncs `?preview=<slug>` with the History API (supporting shareable preview links and mobile Back-button dismissal) and supports `← Prev` / `Next →` buttons + `ArrowLeft` / `ArrowRight` keys.
- **Self-Hosted Variable Fonts**: Uses `@fontsource-variable/jetbrains-mono` and `@fontsource-variable/inter` (`.woff2` variable subsets).

## Project Structure

```text
├── public/assets/              # Static project media, favicons, and logos
├── src/
│   ├── components/
│   │   ├── mdx/                # Reusable MDX blocks: Figure, FigureGroup, Callout, SpecsTable
│   │   └── ProjectOverlay.astro
│   ├── content/
│   │   └── projects/           # Per-project MDX case studies (typhoon, bikeysens, rcxd, team-214)
│   ├── content.config.ts       # Astro 5 Content Layer Zod schema
│   ├── layouts/
│   │   └── BaseLayout.astro    # Shared HTML shell, SEO/OpenGraph tags, variable font imports
│   ├── lib/
│   │   └── previewUrl.ts       # Pure URL query & project stepper helpers
│   ├── pages/
│   │   ├── index.astro         # Home sidebar + 4-tile grid + quick-preview overlay
│   │   └── projects/
│   │       └── [slug].astro    # Static full-page case study template + TOC + figure lightbox
│   ├── styles/                 # tokens.css, home.css, article.css
│   └── test/                   # Vitest content & URL helper unit tests
├── e2e/                        # Playwright 4-tier end-to-end test suite
├── astro.config.mjs
├── package.json
└── playwright.config.ts
```

## Adding or Editing a Project

1. Place images/videos in `public/assets/images/projects/<slug>/`.
2. Add or edit `src/content/projects/<slug>.mdx` (update `slug` enum in `src/content.config.ts` if adding a new slug).
3. Run `npm test && npm run build` to verify schema types and asset references.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start local Astro dev server |
| `npm run build` | Run `astro check` and build static output to `./dist` |
| `npm run preview` | Preview production `./dist` locally |
| `npm run typecheck` | Type-check Astro templates, MDX frontmatter, and Playwright E2E specs |
| `npm test` | Run Vitest unit & asset integrity tests |
| `npm run test:e2e` | Build and run full Playwright E2E suite |
