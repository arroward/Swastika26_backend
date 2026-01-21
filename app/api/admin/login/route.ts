import { NextRequest, NextResponse } from "next/server";
import { getAdminByEmail } from "@/lib/db";
import crypto from "crypto";

// Simple password hash function (in production, use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const admin = await getAdminByEmail(email);

    if (!admin || !verifyPassword(password, admin.password)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // In production, use JWT tokens
    const sessionData = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    const response = NextResponse.json({
      success: true,
      admin: sessionData,
    });

    // Set secure cookie with admin session
    response.cookies.set("admin_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
