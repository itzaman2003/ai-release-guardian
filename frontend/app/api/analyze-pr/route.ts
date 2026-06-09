import { NextRequest, NextResponse } from "next/server";
import { buildMockReport } from "@/lib/mock-report";
import { saveReport } from "@/lib/supabase-store";

// Server-side only — never exposed to the browser (no NEXT_PUBLIC_ prefix).
// Set this in Vercel Project Settings → Environment Variables to point at your
// deployed FastAPI backend, e.g. https://your-api.railway.app
const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, "");

export async function POST(request: NextRequest) {
  // ── Proxy mode: forward the request to the FastAPI backend ──────────────
  if (BACKEND_URL) {
    let body: string;
    try {
      body = await request.text();
    } catch {
      return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
    }

    try {
      const backendRes = await fetch(`${BACKEND_URL}/analyze-pr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status });
    } catch {
      return NextResponse.json(
        {
          detail:
            "Could not reach the backend. Check that BACKEND_URL is correct and the service is running.",
        },
        { status: 502 },
      );
    }
  }

  // ── Mock mode: no backend configured, return local mock data ────────────
  const payload = (await request.json().catch(() => null)) as { pr_url?: string } | null;
  const prUrl = payload?.pr_url;

  if (!prUrl || !isGithubPullRequestUrl(prUrl)) {
    return NextResponse.json(
      { detail: "Enter a full GitHub PR URL, for example https://github.com/org/repo/pull/123." },
      { status: 422 },
    );
  }

  const report = buildMockReport(prUrl);
  await saveReport(report);
  return NextResponse.json(report);
}

function isGithubPullRequestUrl(value: string) {
  try {
    const url = new URL(value);
    const pathParts = url.pathname.split("/").filter(Boolean);
    return (
      url.hostname === "github.com" &&
      pathParts.length >= 4 &&
      pathParts[2] === "pull" &&
      /^\d+$/.test(pathParts[3])
    );
  } catch {
    return false;
  }
}