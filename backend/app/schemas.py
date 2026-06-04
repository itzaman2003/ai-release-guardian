from enum import Enum
from pydantic import BaseModel, Field, HttpUrl


class Severity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class GateStatus(str, Enum):
    pass_ = "pass"
    warn = "warn"
    fail = "fail"


class AnalyzePrRequest(BaseModel):
    pr_url: HttpUrl = Field(..., examples=["https://github.com/acme/api/pull/42"])


class QualityGateRequest(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    critical_issues: int = Field(0, ge=0)
    high_issues: int = Field(0, ge=0)


class QualityGateDecision(BaseModel):
    status: GateStatus
    reason: str
    required_actions: list[str]


class ReleaseApprovalRequest(BaseModel):
    report_id: str
    approver: str = Field(..., min_length=2)
    role: str = Field(..., examples=["release-manager"])
    comment: str | None = None


class ReleaseApproval(BaseModel):
    report_id: str
    approver: str
    role: str
    status: str
    comment: str | None = None
    quality_gate: GateStatus


class PullRequestMetadata(BaseModel):
    url: str
    title: str
    author: str
    repository: str
    branch: str
    files_changed: int
    additions: int
    deletions: int


class GuardianIssue(BaseModel):
    title: str
    severity: Severity
    file: str
    line: int | None = None
    description: str
    suggested_fix: str


class TestSuggestion(BaseModel):
    title: str
    framework: str
    command: str
    code: str


class ReleaseNotes(BaseModel):
    summary: str
    user_facing_changes: list[str]
    technical_changes: list[str]
    risks: list[str]
    rollback_plan: str


class AnalysisReport(BaseModel):
    id: str
    pr: PullRequestMetadata
    summary: str
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: Severity
    issues: list[GuardianIssue]
    test_suggestions: list[TestSuggestion]
    release_notes: ReleaseNotes
    deployment_recommendation: str
    quality_gate: GateStatus


class DashboardSummary(BaseModel):
    total_reports: int
    blocked_releases: int
    warning_releases: int
    passing_releases: int
    latest_report: AnalysisReport | None = None
