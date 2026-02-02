import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
import { AdminCancelTicketRequest } from "@/types/ticketing";
import { canCancelTicket } from "@/lib/scan-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: AdminCancelTicketRequest = await req.json();
    const { ticketId, reason } = body;

    // 1. Validation
    if (!ticketId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!adminFirestore) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 },
      );
    }

    // 2. Get ticket from database
    const ticketDoc = await adminFirestore
      .collection("tickets")
      .doc(ticketId)
      .get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticketData = ticketDoc.data();
    const ticket = {
      ticketId,
      purchaseId: ticketData?.purchaseId || "",
      type: ticketData?.type,
      qrHash: ticketData?.qrHash || ticketData?.qrCode || "",
      holderName: ticketData?.holderName,
      holderEmail: ticketData?.holderEmail,
      holderPhone: ticketData?.holderPhone,
      qrCode: ticketData?.qrCode || "",
      scans: ticketData?.scans || [],
      allowedDays: ticketData?.allowedDays || [],
      maxScans: ticketData?.maxScans || 0,
      status: ticketData?.status,
      createdAt: ticketData?.createdAt?.toDate() || new Date(),
      updatedAt: ticketData?.updatedAt?.toDate() || new Date(),
    };

    // 3. Check if ticket can be cancelled
    const canCancel = canCancelTicket(ticket);
    if (!canCancel.allowed) {
      return NextResponse.json({ error: canCancel.reason }, { status: 400 });
    }

    // 4. Cancel ticket
    await adminFirestore.collection("tickets").doc(ticketId).update({
      status: "CANCELLED",
      cancellationReason: reason,
      cancelledAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. Log admin action
    await adminFirestore.collection("admin_actions").add({
      action: "CANCEL_TICKET",
      ticketId,
      purchaseId: ticket.purchaseId,
      reason,
      timestamp: new Date(),
      performedBy: "admin", // TODO: Add actual admin user ID
    });

    return NextResponse.json(
      {
        success: true,
        message: "Ticket cancelled successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error cancelling ticket:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
