'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, getDocs, where } from 'firebase/firestore';
import { Check, X, Loader2, Search, Mail, RotateCcw, ScanLine, TrendingUp, Ticket, Users, DollarSign, Calendar, Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Purchase {
    purchaseId: string;
    email: string;
    phone: string;
    name: string;
    totalAmount: number;
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
    paymentId: string;
    tickets: string[];
    purchaseDate: any;
    status: 'ACTIVE' | 'CANCELLED';
    emailSent?: boolean;
    emailSentAt?: any;
}

interface TicketData {
    ticketId: string;
    purchaseId: string;
    type: 'DAY_1' | 'DAY_2' | 'BOTH_DAYS';
    holderName?: string;
    holderEmail?: string;
    holderPhone?: string;
    qrCode: string;
    scans: any[];
    allowedDays: string[];
    maxScans: number;
    status: 'ACTIVE' | 'USED' | 'CANCELLED' | 'TRANSFERRED';
    createdAt: any;
    updatedAt: any;
}

interface Stats {
    purchases: {
        total: number;
        completed: number;
        pending: number;
        failed: number;
    };
    revenue: {
        total: number;
        byType: {
            day1: number;
            day2: number;
            bothDays: number;
        };
    };
    tickets: {
        total: number;
        active: number;
        used: number;
        cancelled: number;
        byType: {
            day1: number;
            day2: number;
            bothDays: number;
        };
    };
    scans: {
        total: number;
        day1: number;
        day2: number;
    };
}

export default function NewTicketingPanel() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState<Stats | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch purchases and tickets
    useEffect(() => {
        const purchasesQuery = query(collection(db, 'purchases'), orderBy('purchaseDate', 'desc'));
        const ticketsQuery = query(collection(db, 'tickets'));

        const unsubPurchases = onSnapshot(purchasesQuery, (snapshot) => {
            const data: Purchase[] = snapshot.docs.map(doc => ({
                purchaseId: doc.id,
                ...doc.data()
            } as Purchase));
            setPurchases(data);
        });

        const unsubTickets = onSnapshot(ticketsQuery, (snapshot) => {
            const data: TicketData[] = snapshot.docs.map(doc => ({
                ticketId: doc.id,
                ...doc.data()
            } as TicketData));
            setTickets(data);
            setLoading(false);
        });

        return () => {
            unsubPurchases();
            unsubTickets();
        };
    }, []);

    // Fetch stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    // Send ticket email
    const handleSendEmail = async (purchaseId: string) => {
        if (!confirm('Send ticket confirmation email?')) return;

        setProcessingId(purchaseId);
        try {
            const response = await fetch('/api/email/send-tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ purchaseId })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send email');
            }

            alert('Email sent successfully!');
        } catch (error: any) {
            console.error(error);
            alert('Error: ' + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    // Filter purchases
    const filteredPurchases = purchases.filter(p => {
        const matchesSearch =
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone?.includes(searchTerm) ||
            p.purchaseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.paymentId?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === 'pending') return p.paymentStatus === 'PENDING';
        if (activeTab === 'completed') return p.paymentStatus === 'COMPLETED';
        return true;
    });

    // Get tickets for a purchase
    const getTicketsForPurchase = (purchaseId: string) => {
        return tickets.filter(t => t.purchaseId === purchaseId);
    };

    return (
        <div className="space-y-6">
            {/* Stats Dashboard */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<DollarSign className="w-5 h-5" />}
                        label="Total Revenue"
                        value={`₹${stats.revenue.total.toLocaleString()}`}
                        color="green"
                    />
                    <StatCard
                        icon={<Ticket className="w-5 h-5" />}
                        label="Total Tickets"
                        value={stats.tickets.total}
                        subtitle={`${stats.tickets.active} active`}
                        color="blue"
                    />
                    <StatCard
                        icon={<Users className="w-5 h-5" />}
                        label="Total Purchases"
                        value={stats.purchases.total}
                        subtitle={`${stats.purchases.completed} completed`}
                        color="purple"
                    />
                    <StatCard
                        icon={<ScanLine className="w-5 h-5" />}
                        label="Total Scans"
                        value={stats.scans.total}
                        subtitle={`D1: ${stats.scans.day1} | D2: ${stats.scans.day2}`}
                        color="orange"
                    />
                </div>
            )}

            {/* Ticket Type Breakdown */}
            {stats && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Ticket Sales Breakdown</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">{stats.tickets.byType.day1}</div>
                            <div className="text-xs text-gray-500">Day 1 Pass</div>
                            <div className="text-xs text-green-500">₹{stats.revenue.byType.day1}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{stats.tickets.byType.day2}</div>
                            <div className="text-xs text-gray-500">Day 2 Pass</div>
                            <div className="text-xs text-green-500">₹{stats.revenue.byType.day2}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-400">{stats.tickets.byType.bothDays}</div>
                            <div className="text-xs text-gray-500">Both Days</div>
                            <div className="text-xs text-green-500">₹{stats.revenue.byType.bothDays}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div>
                    <h2 className="text-xl font-bold text-white">Purchase Management</h2>
                    <p className="text-gray-400 text-sm">Verify payments and send ticket emails</p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded border border-yellow-500/20">
                        PENDING: {stats?.purchases.pending || 0}
                    </div>
                    <div className="bg-green-500/10 text-green-500 px-3 py-1.5 rounded border border-green-500/20">
                        COMPLETED: {stats?.purchases.completed || 0}
                    </div>
                    <div className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded border border-red-500/20">
                        FAILED: {stats?.purchases.failed || 0}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'pending'
                            ? 'text-yellow-500 border-b-2 border-yellow-500'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    Pending ({stats?.purchases.pending || 0})
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'completed'
                            ? 'text-green-500 border-b-2 border-green-500'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    Completed ({stats?.purchases.completed || 0})
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'all'
                            ? 'text-blue-500 border-b-2 border-blue-500'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    All ({purchases.length})
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search by Name, Email, Phone, Purchase ID, or Payment ID..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Purchases List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    </div>
                ) : filteredPurchases.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-gray-700 rounded-lg text-gray-500">
                        No purchases found.
                    </div>
                ) : (
                    filteredPurchases.map((purchase) => (
                        <PurchaseCard
                            key={purchase.purchaseId}
                            purchase={purchase}
                            tickets={getTicketsForPurchase(purchase.purchaseId)}
                            onSendEmail={() => handleSendEmail(purchase.purchaseId)}
                            isProcessing={processingId === purchase.purchaseId}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subtitle, color }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtitle?: string;
    color: 'green' | 'blue' | 'purple' | 'orange';
}) {
    const colorClasses = {
        green: 'bg-green-500/10 text-green-500 border-green-500/20',
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    };

    return (
        <div className={`${colorClasses[color]} border rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && <div className="text-xs opacity-60 mt-1">{subtitle}</div>}
        </div>
    );
}

function PurchaseCard({ purchase, tickets, onSendEmail, isProcessing }: {
    purchase: Purchase;
    tickets: TicketData[];
    onSendEmail: () => void;
    isProcessing: boolean;
}) {
    const statusColors = {
        PENDING: 'border-yellow-500/50 bg-yellow-500/5',
        COMPLETED: 'border-green-500/20 bg-green-500/5',
        FAILED: 'border-red-500/20 bg-red-500/5'
    };

    const statusStrip = {
        PENDING: 'bg-yellow-500',
        COMPLETED: 'bg-green-500',
        FAILED: 'bg-red-500'
    };

    // Group tickets by type
    const ticketCounts = tickets.reduce((acc, ticket) => {
        acc[ticket.type] = (acc[ticket.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gray-800 border rounded-lg p-4 relative overflow-hidden ${statusColors[purchase.paymentStatus]}`}
        >
            {/* Status Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusStrip[purchase.paymentStatus]}`} />

            <div className="flex flex-col lg:flex-row justify-between gap-4 pl-3">
                {/* Left Info */}
                <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h4 className="font-bold text-lg text-white">{purchase.name}</h4>

                        {/* Payment Status Badge */}
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${purchase.paymentStatus === 'COMPLETED' ? 'bg-green-500/20 text-green-500' :
                                purchase.paymentStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                    'bg-red-500/20 text-red-500'
                            }`}>
                            {purchase.paymentStatus}
                        </span>

                        {/* Email Status */}
                        {purchase.emailSent && (
                            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <Mail className="w-3 h-3" /> EMAIL SENT
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-sm text-gray-400 mb-3">
                        <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {purchase.email}</p>
                        <p className="font-mono">{purchase.phone}</p>
                        <p className="font-mono text-gray-500 text-xs">ID: {purchase.purchaseId}</p>
                        <p className="font-mono text-gray-500 text-xs">Payment: {purchase.paymentId || 'N/A'}</p>
                        <p className="flex items-center gap-1">
                            Total: <span className="text-white font-bold">₹{purchase.totalAmount}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                            {purchase.purchaseDate?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </p>
                    </div>

                    {/* Tickets Breakdown */}
                    <div className="flex flex-wrap gap-2">
                        {ticketCounts.DAY_1 && (
                            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
                                Day 1: {ticketCounts.DAY_1}
                            </span>
                        )}
                        {ticketCounts.DAY_2 && (
                            <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded">
                                Day 2: {ticketCounts.DAY_2}
                            </span>
                        )}
                        {ticketCounts.BOTH_DAYS && (
                            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">
                                Both Days: {ticketCounts.BOTH_DAYS}
                            </span>
                        )}
                        <span className="text-xs text-gray-500">
                            Total: {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Ticket Details */}
                    {tickets.length > 0 && (
                        <div className="mt-3 p-2 bg-gray-900/50 rounded border border-gray-700">
                            <div className="text-xs text-gray-500 mb-1">Tickets:</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                                {tickets.slice(0, 4).map(ticket => (
                                    <div key={ticket.ticketId} className="flex items-center gap-2">
                                        <span className="font-mono text-gray-400">{ticket.ticketId}</span>
                                        <span className={`px-1 rounded text-[10px] ${ticket.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' :
                                                ticket.status === 'USED' ? 'bg-blue-500/20 text-blue-500' :
                                                    'bg-gray-500/20 text-gray-500'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                ))}
                                {tickets.length > 4 && (
                                    <div className="text-gray-500">+{tickets.length - 4} more</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex flex-col justify-center items-end gap-2 min-w-[160px]">
                    {purchase.paymentStatus === 'COMPLETED' && (
                        <button
                            onClick={onSendEmail}
                            disabled={isProcessing}
                            className="w-full px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Mail className="w-4 h-4" />
                            )}
                            {purchase.emailSent ? 'Resend Email' : 'Send Email'}
                        </button>
                    )}

                    {purchase.paymentStatus === 'PENDING' && (
                        <div className="text-xs text-yellow-500 text-center">
                            ⏳ Awaiting payment verification
                        </div>
                    )}

                    {purchase.emailSent && purchase.emailSentAt && (
                        <div className="text-[10px] text-gray-500 text-center">
                            Sent: {purchase.emailSentAt?.toDate?.()?.toLocaleString() || 'N/A'}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
