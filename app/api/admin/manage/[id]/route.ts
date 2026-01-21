import { NextRequest, NextResponse } from "next/server";
import { updateAdmin, deleteAdmin } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

async function getAdminFromSession(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session");
  if (!sessionCookie) return null;

  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
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
    const { email, password, role, name } = body;

    // Prevent superadmin from changing their own role
    if (id === admin.id && role && role !== "superadmin") {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 },
      );
    }

    const updates: any = {};
    if (email) updates.email = email;
    if (password) updates.password = hashPassword(password);
    if (role) updates.role = role;
    if (name) updates.name = name;

    await updateAdmin(id, updates);

    return NextResponse.json({
      success: true,
      message: "Admin updated successfully",
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json(
      { error: "Failed to update admin" },
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

    // Prevent superadmin from deleting themselves
    if (id === admin.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    await deleteAdmin(id);

    return NextResponse.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { error: "Failed to delete admin" },
      { status: 500 },
    );
  }
}
