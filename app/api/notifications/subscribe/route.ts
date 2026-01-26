import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        if (!adminFirestore) {
            return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
        }

        // Save token to 'fcm_tokens' collection using Admin SDK (bypasses client rules)
        await adminFirestore.collection('fcm_tokens').doc(token).set({
            token,
            createdAt: new Date(),
            lastSeen: new Date()
        }, { merge: true });

        console.log('Successfully subscribed FCM token:', token);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}
