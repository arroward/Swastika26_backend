"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminNotifications() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [deliveryErrors, setDeliveryErrors] = useState<any[]>([]);
    const [isSending, setIsSending] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setStatus('Processing...');
        setDeliveryErrors([]);

        try {
            const res = await fetch('/api/notifications/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body, imageUrl }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStatus(`Success! Sent to ${data.successCount} devices (Failed: ${data.failureCount}).`);
                if (data.errors) setDeliveryErrors(data.errors);
                setTitle('');
                setBody('');
                setImageUrl('');
            } else {
                setStatus('Failed: ' + (data.error || data.message || 'Unknown error'));
            }
        } catch (err: any) {
            console.error(err);
            setStatus('Error calling API: ' + err.message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-32 flex justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg space-y-8"
            >
                <h1 className="text-4xl font-syne font-bold text-center">Broadcast Notification</h1>
                <p className="text-center text-white/50 text-sm">Sends to all users in 'fcm_tokens' Firestore collection.</p>

                <form onSubmit={handleSend} className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10">
                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                            placeholder="Event Alert!"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2">Body</label>
                        <textarea
                            required
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={4}
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                            placeholder="Something exciting is happening..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2">Image URL (Optional)</label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                            placeholder="https://..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSending}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all font-syne uppercase tracking-wider"
                    >
                        {isSending ? 'Sending...' : 'Broadcast Now'}
                    </button>

                    {status && (
                        <div className="space-y-4">
                            <p className={`text-center text-sm font-mono ${status.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
                                {status}
                            </p>

                            {deliveryErrors.length > 0 && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg max-h-40 overflow-y-auto">
                                    <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Delivery Error Details:</h4>
                                    <div className="space-y-2">
                                        {deliveryErrors.map((err, i) => (
                                            <div key={i} className="text-[10px] font-mono text-red-300/70 border-b border-red-500/10 pb-2 last:border-0">
                                                <span className="text-red-400">Token:</span> {err.token}<br />
                                                <span className="text-red-400">Error:</span> {err.error?.message || 'Unknown FCM Error'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </motion.div>
        </div>
    );
}
