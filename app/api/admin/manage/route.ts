import { NextRequest, NextResponse } from "next/server";
import {
  getAllAdmins,
  createAdmin,
  updateAdminEventAssignments,
} from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

async function getAdminFromSession(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      console.log("No session cookie found");
      return null;
    }

    const admin = JSON.parse(sessionCookie.value);
    console.log("Admin from session:", admin.email, admin.role);
    return admin;
  } catch (error) {
    console.error("Error getting admin from session:", error);
    return null;
  }
}

const ALLOWED_ROLES = new Set([
  "superadmin",
  "event_coordinator",
  "finance_admin",
]);

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession(request);

    if (!admin) {
      console.log("GET /api/admin/manage: No admin session found");
      return NextResponse.json(
        { error: "Unauthorized. Please login again." },
        { status: 401 },
      );
    }

    if (admin.role !== "superadmin") {
      console.log("GET /api/admin/manage: User is not superadmin:", admin.role);
      return NextResponse.json(
        { error: "Unauthorized. Superadmin access required." },
        { status: 403 },
      );
    }

    const admins = await getAllAdmins();
    console.log("getAllAdmins returned:", admins.length, "admins");
    console.log("Admins data:", JSON.stringify(admins, null, 2));

    return NextResponse.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession(request);

    if (!admin) {
      console.log("POST /api/admin/manage: No admin session found");
      return NextResponse.json(
        { error: "Unauthorized. Please login again." },
        { status: 401 },
      );
    }

    if (admin.role !== "superadmin") {
      console.log(
        "POST /api/admin/manage: User is not superadmin:",
        admin.role,
      );
      return NextResponse.json(
        { error: "Unauthorized. Superadmin access required." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { email, password, role, name, eventIds } = body;

    // Validate required fields
    if (!email || !password || !role || !name) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Validate role
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Create new admin
    const newAdminId = crypto.randomUUID();
    await createAdmin({
      id: newAdminId,
      email,
      password: hashPassword(password),
      role,
      name,
    });

    // Assign events if event_coordinator
    if (
      role === "event_coordinator" &&
      eventIds &&
      Array.isArray(eventIds) &&
      eventIds.length > 0
    ) {
      await updateAdminEventAssignments(newAdminId, eventIds);
    }

    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
    });
  } catch (error: any) {
    console.error("Error creating admin:", error);

    // Handle duplicate email error
    if (error.message && error.message.includes("duplicate")) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 },
    );
  }
}
