"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  ExternalLink,
  FileText,
  GitBranch,
  GitPullRequest,
  History,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analyzePullRequest, fetchReports } from "@/lib/api";
import type { AnalysisReport, GateStatus, Severity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/badge";

const demoUrl = "https://github.com/demo/ai-release-guardian/pull/42";
const severityOrder: Severity[] = ["critical", "high", "medium", "low"];

const severityChartColors: Record<Severity, string> = {
  critical: "#be123c",
  high: "#dc2626",
  medium: "#d97706",
  low: "#059669",
};

const gateCopy: Record<GateStatus, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
  pass: {
    label: "Ready to release",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  warn: {
    label: "Needs reviewer attention",
    classes: "border-amber-200 bg-amber-50 text-amber-700",
    icon: AlertTriangle,
  },
  fail: {
    label: "Release blocked",
    classes: "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },
};

export default function Home() {
  const [prUrl, setPrUrl] = useState(demoUrl);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [history, setHistory] = useState<AnalysisReport[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [historyStatus, setHistoryStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setHistoryStatus("loading");
    try {
      const reports = await fetchReports();
      setHistory(reports);
      setReport((current) => current ?? reports[0] ?? null);
      setStatus((current) => (current === "idle" && reports.length > 0 ? "ready" : current));
      setHistoryStatus("ready");
    } catch {
      setHistoryStatus("error");
    }
  }

  async function handleAnalyze(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const nextReport = await analyzePullRequest(prUrl.trim());
      setReport(nextReport);
      setHistory((current) => [nextReport, ...current.filter((item) => item.id !== nextReport.id)].slice(0, 10));
      setSeverityFilter("all");
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const activeReport = report;
  const summary = useMemo(() => buildSummary(history, activeReport), [history, activeReport]);
  const issueChart = useMemo(() => buildIssueChart(activeReport), [activeReport]);
  const filteredIssues =
    activeReport?.issues.filter((issue) => severityFilter === "all" || issue.severity === severityFilter) ?? [];

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6">
      <section id="dashboard" className="scroll-mt-24 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reports" value={summary.reports} detail="Current session" icon={FileText} tone="blue" />
        <StatCard label="High risk" value={summary.highRisk} detail="Score 70+" icon={ShieldAlert} tone="red" />
        <StatCard label="Open issues" value={summary.issues} detail="Across selected report" icon={AlertTriangle} tone="amber" />
        <StatCard label="Tests" value={summary.tests} detail="Suggested checks" icon={CheckCircle2} tone="emerald" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,430px)_1fr]">
        <form id="analyze-pr" onSubmit={handleAnalyze} className="scroll-mt-24 rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle icon={GitPullRequest} title="Analyze Pull Request" />
            <Button type="button" variant="ghost" className="h-9 px-3" onClick={() => setPrUrl(demoUrl)}>
              <Sparkles className="h-4 w-4" />
              Demo
            </Button>
          </div>

          <label className="mt-5 block text-sm font-medium" htmlFor="pr-url">
            GitHub PR URL
          </label>
          <input
            id="pr-url"
            value={prUrl}
            onChange={(event) => setPrUrl(event.target.value)}
            placeholder="https://github.com/org/repo/pull/123"
            className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-4"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Button type="submit" className="w-full" disabled={status === "loading" || prUrl.trim().length === 0}>
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Run Analysis
            </Button>
            <Button type="button" variant="secondary" onClick={loadHistory} disabled={historyStatus === "loading"}>
              <RefreshCcw className={historyStatus === "loading" ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </Button>
          </div>

          {status === "error" ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>
          ) : null}

          <div className="mt-5 border-t border-border pt-5">
            <SectionTitle icon={History} title="Recent Reports" />
            <div className="mt-3 space-y-2">
              {historyStatus === "loading" ? <SkeletonRows /> : null}
              {historyStatus === "error" ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">History unavailable</p>
              ) : null}
              {historyStatus === "ready" && history.length === 0 ? (
                <p className="rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground">No reports yet</p>
              ) : null}
              {history.map((item) => (
                <button
                  type="button"
                  key={`${item.id}-${item.pr.url}`}
                  onClick={() => {
                    setReport(item);
                    setStatus("ready");
                    setSeverityFilter("all");
                  }}
                  className={`w-full rounded-md border p-3 text-left transition hover:border-primary/60 ${
                    activeReport?.id === item.id ? "border-primary bg-primary/5" : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.pr.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{item.pr.repository}</p>
                    </div>
                    <SeverityBadge severity={item.risk_level} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <SectionTitle icon={ShieldAlert} title="Risk Overview" />
              <p className="mt-2 text-sm text-muted-foreground">{activeReport ? activeReport.summary : "Waiting for analysis"}</p>
            </div>
            {activeReport ? <GateBadge status={activeReport.quality_gate} /> : null}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[240px_1fr]">
            <RiskMeter score={activeReport?.risk_score ?? 0} />
            <div className="min-h-64 rounded-md border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Issue Severity</p>
                {activeReport ? <SeverityBadge severity={activeReport.risk_level} /> : null}
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={issueChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="severity" />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {issueChart.map((item) => (
                        <Cell key={item.severity} fill={severityChartColors[item.severity]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {activeReport ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-md border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionTitle icon={GitBranch} title="PR Metadata" />
                <a
                  href={activeReport.pr.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open PR
                </a>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Meta label="Repository" value={activeReport.pr.repository} />
                <Meta label="Author" value={activeReport.pr.author} />
                <Meta label="Branch" value={activeReport.pr.branch} />
                <Meta label="Files" value={String(activeReport.pr.files_changed)} />
                <Meta label="Additions" value={`+${activeReport.pr.additions}`} accent="text-emerald-700" />
                <Meta label="Deletions" value={`-${activeReport.pr.deletions}`} accent="text-red-700" />
              </div>
            </div>

            <div id="quality-gate" className="scroll-mt-24 rounded-md border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <SectionTitle icon={ShieldCheck} title="Deployment Decision" />
                <Button type="button" variant="secondary" className="h-9 px-3" onClick={() => copyReport(activeReport)}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm font-semibold leading-6">{activeReport.deployment_recommendation}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{activeReport.release_notes.rollback_plan}</p>
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle icon={AlertTriangle} title="Findings" />
              <div className="flex flex-wrap gap-2">
                {(["all", ...severityOrder] as const).map((severity) => (
                  <button
                    key={severity}
                    type="button"
                    onClick={() => setSeverityFilter(severity)}
                    className={`h-8 rounded-md border px-3 text-xs font-semibold capitalize transition ${
                      severityFilter === severity ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {filteredIssues.map((issue) => (
                <article key={`${issue.file}-${issue.title}`} className="rounded-md border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold leading-5">{issue.title}</h3>
                    <SeverityBadge severity={issue.severity} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{issue.description}</p>
                  <p className="mt-3 break-words rounded-md bg-muted p-2 text-xs text-muted-foreground">
                    {issue.file}
                    {issue.line ? `:${issue.line}` : ""}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-6">{issue.suggested_fix}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-md border border-border bg-card p-5 shadow-sm">
              <SectionTitle icon={CheckCircle2} title="Test Suggestions" />
              <div className="mt-4 space-y-4">
                {activeReport.test_suggestions.map((test) => (
                  <div key={test.title} className="overflow-hidden rounded-md border border-border bg-background">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{test.title}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {test.framework} / {test.command}
                        </p>
                      </div>
                      <Button type="button" variant="secondary" className="h-8 px-3" onClick={() => copyText(test.code)}>
                        <Clipboard className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <pre className="max-h-56 overflow-auto p-4 text-xs leading-5">
                      <code>{test.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionTitle icon={FileText} title="Release Notes" />
                <Button type="button" variant="secondary" className="h-8 px-3" onClick={() => copyText(formatReleaseNotes(activeReport))}>
                  <Clipboard className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{activeReport.release_notes.summary}</p>
              <NotesList title="User-facing changes" items={activeReport.release_notes.user_facing_changes} />
              <NotesList title="Technical changes" items={activeReport.release_notes.technical_changes} />
              <NotesList title="Risks" items={activeReport.release_notes.risks} />
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-md border border-dashed border-border bg-card p-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">No active report</p>
          <p className="mt-1 text-sm text-muted-foreground">Run or select a report to populate the dashboard.</p>
        </section>
      )}
    </div>
  );
}

function buildSummary(history: AnalysisReport[], report: AnalysisReport | null) {
  return {
    reports: history.length,
    highRisk: history.filter((item) => item.risk_score >= 70).length,
    issues: report?.issues.length ?? 0,
    tests: report?.test_suggestions.length ?? 0,
  };
}

function buildIssueChart(report: AnalysisReport | null) {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  report?.issues.forEach((issue) => {
    counts[issue.severity] += 1;
  });

  return severityOrder.map((severity) => ({ severity, count: counts[severity] }));
}

function SectionTitle({ icon: Icon, title }: { icon: typeof ShieldAlert; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof FileText;
  tone: "blue" | "red" | "amber" | "emerald";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    red: "bg-red-50 text-red-700 border-red-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md border ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function RiskMeter({ score }: { score: number }) {
  const meterClass = score >= 70 ? "bg-red-500" : score >= 40 ? "bg-amber-400" : "bg-emerald-500";
  const label = score >= 70 ? "High risk" : score >= 40 ? "Medium risk" : "Low risk";

  return (
    <div className="flex min-h-64 flex-col justify-center rounded-md border border-border bg-background p-5">
      <p className="text-sm text-muted-foreground">Risk score</p>
      <p className="mt-2 text-6xl font-semibold tracking-normal">{score}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${meterClass}`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}

function GateBadge({ status }: { status: GateStatus }) {
  const gate = gateCopy[status];
  const Icon = gate.icon;

  return (
    <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${gate.classes}`}>
      <Icon className="h-4 w-4" />
      {gate.label}
    </div>
  );
}

function Meta({ label, value, accent = "" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 break-words text-sm font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function NotesList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-16 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}

function formatReleaseNotes(report: AnalysisReport) {
  return [
    `# ${report.pr.title}`,
    "",
    report.release_notes.summary,
    "",
    "## User-facing changes",
    ...report.release_notes.user_facing_changes.map((item) => `- ${item}`),
    "",
    "## Technical changes",
    ...report.release_notes.technical_changes.map((item) => `- ${item}`),
    "",
    "## Risks",
    ...report.release_notes.risks.map((item) => `- ${item}`),
    "",
    "## Rollback plan",
    report.release_notes.rollback_plan,
  ].join("\n");
}

function copyReport(report: AnalysisReport) {
  copyText(
    JSON.stringify(
      {
        id: report.id,
        pull_request: report.pr.url,
        risk_score: report.risk_score,
        risk_level: report.risk_level,
        quality_gate: report.quality_gate,
        deployment_recommendation: report.deployment_recommendation,
        issues: report.issues,
        test_suggestions: report.test_suggestions.map((test) => ({
          title: test.title,
          command: test.command,
        })),
      },
      null,
      2,
    ),
  );
}

function copyText(value: string) {
  navigator.clipboard?.writeText(value);
}
