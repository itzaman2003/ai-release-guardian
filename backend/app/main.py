from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .mock_data import build_mock_report
from .schemas import AnalysisReport, AnalyzePrRequest

app = FastAPI(
    title="AI Release Guardian API",
    description="Hackathon API for pull request release-risk analysis.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REPORT_HISTORY: list[AnalysisReport] = []


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-release-guardian"}


@app.post("/analyze-pr", response_model=AnalysisReport)
def analyze_pr(payload: AnalyzePrRequest) -> AnalysisReport:
    report = build_mock_report(str(payload.pr_url))
    REPORT_HISTORY.insert(0, report)
    return report


@app.get("/reports", response_model=list[AnalysisReport])
def reports() -> list[AnalysisReport]:
    if REPORT_HISTORY:
        return REPORT_HISTORY[:10]
    return [build_mock_report("https://github.com/demo/ai-release-guardian/pull/42")]
