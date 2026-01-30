import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: { purchaseId: string } }
) {
    try {
        const { purchaseId } = params;

        if (!purchaseId) {
            return NextResponse.json(
                { error: 'Purchase ID is required' },
                { status: 400 }
            );
        }

        if (!adminFirestore) {
            return NextResponse.json(
                { error: 'Database not initialized' },
                { status: 500 }
            );
        }

        // 1. Get purchase from database
        const purchaseDoc = await adminFirestore.collection('purchases').doc(purchaseId).get();

        if (!purchaseDoc.exists) {
            return NextResponse.json(
                { error: 'Purchase not found' },
                { status: 404 }
            );
        }

        const purchase = purchaseDoc.data();

        // 2. Get all tickets for this purchase
        const ticketIds = purchase?.tickets || [];
        const tickets = [];

        for (const ticketId of ticketIds) {
            const ticketDoc = await adminFirestore.collection('tickets').doc(ticketId).get();
            if (ticketDoc.exists) {
                const ticketData = ticketDoc.data();
                tickets.push({
                    ticketId,
                    type: ticketData?.type,
                    status: ticketData?.status,
                    scans: ticketData?.scans || [],
                    holderName: ticketData?.holderName,
                    holderEmail: ticketData?.holderEmail,
                    holderPhone: ticketData?.holderPhone,
                    qrCode: ticketData?.qrCode,
                    allowedDays: ticketData?.allowedDays,
                    maxScans: ticketData?.maxScans
                });
            }
        }

        // 3. Return wallet data
        const response = {
            purchaseId,
            email: purchase?.email,
            phone: purchase?.phone,
            name: purchase?.name,
            totalAmount: purchase?.totalAmount,
            paymentStatus: purchase?.paymentStatus,
            purchaseDate: purchase?.purchaseDate,
            status: purchase?.status,
            tickets
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching wallet:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
