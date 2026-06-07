# Deployment

Career Forge is production-ready for Render as a Docker Web Service.

Render serves the public product page at `/` and the editor workspace at `/studio`.

## Why Docker

The app uses Next.js API routes for CV and Portfolio Deck PDF export, and Playwright needs Chromium plus OS-level browser dependencies. Docker keeps those dependencies reproducible across local machines, CI, and Render.

Portfolio Deck PDF export does not let Chromium browse user-supplied remote URLs. The server resolves allowed public HTTPS images with redirect, network-range, MIME, timeout, and size guards, converts them to data URLs, and renders the Deck with JavaScript disabled and a restrictive CSP.

## Render Blueprint

The root `render.yaml` defines one web service:

- `runtime: docker`
- `dockerfilePath: ./Dockerfile`
- `dockerContext: .`
- `healthCheckPath: /api/health`
- `autoDeployTrigger: checksPass`
- `PORT=10000`

After pushing the repo to GitHub, create a new Render Blueprint and select this repository. Render will build the Dockerfile and deploy the web service.

The Blueprint uses Render's free instance type so the project can be published as a portfolio demo without paid setup. For an always-on production service, switch `plan` in `render.yaml` to a paid instance type to avoid free-tier sleep and cold starts.

## Manual Render Setup

If you do not use Blueprint, create a Render Web Service with these settings:

- Runtime: Docker
- Dockerfile path: `./Dockerfile`
- Docker context: `.`
- Health check path: `/api/health`
- Auto deploy: After CI checks pass, if GitHub Actions is enabled

The start command is handled by the Dockerfile. The app binds to `0.0.0.0` and uses the `PORT` environment variable. The Blueprint sets `PORT=10000` explicitly.

## Environment Variables

Required:

- `PORT=10000`
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`
- `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`
- `ENABLE_OLLAMA_REVIEW=false`

Optional:

- `ENABLE_OLLAMA_REVIEW=true`: enable AI review for a self-hosted/local deployment with reachable Ollama.
- `OLLAMA_BASE_URL`: URL of an Ollama service reachable from the web service.
- `OLLAMA_MODEL`: model name used by AI review, default `llama3.1`.

For a normal Render deploy, leave Ollama unset unless you have a separate reachable Ollama host. The scoring and job description matcher do not depend on Ollama.

## Local Production Smoke Test

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
docker build -t career-forge .
docker run --rm -p 3000:3000 -e PORT=3000 career-forge
```

Then open `http://localhost:3000/api/health`. A healthy app returns JSON with `status: "ok"`.
