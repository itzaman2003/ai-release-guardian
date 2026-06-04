from app.schemas import QualityGateRequest
from app.services.quality_gate import evaluate_quality_gate


def test_quality_gate_fails_high_risk_release() -> None:
    gate = evaluate_quality_gate(QualityGateRequest(risk_score=82, critical_issues=0, high_issues=1))

    assert gate.status == "fail"
    assert "risk" in gate.reason.lower()
    assert gate.required_actions


def test_quality_gate_fails_critical_issue() -> None:
    gate = evaluate_quality_gate(QualityGateRequest(risk_score=25, critical_issues=1, high_issues=0))

    assert gate.status == "fail"
    assert "critical" in gate.reason.lower()


def test_quality_gate_warns_medium_risk_release() -> None:
    gate = evaluate_quality_gate(QualityGateRequest(risk_score=48, critical_issues=0, high_issues=0))

    assert gate.status == "warn"
    assert "reviewer" in gate.reason.lower()


def test_quality_gate_passes_low_risk_release() -> None:
    gate = evaluate_quality_gate(QualityGateRequest(risk_score=18, critical_issues=0, high_issues=0))

    assert gate.status == "pass"
    assert "allowed" in gate.reason.lower()
