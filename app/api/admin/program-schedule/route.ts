import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getScheduleItems, createScheduleItem } from "@/lib/db";
import crypto from "crypto";

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

// GET /api/admin/program-schedule?day=1
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const day = parseInt(searchParams.get("day") ?? "1", 10);

    const items = await getScheduleItems(day);
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("GET /api/admin/program-schedule error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/admin/program-schedule
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { day, timeStart, timeEnd, program, participants, sortOrder } = body;

    if (!timeStart || !timeEnd || !program?.trim()) {
      return NextResponse.json(
        { error: "timeStart, timeEnd and program are required" },
        { status: 400 },
      );
    }

    const item = await createScheduleItem({
      id: crypto.randomUUID(),
      day: typeof day === "number" ? day : 1,
      timeStart,
      timeEnd,
      program: program.trim(),
      participants: Array.isArray(participants) ? participants : [],
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/program-schedule error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/program-schedule
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminFromSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await request.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 });
    }

    const { updateScheduleSortOrder } = await import("@/lib/db");
    await updateScheduleSortOrder(items);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin/program-schedule error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

