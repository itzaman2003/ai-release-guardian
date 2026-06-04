from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .mock_data import build_mock_report
from .schemas import (
    AnalysisReport,
    AnalyzePrRequest,
    DashboardSummary,
    QualityGateDecision,
    QualityGateRequest,
    ReleaseApproval,
    ReleaseApprovalRequest,
)
from .services.quality_gate import evaluate_quality_gate, request_from_report
from .services.release_approval import approve_release
from .services.report_store import report_store

app = FastAPI(
    title="AI Release Guardian API",
    description="Hackathon API for pull request release-risk analysis.",
    version="0.1.0",
)

# Add CORS middleware BEFORE your routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-release-guardian"}


@app.post("/analyze-pr", response_model=AnalysisReport)
def analyze_pr(payload: AnalyzePrRequest) -> AnalysisReport:
    report = build_mock_report(str(payload.pr_url))
    gate = evaluate_quality_gate(request_from_report(report.risk_score, report.issues))
    report.quality_gate = gate.status
    report_store.add(report)
    return report


@app.get("/reports", response_model=list[AnalysisReport])
def reports() -> list[AnalysisReport]:
    return report_store.list()


@app.get("/reports/summary", response_model=DashboardSummary)
def report_summary() -> DashboardSummary:
    return report_store.summary()


@app.get("/reports/{report_id}", response_model=AnalysisReport)
def report_detail(report_id: str) -> AnalysisReport:
    report = report_store.get(report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return report


@app.post("/quality-gate", response_model=QualityGateDecision)
def quality_gate(payload: QualityGateRequest) -> QualityGateDecision:
    return evaluate_quality_gate(payload)


@app.post("/releases/approve", response_model=ReleaseApproval)
def release_approval(payload: ReleaseApprovalRequest) -> ReleaseApproval:
    report = report_store.get(payload.report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return approve_release(report, payload)
