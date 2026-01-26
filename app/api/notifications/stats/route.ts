import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';

export async function GET() {
    try {
        if (!adminFirestore) {
            return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
        }

        // 1. Fetch Subscriber Stats
        const tokensSnapshot = await adminFirestore.collection('fcm_tokens').get();
        const subscriberCount = tokensSnapshot.size;

        // Get most recent subscriber separately
        const lastTokenQuery = await adminFirestore.collection('fcm_tokens').orderBy('createdAt', 'desc').limit(1).get();
        const lastSubscriberDate = !lastTokenQuery.empty ? lastTokenQuery.docs[0].data().createdAt?.toDate()?.toISOString() : null;

        // 2. Fetch Notification History (Rich data)
        const historySnapshot = await adminFirestore.collection('notifications').orderBy('createdAt', 'desc').limit(20).get();
        const history = historySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()?.toISOString() || null,
            completedAt: doc.data().completedAt?.toDate()?.toISOString() || null,
            failureDetails: doc.data().failureDetails || [] // Return error details
        }));

        return NextResponse.json({
            subscriberCount,
            lastSubscriberDate,
            totalNotificationsSent: history.length, // Currently showing fetched count
            history
        });

    } catch (error) {
        console.error('Error fetching notification stats:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
