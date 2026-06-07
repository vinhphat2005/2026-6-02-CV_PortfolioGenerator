# Deployment

Career Forge should be deployed as a Render Web Service, not a static site. The app uses Next.js API routes and Playwright/Chromium for PDF export, so a server runtime is required.

## Render Blueprint

The repository includes `render.yaml`. The recommended deployment path is:

1. Push the repository to GitHub.
2. In Render, create a new Blueprint from the GitHub repository.
3. Let Render read `render.yaml`.
4. Confirm the `career-forge` web service.
5. Wait for the Docker build and health check to pass.

The Blueprint sets:

- `runtime: docker`
- `healthCheckPath: /api/health`
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`
- `ENABLE_OLLAMA_REVIEW=false`
- `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`

## Manual Render Web Service

If not using Blueprint, create a Docker Web Service manually:

- Build context: `.`
- Dockerfile path: `./Dockerfile`
- Health check path: `/api/health`
- Environment variables:
  - `NODE_ENV=production`
  - `NEXT_TELEMETRY_DISABLED=1`
  - `ENABLE_OLLAMA_REVIEW=false`
  - `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`

Render provides `PORT` automatically. The Docker command starts Next.js on `0.0.0.0` using that port.

## Local AI

Hosted Render deployments keep Ollama review disabled by default. Users who want local AI can clone the repository and run their own Ollama server with:

- `ENABLE_OLLAMA_REVIEW=true`
- `OLLAMA_BASE_URL=http://127.0.0.1:11434`
- `OLLAMA_MODEL=llama3.1`

## Verification

Before pushing a production deploy, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

For a full browser workflow check, run:

```bash
npm run test:e2e
```
