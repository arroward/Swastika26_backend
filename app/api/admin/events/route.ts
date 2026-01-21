import { NextRequest, NextResponse } from "next/server";
import { getAdminManagedEvents, getEvents } from "@/lib/db";
import { cookies } from "next/headers";
import { Event } from "@/types/event";

// Helper to get admin from session
async function getAdminFromSession(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return null;
    }

    const admin = JSON.parse(sessionCookie.value);
    return admin;
  } catch (error) {
    console.error("Error parsing session:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession(request);

    if (!admin) {
      console.log("GET /api/admin/events: No admin session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    console.log(`Fetching events for admin ${admin.email} with role ${role}`);

    let events: Event[] = [];

    // Superadmin sees all events
    if (role === "superadmin") {
      events = await getEvents();
      console.log(`Superadmin: fetched ${events.length} events`);
    }

    // Event coordinator sees only their managed events
    if (role === "event_coordinator") {
      events = await getAdminManagedEvents(admin.id);
      console.log(`Coordinator ${admin.id}: fetched ${events.length} events`);
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
