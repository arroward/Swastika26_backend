import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";

const ALLOWED_ROLES = new Set([
  "superadmin",
  "finance_admin",
  "event_coordinator",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter required" },
        { status: 400 },
      );
    }

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

    if (!ALLOWED_ROLES.has(admin.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Search in event_registrations table
    // Matches: email, phone, id, full_name, upi_transaction_id
    const results = await sql`
      SELECT 
        r.id,
        r.event_id as "eventId",
        e.title as "eventTitle",
        r.full_name as "fullName",
        r.email,
        r.phone,
        r.college_name as "collegeName",
        r.university_name as "universityName",
        r.upi_transaction_id as "upiTransactionId",
        r.upload_file_url as "uploadFileUrl",
        r.registration_date as "registrationDate"
      FROM event_registrations r
      JOIN events e ON r.event_id = e.id
      WHERE 
        r.email ILIKE ${"%" + query + "%"} OR 
        r.phone ILIKE ${"%" + query + "%"} OR
        r.id::text = ${query} OR
        r.full_name ILIKE ${"%" + query + "%"} OR
        r.upi_transaction_id ILIKE ${"%" + query + "%"}
      LIMIT 1
    `;

    if (results.length === 0) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ success: true, data: results[0] });
  } catch (error) {
    console.error("Error searching registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
