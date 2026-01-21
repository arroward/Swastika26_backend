import { NextRequest, NextResponse } from "next/server";
import { getRegistrationsByEvent } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await params;

    console.log("Fetching registrations for event ID:", eventId);

    const registrations = await getRegistrationsByEvent(eventId);

    console.log("Found registrations:", registrations.length);

    return NextResponse.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
