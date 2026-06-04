import type { AnalysisReport } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

export async function analyzePullRequest(prUrl: string): Promise<AnalysisReport> {
  const response = await guardianFetch("/analyze-pr", {
    method: "POST",
    body: JSON.stringify({ pr_url: prUrl }),
  });

  if (!response.ok) {
    if (response.status === 422) {
      throw new Error("Enter a full GitHub PR URL, for example https://github.com/org/repo/pull/123.");
    }
    throw new Error("Analysis failed. Check the backend and PR URL.");
  }

  return response.json();
}

export async function fetchReports(): Promise<AnalysisReport[]> {
  const response = await guardianFetch("/reports");

  if (!response.ok) {
    throw new Error("Report history is unavailable.");
  }

  return response.json();
}

async function guardianFetch(path: string, init?: RequestInit) {
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error(`Backend is not reachable at ${API_BASE_URL}. Start the backend and refresh the page.`);
  }
}
