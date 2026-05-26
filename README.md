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

## Run Locally

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
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
