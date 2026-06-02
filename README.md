# MERN Notes App (10Pearls assignment)

This repository contains a full-stack MERN (MongoDB, Express, React, Node) sample application for managing notes. It is split into two main folders:

- `backend/` — TypeScript Node/Express API, authentication, and persistence (MongoDB).
- `frontend/` — React + Vite TypeScript single-page app that consumes the API.

This README explains how to set up, run, test, and contribute to the project.

## Table of Contents

- Project structure
- Prerequisites
- Backend (development & production)
- Frontend (development & production)
- Running both locally
- Environment variables
- Tests
- Linting & formatting
- Contributing
- License

## Project structure

- `backend/` — server entrypoints: `src/app.ts`, `src/server.ts`; routes under `src/routes/`; models under `src/models/`.
- `frontend/` — React app under `src/`, API helpers under `src/api/`, pages under `src/pages/`.
- `test/` — backend unit/integration tests.

Refer to the source folders for more details.

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- MongoDB instance (local or hosted)

## Backend

1. Install dependencies

```bash
cd backend
npm install
```

2. Run in development (TypeScript + ts-node / ts-node-dev)

```bash
cd backend
npm run dev
```

3. Build & run for production

```bash
cd backend
npm run build
npm start
```

4. Useful scripts (check `backend/package.json` for exact names)

- `dev` — start development server with auto-reload
- `build` — compile TypeScript to JavaScript
- `start` — run compiled production server
- `test` — run backend tests

## Frontend

1. Install dependencies

```bash
cd frontend
npm install
```

2. Environment variables

Create a `.env` or set `VITE_API_URL` (used by the frontend config) to point to the backend API, e.g.:

```
VITE_API_URL=http://localhost:4000/api
```

3. Run development server

```bash
cd frontend
npm run dev
```

4. Build for production

```bash
cd frontend
npm run build
```

5. Useful scripts (check `frontend/package.json`)

- `dev` — start Vite dev server
- `build` — create production build
- `test` — run frontend tests (Jest + React Testing Library)

## Running both locally

Option A: open two terminals and run backend and frontend separately:

```bash
# terminal 1
cd backend && npm run dev
# terminal 2
cd frontend && npm run dev
```

Option B: use a process manager or `concurrently` (not included by default) to run both with one command.

## API Endpoints (overview)

The backend exposes authentication and notes endpoints. Example routes (check `backend/src/routes` for definitive list):

- `POST /api/auth/signup` — create user
- `POST /api/auth/login` — login and receive JWT
- `GET /api/notes` — list notes (requires auth)
- `POST /api/notes` — create note (requires auth)

Use the frontend `src/api/` helpers as examples for request shapes.

## Tests

- Backend tests are located in `test/`. Run them with:

```bash
cd backend
npm test
```

- Frontend tests exist under `frontend/tests/` and can be run with:

```bash
cd frontend
npm test
```
