import { NextResponse } from "next/server";
import { buildMockReport } from "@/lib/mock-report";

export function GET() {
  return NextResponse.json([buildMockReport("https://github.com/demo/ai-release-guardian/pull/42")]);
}
