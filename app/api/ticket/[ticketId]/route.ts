import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: { ticketId: string } }
) {
    try {
        const { ticketId } = params;

        if (!ticketId) {
            return NextResponse.json(
                { error: 'Ticket ID is required' },
                { status: 400 }
            );
        }

        if (!adminFirestore) {
            return NextResponse.json(
                { error: 'Database not initialized' },
                { status: 500 }
            );
        }

        // 1. Get ticket from database
        const ticketDoc = await adminFirestore.collection('tickets').doc(ticketId).get();

        if (!ticketDoc.exists) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        const ticket = ticketDoc.data();

        // 2. Return ticket data
        const response = {
            ticketId,
            purchaseId: ticket?.purchaseId,
            type: ticket?.type,
            status: ticket?.status,
            qrCode: ticket?.qrCode,
            scans: ticket?.scans || [],
            allowedDays: ticket?.allowedDays,
            maxScans: ticket?.maxScans,
            holderName: ticket?.holderName,
            holderEmail: ticket?.holderEmail,
            holderPhone: ticket?.holderPhone,
            createdAt: ticket?.createdAt,
            updatedAt: ticket?.updatedAt
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching ticket:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
