import { NextRequest, NextResponse } from "next/server";
import { buildMockReport } from "@/lib/mock-report";

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as { pr_url?: string } | null;
  const prUrl = payload?.pr_url;

  if (!prUrl || !isGithubPullRequestUrl(prUrl)) {
    return NextResponse.json(
      { detail: "Enter a full GitHub PR URL, for example https://github.com/org/repo/pull/123." },
      { status: 422 },
    );
  }

  return NextResponse.json(buildMockReport(prUrl));
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
