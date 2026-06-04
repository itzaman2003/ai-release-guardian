import pytest
from fastapi import HTTPException

from app.mock_data import build_mock_report
from app.schemas import GateStatus, ReleaseApprovalRequest
from app.services.release_approval import approve_release


def test_approval_requires_authorized_role() -> None:
    report = build_mock_report("https://github.com/demo/ai-release-guardian/pull/42")
    report.quality_gate = GateStatus.warn
    payload = ReleaseApprovalRequest(report_id=report.id, approver="Mona", role="developer")

    with pytest.raises(HTTPException) as exc:
        approve_release(report, payload)

    assert exc.value.status_code == 403


def test_approval_blocks_failed_quality_gate() -> None:
    report = build_mock_report("https://github.com/demo/ai-release-guardian/pull/42")
    payload = ReleaseApprovalRequest(report_id=report.id, approver="Mona", role="release-manager")

    with pytest.raises(HTTPException) as exc:
        approve_release(report, payload)

    assert exc.value.status_code == 409


def test_approval_allows_release_manager_when_gate_warns() -> None:
    report = build_mock_report("https://github.com/demo/ai-release-guardian/pull/42")
    report.quality_gate = GateStatus.warn
    payload = ReleaseApprovalRequest(
        report_id=report.id,
        approver="Mona",
        role="release-manager",
        comment="Reviewed rollback plan.",
    )

    approval = approve_release(report, payload)

    assert approval.status == "approved"
    assert approval.quality_gate == "warn"
    assert approval.comment == "Reviewed rollback plan."
