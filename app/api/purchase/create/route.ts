import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import {
    CreatePurchaseRequest,
    CreatePurchaseResponse,
    Ticket,
    Purchase
} from '@/types/ticketing';
import {
    generatePurchaseId,
    generateTicketId,
    generateQRCode,
    calculateTotalAmount,
    getAllowedDays,
    getMaxScans,
    isValidEmail,
    isValidPhone
} from '@/lib/ticketing-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body: CreatePurchaseRequest = await req.json();
        const { email, phone, name, tickets } = body;

        // 1. Validation
        if (!email || !phone || !name || !tickets || tickets.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        if (!isValidPhone(phone)) {
            return NextResponse.json(
                { error: 'Invalid phone number format' },
                { status: 400 }
            );
        }

        // 2. Calculate total amount
        const totalAmount = calculateTotalAmount(tickets);

        // 3. Generate Purchase ID
        const purchaseId = generatePurchaseId();

        // 4. Create tickets
        const ticketIds: string[] = [];
        const ticketData: { ticketId: string; type: string }[] = [];

        for (const ticketItem of tickets) {
            for (let i = 0; i < ticketItem.quantity; i++) {
                const ticketId = generateTicketId();
                const qrCode = generateQRCode(ticketId);

                const ticket: Ticket = {
                    ticketId,
                    purchaseId,
                    type: ticketItem.type,
                    holderName: name, // Default to buyer name
                    holderEmail: email,
                    holderPhone: phone,
                    qrCode,
                    scans: [],
                    allowedDays: getAllowedDays(ticketItem.type),
                    maxScans: getMaxScans(ticketItem.type),
                    status: "ACTIVE",
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                // Save ticket to Firestore
                if (adminFirestore) {
                    await adminFirestore.collection('tickets').doc(ticketId).set({
                        ...ticket,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }

                ticketIds.push(ticketId);
                ticketData.push({ ticketId, type: ticketItem.type });
            }
        }

        // 5. Create purchase record
        const purchase: Purchase = {
            purchaseId,
            email,
            phone,
            name,
            totalAmount,
            paymentStatus: "PENDING",
            paymentId: "", // Will be updated after payment
            tickets: ticketIds,
            purchaseDate: new Date(),
            status: "ACTIVE"
        };

        // Save purchase to Firestore
        if (adminFirestore) {
            await adminFirestore.collection('purchases').doc(purchaseId).set({
                ...purchase,
                purchaseDate: new Date()
            });
        }

        // 6. Generate wallet URL
        const walletUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://swastika.live'}/wallet/${purchaseId}`;

        // 7. Return response
        const response: CreatePurchaseResponse = {
            purchaseId,
            totalAmount,
            tickets: ticketData,
            walletUrl
        };

        return NextResponse.json(response, { status: 201 });

    } catch (error: any) {
        console.error('Error creating purchase:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
