# Task Management App

A simple task management app built for the Software Engineering Internship practical assessment. Create, list, view, update, and delete tasks (title, description, status, due date, created date), persisted in a local SQLite database.

## Tech stack

- **Next.js 16** (App Router, TypeScript) — also serves as the API layer via Route Handlers
- **SQLite** via **Prisma ORM 7** (file-based database, no external DB server)
- **Zod** for input validation
- **Hugeicons** for icons
- **Tailwind CSS ** for styling

## Getting started

### Prerequisites

- Node.js 20.19+ 

### Setup

```bash
npm install
npx prisma migrate dev
```

`npm install` installs dependencies. `npx prisma migrate dev` creates the local SQLite database (`dev.db`, at the project root) and applies the schema.

### Environment variables

A `.env` file with the database connection string is required:

```env
DATABASE_URL="file:./dev.db"
```

This is already present in the repo for local development convenience (it only points at a local SQLite file). If it's missing, create it before running `prisma migrate dev`.

### Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/tasks`.

## How it works

- `/tasks` — Server Component that lists all tasks, queried directly from the database.
- Viewing, editing, and creating a task all happen in a **modal** on top of the list (no separate pages), with the open task reflected in the URL as a query param:
  - `/tasks?task=new` — create
  - `/tasks?task=<id>` — view
  - `/tasks?task=<id>&edit=1` — edit
- The modal fetches/mutates data through a small REST API:
  - `GET /api/tasks` — list (optionally `?status=TODO|IN_PROGRESS|DONE`)
  - `POST /api/tasks` — create task
  - `GET /api/tasks/:id` — fetch task with id
  - `PUT /api/tasks/:id` — update task
  - `DELETE /api/tasks/:id` — delete task
- All input is validated with Zod on the server; invalid input returns `400` with field-level errors, a missing task returns `404`, and unexpected failures return `500`.


