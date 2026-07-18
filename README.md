# ShadowAI

**Know what the internet knows about you before hackers do.**

An AI-powered digital footprint intelligence platform — built for Idea2Impact 2026.

---

## What's working right now

This is **Phase 1** of the full build: a genuinely working, end-to-end slice of the product —
not a mockup. Specifically:

- ✅ Full authentication: signup, login, JWT access + refresh tokens, forgot/reset password, profile & settings
- ✅ Dashboard shell with sidebar navigation, live score gauges, recent reports, privacy checklist
- ✅ **Resume Analyzer** — fully functional: upload a PDF → text extracted (PyMuPDF) → PII detected
  (phone, email, address, DOB, PAN, Aadhaar, passport, LinkedIn/GitHub links, certificates, skills) →
  risk scores computed → recommendations generated → stored to the database → shown on the dashboard
- ✅ Real MongoDB-compatible data layer (see note below on the demo database)
- ✅ Premium dark/glassmorphic UI matching the brief (React + TypeScript + Tailwind v4 + Framer-Motion-ready components)
- 🔜 GitHub Scanner, Portfolio Scanner, LinkedIn Scanner, Digital Footprint Map, Attack Simulation,
  AI Privacy Coach, Safe Resume Generator, History, Admin Panel — scaffolded in the architecture doc,
  not yet built. These are next — say the word and I'll keep building them one module at a time.

## Important note on the database

The backend talks to MongoDB through the standard **Motor** async driver — the same code that runs
against a real MongoDB Atlas cluster in production. For local/demo use with **zero setup**, it
automatically falls back to an in-memory Mongo-compatible engine (`mongomock`) whenever `MONGO_URI`
is left blank in `.env`. Nothing in the application code needs to change to switch between the two —
just set `MONGO_URI` to your Atlas connection string when you're ready to persist real data.

---

## Running it locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # leave MONGO_URI blank to use the in-memory demo DB
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` requests to the backend automatically
(configured in `vite.config.ts`) — no `.env` needed for local dev.

### Try it

1. Open `http://localhost:5173`
2. Click **Get started** → create an account
3. You'll land on the dashboard (empty state, since you have no scans yet)
4. Click **Resume Analyzer** in the sidebar → drop in any PDF resume
5. Watch the risk scores, detected PII, and recommendations populate
6. Go back to **Dashboard** — your scan now shows up there too

### Running with Docker

```bash
docker-compose up --build
```

Backend on port 8000, frontend on port 5173, both talking to the in-memory demo database out of the box.

---

## Deploying

- **Frontend → Vercel**: point it at `/frontend`, set `VITE_API_BASE_URL` to your deployed backend URL
  (see `frontend/.env.example`) and update `src/lib/api/client.ts`'s `baseURL` accordingly.
- **Backend → Render**: point it at `/backend`, set `MONGO_URI` (your Atlas connection string),
  `SECRET_KEY` (a long random value), and `CORS_ORIGINS` to your Vercel URL.
- **Database → MongoDB Atlas**: create a free M0 cluster, get the connection string, set it as `MONGO_URI`.

---

## Project structure

```
shadowai/
├── backend/           FastAPI + Motor + JWT auth + analyzers
│   ├── app/
│   │   ├── core/       config, security, deps, exception handling
│   │   ├── db/          Mongo connection (with demo fallback)
│   │   ├── models/      Pydantic schemas
│   │   ├── repositories/ data access layer
│   │   ├── routers/     HTTP endpoints
│   │   ├── services/    business logic
│   │   └── analyzers/   PDF extraction, PII detection, scoring
│   └── requirements.txt
├── frontend/          React + TypeScript + Vite + Tailwind v4
│   └── src/
│       ├── pages/       Landing, Auth, Dashboard, Resume Analyzer
│       ├── components/  UI primitives, layout, feature components
│       ├── context/      Auth state
│       └── lib/api/      Axios client + endpoint wrappers
└── docker-compose.yml
```

See `ShadowAI-Architecture.md` (shared earlier in this conversation) for the full system design,
database schema, API contract, and module roadmap covering every remaining feature.

---

## Security notes for this build

- Passwords hashed with bcrypt (72-byte limit enforced at both the validation and hashing layer)
- JWT access tokens (15 min) + refresh tokens (7 days), with automatic refresh-and-retry on the frontend
- `/auth/me` strips `password_hash` and reset-token fields before they ever reach a response
- File uploads validated for PDF magic bytes and a 5MB size cap before parsing
- CORS locked to explicit origins (no wildcard)

## Educational use

The Attack Simulation feature (not yet built) will generate example phishing/recruiter-scam messages
for awareness purposes only, clearly labeled as simulated and never sent anywhere.
