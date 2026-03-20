# Evoltsoft — EV charging station manager

Full-stack app for signing up, logging in, and managing EV charging stations: list them with filters, edit details, and browse them on a map (Leaflet). Nothing fancy—just JWT auth, a REST API, and a Vue UI.

## What’s in the box

**Backend** (`backend/`) — Express on Node, MongoDB via Mongoose, access/refresh tokens, rate limiting, validation, Swagger UI at `/api/docs`.

**Frontend** (`frontend/`) — Vue 3, Vite, Pinia, Vue Router, Tailwind, Axios. Dev server proxies `/api` to the backend on port 5000.

## Requirements

- Node 18+
- MongoDB (local URI or Atlas)

## Run it locally

**1. Backend**

```bash
cd backend
cp .env.example .env
# Edit .env — at minimum MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET
npm install
npm run dev
```

API listens on **http://localhost:5000** by default. Quick checks: `GET /` (service blurb), `GET /health`, OpenAPI UI at **http://localhost:5000/api/docs**.

**2. Frontend** (separate terminal)

```bash
cd frontend
cp .env.example .env   # optional; defaults assume localhost API
npm install
npm run dev
```

App is **http://localhost:5173**. Registration/login hit `/api/v1/auth`; stations under `/api/v1/stations`.

If you change the API URL for a built bundle, set `VITE_API_BASE_URL` (see `frontend/.env.example`).

## API sketch

| Area        | Base path        | Notes                          |
|------------|------------------|--------------------------------|
| Auth       | `/api/v1/auth`   | register, login, refresh, `/me` |
| Stations   | `/api/v1/stations` | CRUD, stats, filters, pagination |
| Docs       | `/api/docs`      | Swagger                        |

All protected station routes expect a Bearer access token.

## Env vars

Central reference: **`.env.example`** (repo root) and **`backend/.env.example`**, **`frontend/.env.example`**.

For production, the usual gotcha is **CORS**: set `CORS_ORIGIN` on the backend to your frontend origin (comma-separated if you need localhost and prod). Details and deploy notes are in **`DEPLOYMENT.md`**.

## Deploy

Frontend is set up for **Vercel** (`frontend/vercel.json`); backend fits **Render** or similar (`render.yaml` is there if you like Blueprint-style config). Step-by-step checklist lives in **`DEPLOYMENT.md`**—especially env vars and CORS after you have real URLs.

## Project layout

```
backend/    Express API, models, middleware
frontend/   Vue SPA, stores, views
DEPLOYMENT.md
render.yaml
```

## License

Unspecified — add one if you’re publishing this publicly.
