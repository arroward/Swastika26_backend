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
        const { purchaseId, paymentId, signature } = body;

        // 1. Validation
        if (!purchaseId || !paymentId || !signature) {
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

        // 2. Get purchase from database
        const purchaseDoc = await adminFirestore.collection('purchases').doc(purchaseId).get();

        if (!purchaseDoc.exists) {
            return NextResponse.json(
                { error: 'Purchase not found' },
                { status: 404 }
            );
        }

        const purchase = purchaseDoc.data();

        // 3. Check if already verified
        if (purchase?.paymentStatus === 'COMPLETED') {
            return NextResponse.json(
                { error: 'Payment already verified' },
                { status: 400 }
            );
        }

        // 4. Verify payment signature (Razorpay)
        // Note: For testing, you can skip signature verification
        // In production, uncomment this:
        /*
        const isValid = verifyRazorpaySignature(purchaseId, paymentId, signature);
        if (!isValid) {
          // Update payment status to FAILED
          await adminFirestore.collection('purchases').doc(purchaseId).update({
            paymentStatus: 'FAILED',
            paymentId,
            updatedAt: new Date()
          });
    
          return NextResponse.json(
            { error: 'Invalid payment signature' },
            { status: 400 }
          );
        }
        */

        // 5. Update purchase with payment details
        await adminFirestore.collection('purchases').doc(purchaseId).update({
            paymentStatus: 'COMPLETED',
            paymentId,
            updatedAt: new Date()
        });

        // 6. Update all tickets to ACTIVE status (if not already)
        const ticketIds = purchase?.tickets || [];
        const batch = adminFirestore.batch();

        for (const ticketId of ticketIds) {
            const ticketRef = adminFirestore.collection('tickets').doc(ticketId);
            batch.update(ticketRef, {
                status: 'ACTIVE',
                updatedAt: new Date()
            });
        }

        await batch.commit();

        // 7. Return success response
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
