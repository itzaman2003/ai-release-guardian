# AI Release Guardian

AI Release Guardian is a 1-week hackathon prototype that reviews GitHub pull
requests before release. A user pastes a PR URL, the backend fetches or mocks PR
context, the AI contract returns release risk, test suggestions, release notes,
and a deployment recommendation, and the frontend presents it as a dashboard.

This repository is structured for the agreed hackathon stack:

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn-style UI, Recharts
- Backend: FastAPI, Python, PostgreSQL/Supabase-ready config, GitHub REST API-ready config
- AI: OpenAI or Azure OpenAI-ready config
- CI/CD demo: GitHub Actions quality gate example

## Project Structure

```text
AI-Release-Guardian/
  backend/      FastAPI API contract and mock analysis service
  frontend/     Developer 2 dashboard and report UI
  .github/      CI/CD quality gate demo workflow
```

## MVP Demo Flow

1. Paste a GitHub PR URL.
2. Backend returns a structured analysis report.
3. Dashboard shows PR metadata, risk score, issues, tests, release notes, and rollback plan.
4. Optional CI quality gate can pass, warn, or fail based on risk.

## Backend API

Developer 1 owns the FastAPI service contract:

- `GET /health` returns service status.
- `POST /analyze-pr` accepts a GitHub PR URL and returns an analysis report.
- `GET /reports` returns recent analysis reports.
- `GET /reports/{report_id}` returns one report.
- `GET /reports/summary` returns dashboard counts.
- `POST /quality-gate` evaluates risk score and issue counts into `pass`, `warn`, or `fail`.
- `POST /releases/approve` approves a non-blocked report for authorized release roles.

## Run Locally

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Run backend tests:

```bash
cd backend
source .venv/bin/activate
pytest -q
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy the example files and fill values as the project moves past mock mode:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

For Day 1/2 development, the mock endpoint works without secrets.
