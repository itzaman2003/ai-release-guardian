from ..schemas import GateStatus, GuardianIssue, QualityGateDecision, QualityGateRequest, Severity


def evaluate_quality_gate(payload: QualityGateRequest) -> QualityGateDecision:
    if payload.critical_issues > 0:
        return QualityGateDecision(
            status=GateStatus.fail,
            reason="Critical issues must be resolved before release.",
            required_actions=[
                "Fix every critical issue.",
                "Run the release regression suite again.",
                "Request release-manager approval after fixes.",
            ],
        )

    if payload.risk_score >= 70 or payload.high_issues >= 2:
        return QualityGateDecision(
            status=GateStatus.fail,
            reason="Risk score or high-severity issue count exceeds the release threshold.",
            required_actions=[
                "Address high-severity findings.",
                "Add regression coverage for the changed release path.",
                "Re-run AI Release Guardian before deployment.",
            ],
        )

    if payload.risk_score >= 40 or payload.high_issues == 1:
        return QualityGateDecision(
            status=GateStatus.warn,
            reason="Release can proceed only with reviewer acknowledgement.",
            required_actions=[
                "Confirm the rollback plan.",
                "Have a reviewer acknowledge the remaining risk.",
            ],
        )

    return QualityGateDecision(
        status=GateStatus.pass_,
        reason="Risk is within the allowed release threshold.",
        required_actions=["Proceed with normal release checks."],
    )


def request_from_report(risk_score: int, issues: list[GuardianIssue]) -> QualityGateRequest:
    return QualityGateRequest(
        risk_score=risk_score,
        critical_issues=sum(1 for issue in issues if issue.severity == Severity.critical),
        high_issues=sum(1 for issue in issues if issue.severity == Severity.high),
    )
