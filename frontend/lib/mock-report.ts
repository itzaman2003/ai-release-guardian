import type { AnalysisReport } from "@/lib/types";

export function buildMockReport(prUrl: string): AnalysisReport {
  return {
    id: "guardian-demo-001",
    pr: {
      url: prUrl,
      title: "Add release approval endpoint",
      author: "developer-1",
      repository: repositoryFromUrl(prUrl),
      branch: "feature/release-approval",
      files_changed: 8,
      additions: 312,
      deletions: 74,
    },
    summary:
      "This PR adds a release approval API path and touches deployment-sensitive logic. The implementation is close, but authorization and failure-mode tests need attention before release.",
    risk_score: 78,
    risk_level: "high",
    issues: [
      {
        title: "Missing authorization check before approval write",
        severity: "high",
        file: "backend/app/routes/releases.py",
        line: 42,
        description:
          "The new approval endpoint accepts a release id and writes an approval without verifying that the caller can approve that release.",
        suggested_fix: "Validate the GitHub user or app installation permissions before writing the approval record.",
      },
      {
        title: "No regression coverage for failed quality gate",
        severity: "medium",
        file: "backend/tests/test_quality_gate.py",
        description: "The quality gate behavior is changed but there is no test that proves high-risk PRs are blocked.",
        suggested_fix: "Add tests for pass, warn, and fail gate outcomes.",
      },
      {
        title: "Rollback path is not logged",
        severity: "low",
        file: "backend/app/services/release_notes.py",
        description: "Generated rollback guidance is returned to the UI but not persisted for audit history.",
        suggested_fix: "Persist the rollback plan with the completed analysis report.",
      },
    ],
    test_suggestions: [
      {
        title: "Quality gate fails high-risk releases",
        framework: "pytest",
        command: "pytest backend/tests/test_quality_gate.py",
        code:
          "def test_quality_gate_fails_high_risk_release():\n    report = build_report(risk_score=82, critical_issues=0)\n    gate = evaluate_quality_gate(report)\n    assert gate.status == 'fail'\n    assert 'risk score' in gate.reason.lower()\n",
      },
      {
        title: "Approval endpoint requires release permission",
        framework: "pytest",
        command: "pytest backend/tests/test_release_approval.py",
        code:
          "def test_approval_requires_authorized_user(client):\n    response = client.post('/releases/123/approve', headers={})\n    assert response.status_code == 403\n",
      },
    ],
    release_notes: {
      summary: "Adds AI-assisted release approval checks for pull requests.",
      user_facing_changes: [
        "Release reviewers can see an approval recommendation before deployment.",
        "High-risk PRs show a blocked quality gate in the dashboard.",
      ],
      technical_changes: [
        "Introduces a release approval API endpoint.",
        "Adds structured report fields for gate status and rollback guidance.",
      ],
      risks: ["Approval writes need stronger authorization checks.", "Quality gate regressions could allow risky releases to pass."],
      rollback_plan:
        "Disable the release approval route, revert the quality gate workflow change, and continue using manual PR review until authorization is patched.",
    },
    deployment_recommendation: "Block release until authorization and gate tests are added.",
    quality_gate: "fail",
  };
}

function repositoryFromUrl(prUrl: string) {
  try {
    const url = new URL(prUrl);
    const [owner, repo] = url.pathname.split("/").filter(Boolean);
    return owner && repo ? `${owner}/${repo}` : "demo/ai-release-guardian";
  } catch {
    return "demo/ai-release-guardian";
  }
}
