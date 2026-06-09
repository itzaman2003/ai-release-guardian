import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8001";

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as { pr_url?: string } | null;
  const prUrl = payload?.pr_url;

  if (!prUrl || !isGithubPullRequestUrl(prUrl)) {
    return NextResponse.json(
      { detail: "Enter a full GitHub PR URL, for example https://github.com/org/repo/pull/123." },
      { status: 422 },
    );
  }

  try {
    const response = await fetch(`${BACKEND_URL}/analyze-pr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pr_url: prUrl }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Analysis failed" }));
      return NextResponse.json(error, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json(
      { detail: `Backend error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    );
  }
}

function isGithubPullRequestUrl(value: string) {
  try {
    const url = new URL(value);
    const pathParts = url.pathname.split("/").filter(Boolean);
    return url.hostname === "github.com" && pathParts.length >= 4 && pathParts[2] === "pull" && /^\d+$/.test(pathParts[3]);
  } catch {
    return false;
  }
}
