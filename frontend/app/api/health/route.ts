import { NextResponse } from "next/server";

// Server-side only — never exposed to the browser (no NEXT_PUBLIC_ prefix).
const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, "");

export async function GET() {
  // ── Proxy mode: forward the request to the FastAPI backend ──────────────
  if (BACKEND_URL) {
    try {
      const backendRes = await fetch(`${BACKEND_URL}/health`);
      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status });
    } catch {
      return NextResponse.json(
        { status: "backend_unreachable", backend_url: BACKEND_URL },
        { status: 502 },
      );
    }
  }

  // ── Mock mode: no backend configured, running standalone ────────────────
  return NextResponse.json({ status: "ok", service: "ai-release-guardian", mode: "mock" });
}