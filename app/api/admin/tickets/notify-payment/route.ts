import { NextRequest, NextResponse } from "next/server";
import * as admin from 'firebase-admin';
import { adminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/email-service";
import { generatePaymentReceivedEmailHTML } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
    try {
        // Auth check removed to match verify-and-send implementation pattern
        // The middleware or higher-level layout is expected to handle protection

        if (!adminDb) {
            return NextResponse.json({ error: "Firebase DB not initialized" }, { status: 500 });
        }

        const { ticketId } = await req.json();

        if (!ticketId) {
            return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
        }

        const ticketRef = adminDb.collection("proshow_passes").doc(ticketId);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        const ticketData = ticketDoc.data();

        if (!ticketData?.email) {
            return NextResponse.json({ error: "No email associated with this ticket" }, { status: 400 });
        }

        // Send payment acknowledgement email
        const emailHtml = generatePaymentReceivedEmailHTML({
            fullName: ticketData.name,
            email: ticketData.email,
            eventTitle: "Proshow Pass",
            amount: ticketData.totalAmount || 0,
            transactionId: ticketData.transactionId || "N/A",
            date: new Date().toISOString()
        });

        await sendEmail({
            to: ticketData.email,
            subject: `Payment Received - Proshow Pass`,
            html: emailHtml
        });

        // Update payment ack count
        await ticketRef.update({
            paymentAckCount: admin.firestore.FieldValue.increment(1)
        });

        return NextResponse.json({ success: true, message: "Payment acknowledgement email sent" });

        return NextResponse.json({ success: true, message: "Payment acknowledgement email sent" });

    } catch (error: any) {
        console.error("Error sending payment notification:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
