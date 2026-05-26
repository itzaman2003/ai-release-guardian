"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clipboard, GitPullRequest, Loader2, ShieldAlert } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analyzePullRequest } from "@/lib/api";
import type { AnalysisReport, Severity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/badge";

const demoUrl = "https://github.com/demo/ai-release-guardian/pull/42";

const severityOrder: Severity[] = ["critical", "high", "medium", "low"];

export default function Home() {
  const [prUrl, setPrUrl] = useState(demoUrl);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [status, setStatus] = useState<"empty" | "loading" | "ready" | "error">("empty");
  const [error, setError] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");

  async function handleAnalyze() {
    setStatus("loading");
    setError("");
    try {
      const nextReport = await analyzePullRequest(prUrl);
      setReport(nextReport);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const stats = useMemo(() => {
    if (!report) {
      return [
        { label: "PRs analyzed", value: 0 },
        { label: "High-risk PRs", value: 0 },
        { label: "Tests suggested", value: 0 },
        { label: "Issues detected", value: 0 },
      ];
    }

    return [
      { label: "PRs analyzed", value: 1 },
      { label: "High-risk PRs", value: report.risk_score >= 70 ? 1 : 0 },
      { label: "Tests suggested", value: report.test_suggestions.length },
      { label: "Issues detected", value: report.issues.length },
    ];
  }, [report]);

  const issueChart = useMemo(() => {
    const counts = Object.fromEntries(severityOrder.map((severity) => [severity, 0]));
    report?.issues.forEach((issue) => {
      counts[issue.severity] += 1;
    });
    return severityOrder.map((severity) => ({ severity, count: counts[severity] }));
  }, [report]);

  const filteredIssues = report?.issues.filter((issue) => severityFilter === "all" || issue.severity === severityFilter) ?? [];

  return (
    <div className="space-y-6 px-5 py-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Analyze Pull Request</h2>
          </div>
          <label className="mt-5 block text-sm font-medium" htmlFor="pr-url">
            GitHub PR URL
          </label>
          <input
            id="pr-url"
            value={prUrl}
            onChange={(event) => setPrUrl(event.target.value)}
            placeholder="https://github.com/org/repo/pull/123"
            className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring-4"
          />
          <Button className="mt-4 w-full" onClick={handleAnalyze} disabled={status === "loading"}>
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
            Run Guardian Analysis
          </Button>
          {status === "error" ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          ) : null}
          {status === "empty" ? (
            <div className="mt-4 rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground">
              Paste a PR URL and run the mock Day 1 contract. The backend can later swap in GitHub and AI calls without changing this UI.
            </div>
          ) : null}
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Risk Overview</h2>
              <p className="text-sm text-muted-foreground">{report ? report.pr.title : "No report generated yet"}</p>
            </div>
            {report ? <SeverityBadge severity={report.risk_level} /> : null}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr]">
            <RiskMeter score={report?.risk_score ?? 0} />
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issueChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="severity" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {report ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-md border border-border bg-card p-5">
              <h2 className="text-base font-semibold">PR Metadata</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Meta label="Repository" value={report.pr.repository} />
                <Meta label="Author" value={report.pr.author} />
                <Meta label="Branch" value={report.pr.branch} />
                <Meta label="Files changed" value={String(report.pr.files_changed)} />
                <Meta label="Additions" value={`+${report.pr.additions}`} />
                <Meta label="Deletions" value={`-${report.pr.deletions}`} />
              </div>
            </div>
            <div className="rounded-md border border-border bg-card p-5">
              <h2 className="text-base font-semibold">Deployment Recommendation</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{report.summary}</p>
              <div className="mt-4 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <p className="text-sm font-medium">{report.deployment_recommendation}</p>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Issues Found</h2>
              <div className="flex flex-wrap gap-2">
                {(["all", ...severityOrder] as const).map((severity) => (
                  <button
                    key={severity}
                    onClick={() => setSeverityFilter(severity)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                      severityFilter === severity ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {filteredIssues.map((issue) => (
                <article key={`${issue.file}-${issue.title}`} className="rounded-md border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold">{issue.title}</h3>
                    <SeverityBadge severity={issue.severity} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{issue.description}</p>
                  <p className="mt-3 break-words rounded-md bg-muted p-2 text-xs text-muted-foreground">
                    {issue.file}
                    {issue.line ? `:${issue.line}` : ""}
                  </p>
                  <p className="mt-3 text-sm font-medium">{issue.suggested_fix}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-md border border-border bg-card p-5">
              <h2 className="text-base font-semibold">Test Suggestions</h2>
              <div className="mt-4 space-y-4">
                {report.test_suggestions.map((test) => (
                  <div key={test.title} className="rounded-md border border-border">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">{test.title}</p>
                        <p className="text-xs text-muted-foreground">{test.framework} · {test.command}</p>
                      </div>
                      <Button variant="secondary" className="h-8 px-3" onClick={() => navigator.clipboard.writeText(test.code)}>
                        <Clipboard className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <pre className="overflow-x-auto p-4 text-xs leading-5"><code>{test.code}</code></pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-border bg-card p-5">
              <h2 className="text-base font-semibold">Release Notes</h2>
              <p className="mt-3 text-sm text-muted-foreground">{report.release_notes.summary}</p>
              <NotesList title="User-facing changes" items={report.release_notes.user_facing_changes} />
              <NotesList title="Technical changes" items={report.release_notes.technical_changes} />
              <NotesList title="Risks" items={report.release_notes.risks} />
              <div className="mt-4 rounded-md border border-border bg-muted p-3">
                <p className="text-sm font-semibold">Rollback Plan</p>
                <p className="mt-2 text-sm text-muted-foreground">{report.release_notes.rollback_plan}</p>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">CI/CD Quality Gate</h2>
                <p className="mt-1 text-sm text-muted-foreground">GitHub Actions can call the backend and block high-risk releases.</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold uppercase text-red-700">
                <CheckCircle2 className="h-4 w-4" />
                {report.quality_gate}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function RiskMeter({ score }: { score: number }) {
  const color = score >= 70 ? "bg-red-500" : score >= 40 ? "bg-amber-400" : "bg-emerald-500";
  return (
    <div className="flex h-56 flex-col justify-center rounded-md border border-border bg-background p-5">
      <p className="text-sm text-muted-foreground">Risk score</p>
      <p className="mt-2 text-5xl font-semibold">{score}</p>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Low 0-39 · Medium 40-69 · High 70+</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

function NotesList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
