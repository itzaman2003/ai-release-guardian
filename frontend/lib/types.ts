export type Severity = "low" | "medium" | "high" | "critical";
export type GateStatus = "pass" | "warn" | "fail";

export type PullRequestMetadata = {
  url: string;
  title: string;
  author: string;
  repository: string;
  branch: string;
  files_changed: number;
  additions: number;
  deletions: number;
};

export type GuardianIssue = {
  title: string;
  severity: Severity;
  file: string;
  line?: number | null;
  description: string;
  suggested_fix: string;
};

export type TestSuggestion = {
  title: string;
  framework: string;
  command: string;
  code: string;
};

export type ReleaseNotes = {
  summary: string;
  user_facing_changes: string[];
  technical_changes: string[];
  risks: string[];
  rollback_plan: string;
};

export type AnalysisReport = {
  id: string;
  pr: PullRequestMetadata;
  summary: string;
  risk_score: number;
  risk_level: Severity;
  issues: GuardianIssue[];
  test_suggestions: TestSuggestion[];
  release_notes: ReleaseNotes;
  deployment_recommendation: string;
  quality_gate: GateStatus;
};
