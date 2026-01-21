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

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const role = searchParams.get("role");

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
      const registrations = await getRegistrationsByEvent(eventId);
      return NextResponse.json({
        success: true,
        data: registrations,
      });
    }

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
