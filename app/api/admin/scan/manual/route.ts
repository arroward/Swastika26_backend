import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { AdminManualScanRequest, ScanRecord } from '@/types/ticketing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body: AdminManualScanRequest = await req.json();
        const { ticketId, day, location, timestamp } = body;

        // 1. Validation
        if (!ticketId || !day || !location || !timestamp) {
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

        if (!ticketDoc.exists) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        const ticketData = ticketDoc.data();

        // 3. Check if ticket is valid
        if (ticketData?.status === 'CANCELLED') {
            return NextResponse.json(
                { error: 'Cannot scan a cancelled ticket' },
                { status: 400 }
            );
        }

        // 4. Check if already scanned for this day
        const existingScans = ticketData?.scans || [];
        const dayScans = existingScans.filter((s: ScanRecord) => s.day === day);

        if (dayScans.length > 0) {
            return NextResponse.json(
                { error: `Ticket already scanned for ${day}` },
                { status: 400 }
            );
        }

        // 5. Create manual scan record
        const scanRecord: ScanRecord = {
            day,
            timestamp: new Date(timestamp),
            scannedBy: 'MANUAL_ADMIN',
            location,
            deviceId: 'ADMIN_PANEL'
        };

        // 6. Add scan to ticket
        const updatedScans = [...existingScans, scanRecord];
        const newStatus = updatedScans.length >= (ticketData?.maxScans || 0) ? 'USED' : 'ACTIVE';

        await adminFirestore.collection('tickets').doc(ticketId).update({
            scans: updatedScans,
            status: newStatus,
            updatedAt: new Date()
        });

        // 7. Log admin action
        await adminFirestore.collection('admin_actions').add({
            action: 'MANUAL_SCAN',
            ticketId,
            purchaseId: ticketData?.purchaseId,
            day,
            location,
            timestamp: new Date(timestamp),
            performedBy: 'admin', // TODO: Add actual admin user ID
            performedAt: new Date()
        });

        // 8. Log scan
        await adminFirestore.collection('scan_logs').add({
            ticketId,
            purchaseId: ticketData?.purchaseId,
            day,
            scannedBy: 'MANUAL_ADMIN',
            location,
            deviceId: 'ADMIN_PANEL',
            timestamp: new Date(timestamp),
            result: 'SUCCESS',
            holderName: ticketData?.holderName,
            isManual: true
        });

        return NextResponse.json({
            success: true,
            message: 'Manual scan recorded successfully'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error recording manual scan:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
