import { NextRequest, NextResponse } from "next/server";
import { getAdminEventIds, updateAdminEventAssignments } from "@/lib/db";
import { cookies } from "next/headers";

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
    console.error("Error getting admin from session:", error);
    return null;
  }
}

// GET - Get event assignments for an admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession(request);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Superadmin access required." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const eventIds = await getAdminEventIds(id);

    return NextResponse.json({
      success: true,
      eventIds,
    });
  } catch (error) {
    console.error("Error fetching admin event assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update event assignments for an admin
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession(request);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Superadmin access required." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { eventIds } = body;

    if (!Array.isArray(eventIds)) {
      return NextResponse.json(
        { error: "eventIds must be an array" },
        { status: 400 },
      );
    }

    await updateAdminEventAssignments(id, eventIds);

    return NextResponse.json({
      success: true,
      message: "Event assignments updated successfully",
    });
  } catch (error) {
    console.error("Error updating admin event assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
