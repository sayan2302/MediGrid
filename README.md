# MediGrid

MediGrid is a prototype hospital supply chain management system with:
- React + Vite frontend
- Node.js + Express backend
- FastAPI AI microservice (Groq inference)
- MongoDB database

## Monorepo Structure

- `frontend` - UI app
- `backend` - core APIs and workflow engine
- `ai-service` - AI forecasting and expiry risk endpoints
- `docs` - API and deployment docs

## Before Running

1. Firebase console:
	- Enable Email/Password sign-in provider.
	- Create at least one user for login.
2. Local env files:
	- `backend/.env` for database + backend config.
	- `ai-service/.env` for Groq config.
	- `frontend/.env` for backend URL + Firebase web config.

## Quick Local Run (without Docker)

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

### 2) AI service

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/login` and sign in with your Firebase user.

## Docker Run

```bash
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
docker compose up --build
```

Frontend: http://localhost:5173
Backend health: http://localhost:4000/api/health
AI health: http://localhost:8000/health

## Seed Data

```bash
cd backend
node src/scripts/seed.js
```

## Important Notes

- Firebase auth is optional in this prototype. If Firebase admin env vars are missing, backend accepts requests with demo user fallback.
- AI endpoints work with heuristic fallback when `GROQ_API_KEY` is missing.

## Safe Publish Checklist

1. Never commit `.env` files.
2. Keep only `.env.example` files in git.
3. After pushing to GitHub, configure secrets directly in Render/Vercel dashboards.
4. Use `docs/DEPLOYMENT.md` for exact free-tier deployment steps.
