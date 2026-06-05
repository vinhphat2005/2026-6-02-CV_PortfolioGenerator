# Career Forge

Career Forge is a local-first CV and portfolio generator. It lets users edit one structured profile, choose multiple CV and portfolio templates, score the resume against a target role, match it against a pasted job description, and export a PDF or static portfolio zip.

It is designed to be more useful than downloading a random template because it helps users tailor evidence to a job, identify missing technical signals, and keep portfolio content reusable.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Windows helper:

```bat
run.bat
```

Unix helper:

```bash
./run.sh
```

Docker:

```bash
docker compose up --build
```

Production Docker image:

```bash
docker build -t career-forge .
docker run --rm -p 3000:3000 -e PORT=3000 career-forge
```

## Features

- Local-first app with no login, no paid API, and no cloud database.
- English defaults with customizable section labels, order, visibility, theme, and font preset.
- Sample profiles for software intern, frontend, backend, full-stack, game, AI automation, and data analyst roles.
- Five CV templates, including an ATS-friendly format and a two-column Classic Sidebar layout.
- Four portfolio templates that export as static HTML inside a zip.
- Role-targeted scoring for common software and data roles.
- Local Job Description keyword matcher with alias normalization.
- Optional local AI review through Ollama if it is already running on the user's machine.
- PDF export through Playwright.
- Dockerized production deployment for Render with a health check endpoint.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run setup:browsers
```

If PDF export fails locally because Chromium is missing, run:

```bash
npm run setup:browsers
```

## Sample Workflow

1. Load a sample profile from the sidebar.
2. Edit profile details, projects, and skills in `Editor`.
3. Choose a target role such as Backend Developer or Game Developer.
4. Paste a job description in `Job Match`.
5. Review matched and missing keywords.
6. Switch templates in `Templates`.
7. Preview the CV or portfolio.
8. Export PDF or portfolio zip.

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [Template Authoring](docs/template-authoring.md)
- [Scoring Rules](docs/scoring-rules.md)

## Deployment

This app should be deployed as a Render Web Service, not a static site, because PDF export runs through a Next.js API route and Playwright/Chromium. The repository includes:

- `Dockerfile` for a production Next.js container with Chromium installed.
- `render.yaml` for Render Blueprint provisioning.
- `/api/health` for Render HTTP health checks.
- `.env.example` for optional Ollama configuration.

On Render, create a Blueprint from this repo or create a Docker Web Service manually. The container binds to `0.0.0.0` and uses Render's `PORT` environment variable.

## Privacy

Profile data is stored in browser localStorage and in files the user explicitly exports. The default scoring and JD matching engines run locally. Optional AI review uses an Ollama server only when `OLLAMA_BASE_URL` is reachable.
