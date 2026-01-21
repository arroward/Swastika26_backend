import { NextRequest, NextResponse } from "next/server";
import { getEventById, updateEvent, deleteEvent } from "@/lib/db";
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await params;
    const event = await getEventById(eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const admin = await getAdminFromSession();

    if (!admin || admin.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Only super admins can update events." },
        { status: 403 },
      );
    }

    const { eventId } = await params;
    const body = await request.json();

    // Check if event exists
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updates: any = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.date !== undefined) updates.date = body.date;
    if (body.location !== undefined) updates.location = body.location;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
    if (body.category !== undefined) updates.category = body.category;
    if (body.capacity !== undefined) updates.capacity = body.capacity;

    await updateEvent(eventId, updates);

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const admin = await getAdminFromSession();

    if (!admin || admin.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Only super admins can delete events." },
        { status: 403 },
      );
    }

    const { eventId } = await params;

    // Check if event exists
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await deleteEvent(eventId);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
