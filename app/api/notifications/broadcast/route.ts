import { NextResponse } from 'next/server';
import { adminMessaging, adminFirestore } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const { title, body, imageUrl } = await request.json();

        if (!title || !body) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
        }

        if (!adminMessaging || !adminFirestore) {
            return NextResponse.json({ error: 'Firebase Admin not initialized (check env vars)' }, { status: 500 });
        }

        // 1. Save Notification to Firestore 'notifications' collection
        const docRef = await adminFirestore.collection('notifications').add({
            title,
            body,
            imageUrl: imageUrl || null,
            createdAt: new Date(),
            status: 'sending'
        });

        // 2. Fetch all tokens from 'fcm_tokens' collection
        const snapshot = await adminFirestore.collection('fcm_tokens').get();

        if (snapshot.empty) {
            return NextResponse.json({ message: 'No subscribers found' });
        }

        const tokens = snapshot.docs.map(doc => doc.data().token).filter(Boolean);

        if (tokens.length === 0) {
            return NextResponse.json({ message: 'No valid tokens found' });
        }

        // 3. Send Multicast Message
        // Batching logic: sendEachForMulticast handles up to 500 tokens.

        const message = {
            notification: {
                title,
                body,
                imageUrl: imageUrl || undefined,
            },
            webpush: {
                notification: {
                    icon: '/logo/wh_sw.png',
                    image: imageUrl || undefined,
                }
            },
            data: {
                url: '/',
            },
            tokens,
        };

        // Note: If tokens > 500, we'd need to chunk the array.
        // For MVP, assuming < 500.
        const response = await adminMessaging.sendEachForMulticast(message);

        // Collect errors and clean up invalid tokens
        const errors: any[] = [];
        const failedTokens: string[] = [];

        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const error = resp.error;
                    errors.push({
                        token: tokens[idx].substring(0, 10) + '...',
                        error: error
                    });

                    // Identify invalid tokens for cleanup
                    if (error?.code === 'messaging/registration-token-not-registered' ||
                        error?.code === 'messaging/invalid-argument') {
                        failedTokens.push(tokens[idx]);
                    }
                }
            });
            console.log(`Failed to send to ${response.failureCount} tokens.`, errors);

            // Clean up invalid tokens from Firestore
            if (failedTokens.length > 0 && adminFirestore) {
                const db = adminFirestore;
                try {
                    const batch = db.batch();
                    failedTokens.forEach(t => batch.delete(db.collection('fcm_tokens').doc(t)));
                    await batch.commit();
                    console.log(`Cleaned up ${failedTokens.length} invalid/stale tokens.`);
                } catch (cleanupError) {
                    console.error("Failed to cleanup tokens:", cleanupError);
                }
            }
        }

        // Update Firestore document with results
        await docRef.update({
            successCount: response.successCount,
            failureCount: response.failureCount,
            status: response.failureCount > 0 ? 'completed_with_errors' : 'completed',
            completedAt: new Date(),
            failureDetails: errors // Save the detailed error logs
        });

        return NextResponse.json({
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error broadcasting notification:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
