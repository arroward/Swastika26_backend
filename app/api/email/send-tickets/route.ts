import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { sendTicketEmail } from '@/lib/email-service';
import { Purchase, Ticket } from '@/types/ticketing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { purchaseId } = body;

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

        const purchaseData = purchaseDoc.data();

        // 2. Check if payment is completed
        if (purchaseData?.paymentStatus !== 'COMPLETED') {
            return NextResponse.json(
                { error: 'Payment not completed' },
                { status: 400 }
            );
        }

        // 3. Get all tickets for this purchase
        const ticketIds = purchaseData?.tickets || [];
        const tickets: Ticket[] = [];

        for (const ticketId of ticketIds) {
            const ticketDoc = await adminFirestore.collection('tickets').doc(ticketId).get();
            if (ticketDoc.exists) {
                const ticketData = ticketDoc.data();
                tickets.push({
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
                });
            }
        }

        const purchase: Purchase = {
            purchaseId,
            email: purchaseData?.email || '',
            phone: purchaseData?.phone || '',
            name: purchaseData?.name || '',
            totalAmount: purchaseData?.totalAmount || 0,
            paymentStatus: purchaseData?.paymentStatus,
            paymentId: purchaseData?.paymentId || '',
            tickets: ticketIds,
            purchaseDate: purchaseData?.purchaseDate?.toDate() || new Date(),
            status: purchaseData?.status
        };

        // 4. Send email
        try {
            await sendTicketEmail({ purchase, tickets });

            // 5. Update email sent status
            await adminFirestore.collection('purchases').doc(purchaseId).update({
                emailSent: true,
                emailSentAt: new Date()
            });

            return NextResponse.json({
                success: true,
                message: 'Email sent successfully'
            }, { status: 200 });

        } catch (emailError: any) {
            console.error('Error sending email:', emailError);

            // Log email failure
            await adminFirestore.collection('purchases').doc(purchaseId).update({
                emailSent: false,
                emailError: emailError.message
            });

            return NextResponse.json(
                { error: 'Failed to send email: ' + emailError.message },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Error in send email endpoint:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
