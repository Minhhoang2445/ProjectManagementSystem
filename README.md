# Project Management System

Modern full-stack project management platform featuring role-based access (admin, project leader, staff), portfolio dashboards, task analytics, and collaborative tooling for updating project metadata and managing team members.

## Repository layout

```
PMsystem/
├── backend/   # Express + Prisma API, REST routes, authentication, file uploads
├── frontend/  # React + Vite client with Tailwind UI, Zustand stores, axios services
└── uploads/   # Runtime storage for avatars and attachment files (gitignored)
```

## Tech stack

- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL/MySQL (via `DATABASE_URL`), JWT auth, Multer uploads, Zod validation
- **Frontend:** React 19, Vite, TypeScript, React Router, Zustand, Tailwind CSS, Radix UI, Recharts
- **Tooling:** Nodemon, ESLint, TypeScript, Prisma Migrate

## Prerequisites

- Node.js 18+ and npm 9+
- A relational database supported by Prisma (e.g., PostgreSQL)
- Recommended: Git, VS Code, and Prisma CLI (`npx prisma ...`)

## Backend setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create `backend/.env` based on the template below:
   ```ini
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ACCESS_TOKEN_SECRET=replace-with-strong-secret
   ```
   - `DATABASE_URL` must point to your Prisma-compatible database.
   - `CLIENT_URL` enables CORS + credentialed requests.
   - `ACCESS_TOKEN_SECRET` secures JWT access tokens; keep it private.
3. Apply database schema and generate the Prisma client:
   ```bash
   npx prisma migrate deploy   # or 'migrate dev' during development
   npx prisma generate
   ```
4. Start the API server:
   ```bash
   npm run dev   # uses nodemon for autoreload
   ```
   The server will default to `http://localhost:5000` (see `server.js`).

## Frontend setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Define environment variables if needed (e.g., `VITE_API_URL`) inside `frontend/.env`. Many axios services default to relative paths, so when developing locally ensure the backend runs on port 5000 and configure Vite proxy or `VITE_API_URL` accordingly.
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Vite serves the client at `http://localhost:5173` by default.
4. Build & preview production bundle:
   ```bash
   npm run build
   npm run preview
   ```

## Key scripts

| Location  | Command        | Description                            |
|-----------|----------------|----------------------------------------|
| backend   | `npm run dev`  | Start Express API with nodemon         |
| backend   | `npm start`    | Start API in production mode           |
| frontend  | `npm run dev`  | Launch Vite dev server                 |
| frontend  | `npm run build`| Type-check and build production assets |
| frontend  | `npm run lint` | Run ESLint across the React codebase   |

## Prisma & database tasks

- Inspect current schema: `npx prisma studio`
- Create a new migration: `npx prisma migrate dev --name add_feature`
- Reset development DB (destructive!): `npx prisma migrate reset`

## File uploads

Uploaded avatars and attachments are saved under `uploads/avatars` and `uploads/attachments`. These folders are expected to exist before running the backend (create them manually or ensure your deployment pipeline does).

## Troubleshooting

- **Maximum update depth exceeded (frontend):** usually indicates an effect calling `setState` without stable dependencies. Verify custom hooks and modal components only update state when inputs actually change.
- **Prisma/database errors:** confirm `DATABASE_URL` is correct and run `npx prisma generate` after changing the schema.
- **CORS/credential issues:** ensure `CLIENT_URL` matches the actual frontend origin and that both servers run with matching ports when developing locally.

## Deployment notes

- Set environment variables securely on your hosting platform (no `.env` files committed).
- Run `npm run build` in `frontend/` and serve the `dist` folder via your preferred host or behind a CDN.
- For backend deployments, run database migrations (`npx prisma migrate deploy`) during release pipelines before starting the server.

## Contributing

1. Create a feature branch from `main`.
2. Update or add tests (where applicable).
3. Run linting/build steps locally.
4. Open a PR describing changes, screenshots, and testing notes.

## License

This project is currently unlicensed; see `package.json` for placeholders. Add licensing terms before public distribution.
