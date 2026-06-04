from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_analyze_pr_returns_report_and_updates_history() -> None:
    response = client.post("/analyze-pr", json={"pr_url": "https://github.com/demo/ai-release-guardian/pull/42"})

    assert response.status_code == 200
    report = response.json()
    assert report["pr"]["repository"] == "demo/ai-release-guardian"
    assert report["quality_gate"] == "fail"

    reports_response = client.get("/reports")
    assert reports_response.status_code == 200
    assert reports_response.json()[0]["id"] == report["id"]


def test_quality_gate_endpoint() -> None:
    response = client.post("/quality-gate", json={"risk_score": 45, "critical_issues": 0, "high_issues": 0})

    assert response.status_code == 200
    assert response.json()["status"] == "warn"


def test_release_approval_rejects_unknown_report() -> None:
    response = client.post(
        "/releases/approve",
        json={"report_id": "missing", "approver": "Mona", "role": "release-manager"},
    )

    assert response.status_code == 404
