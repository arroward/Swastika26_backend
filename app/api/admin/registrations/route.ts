import { NextRequest, NextResponse } from "next/server";
import {
  getAllRegistrations,
  getRegistrationsByEvent,
  getAdminManagedEvents,
  getAdminByEmail,
} from "@/lib/db";
import { cookies } from "next/headers";

// Helper to get admin from session
async function getAdminFromSession(request: NextRequest) {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_session")?.value;

  if (!adminId) {
    return null;
  }

  // In production, validate JWT token and get admin details
  return adminId;
}

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminFromSession(request);

    console.log("Admin session:", adminId);

    if (!adminId) {
      console.log("No admin session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const role = searchParams.get("role");

    console.log("Request params:", { eventId, role });

    // Superadmin gets all registrations
    if (role === "superadmin") {
      const registrations = await getAllRegistrations();
      return NextResponse.json({
        success: true,
        data: registrations,
      });
    }

    // Event coordinator gets registrations for their events
    if (role === "event_coordinator" && eventId) {
      console.log("Fetching registrations for event:", eventId);
      const registrations = await getRegistrationsByEvent(eventId);
      console.log("Found registrations:", registrations.length);
      return NextResponse.json({
        success: true,
        data: registrations,
      });
    }

    console.log("Invalid request - missing role or eventId");
    return NextResponse.json(
      { error: "Invalid request parameters" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
