import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const type = searchParams.get('type') || 'all'; // all, ticket, purchase, email, phone

        if (!query) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        if (!adminFirestore) {
            return NextResponse.json(
                { error: 'Database not initialized' },
                { status: 500 }
            );
        }

        const results: any = {
            tickets: [],
            purchases: []
        };

        const searchQuery = query.toLowerCase();

        // Search tickets
        if (type === 'all' || type === 'ticket') {
            const ticketsSnapshot = await adminFirestore.collection('tickets').get();

            results.tickets = ticketsSnapshot.docs
                .filter(doc => {
                    const data = doc.data();
                    return (
                        doc.id.toLowerCase().includes(searchQuery) ||
                        data.holderName?.toLowerCase().includes(searchQuery) ||
                        data.holderEmail?.toLowerCase().includes(searchQuery) ||
                        data.holderPhone?.includes(query) ||
                        data.purchaseId?.toLowerCase().includes(searchQuery)
                    );
                })
                .map(doc => ({
                    ticketId: doc.id,
                    ...doc.data()
                }));
        }

        // Search purchases
        if (type === 'all' || type === 'purchase' || type === 'email' || type === 'phone') {
            const purchasesSnapshot = await adminFirestore.collection('purchases').get();

            results.purchases = purchasesSnapshot.docs
                .filter(doc => {
                    const data = doc.data();
                    return (
                        doc.id.toLowerCase().includes(searchQuery) ||
                        data.name?.toLowerCase().includes(searchQuery) ||
                        data.email?.toLowerCase().includes(searchQuery) ||
                        data.phone?.includes(query) ||
                        data.paymentId?.toLowerCase().includes(searchQuery)
                    );
                })
                .map(doc => ({
                    purchaseId: doc.id,
                    ...doc.data()
                }));
        }

        return NextResponse.json(results, { status: 200 });

    } catch (error: any) {
        console.error('Error searching:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
