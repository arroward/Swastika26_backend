"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NotificationHistory {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    status?: string;
    successCount?: number;
    failureCount?: number;
    imageUrl?: string;
    failureDetails?: any[];
}

export default function AdminNotifications() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [deliveryErrors, setDeliveryErrors] = useState<any[]>([]);
    const [isSending, setIsSending] = useState(false);

    // Modal State
    const [selectedNotification, setSelectedNotification] = useState<NotificationHistory | null>(null);

    // Calculate days left for Swastika (Feb 20, 2026)
    const targetDate = new Date('2026-02-20T00:00:00');
    const today = new Date();
    const timeDiff = targetDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const templates = [
        {
            name: "Daily Countdown 📅",
            title: `⏳ Only ${daysLeft} Days to go!`,
            body: `The countdown is on! ${daysLeft} days left until Swastika'26. Gear up for the ultimate techno-cultural fest! 🔥`
        },
        {
            name: "About Swastika 🚀",
            title: "Experience Swastika'26! 🔥",
            body: "The National Level Techno-Cultural Fest of MBCET. A high-octane celebration of technology, creativity, and culture! 🌟"
        },
        {
            name: "About MBCET 🏫",
            title: "Welcome to MBCET 🌿",
            body: "Mar Baselios Christian College of Engineering & Technology, Peermade. Quality engineering education in a serene hill-station campus. 🎓"
        },
        {
            name: "Registration 🎟️",
            title: "Registrations are Live! 📝",
            body: "Slots are filling up fast! Register now to showcase your skills at the National Level Techno-Cultural Fest. 🏆"
        }
    ];

    const applyTemplate = (t: typeof templates[0]) => {
        setTitle(t.title);
        setBody(t.body);
    };

    // Stats State
    const [stats, setStats] = useState<{
        subscriberCount: number;
        lastSubscriberDate?: string;
        history: NotificationHistory[]
    }>({
        subscriberCount: 0,
        history: []
    });

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/notifications/stats');
            const data = await res.json();
            if (data.subscriberCount !== undefined) {
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

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
                // Refresh stats to show new notification in history
                fetchStats();
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
        <div className="min-h-screen bg-black text-white p-8 pt-32 flex flex-col items-center gap-12 relative">

            <header className="text-center space-y-4">
                <h1 className="text-5xl font-syne font-bold text-white">Broadcast Center</h1>
                <p className="text-white/50 text-base max-w-xl mx-auto">
                    Manage push notifications for the Swastika26 mobile app.
                </p>
            </header>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Left Column: Send Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full"
                >
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-syne font-semibold flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                Compose Message
                            </h2>
                        </div>

                        {/* Templates */}
                        <div className="mb-8">
                            <label className="block text-xs font-mono text-white/30 uppercase tracking-widest mb-3">Quick Templates</label>
                            <div className="flex flex-wrap gap-2">
                                {templates.map((t, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => applyTemplate(t)}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-full text-xs font-mono text-white/70 hover:text-white transition-all"
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSend} className="space-y-6">
                            <div>
                                <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:border-red-500 focus:outline-none transition-all"
                                    placeholder="e.g. New Event Announced!"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">Body</label>
                                <textarea
                                    required
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={4}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:border-red-500 focus:outline-none transition-all resize-none"
                                    placeholder="Detailed message content..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">Image URL (Optional)</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:border-red-500 focus:outline-none transition-all"
                                    placeholder="https://"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all font-syne uppercase tracking-widest shadow-lg shadow-red-900/20"
                            >
                                {isSending ? 'Broadcasting...' : 'Send Broadcast'}
                            </button>

                            {status && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 pt-4 border-t border-white/5"
                                >
                                    <p className={`text-center text-sm font-mono ${status.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
                                        {status}
                                    </p>

                                    {deliveryErrors.length > 0 && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
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
                                </motion.div>
                            )}
                        </form>
                    </div>
                </motion.div>

                {/* Right Column: Stats & History */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-8"
                >
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                            <h2 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Total Subscribers</h2>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-syne font-bold text-white">{stats.subscriberCount}</span>
                                <span className="text-xs font-mono text-green-400 mb-2">devices</span>
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                            <h2 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Last New User</h2>
                            <div className="flex flex-col justify-end h-full pb-1">
                                <span className="text-lg font-syne font-bold text-white">
                                    {stats.lastSubscriberDate ? new Date(stats.lastSubscriberDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                                </span>
                                <span className="text-[10px] font-mono text-white/40">
                                    {stats.lastSubscriberDate ? new Date(stats.lastSubscriberDate).toLocaleTimeString() : '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm min-h-[500px]">
                        <h2 className="text-xl font-syne font-semibold mb-6 flex justify-between items-center">
                            Recent Broadcasts
                            <span className="text-xs font-mono text-white/30 bg-white/5 px-2 py-1 rounded">Last 20</span>
                        </h2>

                        <div className="space-y-4">
                            {stats.history.length === 0 ? (
                                <p className="text-white/30 text-sm font-mono italic">No recent broadcasts found.</p>
                            ) : (
                                stats.history.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedNotification(item)}
                                        className="group p-4 bg-black/20 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">{item.title}</h3>
                                            <span className="text-[10px] font-mono text-white/30 whitespace-nowrap ml-2">
                                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/60 line-clamp-2 mb-3">{item.body}</p>

                                        <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                                            {/* Delivery Stats Pills */}
                                            {(item.successCount !== undefined) ? (
                                                <>
                                                    <span className="flex items-center gap-1 text-[10px] font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                                                        Sent: {item.successCount}
                                                    </span>
                                                    {item.failureCount! > 0 ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                                                            Failed: {item.failureCount}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] font-mono text-green-400/50">
                                                            100% Success
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-[10px] font-mono text-white/20 italic">Legacy Data</span>
                                            )}

                                            <span className="ml-auto text-[10px] font-mono text-white/40 group-hover:text-white transition-colors">
                                                View Details →
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Detailed Modal */}
            {selectedNotification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedNotification(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#111] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-start sticky top-0 bg-[#111] z-10">
                            <div>
                                <h2 className="text-2xl font-syne font-bold text-white mb-2">{selectedNotification.title}</h2>
                                <span className="text-xs font-mono text-white/40">ID: {selectedNotification.id}</span>
                            </div>
                            <button onClick={() => setSelectedNotification(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                ✕
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-8">

                            {/* Message Body */}
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-white/30 uppercase tracking-widest">Message Content</label>
                                <p className="text-white/80 leading-relaxed text-lg">{selectedNotification.body}</p>
                                {selectedNotification.imageUrl && (
                                    <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                                        <img src={selectedNotification.imageUrl} alt="Notification attachment" className="w-full h-auto object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-500/10 p-6 rounded-2xl border border-green-500/20 text-center">
                                    <span className="block text-4xl font-bold text-green-400 mb-1">{selectedNotification.successCount ?? '-'}</span>
                                    <span className="text-xs font-mono text-green-400/70 uppercase">Delivered</span>
                                </div>
                                <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 text-center">
                                    <span className="block text-4xl font-bold text-red-400 mb-1">{selectedNotification.failureCount ?? '-'}</span>
                                    <span className="text-xs font-mono text-red-400/70 uppercase">Failed</span>
                                </div>
                            </div>

                            {/* Failure Logs */}
                            {selectedNotification.failureDetails && selectedNotification.failureDetails.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                        Failure Log
                                    </h3>
                                    <div className="bg-black/40 rounded-xl border border-red-500/10 overflow-hidden">
                                        {selectedNotification.failureDetails.map((log, idx) => (
                                            <div key={idx} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-mono text-white/50">Token</span>
                                                    <span className="text-[10px] font-mono text-white/20">{log.token}</span>
                                                </div>
                                                <p className="text-xs text-red-300 font-mono">{log.error?.message || 'Unknown Error'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="pt-8 border-t border-white/5 flex gap-8 text-xs font-mono text-white/30">
                                <div>
                                    <span className="block mb-1">Created At</span>
                                    {new Date(selectedNotification.createdAt).toLocaleString()}
                                </div>
                                <div>
                                    <span className="block mb-1">Status</span>
                                    <span className="capitalize">{selectedNotification.status?.replace('_', ' ')}</span>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
