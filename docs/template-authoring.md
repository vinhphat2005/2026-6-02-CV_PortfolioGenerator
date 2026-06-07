# Template Authoring

Career Forge separates data from presentation. Resume, website portfolio, and printable deck templates all render from the same `ProfileDocument`.

## Template Types

- Resume templates live in `src/templates/resumeTemplates.tsx`.
- Website portfolio templates live in `src/templates/portfolioTemplates.tsx`.
- Printable deck templates live in `src/templates/portfolioDeckTemplates.tsx` and render through `src/features/portfolio/PortfolioDeckView.tsx`.

Register templates in `src/templates/registry.ts`. Template IDs must be unique across resume, website, and deck templates.

## Resume Templates

A resume template receives:

```ts
{ document: ProfileDocument }
```

Use the validated `profile` and `settings` fields. Keep resume templates printable, readable, and careful with overflow.

## Website Portfolio Templates

Website portfolio templates also receive:

```ts
{ document: ProfileDocument }
```

Generated website ZIP output must escape user text and use safe links only. Avoid scripts in exported HTML.

## Printable Deck Templates

Deck templates are selected by `document.portfolio.templateId`. They share the same semantic page sequence and differ through visual layout, color, typography, and spacing.

Accessibility rules:

- Keep heading order logical.
- Preserve meaningful text in DOM reading order.
- Use meaningful alt text for project images.
- Hide decorative page numbers and shapes from screen readers.
- Respect `prefers-reduced-motion` in interactive previews.

Security rules:

- Do not render unsafe URLs.
- Do not add client scripts to generated PDF HTML.
- Keep remote images behind the guarded resolver in `src/lib/portfolioPdfSecurity.ts`.

## Palette Behavior

Each deck template has a recommended palette in its metadata. Selecting a template applies its default `primaryColor` and `secondaryColor`. Users can override both colors in the Portfolio editor.
