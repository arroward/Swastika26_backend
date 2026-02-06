import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("admin_session");

        if (!sessionCookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Ensure Firebase is initialized
        if (!adminFirestore) {
            return NextResponse.json({ error: "Firebase Service unavailable" }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get("eventId");

        let query: FirebaseFirestore.Query = adminFirestore.collection("payment_verifications");

        if (eventId) {
            query = query.where("eventId", "==", eventId);
        }

        const snapshot = await query.get();
        const verifications: Record<string, any> = {};

        snapshot.docs.forEach(doc => {
            verifications[doc.id] = doc.data();
        });

        return NextResponse.json({ success: true, data: verifications });

    } catch (error) {
        console.error("Error fetching payment verifications:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
