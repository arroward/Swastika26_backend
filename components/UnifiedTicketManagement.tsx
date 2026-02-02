'use client';

import React, { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp, setDoc, getDoc, getDocs, where, serverTimestamp, increment } from 'firebase/firestore';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';
import {
    ScanLine, CheckCircle2, UserCheck, ShieldCheck, Check, X,
    Loader2, Search, Mail, RotateCcw, Scan, AlertTriangle, Calendar
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TicketBooking {
    id: string;
    name: string;
    email: string;
    phone: string;
    transactionId: string;
    tickets?: {
        day1: number;
        day2: number;
        combo: number;
    };
    ticketType?: 'day1' | 'day2' | 'combo';
    count?: number;
    totalAmount: number;
    createdAt: Timestamp;
    status: 'pending' | 'verified' | 'rejected' | 'ACTIVE' | 'USED' | 'CANCELLED';
    mailStatus: 'pending' | 'sent' | 'failed';
    rejectionReason?: string;
    admitted?: {
        day1: number;
        day2: number;
        [key: string]: any;
    } | boolean;
    admittedAt?: Timestamp;
}

// ============================================================================
// HELPERS
// ============================================================================

const checkAdmitted = (admitted: any): boolean => {
    if (!admitted) return false;
    if (admitted === true) return true;
    if (typeof admitted === 'object') {
        return Object.values(admitted).some(v => typeof v === 'number' && v > 0);
    }
    return false;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UnifiedTicketManagement() {
    const [activeView, setActiveView] = useState<'verify' | 'scan' | 'admitted'>('verify');

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-blue-500" />
                        Unified Ticket Command
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Complete ticket management system</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-3 gap-2 bg-gray-900/50 p-1.5 rounded-xl border border-gray-800">
                <button
                    onClick={() => setActiveView('verify')}
                    className={`flex flex-col md:flex-row items-center justify-center gap-2 px-2 md:px-6 py-3 rounded-lg text-xs md:text-sm font-bold transition-all ${activeView === 'verify'
                        ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
                        : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                        }`}
                >
                    <CheckCircle2 className="w-5 h-5 md:w-4 md:h-4" />
                    <span>Verify</span>
                </button>
                <button
                    onClick={() => setActiveView('scan')}
                    className={`flex flex-col md:flex-row items-center justify-center gap-2 px-2 md:px-6 py-3 rounded-lg text-xs md:text-sm font-bold transition-all ${activeView === 'scan'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                        }`}
                >
                    <ScanLine className="w-5 h-5 md:w-4 md:h-4" />
                    <span>Scanner</span>
                </button>
                <button
                    onClick={() => setActiveView('admitted')}
                    className={`flex flex-col md:flex-row items-center justify-center gap-2 px-2 md:px-6 py-3 rounded-lg text-xs md:text-sm font-bold transition-all ${activeView === 'admitted'
                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                        : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                        }`}
                >
                    <UserCheck className="w-5 h-5 md:w-4 md:h-4" />
                    <span>Admitted</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeView === 'verify' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <VerificationPanel viewMode="verification" />
                    </div>
                )}

                {activeView === 'scan' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <TicketScanner />
                    </div>
                )}

                {activeView === 'admitted' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <VerificationPanel viewMode="admitted" />
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// VERIFICATION PANEL COMPONENT
// ============================================================================

interface VerificationPanelProps {
    viewMode?: 'verification' | 'admitted';
}

function VerificationPanel({ viewMode = 'verification' }: VerificationPanelProps) {
    const [passes, setPasses] = useState<TicketBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0, admitted: 0 });

    useEffect(() => {
        const q = query(collection(db, 'proshow_passes'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: TicketBooking[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as TicketBooking));

            setPasses(data);

            const s = { pending: 0, verified: 0, rejected: 0, admitted: 0 };
            data.forEach(p => {
                if (p.status === 'pending') s.pending++;
                else if (p.status === 'verified') s.verified++;
                else if (p.status === 'rejected') s.rejected++;

                if (checkAdmitted(p.admitted)) s.admitted++;
            });
            setStats(s);

            setLoading(false);
        }, (error) => {
            console.error("Error fetching passes:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleVerify = async (booking: TicketBooking, isResend = false) => {
        const action = isResend ? "RESEND EMAIL to" : "VERIFY and EMAIL";
        if (!confirm(`Are you sure you want to ${action} ${booking.name}?`)) return;

        setProcessingId(booking.id);
        try {
            const res = await fetch('/api/admin/verify-and-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    docId: booking.id,
                    email: booking.email,
                    name: booking.name,
                    tickets: booking.tickets,
                    ticketType: booking.ticketType,
                    count: booking.count,
                    totalAmount: booking.totalAmount,
                    transactionId: booking.transactionId
                })
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to verify');
            }
            if (isResend) alert("Email resent successfully!");

        } catch (err: any) {
            console.error(err);
            alert('Error: ' + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt("Enter reason for rejection:");
        if (reason === null) return;

        setProcessingId(id);
        try {
            await updateDoc(doc(db, 'proshow_passes', id), {
                status: 'rejected',
                rejectionReason: reason || 'Admin rejected without reason',
                verifiedAt: Timestamp.now()
            });
        } catch (err: any) {
            console.error(err);
            alert('Error: ' + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredPasses = passes.filter(p => {
        if (!p.name) return false;
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (viewMode === 'admitted') {
            return p.admitted === true || (typeof p.admitted === 'object' && Object.values(p.admitted).some(v => v > 0));
        }

        return true;
    });

    const pendingPasses = viewMode === 'verification' ? filteredPasses.filter(p => p.status === 'pending') : [];
    const processedPasses = viewMode === 'verification'
        ? filteredPasses.filter(p => p.status !== 'pending')
        : filteredPasses;

    const shownProcessed = searchTerm || viewMode === 'admitted' ? processedPasses : processedPasses.slice(0, 50);

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div>
                    <h2 className="text-xl font-bold text-white">
                        {viewMode === 'admitted' ? 'Admitted Attendees' : 'Ticket Verification'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {viewMode === 'admitted' ? 'List of all users who have entered the venue.' : 'Review approvals and monitor history.'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {viewMode === 'verification' && (
                        <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded border border-yellow-500/20">
                            PENDING: {stats.pending}
                        </div>
                    )}
                    {viewMode === 'verification' && (
                        <div className="bg-green-500/10 text-green-500 px-3 py-1.5 rounded border border-green-500/20">
                            VERIFIED: {stats.verified}
                        </div>
                    )}

                    <div className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded border border-blue-500/20 flex items-center gap-1">
                        <ScanLine className="w-3 h-3" /> ADMITTED: {stats.admitted}
                    </div>
                    <div className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded border border-red-500/20">
                        REJECTED: {stats.rejected}
                    </div>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search by Name, Email, or Transaction ID..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-8">
                {viewMode === 'verification' && (
                    <div>
                        <h3 className="text-lg font-semibold text-yellow-500 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            Pending Requests ({pendingPasses.length})
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                            </div>
                        ) : pendingPasses.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-gray-700 rounded-lg text-gray-500">
                                No pending requests found.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {pendingPasses.map((pass) => (
                                    <PassCard
                                        key={pass.id}
                                        pass={pass}
                                        onVerify={() => handleVerify(pass)}
                                        onReject={() => handleReject(pass.id)}
                                        isProcessing={processingId === pass.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {(shownProcessed.length > 0 || viewMode === 'admitted') && (
                    <div className={viewMode === 'verification' ? "pt-6 border-t border-gray-800" : ""}>
                        <h3 className="text-lg font-semibold text-gray-400 mb-4 flex items-center justify-between">
                            <span>{viewMode === 'admitted' ? 'Admitted List' : `All History ${searchTerm ? '(Filtered)' : '(Recent 50)'}`}</span>
                            <span className="text-xs font-normal text-gray-600">Showing {shownProcessed.length} items</span>
                        </h3>

                        <div className="space-y-3">
                            {shownProcessed.map((pass) => (
                                <PassCard
                                    key={pass.id}
                                    pass={pass}
                                    onResend={() => handleVerify(pass, true)}
                                    isProcessing={processingId === pass.id}
                                    readonly
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// PASS CARD COMPONENT
// ============================================================================

function PassCard({
    pass,
    onVerify,
    onReject,
    onResend,
    isProcessing,
    readonly
}: {
    pass: TicketBooking,
    onVerify?: () => void,
    onReject?: () => void,
    onResend?: () => void,
    isProcessing?: boolean,
    readonly?: boolean
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                bg-gray-800 border rounded-lg p-4 relative overflow-hidden group
                ${pass.status === 'verified' ? 'border-green-500/20' : ''}
                ${pass.status === 'rejected' ? 'border-red-500/20' : ''}
                ${pass.status === 'pending' ? 'border-yellow-500/50' : ''}
            `}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 
                ${pass.status === 'verified' ? 'bg-green-500' : ''}
                ${pass.status === 'rejected' ? 'bg-red-500' : ''}
                ${pass.status === 'pending' ? 'bg-yellow-500' : ''}
            `} />

            <div className="flex flex-col md:flex-row justify-between gap-4 pl-3">
                <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h4 className="font-bold text-lg text-white leading-none">{pass.name}</h4>

                        {pass.tickets ? (
                            <div className="flex gap-1">
                                {pass.tickets.day1 > 0 && <span className="bg-blue-500/20 text-blue-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded">D1: {pass.tickets.day1}</span>}
                                {pass.tickets.day2 > 0 && <span className="bg-purple-500/20 text-purple-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded">D2: {pass.tickets.day2}</span>}
                                {pass.tickets.combo > 0 && <span className="bg-yellow-500/20 text-yellow-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Combo: {pass.tickets.combo}</span>}
                            </div>
                        ) : (
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded
                                ${pass.ticketType === 'combo' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}
                            `}>
                                {pass.ticketType} ({pass.count})
                            </span>
                        )}

                        {checkAdmitted(pass.admitted) && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <ScanLine className="w-3 h-3" /> ADMITTED
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-sm text-gray-400">
                        <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {pass.email}</p>
                        <p className="font-mono">{pass.phone}</p>
                        <p className="font-mono text-gray-500 text-xs mt-0.5">TXN: {pass.transactionId}</p>
                        <p className="flex items-center gap-1">
                            Total: <span className="text-white font-bold">₹{pass.totalAmount}</span>
                        </p>
                    </div>

                    {pass.rejectionReason && (
                        <div className="mt-2 text-xs text-red-400 bg-red-900/10 p-2 rounded border border-red-900/20">
                            Reason: {pass.rejectionReason}
                        </div>
                    )}
                </div>

                <div className="flex flex-row md:flex-col justify-end items-center md:items-end gap-2 min-w-[140px]">
                    {!readonly ? (
                        isProcessing ? (
                            <div className="text-gray-500 flex items-center gap-2 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" /> Processing
                            </div>
                        ) : (
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={onVerify}
                                    className="flex-1 md:flex-none px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                                >
                                    <Check className="w-4 h-4" /> Verify
                                </button>
                                <button
                                    onClick={onReject}
                                    className="flex-1 md:flex-none px-4 py-2 rounded bg-red-900/30 hover:bg-red-900/50 text-red-500 border border-red-900/30 text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Reject
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-end gap-2">
                            <div className={`text-xs font-mono uppercase tracking-widest px-3 py-1 rounded border
                                ${pass.status === 'verified' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}
                            `}>
                                {pass.status}
                            </div>

                            {pass.status === 'verified' && (
                                <button
                                    onClick={onResend}
                                    disabled={isProcessing}
                                    className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 bg-gray-700 px-2 py-1 rounded transition-colors"
                                    title="Resend Ticket Email"
                                >
                                    {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                                    Resend Mail
                                </button>
                            )}

                            {pass.mailStatus && !pass.admitted && pass.status === 'verified' && (
                                <span className={`text-[10px] ${pass.mailStatus === 'sent' ? 'text-green-500/50' : 'text-red-500'}`}>
                                    Mail {pass.mailStatus}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ============================================================================
// TICKET SCANNER COMPONENT
// ============================================================================

function TicketScanner() {
    const [scanDay, setScanDay] = useState<'day1' | 'day2'>('day1');
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [ticketInfo, setTicketInfo] = useState<TicketBooking | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [admitCount, setAdmitCount] = useState<number>(1);
    const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
    const isTransitioning = useRef(false);

    const [admissionStatus, setAdmissionStatus] = useState<{
        allowed: number;
        admitted: number;
        canEnter: boolean;
        message: string;
        remaining: number;
    } | null>(null);

    useEffect(() => {
        let mounted = true;

        const manageScanner = async () => {
            if (isTransitioning.current) return;

            const readerElement = document.getElementById("reader");
            if (!readerElement) return;

            try {
                if (!scannerInstanceRef.current) {
                    scannerInstanceRef.current = new Html5Qrcode("reader");
                }

                const scanner = scannerInstanceRef.current;

                if (scannedData) {
                    // Logic: If there is data, scanner should be stopped
                    if (scanner.isScanning) {
                        isTransitioning.current = true;
                        await scanner.stop();
                        isTransitioning.current = false;
                    }
                } else {
                    // Logic: If no data, scanner should be starting or running
                    if (!scanner.isScanning) {
                        isTransitioning.current = true;
                        await scanner.start(
                            { facingMode: "environment" },
                            {
                                fps: 10,
                                qrbox: { width: 250, height: 250 },
                                aspectRatio: 1.0,
                            },
                            (decodedText: string) => {
                                if (mounted) onScanSuccess(decodedText, null);
                            },
                            () => { /* ignore */ }
                        );
                        isTransitioning.current = false;
                    }
                }
            } catch (err) {
                console.error("Scanner state error:", err);
                isTransitioning.current = false;
                if (mounted && !String(err).includes("scanning")) {
                    setError("Scanner error. Please try resetting.");
                }
            }
        };

        const timer = setTimeout(manageScanner, 300);

        return () => {
            mounted = false;
            clearTimeout(timer);
            // Cleanup on tab switch or unmount
            if (scannerInstanceRef.current && scannerInstanceRef.current.isScanning && !isTransitioning.current) {
                isTransitioning.current = true;
                scannerInstanceRef.current.stop()
                    .then(() => { isTransitioning.current = false; })
                    .catch(() => { isTransitioning.current = false; });
            }
        };
    }, [scannedData]);

    useEffect(() => {
        if (!ticketInfo) {
            setAdmissionStatus(null);
            return;
        }

        const { allowed, admitted, remaining, canEnter, message } = calculateAdmissionLogic(ticketInfo, scanDay, admitCount);
        setAdmissionStatus({ allowed, admitted, remaining, canEnter, message });

    }, [ticketInfo, scanDay, admitCount]);

    const calculateAdmissionLogic = (ticket: TicketBooking, currentDay: 'day1' | 'day2', countToAdmit: number) => {
        let allowed = 0;
        let admittedCount = 0;

        if (ticket.tickets) {
            const specificDayCount = ticket.tickets[currentDay] || 0;
            const comboCount = ticket.tickets.combo || 0;
            allowed = specificDayCount + comboCount;
        } else if (ticket.ticketType && ticket.count) {
            if (ticket.ticketType === 'combo' || ticket.ticketType === currentDay) {
                allowed = ticket.count;
            } else {
                allowed = 0;
            }
        }

        if (ticket.admitted) {
            if (typeof ticket.admitted === 'boolean') {
                admittedCount = ticket.admitted ? allowed : 0;
            } else {
                admittedCount = ticket.admitted[currentDay] || 0;
            }
        }

        const remaining = Math.max(0, allowed - admittedCount);

        const isVerified = ticket.status === 'verified' || ticket.status === 'ACTIVE' || ticket.status === 'USED';
        const hasRemaining = remaining > 0;
        const countValid = countToAdmit > 0 && countToAdmit <= remaining;

        const canEnter = isVerified && hasRemaining && countValid;

        let message = '';
        if (!isVerified) message = `Invalid Status: ${ticket.status}`;
        else if (allowed === 0) message = `No ${currentDay === 'day1' ? 'D1' : 'D2'} Access`;
        else if (remaining === 0) message = 'All Admitted';
        else if (!countValid) message = `Limit Exceeded (${remaining})`;
        else message = 'Access Granted';

        return { allowed, admitted: admittedCount, remaining, canEnter, message };
    };

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
        if (scannedData === decodedText) return;

        setScannedData(decodedText);
        setAdmitCount(1);
        setError(null);
        setSuccessMsg(null);
        setTicketInfo(null);

        try {
            const text = decodedText.trim();
            let parsedId = '';

            // 1. Handle deep links or URLs
            if (text.includes('://') || text.startsWith('http')) {
                parsedId = text.split('/').pop() || '';
            }
            // 2. Handle legacy format with colons (SW26:ID:TYPE:COUNT)
            else if (text.includes(':')) {
                const parts = text.split(':');
                parsedId = parts[1] || parts[0];
            }
            // 3. Raw format
            else {
                parsedId = text;
            }

            // Cleanup query strings if present
            parsedId = parsedId.split('?')[0];

            if (!parsedId || parsedId.length < 3) {
                throw new Error("Invalid ID format");
            }

            fetchTicket(parsedId);
        } catch (err: any) {
            console.error("Scanner parsing failed:", err);
            setError("Invalid Swastika Ticket QR Code");
        }
    };

    const fetchTicket = async (docId: string) => {
        setLoading(true);
        try {
            // 1. Try new 'tickets' collection (Direct ID)
            let docRef = doc(db, 'tickets', docId);
            let docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // 1b. Fallback: Search by ticketId field
                const q = query(collection(db, 'tickets'), where('ticketId', '==', docId));
                const qSnap = await getDocs(q);
                if (!qSnap.empty) {
                    docSnap = qSnap.docs[0];
                }
            }

            if (docSnap.exists()) {
                const data = docSnap.data();
                setTicketInfo({
                    ...data,
                    id: docSnap.id,
                    _collection: 'tickets'
                } as any);
                return;
            }

            // 2. Try legacy 'proshow_passes' (Direct ID)
            docRef = doc(db, 'proshow_passes', docId);
            docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setTicketInfo({
                    ...data,
                    id: docSnap.id,
                    _collection: 'proshow_passes'
                } as any);
            } else {
                setError("Invalid Swastika Ticket QR Code");
            }
        } catch (err: any) {
            console.error("Fetch error:", err);
            setError("Invalid Swastika Ticket QR Code");
        } finally {
            setLoading(false);
        }
    };

    const handleAdmit = async () => {
        if (!ticketInfo || !admissionStatus?.canEnter) return;

        setLoading(true);
        try {
            // Determine collection from marker or presence of ticketId (new schema has ticketId)
            const collectionName = (ticketInfo as any)._collection ||
                ((ticketInfo as any).ticketId ? 'tickets' : 'proshow_passes');

            const docRef = doc(db, collectionName, ticketInfo.id);

            // If it's the new 'tickets' collection, we also push a scan record
            const scanData: any = {
                admitted: {
                    [scanDay]: increment(admitCount)
                },
                [`last_scan_${scanDay}`]: serverTimestamp(),
            };

            // If new schema 'tickets', follow its scans object structure
            if (collectionName === 'tickets') {
                const newScan = {
                    day: scanDay.toUpperCase(),
                    time: new Date().toISOString(),
                    gate: 'Main Command'
                };
                scanData.scans = (ticketInfo as any).scans ? [...(ticketInfo as any).scans, newScan] : [newScan];
            }

            await setDoc(docRef, scanData, { merge: true });

            setSuccessMsg(`Admitted ${admitCount} for ${scanDay.toUpperCase()}`);

            setTicketInfo(prev => {
                if (!prev) return null;
                const prevAdmitted = (typeof prev.admitted === 'object' ? prev.admitted : {}) || {};
                const currentCount = (prevAdmitted as any)[scanDay] || 0;

                return {
                    ...prev,
                    admitted: {
                        ...prevAdmitted,
                        [scanDay]: currentCount + admitCount
                    } as any
                };
            });

            setAdmitCount(1);

        } catch (err: any) {
            setError("Failed to admit: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setScannedData(null);
        setTicketInfo(null);
        setError(null);
        setSuccessMsg(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Scan className="w-6 h-6 text-blue-400" /> Ticket Scanner
                    </h2>
                    <p className="text-sm text-gray-400">Scan QR codes for entry.</p>
                </div>

                <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                    <button
                        onClick={() => setScanDay('day1')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${scanDay === 'day1' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        DAY 1
                    </button>
                    <button
                        onClick={() => setScanDay('day2')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${scanDay === 'day2' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        DAY 2
                    </button>
                </div>

                <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition font-mono uppercase"
                >
                    Reset Check
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black p-4 rounded-xl border border-gray-800 overflow-hidden relative min-h-[350px] flex flex-col justify-center">
                    <div id="reader" className="w-full h-full rounded-lg overflow-hidden"></div>

                    {scannedData && (
                        <div className="absolute inset-0 bg-black/90 z-10 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                            <Check className="w-16 h-16 text-green-500 mb-4" />
                            <p className="text-green-500 font-bold text-lg">Scan Successful</p>
                            <p className="text-gray-500 text-xs mt-2 break-all px-4 text-center">{scannedData}</p>
                        </div>
                    )}

                    {!scannedData && <p className="text-center text-gray-500 mt-4 animate-pulse absolute bottom-4 left-0 right-0 pointer-events-none">Waiting for QR Code...</p>}
                </div>

                {scannedData ? (
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col animate-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider flex items-center gap-2">
                                <Check className="w-3 h-3" /> SCANNED
                            </div>
                            <button onClick={handleReset} className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {loading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
                                <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                                <p className="animate-pulse">Fetching Ticket Details...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl text-center">
                                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-red-400 mb-2">Scan Error</h3>
                                <p className="text-red-300 mb-6">{error}</p>
                                <button onClick={handleReset} className="w-full py-3 bg-red-900/50 hover:bg-red-900 text-white rounded-lg font-bold">
                                    Try Again
                                </button>
                            </div>
                        )}

                        {ticketInfo && admissionStatus && !loading && (
                            <div className="space-y-6">
                                <div className={`p-6 rounded-xl text-center font-black tracking-widest uppercase shadow-2xl border-2
                                ${admissionStatus.canEnter
                                        ? 'bg-green-500/10 text-green-400 border-green-500'
                                        : 'bg-red-500/10 text-red-400 border-red-500'}
                            `}>
                                    <div className="text-2xl mb-1">{admissionStatus.message}</div>
                                    {admissionStatus.remaining > 0 && <div className="text-xs opacity-70">Passes Remaining: {admissionStatus.remaining}</div>}
                                </div>

                                <div>
                                    <h3 className="text-3xl font-bold text-white leading-none">{ticketInfo.name}</h3>
                                    <p className="text-gray-400 mt-1 font-mono">{ticketInfo.email}</p>
                                    <p className="text-xs text-gray-600 mt-2 font-mono">ID: {ticketInfo.id}</p>
                                </div>

                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Total Allowed</span>
                                        <span className="text-xl font-bold text-white">{admissionStatus.allowed}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Already Entered</span>
                                        <span className={`text-xl font-bold ${admissionStatus.admitted > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                            {admissionStatus.admitted}
                                        </span>
                                    </div>
                                </div>

                                {successMsg ? (
                                    <div className="bg-green-600 text-white p-6 rounded-xl text-center animate-in zoom-in-50 duration-300">
                                        <Check className="w-12 h-12 mx-auto mb-2" />
                                        <h3 className="text-2xl font-bold">ADMISSION SUCCESS</h3>
                                        <p className="opacity-80 mt-1">{successMsg}</p>
                                        <button
                                            onClick={handleReset}
                                            className="mt-6 w-full py-3 bg-white text-green-700 font-bold rounded-lg hover:bg-gray-100 transition shadow-lg"
                                        >
                                            SCAN NEXT GUEST
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pt-4 border-t border-gray-700">
                                        {admissionStatus.canEnter && admissionStatus.remaining > 1 && (
                                            <div className="flex items-center justify-between bg-gray-700/30 p-2 rounded-lg mb-4">
                                                <button onClick={() => setAdmitCount(Math.max(1, admitCount - 1))} className="w-10 h-10 rounded bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg">-</button>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Admit Count</div>
                                                    <div className="text-2xl font-bold text-white">{admitCount}</div>
                                                </div>
                                                <button onClick={() => setAdmitCount(Math.min(admissionStatus.remaining, admitCount + 1))} className="w-10 h-10 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg">+</button>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleAdmit}
                                            disabled={!admissionStatus.canEnter}
                                            className={`w-full py-5 rounded-xl font-black text-xl tracking-wider shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3
                                            ${admissionStatus.canEnter
                                                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/20'
                                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                                                }
                                        `}
                                        >
                                            {admissionStatus.canEnter ? (
                                                <>
                                                    <Check className="w-6 h-6" />
                                                    CONFIRM ENTRY {admitCount > 1 ? `(${admitCount})` : ''}
                                                </>
                                            ) : (
                                                <>
                                                    <X className="w-6 h-6" />
                                                    ENTRY DENIED
                                                </>
                                            )}
                                        </button>

                                        <button onClick={handleReset} className="w-full py-3 text-gray-500 font-bold text-sm hover:text-white transition">
                                            CANCEL / SCAN NEXT
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="hidden md:flex bg-gray-900/50 rounded-xl border border-gray-800/50 items-center justify-center text-gray-600 p-12">
                        <div className="text-center">
                            <Scan className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Ready to Scan</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
