from fastapi import HTTPException, status

from ..schemas import AnalysisReport, GateStatus, ReleaseApproval, ReleaseApprovalRequest

APPROVER_ROLES = {"release-manager", "engineering-manager", "sre-lead"}


def approve_release(report: AnalysisReport, payload: ReleaseApprovalRequest) -> ReleaseApproval:
    if payload.role not in APPROVER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Approver role is not allowed to approve releases.",
        )

    if report.quality_gate == GateStatus.fail:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Release is blocked by the quality gate.",
        )

    return ReleaseApproval(
        report_id=report.id,
        approver=payload.approver,
        role=payload.role,
        status="approved",
        comment=payload.comment,
        quality_gate=report.quality_gate,
    )
