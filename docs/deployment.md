# Deployment

## Goal

Deploy the MVP on a simple free-tier-friendly stack:

- `Vercel` for the `Next.js` frontend
- `Render` for the `FastAPI` backend
- `Supabase` for `PostgreSQL` and `Supabase Auth`

## Services

### `Supabase`

Use `Supabase` for:

- the hosted PostgreSQL database
- email/password authentication
- the public frontend auth values

You need:

- project URL
- anon/public key for the frontend
- PostgreSQL connection string for the backend

### `Render`

Use a single web service for the backend.

Recommended `Render` setup:

- Root Directory: `backend`
- Runtime: `Python 3.12`
- Build Command: `python -m venv venv && ./venv/bin/python -m pip install --upgrade pip && ./venv/bin/pip install -e .`
- Start Command: `./venv/bin/alembic upgrade head && ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port $PORT`

This keeps the migration order simple for the MVP: schema upgrade first, app start second.

### `Vercel`

Use a single `Vercel` project for the frontend.

Recommended `Vercel` setup:

- Root Directory: `frontend`
- Framework Preset: `Next.js`
- Node.js: `20+`

`Vercel` can use the default install/build commands for the `Next.js` app.

## Environment Variables

### Frontend (`Vercel`)

Set these in `Vercel`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`

Use the deployed `Render` backend URL for `NEXT_PUBLIC_API_BASE_URL`.

### Backend (`Render`)

Set these in `Render`:

- `APPLYPILOT_DATABASE_URL`
- `APPLYPILOT_SUPABASE_URL`
- `APPLYPILOT_SUPABASE_JWT_SECRET`

Notes:

- Current production auth uses `Supabase` asymmetric signing and JWKS from `APPLYPILOT_SUPABASE_URL`.
- `APPLYPILOT_SUPABASE_JWT_SECRET` is only needed if you intentionally use legacy symmetric token verification or want compatibility with non-JWKS local/test flows.
- Do not hardcode any of these values in the repo.

## Deploy Order

1. Create the `Supabase` project.
2. Enable email/password auth in `Supabase Auth`.
3. Create the `Render` backend service.
4. Set backend environment variables in `Render`.
5. Deploy the backend so `alembic upgrade head` runs before the API starts.
6. Confirm the backend health endpoint responds at `/api/v1/health`.
7. Create the `Vercel` frontend project.
8. Set frontend environment variables in `Vercel`, including the deployed backend URL.
9. Deploy the frontend.

## Post-Deploy Checks

After both services are live:

- verify `GET /api/v1/health` returns `200`
- verify frontend sign-up and sign-in work against `Supabase Auth`
- verify `/app` loads dashboard data
- verify create/update flows still work for applications, contacts, tasks, and notes

## CI

The repo includes `GitHub Actions` CI in `.github/workflows/ci.yml`.

The workflow does the following:

- installs frontend dependencies with `npm ci`
- creates `backend/venv/`
- installs backend dependencies into `backend/venv/`
- validates the Alembic migration chain with `alembic upgrade head --sql`
- runs `make quality`

## Limits

This foundation keeps deployment intentionally simple:

- no staging environment
- no separate worker process
- no Docker deploys for frontend or backend
- no multi-region or multi-instance coordination

That is appropriate for the current MVP and free-tier launch path.
