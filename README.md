# Prash Frontend

The dashboard for [Prash](https://github.com/Drufiy/prash-backend), Drufiy's
autonomous CI/CD repair agent. GitHub OAuth login, connected-repository management,
and a live view of diagnosed failures and the pull requests Prash opens to fix them.

> **Full technical documentation:** see [PROJECT_DOC.md](https://github.com/Drufiy/prash-backend/blob/main/PROJECT_DOC.md)
> in the backend repo for architecture and API specs covering both sides. Frontend
> specifics are in [FRONTEND.md](./FRONTEND.md).

## Stack

React 19 + TypeScript + Vite + Tailwind CSS v4 + Supabase Realtime (live status
updates as Prash works) + Radix UI + TanStack Query.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in:

- `VITE_API_URL` — the backend's URL (`prash-backend` / `drufiy-backend`)
- `VITE_GITHUB_CLIENT_ID` — GitHub OAuth App client ID
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — from the Supabase project (anon
  key only, never `service_role`)

```bash
npm run build      # tsc -b && vite build
npm run lint
npm run preview
```

## Deployment

Runs on **Google Cloud Run** (service `prash-frontend`, project `prash-by-drufiy`,
region `asia-south1`) via Google Cloud Buildpacks — no Dockerfile in this repo,
Buildpacks auto-detects the Vite/Node app. Builds continuously from `main` via a
Cloud Build GitHub trigger.

**Known issue (2026-09-01):** the Buildpacks-built container currently fails Cloud
Run's health check on deploy (doesn't bind `$PORT` in time), so pushes build
successfully but don't yet go live automatically — Cloud Run keeps serving the last
good manual deploy. Needs a fix (likely a `Procfile` / explicit start command
binding host `0.0.0.0:$PORT`) before this is truly hands-off.

## Status

Live product frontend, in early access alongside the backend.
