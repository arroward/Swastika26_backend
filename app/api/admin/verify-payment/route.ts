import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

const FINANCE_ROLES = new Set(["superadmin", "finance_admin"]);

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let admin;
    try {
      admin = JSON.parse(sessionCookie.value);
    } catch (error) {
      console.error("Invalid admin session cookie", error);
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!FINANCE_ROLES.has(admin.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Ensure Firebase is initialized
    if (!adminFirestore) {
      return NextResponse.json(
        { error: "Firebase Service unavailable" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { registrationId, eventId, status, details } = body;

    if (!registrationId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Write to Firebase 'payment_verifications' collection
    // Ensure registrationId is a string for the document path
    const docId = String(registrationId);

    await adminFirestore
      .collection("payment_verifications")
      .doc(docId)
      .set(
        {
          registrationId: docId,
          eventId,
          status, // APPROVED or REJECTED
          verifiedBy: admin.email,
          verifiedAt: new Date(),
          details: details || {}, // Store snapshot of details
          updatedAt: new Date(),
        },
        { merge: true },
      );

    return NextResponse.json({
      success: true,
      message: "Verification recorded in Firebase",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
