# Architecture

Career Forge is a local-first Next.js app. The browser owns profile editing, session autosave, template selection, scoring, portfolio images, and website zip export. The server only handles guarded PDF export and optional local Ollama proxy routes.

The public landing page lives at `/`; the stateful local-first workspace lives at `/studio`. Both routes share the same Next.js application and API routes.

## Data Flow

1. `ProfileDocument` combines structured `profile`, `settings`, and printable `portfolio` data.
2. `ProfileDocumentSchema` validates imported JSON and sample data.
3. Editor changes update React state and autosave a tolerant, normalized draft to a session-specific `localStorage` key.
4. Resume, website portfolio, and printable deck previews render directly from the same document.
5. Scoring and JD matching run locally from profile text.
6. CV PDF export posts the selected document and template id to `/api/export/pdf`.
7. Portfolio PDF export posts the document and resolved local image data to `/api/export/portfolio-pdf`.

## Core Modules

- `src/lib/schema.ts`: Zod schemas, defaults, target roles, section labels.
- `src/data/sampleProfiles.ts`: realistic role-specific sample profiles.
- `src/templates/*`: CV, website, and printable Deck template registries and React renderers.
- `src/lib/scoring/*`: role criteria and rule-based scoring.
- `src/lib/jdMatcher.ts`: keyword extraction, alias normalization, match report.
- `src/lib/portfolioExport.ts`: static portfolio HTML and zip generation.
- `src/features/app/*`: application orchestration and sidebar.
- `src/features/editor/*`: structured CV/profile editor.
- `src/features/portfolio/*`: Portfolio Deck editor, preview, renderer, and IndexedDB asset resolution.
- `src/features/workspace/*`: templates, preview controls, scoring, and job-match panels.
- `src/features/landing/*`: public product landing experience and studio entry point.
- `src/features/preview/*`: responsive A4 scaling, zoom, focus mode, and output preview orchestration.
- `src/lib/portfolioModel.ts`: case-study seeding and portfolio defaults.
- `src/lib/localSession.ts`: shared anonymous browser session identity used by localStorage and IndexedDB.
- `src/lib/draftNormalizer.ts`: tolerant autosave recovery that strips unknown keys without rejecting temporary editor states.
- `src/lib/portfolioAssets.ts`: validated, compressed, session-scoped browser-local image storage.
- `src/lib/portfolioDeckHtml.tsx`: shared printable deck HTML renderer.
- `src/lib/portfolioPdfSecurity.ts`: guarded public HTTPS image resolution and conversion to data URLs before Playwright rendering.

## Local-First Constraints

No account, paid API, or server database is required. Each browser session uses a separate localStorage key and IndexedDB asset scope. Reset removes only the active session's draft and images. Local images are included only in guarded portfolio PDF requests. Remote Deck images are fetched server-side with private-network, redirect, MIME, timeout, and size checks, then converted to data URLs before Playwright renders with JavaScript disabled.
