import { NextRequest, NextResponse } from "next/server";
import { deleteEvent, updateEvent } from "@/lib/db";
import { cookies } from "next/headers";

async function getAdminFromSession(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return null;
    }

    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

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

    const normalizedIsOnline =
      isOnline === true || isOnline === "true" || isOnline === 1;

    await updateEvent(id, {
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
    await deleteEvent(id);

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
