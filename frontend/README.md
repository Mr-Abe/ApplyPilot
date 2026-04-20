# Frontend

This directory contains the initial `Next.js` + `TypeScript` frontend scaffold for ApplyPilot.

## Included

- `Next.js` App Router structure
- public marketing and auth routes
- shared dashboard shell for `/app/*`
- Supabase Auth client setup and session handling
- middleware-based route protection for `/app/*`
- applications list, create, detail, edit, and archive flows
- contacts list, create, edit, and delete flows
- tasks list, create, edit, complete, and delete flows
- application detail panels for linked contacts, follow-up tasks, and notes
- minimal global styling
- `ESLint` and `Prettier` configuration

## Routes

- `/`
- `/login`
- `/signup`
- `/app`
- `/app/applications`
- `/app/applications/new`
- `/app/applications/[id]`
- `/app/contacts`
- `/app/tasks`
- `/app/settings`

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Set `NEXT_PUBLIC_API_BASE_URL` to your backend origin, such as `http://localhost:8000`.
4. Install dependencies with `npm install`.
5. Start the dev server with `npm run dev`.
6. Open `http://localhost:3000`.

## Notes

- Authentication uses `Supabase Auth` with email/password only.
- `/app/*` routes are protected by middleware.
- `/app/applications` is now backed by the real applications API.
- `/app/contacts` and `/app/tasks` are backed by live authenticated backend APIs.
- Application details now act as a working command center for one opportunity, including contacts, tasks, and notes.
