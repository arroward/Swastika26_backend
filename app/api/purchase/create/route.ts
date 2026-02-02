import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
import { SITE_CONFIG } from "@/lib/site-config";
import {
  CreatePurchaseRequest,
  CreatePurchaseResponse,
  Ticket,
  Purchase,
  TicketType,
} from "@/types/ticketing";
import {
  generatePurchaseId,
  generateTicketId,
  calculateTotalAmount,
  getAllowedDays,
  getMaxScans,
  isValidEmail,
  isValidPhone,
} from "@/lib/ticketing-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: CreatePurchaseRequest = await req.json();
    const { email, phone, name, tickets } = body;

    // 1. Validation
    if (!email || !phone || !name || !tickets || tickets.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 2. Calculate total amount
    const totalAmount = calculateTotalAmount(tickets);

    // 3. Generate Purchase ID
    const purchaseId = generatePurchaseId();

    // 4. Create purchase record (PENDING)
    const purchase: Purchase = {
      purchaseId,
      email,
      phone,
      name,
      buyerEmail: email,
      buyerPhone: phone,
      buyerName: name,
      totalAmount,
      purchaseDate: new Date(),
      status: "PENDING",
    };

    // Save purchase to Firestore
    if (adminFirestore) {
      await adminFirestore
        .collection("purchases")
        .doc(purchaseId)
        .set(purchase);
    }

    // 5. Generate wallet URL
    const walletUrl = SITE_CONFIG.links.wallet(purchaseId);

    // 6. Return response
    const response: CreatePurchaseResponse = {
      purchaseId,
      totalAmount,
      tickets: [], // Tickets will be created during verification
      walletUrl,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
