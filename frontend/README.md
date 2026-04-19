# Frontend

This directory contains the initial `Next.js` + `TypeScript` frontend scaffold for ApplyPilot.

## Included

- `Next.js` App Router structure
- public marketing and auth placeholder routes
- shared dashboard shell for `/app/*`
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

1. From `frontend/`, install dependencies with `npm install`.
2. Start the dev server with `npm run dev`.
3. Open `http://localhost:3000`.

## Notes

- Authentication is not implemented yet.
- Business logic and data fetching are not implemented yet.
- The `/app` route group is structured so route protection can be added later.
