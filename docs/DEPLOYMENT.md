# MediGrid Deployment (Free Options)

## Recommended Free Setup (Fastest)

- Frontend: Vercel (free)
- Backend: Render Web Service (free)
- AI Service: Render Web Service (free)
- Database: MongoDB Atlas M0 (free)

This avoids credit card requirements in many regions and is the quickest for submission demos.

## 1) Prepare Git Repo

Push the monorepo to GitHub.

## 2) MongoDB Atlas (Free)

1. Create free M0 cluster.
2. Create database user and password.
3. Add network access (0.0.0.0/0 for demo, tighten later).
4. Copy connection string as `MONGO_URI`.

## 3) Deploy AI Service on Render

1. New Web Service -> connect GitHub repo.
2. Root directory: `ai-service`
3. Runtime: Python
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Environment variables:
   - `GROQ_API_KEY` (optional but recommended)
   - `GROQ_MODEL=llama-3.1-8b-instant`
7. Deploy and copy AI URL, e.g. `https://medigrid-ai.onrender.com`

## 4) Deploy Backend on Render

1. New Web Service -> same repo.
2. Root directory: `backend`
3. Runtime: Node
4. Build command: `npm install`
5. Start command: `npm start`
6. Environment variables:
   - `PORT=10000` (or leave default Render `PORT`)
   - `MONGO_URI=<atlas-uri>`
   - `AI_SERVICE_URL=<ai-render-url>`
   - `EXPIRY_THRESHOLD_DAYS=30`
   - Optional Firebase vars:
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_CLIENT_EMAIL`
     - `FIREBASE_PRIVATE_KEY`
7. Deploy and copy backend URL, e.g. `https://medigrid-api.onrender.com`

Alternative:
- Use the root `render.yaml` blueprint and then set `MONGO_URI`, `AI_SERVICE_URL`, and secret keys in Render dashboard.

## 5) Deploy Frontend on Vercel

1. Import GitHub repo on Vercel.
2. Set root directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variable:
   - `VITE_BACKEND_URL=https://medigrid-api.onrender.com/api`
6. Deploy.

Firebase requirements for deployed frontend:
- In Firebase Auth -> Sign-in method, enable Email/Password.
- In Firebase project settings, add your Vercel domain under authorized domains.

## 6) CORS and Health Check

- Open frontend URL and verify dashboard loads.
- Verify backend health: `<backend>/api/health`
- Verify AI health: `<ai>/health`

## 7) Seed Demo Data

Run locally once with Atlas URI in backend `.env`:

```bash
cd backend
node src/scripts/seed.js
```

Then refresh deployed frontend.

## Backup Option (All Render)

- Deploy frontend also on Render as static site if Vercel is unavailable.
- Set static site root directory `frontend`, build `npm run build`, publish `dist`.
