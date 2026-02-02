'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Ticket, CheckCircle2, QrCode, ArrowLeft, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { SITE_CONFIG } from '@/lib/site-config';

interface TicketData {
    ticketId: string;
    purchaseId: string;
    type: string;
    qrHash: string;
    status: 'ACTIVE' | 'USED';
    scans: any[];
}

interface PurchaseData {
    purchaseId: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    totalAmount: number;
    purchaseDate: any;
    status: string;
}

export default function WalletPage() {
    const params = useParams();
    const purchaseId = params?.purchaseId as string;
    const router = useRouter();

    const [purchase, setPurchase] = useState<PurchaseData | null>(null);
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!purchaseId) return;

        const fetchWalletData = async () => {
            try {
                const response = await fetch(`/api/wallet/${purchaseId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load wallet');
                }

                setPurchase(data.purchase);
                setTickets(data.tickets);
            } catch (err: any) {
                console.error("Error fetching wallet:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, [purchaseId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400 font-mono text-xs tracking-widest uppercase">Initializing Digital Wallet...</p>
            </div>
        );
    }

    if (error || !purchase) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-md text-center">
                    <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-gray-400 text-sm mb-6">{error || 'Invalid or expired wallet link.'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition"
                    >
                        RETURN HOME
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-green-500 tracking-[0.2em] uppercase">Secure Wallet • Active Session</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white italic">
                            SWASTIKA<span className="text-red-600">.</span>WALLET
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm max-w-md uppercase tracking-wider font-medium opacity-60">
                            Digital Pass Management for {purchase.buyerName}
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Paid</div>
                        <div className="text-3xl font-black text-white">₹{purchase.totalAmount}</div>
                        <div className="text-[10px] font-mono text-gray-600 mt-1 uppercase">{purchase.purchaseId}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Buyer Details */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
                            <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Order Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="truncate">
                                        <div className="text-[10px] text-gray-500 uppercase">Email</div>
                                        <div className="text-sm font-semibold text-gray-200 truncate">{purchase.buyerEmail}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase">Phone</div>
                                        <div className="text-sm font-semibold text-gray-200">{purchase.buyerPhone}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-red-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase">Issued On</div>
                                        <div className="text-sm font-semibold text-gray-200">
                                            {purchase.purchaseDate?.toDate
                                                ? purchase.purchaseDate.toDate().toLocaleDateString()
                                                : new Date(purchase.purchaseDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-2xl">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-yellow-500 uppercase">Security Note</h4>
                                    <p className="text-xs text-yellow-500/60 mt-1 leading-relaxed">
                                        Each QR is unique. Avoid sharing screenshots. Present the original code for entry.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tickets List */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Your Passes ({tickets.length})</h3>
                        </div>

                        <div className="grid gap-3">
                            {tickets.map((ticket, index) => (
                                <motion.div
                                    key={ticket.ticketId}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => router.push(`/ticket/view/${ticket.ticketId}?back=${purchase.purchaseId}`)}
                                    className={`group relative bg-[#0a0a0a] border ${ticket.status === 'USED' ? 'border-white/5 opacity-50' : 'border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5'} p-4 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden`}
                                >
                                    {/* Real-time Tear Effect Indicator */}
                                    {ticket.status === 'USED' && (
                                        <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                            <div className="rotate-[-12deg] border-4 border-red-600 px-4 py-1 rounded-xl">
                                                <span className="text-2xl font-black text-red-600 tracking-widest uppercase">SCANNED / ADMITTED</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between relative z-0">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${ticket.status === 'USED' ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-600 to-purple-700'} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                {ticket.status === 'USED' ? <CheckCircle2 className="w-6 h-6 text-gray-500" /> : <Ticket className="w-6 h-6 text-white" />}
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{ticket.type.replace('_', ' ')}</div>
                                                <div className="text-lg font-black text-white italic tracking-tight">{ticket.ticketId}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="hidden sm:block text-right">
                                                <div className="text-[10px] text-gray-500 uppercase">Status</div>
                                                <div className={`text-xs font-bold ${ticket.status === 'USED' ? 'text-gray-500' : 'text-green-500'}`}>
                                                    {ticket.status === 'USED' ? 'VOID' : 'READY TO SCAN'}
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                                                <QrCode className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <footer className="pt-12 pb-6 border-t border-white/5 text-center">
                    <div className="text-2xl font-black tracking-tighter text-white/10 italic mb-4">
                        SWASTIKA<span className="text-red-600/10">.</span>2026
                    </div>
                    <div className="flex justify-center gap-6">
                        <a href={SITE_CONFIG.links.guidelines} target="_blank" className="text-xs text-gray-600 hover:text-white transition uppercase font-bold tracking-widest">Entry Guidelines</a>
                        <a href={SITE_CONFIG.links.schedule} target="_blank" className="text-xs text-gray-600 hover:text-white transition uppercase font-bold tracking-widest">Event Schedule</a>
                    </div>
                </footer>

            </div>
        </div>
    );
}
