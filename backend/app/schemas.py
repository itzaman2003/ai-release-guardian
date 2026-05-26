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
