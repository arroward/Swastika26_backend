import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        if (!adminFirestore) {
            return NextResponse.json(
                { error: 'Database not initialized' },
                { status: 500 }
            );
        }

        // 1. Get all purchases
        const purchasesSnapshot = await adminFirestore.collection('purchases').get();
        const purchases = purchasesSnapshot.docs.map(doc => doc.data());

        // 2. Get all tickets
        const ticketsSnapshot = await adminFirestore.collection('tickets').get();
        const tickets = ticketsSnapshot.docs.map(doc => doc.data());

        // 3. Calculate stats
        const totalPurchases = purchases.length;
        const completedPurchases = purchases.filter(p => p.paymentStatus === 'COMPLETED').length;
        const pendingPurchases = purchases.filter(p => p.paymentStatus === 'PENDING').length;
        const failedPurchases = purchases.filter(p => p.paymentStatus === 'FAILED').length;

        const totalRevenue = purchases
            .filter(p => p.paymentStatus === 'COMPLETED')
            .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

        const totalTickets = tickets.length;
        const activeTickets = tickets.filter(t => t.status === 'ACTIVE').length;
        const usedTickets = tickets.filter(t => t.status === 'USED').length;
        const cancelledTickets = tickets.filter(t => t.status === 'CANCELLED').length;

        // Ticket type breakdown
        const day1Tickets = tickets.filter(t => t.type === 'DAY_1').length;
        const day2Tickets = tickets.filter(t => t.type === 'DAY_2').length;
        const bothDaysTickets = tickets.filter(t => t.type === 'BOTH_DAYS').length;

        // Revenue by ticket type
        const day1Revenue = purchases
            .filter(p => p.paymentStatus === 'COMPLETED')
            .reduce((sum, p) => {
                const purchaseTickets = tickets.filter(t =>
                    p.tickets?.includes(t.ticketId) && t.type === 'DAY_1'
                );
                return sum + (purchaseTickets.length * 50);
            }, 0);

        const day2Revenue = purchases
            .filter(p => p.paymentStatus === 'COMPLETED')
            .reduce((sum, p) => {
                const purchaseTickets = tickets.filter(t =>
                    p.tickets?.includes(t.ticketId) && t.type === 'DAY_2'
                );
                return sum + (purchaseTickets.length * 60);
            }, 0);

        const bothDaysRevenue = purchases
            .filter(p => p.paymentStatus === 'COMPLETED')
            .reduce((sum, p) => {
                const purchaseTickets = tickets.filter(t =>
                    p.tickets?.includes(t.ticketId) && t.type === 'BOTH_DAYS'
                );
                return sum + (purchaseTickets.length * 110);
            }, 0);

        // Scan stats
        const totalScans = tickets.reduce((sum, t) => sum + (t.scans?.length || 0), 0);
        const day1Scans = tickets.reduce((sum, t) => {
            const day1ScanCount = (t.scans || []).filter((s: any) => s.day === 'DAY_1').length;
            return sum + day1ScanCount;
        }, 0);
        const day2Scans = tickets.reduce((sum, t) => {
            const day2ScanCount = (t.scans || []).filter((s: any) => s.day === 'DAY_2').length;
            return sum + day2ScanCount;
        }, 0);

        // 4. Return stats
        const response = {
            purchases: {
                total: totalPurchases,
                completed: completedPurchases,
                pending: pendingPurchases,
                failed: failedPurchases
            },
            revenue: {
                total: totalRevenue,
                byType: {
                    day1: day1Revenue,
                    day2: day2Revenue,
                    bothDays: bothDaysRevenue
                }
            },
            tickets: {
                total: totalTickets,
                active: activeTickets,
                used: usedTickets,
                cancelled: cancelledTickets,
                byType: {
                    day1: day1Tickets,
                    day2: day2Tickets,
                    bothDays: bothDaysTickets
                }
            },
            scans: {
                total: totalScans,
                day1: day1Scans,
                day2: day2Scans
            }
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
