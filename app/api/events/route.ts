import { NextRequest, NextResponse } from "next/server";
import { getEvents, createEvent } from "@/lib/db";
import { cookies } from "next/headers";

// Helper to get admin from session
async function getAdminFromSession() {
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

export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();

    if (!admin || admin.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Only super admins can create events." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { title, description, date, location, imageUrl, category, capacity } =
      body;

    if (!title || !description || !date || !location || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Generate event ID
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await createEvent({
      id: eventId,
      title,
      description,
      date,
      location,
      imageUrl: imageUrl || "",
      category,
      capacity: capacity || 100,
    });

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      eventId,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
