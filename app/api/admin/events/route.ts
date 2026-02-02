import { NextRequest, NextResponse } from "next/server";
import { createEvent, getAdminManagedEvents, getEvents } from "@/lib/db";
import { cookies } from "next/headers";
import { Event } from "@/types/event";
import crypto from "crypto";

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

    console.log(`Fetching events for admin ${admin.email} with role ${role || admin.role}`);

    let events: Event[] = [];

    // Determine effective role
    const effectiveRole = role || admin.role;

    // Superadmin sees all events
    if (effectiveRole === "superadmin") {
      events = await getEvents();
      console.log(`Superadmin: fetched ${events.length} events`);
    }
    // Event coordinator sees only their managed events
    else if (effectiveRole === "event_coordinator") {
      events = await getAdminManagedEvents(admin.id);
      console.log(`Coordinator ${admin.id}: fetched ${events.length} events`);
    }
    // Default: return all events
    else {
      events = await getEvents();
      console.log(`Default: fetched ${events.length} events`);
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession(request);

    if (!admin || admin.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Superadmin access required." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      date,
      location,
      imageUrl,
      category,
      capacity,
      registrationFee,
      isOnline,
      rules,
      priceAmount,
    } = body;

    if (
      !title ||
      !description ||
      !date ||
      !location ||
      !imageUrl ||
      !category ||
      capacity === undefined ||
      registrationFee === undefined ||
      isOnline === undefined ||
      rules === undefined ||
      priceAmount === undefined
    ) {
      return NextResponse.json(
        { error: "All event fields are required" },
        { status: 400 },
      );
    }

    let normalizedRules: string[];
    if (Array.isArray(rules)) {
      normalizedRules = rules.map((rule) => String(rule));
    } else if (typeof rules === "string") {
      try {
        const parsed = JSON.parse(rules);
        if (!Array.isArray(parsed)) {
          return NextResponse.json(
            { error: "Rules must be a JSON array" },
            { status: 400 },
          );
        }
        normalizedRules = parsed.map((rule) => String(rule));
      } catch {
        return NextResponse.json(
          { error: "Rules must be a valid JSON array" },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "Rules must be a JSON array" },
        { status: 400 },
      );
    }

    const eventId = crypto.randomUUID();

    const normalizedIsOnline =
      isOnline === true || isOnline === "true" || isOnline === 1;

    await createEvent({
      id: eventId,
      title,
      description,
      date,
      location,
      imageUrl,
      category,
      capacity: Number(capacity),
      registrationFee: Number(registrationFee),
      isOnline: normalizedIsOnline,
      rules: normalizedRules,
      priceAmount: Number(priceAmount),
    });

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      id: eventId,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
