import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { ValidateScanRequest, ValidateScanResponse, Ticket, ScanRecord } from '@/types/ticketing';
import { validateTicketScan } from '@/lib/scan-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body: ValidateScanRequest = await req.json();
        let { ticketId, currentDay, scannedBy, location, deviceId } = body;

        // Strip prefix if scanned from QR code directly
        if (ticketId && ticketId.startsWith('swastika://ticket/')) {
            ticketId = ticketId.replace('swastika://ticket/', '');
        }

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

        const result = await adminFirestore!.runTransaction(async (transaction) => {
            const ticketRef = adminFirestore!.collection('tickets').doc(ticketId);
            const ticketDoc = await transaction.get(ticketRef);

            if (!ticketDoc.exists) {
                return {
                    success: false,
                    status: 404,
                    data: { valid: false, reason: "TICKET_NOT_FOUND", message: "Invalid Swastika Ticket QR Code" }
                };
            }

            const ticketData = ticketDoc.data() as Ticket;

            // 2. Check if already USED
            if (ticketData.status === 'USED') {
                return {
                    success: false,
                    status: 400,
                    data: { valid: false, reason: "ALREADY_SCANNED", message: "Invalid Swastika Ticket QR Code" }
                };
            }

            // 3. Validate scan
            const validationResult = validateTicketScan(ticketData, currentDay);

            if (!validationResult.valid) {
                return {
                    success: false,
                    status: 400,
                    data: validationResult
                };
            }

            // 3. Record the scan and update status
            const scanRecord: ScanRecord = {
                day: currentDay,
                timestamp: new Date(),
                gate: location // Mapping location to gate as per new schema
            };

            const updatedScans = [...(ticketData.scans || []), scanRecord];

            // Determine if ticket should be marked as USED
            // Based on TICKET_TYPES config
            const { TICKET_TYPES } = await import('@/types/ticketing');
            const config = TICKET_TYPES[ticketData.type];
            const isFullyUsed = updatedScans.length >= config.maxScans;

            transaction.update(ticketRef, {
                scans: updatedScans,
                status: isFullyUsed ? 'USED' : 'ACTIVE',
                updatedAt: new Date()
            } as any);

            // 4. Log the success scan
            const logRef = adminFirestore!.collection('scan_logs').doc();
            transaction.set(logRef, {
                ticketId,
                purchaseId: ticketData.purchaseId,
                day: currentDay,
                scannedBy,
                gate: location,
                deviceId,
                timestamp: new Date(),
                result: 'SUCCESS'
            });

            return {
                success: true,
                status: 200,
                data: validationResult
            };
        });

        if (!result.success) {
            // Log failed scan attempt if needed
            await adminFirestore!.collection('scan_logs').add({
                ticketId,
                day: currentDay,
                scannedBy,
                gate: location,
                deviceId,
                timestamp: new Date(),
                result: 'FAILED',
                reason: (result.data as any).reason,
                message: (result.data as any).message
            });
        }

        return NextResponse.json(result.data, { status: result.status });

    } catch (error: any) {
        console.error('Error validating scan:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
