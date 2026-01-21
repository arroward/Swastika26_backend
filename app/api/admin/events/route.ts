import { NextRequest, NextResponse } from "next/server";
import { getAdminManagedEvents, getEvents } from "@/lib/db";
import { cookies } from "next/headers";
import { Event } from "@/types/event";

// Helper to get admin from session
async function getAdminFromSession(request: NextRequest) {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value;
}

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminFromSession(request);

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    let events: Event[] = [];

    // Superadmin sees all events
    if (role === "superadmin") {
      events = await getEvents();
    }

    // Event coordinator sees only their managed events
    if (role === "event_coordinator") {
      events = await getAdminManagedEvents(adminId);
    }

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
