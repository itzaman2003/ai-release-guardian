import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8001";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/reports`);

    if (!response.ok) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}
