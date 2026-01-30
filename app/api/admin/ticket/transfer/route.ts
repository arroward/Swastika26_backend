import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { AdminTransferTicketRequest } from '@/types/ticketing';
import { canTransferTicket } from '@/lib/scan-validation';
import { isValidEmail } from '@/lib/ticketing-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body: AdminTransferTicketRequest = await req.json();
        const { ticketId, newHolderName, newHolderEmail, newHolderPhone } = body;

        // 1. Validation
        if (!ticketId || !newHolderName || !newHolderEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!isValidEmail(newHolderEmail)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        if (!adminFirestore) {
            return NextResponse.json(
                { error: 'Database not initialized' },
                { status: 500 }
            );
        }

        // 2. Get ticket from database
        const ticketDoc = await adminFirestore.collection('tickets').doc(ticketId).get();

        if (!ticketDoc.exists) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        const ticketData = ticketDoc.data();
        const ticket = {
            ticketId,
            purchaseId: ticketData?.purchaseId || '',
            type: ticketData?.type,
            holderName: ticketData?.holderName,
            holderEmail: ticketData?.holderEmail,
            holderPhone: ticketData?.holderPhone,
            qrCode: ticketData?.qrCode || '',
            scans: ticketData?.scans || [],
            allowedDays: ticketData?.allowedDays || [],
            maxScans: ticketData?.maxScans || 0,
            status: ticketData?.status,
            createdAt: ticketData?.createdAt?.toDate() || new Date(),
            updatedAt: ticketData?.updatedAt?.toDate() || new Date()
        };

        // 3. Check if ticket can be transferred
        const canTransfer = canTransferTicket(ticket);
        if (!canTransfer.allowed) {
            return NextResponse.json(
                { error: canTransfer.reason },
                { status: 400 }
            );
        }

        // 4. Store previous holder info
        const previousHolder = {
            name: ticket.holderName,
            email: ticket.holderEmail,
            phone: ticket.holderPhone
        };

        // 5. Transfer ticket
        await adminFirestore.collection('tickets').doc(ticketId).update({
            holderName: newHolderName,
            holderEmail: newHolderEmail,
            holderPhone: newHolderPhone || null,
            previousHolder,
            transferredAt: new Date(),
            updatedAt: new Date()
        });

        // 6. Log admin action
        await adminFirestore.collection('admin_actions').add({
            action: 'TRANSFER_TICKET',
            ticketId,
            purchaseId: ticket.purchaseId,
            previousHolder,
            newHolder: {
                name: newHolderName,
                email: newHolderEmail,
                phone: newHolderPhone
            },
            timestamp: new Date(),
            performedBy: 'admin' // TODO: Add actual admin user ID
        });

        return NextResponse.json({
            success: true,
            message: 'Ticket transferred successfully'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error transferring ticket:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
