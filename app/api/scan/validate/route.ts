import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { ValidateScanRequest, ValidateScanResponse, Ticket, ScanRecord } from '@/types/ticketing';
import { validateTicketScan } from '@/lib/scan-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body: ValidateScanRequest = await req.json();
        const { ticketId, currentDay, scannedBy, location, deviceId } = body;

        // 1. Validation
        if (!ticketId || !currentDay || !scannedBy || !location || !deviceId) {
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

        // 2. Get ticket from database
        const ticketDoc = await adminFirestore.collection('tickets').doc(ticketId).get();

        let ticket: Ticket | null = null;
        if (ticketDoc.exists) {
            const data = ticketDoc.data();
            ticket = {
                ticketId,
                purchaseId: data?.purchaseId || '',
                type: data?.type,
                holderName: data?.holderName,
                holderEmail: data?.holderEmail,
                holderPhone: data?.holderPhone,
                qrCode: data?.qrCode || '',
                scans: data?.scans || [],
                allowedDays: data?.allowedDays || [],
                maxScans: data?.maxScans || 0,
                status: data?.status,
                createdAt: data?.createdAt?.toDate() || new Date(),
                updatedAt: data?.updatedAt?.toDate() || new Date()
            };
        }

        // 3. Validate scan
        const validationResult = validateTicketScan(ticket, currentDay);

        // 4. If valid, record the scan
        if (validationResult.valid && ticket) {
            const scanRecord: ScanRecord = {
                day: currentDay,
                timestamp: new Date(),
                scannedBy,
                location,
                deviceId
            };

            // Add scan to ticket
            const updatedScans = [...ticket.scans, scanRecord];

            // Update ticket status if fully used
            const newStatus = updatedScans.length >= ticket.maxScans ? 'USED' : 'ACTIVE';

            // Update in database
            await adminFirestore.collection('tickets').doc(ticketId).update({
                scans: updatedScans,
                status: newStatus,
                updatedAt: new Date()
            });

            // Log scan attempt
            await adminFirestore.collection('scan_logs').add({
                ticketId,
                purchaseId: ticket.purchaseId,
                day: currentDay,
                scannedBy,
                location,
                deviceId,
                timestamp: new Date(),
                result: 'SUCCESS',
                holderName: ticket.holderName
            });
        } else {
            // Log failed scan attempt
            await adminFirestore.collection('scan_logs').add({
                ticketId,
                day: currentDay,
                scannedBy,
                location,
                deviceId,
                timestamp: new Date(),
                result: 'FAILED',
                reason: validationResult.reason,
                message: validationResult.message
            });
        }

        // 5. Return validation result
        return NextResponse.json(validationResult, { status: validationResult.valid ? 200 : 400 });

    } catch (error: any) {
        console.error('Error validating scan:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
