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

        // Map docs to extract token AND document ID (for safe deletion)
        const tokenData = snapshot.docs.map(doc => ({
            id: doc.id,
            token: doc.data().token
        })).filter(item => item.token);

        if (tokenData.length === 0) {
            return NextResponse.json({ message: 'No valid tokens found' });
        }

        // 3. Send Multicast Message (Chunked)
        // Firebase sendEachForMulticast allows up to 500 tokens per batch.
        const BATCH_SIZE = 500;
        let successCount = 0;
        let failureCount = 0;
        const errors: any[] = [];
        const failedDocIds: string[] = [];

        // Loop through tokens in chunks
        for (let i = 0; i < tokenData.length; i += BATCH_SIZE) {
            const chunk = tokenData.slice(i, i + BATCH_SIZE);
            const chunkTokens = chunk.map(t => t.token);

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
                tokens: chunkTokens,
            };

            const response = await adminMessaging.sendEachForMulticast(message);

            successCount += response.successCount;
            failureCount += response.failureCount;

            if (response.failureCount > 0) {
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const error = resp.error;
                        errors.push({
                            token: chunkTokens[idx].substring(0, 10) + '...',
                            error: error
                        });

                        // Identify invalid tokens for cleanup
                        if (error?.code === 'messaging/registration-token-not-registered' ||
                            error?.code === 'messaging/invalid-argument') {
                            failedDocIds.push(chunk[idx].id); // Record the Document ID for deletion
                        }
                    }
                });
            }
        }

        console.log(`Broadcast result: ${successCount} success, ${failureCount} failed.`);

        // Clean up invalid tokens from Firestore
        if (failedDocIds.length > 0 && adminFirestore) {
            const db = adminFirestore;
            // Batch delete (limit 500 per batch)
            const DELETE_BATCH_SIZE = 500;
            try {
                for (let i = 0; i < failedDocIds.length; i += DELETE_BATCH_SIZE) {
                    const batchIds = failedDocIds.slice(i, i + DELETE_BATCH_SIZE);
                    const batch = db.batch();
                    batchIds.forEach(id => batch.delete(db.collection('fcm_tokens').doc(id)));
                    await batch.commit();
                }
                console.log(`Cleaned up ${failedDocIds.length} invalid/stale tokens.`);
            } catch (cleanupError) {
                console.error("Failed to cleanup tokens:", cleanupError);
            }
        }

        // Update Firestore document with results
        await docRef.update({
            successCount,
            failureCount,
            status: failureCount > 0 ? 'completed_with_errors' : 'completed',
            completedAt: new Date(),
            failureDetails: errors
        });

        return NextResponse.json({
            success: true,
            successCount,
            failureCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error broadcasting notification:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
