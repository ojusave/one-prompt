# Render Workflow Setup

Render Blueprints do not yet create Workflow services. Configure live mode manually.

## Prerequisites

- Render Web Service deployed from this repo (`render.yaml`)
- Render Postgres in the same region as the web service
- Render CLI 2.11.0+ (`render workflows init` for reference)

## 1. Create Workflow service

1. Open [Render Dashboard](https://dashboard.render.com/)
2. **New** → **Workflow**
3. Connect the same GitHub repository
4. Root directory: `apps/workflows`
5. Build command: `pnpm install && pnpm build`
6. Start command: `pnpm start:tasks`

## 2. Environment variables (Workflow service)

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Internal connection string from `one-prompt-db` |

Use the **internal** Postgres URL so tasks write events on the private network.

## 3. Enable live mode (Web service)

| Variable | Value |
|----------|-------|
| `LIVE_MODE_ENABLED` | `true` |
| `PRESENTER_TOKEN` | Strong random secret |
| `DEMO_SCRIPTED_MODE` | `true` |

## 4. Trigger a live run

```bash
curl -X POST https://your-app.onrender.com/api/live-runs \
  -H "Content-Type: application/json" \
  -H "x-presenter-token: YOUR_TOKEN" \
  -d '{"scenarioId":"duplicate-order-investigation","mode":"scripted-live"}'
```

## 5. Event delivery

Workflow tasks should emit events to Postgres. The web app delivers them via:

- `GET /api/runs/[runId]/stream` (SSE)
- `GET /api/runs/[runId]/events?afterSequence=N` (polling fallback)

## Scripted tasks

See `apps/workflows/src/index.ts`. Tasks use controlled delays and a deliberate verification failure with retry. No LLM required.

## Teardown

- Delete Workflow service when not needed (stops compute charges)
- Postgres data persists until database is deleted
- Set `LIVE_MODE_ENABLED=false` on web service to disable triggers without deleting Workflow
