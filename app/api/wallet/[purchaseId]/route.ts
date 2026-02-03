import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ purchaseId: string }> },
) {
  try {
    const { purchaseId } = await params;

    if (!adminFirestore) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 },
      );
    }

    // 1. Fetch purchase details
    const purchaseDoc = await adminFirestore
      .collection("purchases")
      .doc(purchaseId)
      .get();

    if (!purchaseDoc.exists) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 },
      );
    }

    const purchaseData = purchaseDoc.data();

    // 2. Fetch associated tickets
    const ticketsSnapshot = await adminFirestore
      .collection("tickets")
      .where("purchaseId", "==", purchaseId)
      .get();

    const tickets = ticketsSnapshot.docs.map((doc) => doc.data());

    return NextResponse.json(
      {
        purchase: purchaseData,
        tickets: tickets,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
