import { NextRequest, NextResponse } from "next/server";
import {
  getAllRegistrations,
  getRegistrationsByEvent,
  getCoordinatorRegistrations,
  getAdminManagedEvents,
  getAdminByEmail,
  sql,
} from "@/lib/db";
import { cookies } from "next/headers";

// Helper to get admin from session
async function getAdminFromSession(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return null;
    }

    return JSON.parse(sessionCookie.value);
  } catch (error) {
    console.error("Error parsing session:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminFromSession(request);

    console.log("Admin session:", session?.id);

    if (!session || !session.id) {
      console.log("No admin session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    // Get role and id from session
    const role = session.role;
    const adminId = session.id;

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
    if (role === "event_coordinator") {
      // If eventId is specified, verify coordinator owns this event
      if (eventId) {
        console.log("Fetching registrations for event:", eventId);

        // Verify that coordinator owns this event
        const eventOwnership = await sql`
          SELECT COUNT(*) as count FROM admin_events 
          WHERE admin_id = ${adminId} AND event_id = ${eventId}
        `;

        if (Number(eventOwnership[0].count) === 0) {
          console.log("Coordinator does not own this event");
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const registrations = await getRegistrationsByEvent(eventId);
        console.log("Found registrations:", registrations.length);
        return NextResponse.json({
          success: true,
          data: registrations,
        });
      } else {
        // Get all registrations for coordinator's events
        const registrations = await getCoordinatorRegistrations(adminId);
        console.log(
          "Found registrations for coordinator:",
          registrations.length,
        );
        return NextResponse.json({
          success: true,
          data: registrations,
        });
      }
    }

    console.log("Invalid request - unknown role");
    return NextResponse.json(
      { error: "Forbidden: Invalid role" },
      { status: 403 },
    );
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
