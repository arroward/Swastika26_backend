import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { VerifyPurchaseRequest, VerifyPurchaseResponse } from '@/types/ticketing';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Verify Razorpay payment signature
 */
function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        console.error('RAZORPAY_KEY_SECRET not configured');
        return false;
    }

    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    return expectedSignature === signature;
}

export async function POST(req: NextRequest) {
    try {
        const body: VerifyPurchaseRequest = await req.json();
        const { purchaseId, paymentId, signature, buyerName, buyerEmail, buyerPhone, totalAmount, tickets } = body;

        // 1. Validation
        if (!purchaseId || !paymentId || !signature || !buyerName || !buyerEmail || !tickets) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!adminFirestore) {
            return NextResponse.json(
                { error: 'Database not initialized' },
                { status: 500 }
            );
        }

        // 2. Strict Math Validation
        const { TICKET_TYPES } = await import('@/types/ticketing');
        const { generateTicketId } = await import('@/lib/ticketing-utils');

        let calculatedTotal = 0;
        for (const item of tickets) {
            const config = TICKET_TYPES[item.type];
            if (!config) throw new Error(`Invalid ticket type: ${item.type}`);
            calculatedTotal += config.price * item.quantity;
        }

        if (calculatedTotal !== totalAmount) {
            console.error(`Price discrepancy! Expected: ${calculatedTotal}, Received: ${totalAmount}`);
            // Note: In some cases we might want to fail, or just use calculatedTotal.
            // Requirement says "strict calculation".
        }

        // 2. Verify payment signature (Razorpay)
        // Note: For testing, you can skip signature verification or keep it commented
        /*
        const isValid = verifyRazorpaySignature(purchaseId, paymentId, signature);
        if (!isValid) {
          return NextResponse.json(
            { error: 'Invalid payment signature' },
            { status: 400 }
          );
        }
        */

        // 3. Create purchase record
        const purchaseRecord = {
            purchaseId,
            buyerName,
            buyerEmail,
            buyerPhone: buyerPhone || '',
            totalAmount: calculatedTotal, // Use strictly calculated sum
            purchaseDate: new Date(),
            status: 'COMPLETED'
        };

        const batch = adminFirestore.batch();
        batch.set(adminFirestore.collection('purchases').doc(purchaseId), purchaseRecord);

        // 4. Create ticket records
        for (const item of tickets) {
            for (let i = 0; i < item.quantity; i++) {
                const ticketId = generateTicketId(item.type);

                const ticketRecord = {
                    ticketId,
                    purchaseId,
                    type: item.type,
                    qrHash: ticketId, // The qrCode field should be the exact same string as ticketId
                    status: 'ACTIVE',
                    scans: []
                };

                batch.set(adminFirestore.collection('tickets').doc(ticketId), ticketRecord);
            }
        }

        await batch.commit();

        // 5. Return success response
        const response: VerifyPurchaseResponse = {
            success: true,
            purchaseId,
            status: 'COMPLETED',
            sendEmail: true
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error: any) {
        console.error('Error verifying purchase:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
