# One Prompt

See what one AI instruction becomes at runtime.

Execution observability for AI agents: planning, tool calls, retries, side effects, and verification made visible through an interactive graph, timeline, and inspector.

Built for Joey Baker's Render conference talk *"One Prompt: Field Notes from the Layer Your AI Runs On"* and useful as a standalone product before, during, and after the event.

## Highlights

- **Replay mode (default):** deterministic controlled demo traces, no API keys, works offline after page load
- **Execution graph:** stable layout, branching, parallelism, retries, side-effect markers
- **Synchronized timeline:** scrub, step, speed controls tied to graph and activity feed
- **Run comparison:** three demo traces aligned by execution fingerprint
- **Presentation mode:** `?present=1` enlarges typography, hides chrome, keyboard shortcuts
- **Optional live mode:** Render Workflows + Postgres (feature-flagged)

## Architecture

```
Browser (Next.js App Router)
  ├── Replay engine (Zustand + rAF clock)
  ├── Graph (@xyflow/react + deterministic layout)
  └── API routes
        ├── /api/health
        ├── /api/runs
        └── /api/live-runs (protected)

Live mode (optional):
  Render Workflow tasks → Render Postgres → SSE/polling → Browser
```

| Component | Render service |
|-----------|----------------|
| Web app | Web Service |
| Live run events | Managed PostgreSQL |
| Live execution | Workflow service (Dashboard setup) |

## Quick start (replay only)

```bash
cd one-prompt
pnpm install
pnpm dev
```

Open http://localhost:3000. Click **Run recorded execution** or visit `/runs/demo-late-failure?autoplay=1`.

No database or API keys required for replay.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Prompt workspace |
| `/runs` | Run history |
| `/runs/[runId]` | Active or completed run |
| `/compare` | Compare 2–3 runs |
| `/settings` | Display and presenter preferences |

Query parameters:

- `?present=1` — presentation mode
- `?autoplay=1` — auto-start replay
- `?trace=clean|detour|late-failure`
- `?mode=replay|live`

Example: `/runs/demo-late-failure?present=1&autoplay=1`

## Controlled demo traces

Three validated fixtures in `apps/web/src/lib/traces/fixtures.ts`:

| Trace | Run ID | Description |
|-------|--------|-------------|
| Clean path | `demo-clean` | Direct route, no retry |
| Unexpected detour | `demo-detour` | Extra payment branch, longer duration |
| Late failure | `demo-late-failure` | Verification fails, retries without redoing work |

Traces are controlled demo data, not production customer traces.

## Deploy on Render

1. Push this repo to GitHub.
2. Create a **Blueprint** from `render.yaml` (Web Service + Postgres).
3. Set `LIVE_MODE_ENABLED=true` and `PRESENTER_TOKEN` only if using live mode.
4. Health check: `GET /api/health`

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/render-examples/one-prompt)

## Render Workflow setup (live mode)

Blueprints do not yet manage Workflow services. Create manually:

1. In Render Dashboard, create a **Workflow** service linked to this repo.
2. Set start command: `cd apps/workflows && pnpm install && pnpm build && pnpm start:tasks`
3. Configure `DATABASE_URL` (internal connection string, same region as web service).
4. Set `LIVE_MODE_ENABLED=true` on the web service.
5. Set matching `PRESENTER_TOKEN` on web service; use in Settings or `x-presenter-token` header.

See `apps/workflows/src/index.ts` for scripted task definitions.

## Preview environments

`render.yaml` sets `previews.generation: manual`. Enable per-PR previews in the Render Dashboard when ready. Preview databases start empty: no production data.

## Presentation mode

- Add `?present=1` or use fullscreen
- Keyboard: Space (play/pause), R (restart), 1/2/3 (demo traces), C (compare), ? (help)
- Shift+R: immediate fallback to replay mode

## Panic fallback

If live mode stalls: graph state is preserved, switch to replay via Settings or Shift+R. No full-screen errors on stage.

## Environment variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | Live only | — | Postgres for live events |
| `LIVE_MODE_ENABLED` | No | `false` | Enable live run triggers |
| `PRESENTER_TOKEN` | Live only | — | Protect `POST /api/live-runs` |
| `DEMO_SCRIPTED_MODE` | No | `true` | Scripted workflow tasks |
| `NEXT_PUBLIC_GITHUB_REPO_URL` | No | render-examples URL | Footer link |

## Testing

```bash
pnpm typecheck
pnpm test
pnpm --filter @one-prompt/web test:e2e
pnpm build
```

## Known limitations

- Live mode workflow trigger returns queued status until Workflow service is configured
- Graph layout uses rank/lane algorithm (not ELK/Dagre) for MVP stability
- Trace JSON files in `traces/` are documented; source of truth is TypeScript fixtures

## License

MIT
