import { NextResponse } from "next/server";
import { buildMockReport } from "@/lib/mock-report";
import { listReports } from "@/lib/supabase-store";

// Server-side only — never exposed to the browser (no NEXT_PUBLIC_ prefix).
const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, "");

export async function GET() {
  // ── Proxy mode: forward the request to the FastAPI backend ──────────────
  if (BACKEND_URL) {
    try {
      const backendRes = await fetch(`${BACKEND_URL}/reports`, {
        headers: { "Content-Type": "application/json" },
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
  const reports = await listReports();
  return NextResponse.json(
    reports.length > 0
      ? reports
      : [buildMockReport("https://github.com/demo/ai-release-guardian/pull/42")],
  );
}