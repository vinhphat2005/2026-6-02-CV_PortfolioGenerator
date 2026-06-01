# Architecture

Career Forge is a local-first Next.js app. The browser owns profile editing, autosave, template selection, scoring display, and portfolio zip export. The server only handles PDF export and optional local Ollama proxy routes.

## Data Flow

1. `ProfileDocument` combines structured `profile` data and `settings`.
2. `ProfileDocumentSchema` validates imported JSON and sample data.
3. Editor changes update React state and autosave to `localStorage`.
4. Resume and portfolio templates render directly from the same document.
5. Scoring and JD matching run locally from profile text.
6. PDF export posts the selected document and template id to `/api/export/pdf`.

## Core Modules

- `src/lib/schema.ts`: Zod schemas, defaults, target roles, section labels.
- `src/data/sampleProfiles.ts`: realistic role-specific sample profiles.
- `src/templates/*`: template metadata and React renderers.
- `src/lib/scoring/*`: role criteria and rule-based scoring.
- `src/lib/jdMatcher.ts`: keyword extraction, alias normalization, match report.
- `src/lib/portfolioExport.ts`: static portfolio HTML and zip generation.

## Local-First Constraints

No account, paid API, or database is required. Optional Ollama review is disabled unless `localhost:11434` responds.
