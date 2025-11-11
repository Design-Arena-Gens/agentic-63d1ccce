import { NextResponse } from "next/server";
import { fetchRealtimeData } from "@/lib/realtime";

export async function GET() {
  try {
    const payload = await fetchRealtimeData();
    return NextResponse.json(payload.data ?? []);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
