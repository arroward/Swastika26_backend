
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    // Check if we have credentials in env vars
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });

            if (process.env.FIREBASE_CLIENT_EMAIL?.includes('xxxxx')) {
                console.warn('WARNING: FIREBASE_CLIENT_EMAIL appears to be a placeholder. Notifications will fail.');
            }
        } catch (error: any) {
            console.error('Firebase Admin initialization failed:', error.message);
        }
    } else {
        console.warn("Missing Firebase Admin credentials in environment variables.");
    }
}

const adminMessaging = admin.apps.length ? admin.messaging() : null;
const adminFirestore = admin.apps.length ? admin.firestore() : null;

export { adminMessaging, adminFirestore };
