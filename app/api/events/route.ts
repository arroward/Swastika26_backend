import { NextResponse } from "next/server";
import { getEvents } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
