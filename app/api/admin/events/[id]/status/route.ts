import { NextRequest, NextResponse } from "next/server";
import { updateEventRegistrationStatus } from "@/lib/db";
import { cookies } from "next/headers";

async function getAdminFromSession(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie) return null;
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * PATCH /api/admin/events/[id]/status
 * Body: { registrationStatus: "enabled" | "disabled" }
 * Superadmin only — enables or disables registration for an event.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession(request);

    if (!admin || admin.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Superadmin access required." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { registrationStatus } = body;

    if (registrationStatus !== "enabled" && registrationStatus !== "disabled") {
      return NextResponse.json(
        { error: "registrationStatus must be 'enabled' or 'disabled'" },
        { status: 400 },
      );
    }

    await updateEventRegistrationStatus(id, registrationStatus);

    return NextResponse.json({
      success: true,
      message: `Registration ${registrationStatus === "enabled" ? "enabled" : "disabled"} for event.`,
      registrationStatus,
    });
  } catch (error) {
    console.error("Error updating event registration status:", error);
    return NextResponse.json(
      { error: "Failed to update registration status" },
      { status: 500 },
    );
  }
}
