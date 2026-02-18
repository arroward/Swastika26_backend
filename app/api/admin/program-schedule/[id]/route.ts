import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateScheduleItem, deleteScheduleItem } from "@/lib/db";

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

// PUT /api/admin/program-schedule/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { timeStart, timeEnd, program, participants } = body;

    if (!timeStart || !timeEnd || !program?.trim()) {
      return NextResponse.json(
        { error: "timeStart, timeEnd and program are required" },
        { status: 400 },
      );
    }

    const updated = await updateScheduleItem(id, {
      timeStart,
      timeEnd,
      program: program.trim(),
      participants: Array.isArray(participants) ? participants : [],
    });

    if (!updated) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/admin/program-schedule/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/program-schedule/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteScheduleItem(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/program-schedule/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
