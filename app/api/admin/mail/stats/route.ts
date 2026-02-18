
import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { recipientType, eventId } = await request.json();

        if (!recipientType) {
            return NextResponse.json(
                { error: "Recipient type is required" },
                { status: 400 },
            );
        }

        let count = 0;

        if (recipientType === "all") {
            // All registrations across all events
            try {
                const result = await sql`SELECT COUNT(DISTINCT email) as count FROM event_registrations`;
                count = Number(result[0].count);
            } catch (err) {
                console.error("Error fetching registration count:", err);
                return NextResponse.json(
                    { error: "Failed to fetch registration count" },
                    { status: 500 },
                );
            }
        } else if (recipientType === "event" && eventId) {
            // Specific event registrations
            try {
                const result = await sql`
          SELECT COUNT(DISTINCT email) as count 
          FROM event_registrations 
          WHERE event_id = ${eventId}
        `;
                count = Number(result[0].count);
            } catch (err) {
                console.error("Error fetching event registration count:", err);
                return NextResponse.json(
                    { error: "Failed to fetch event registration count" },
                    { status: 500 },
                );
            }
        } else if (recipientType === "admins") {
            try {
                const result = await sql`SELECT COUNT(*) FROM admins`;
                count = Number(result[0].count);
            } catch (err) {
                console.error("Error fetching admin count:", err);
                return NextResponse.json(
                    { error: "Failed to fetch admin count" },
                    { status: 500 },
                );
            }
        } else if (recipientType === "event_admins_stats") {
            try {
                const result = await sql`SELECT COUNT(DISTINCT admin_id) as count FROM admin_events`;
                count = Number(result[0].count);
            } catch (err) {
                console.error("Error fetching event admin count:", err);
                return NextResponse.json(
                    { error: "Failed to fetch event admin count" },
                    { status: 500 },
                );
            }
        } else if (recipientType === "test" || recipientType === "specific") {
            count = 1;
        }

        return NextResponse.json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Error fetching mail stats:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Unknown error",
                count: 0,
            },
            { status: 500 },
        );
    }
}
