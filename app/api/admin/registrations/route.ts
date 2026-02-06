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

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      console.log("No admin session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let admin;
    try {
      admin = JSON.parse(sessionCookie.value);
    } catch (e) {
      console.log("Failed to parse session cookie");
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const adminId = admin.id;
    const adminRole = admin.role;

    console.log("Admin session:", adminId, "Role:", adminRole);

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    // const role = searchParams.get("role"); // Do NOT trust role from params

    console.log("Request params:", { eventId, role: adminRole });

    // Superadmin gets all registrations, or filtered by event
    if (adminRole === "superadmin") {
      let registrations;
      if (eventId) {
        console.log("Superadmin fetching registrations for event:", eventId);
        registrations = await getRegistrationsByEvent(eventId);
      } else {
        registrations = await getAllRegistrations();
      }

      return NextResponse.json({
        success: true,
        data: registrations,
      });
    }

    // Event coordinator gets registrations for their events
    if (adminRole === "event_coordinator") {
      // If eventId is specified, verify coordinator owns this event
      if (eventId) {
        console.log("Fetching registrations for event:", eventId);

        // Verify that coordinator owns this event
        const eventOwnership = await sql`
          SELECT COUNT(*) as count FROM admin_events 
          WHERE admin_id = ${adminId} AND event_id = ${eventId}
        `;

        // count is usually returned as a string or number depending on driver
        const count = Number(eventOwnership[0].count);

        if (count === 0) {
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

    console.log("Invalid role configuration");
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
