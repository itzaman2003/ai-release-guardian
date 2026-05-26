import type { AnalysisReport } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function analyzePullRequest(prUrl: string): Promise<AnalysisReport> {
  const response = await fetch(`${API_BASE_URL}/analyze-pr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pr_url: prUrl }),
  });

  if (!response.ok) {
    throw new Error("Analysis failed. Check the backend and PR URL.");
  }

  return response.json();
}
