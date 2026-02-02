'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TicketTemplate from '@/components/ticket/TicketTemplate';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ViewTicketPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [ticketData, setTicketData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [purchaseId, setPurchaseId] = useState<string | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setPurchaseId(urlParams.get('back'));
    }, []);

    useEffect(() => {
        if (!id) return;

        const fetchTicket = async () => {
            try {
                // 1. Try new 'tickets' collection first
                let docRef = doc(db, 'tickets', id);
                let docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTicketData({ ...data, id: docSnap.id });
                    // If we don't have a back ID in URL, use the one from the ticket
                    setPurchaseId(prev => prev || data.purchaseId);
                } else {
                    // 2. Try legacy 'proshow_passes'
                    docRef = doc(db, 'proshow_passes', id);
                    docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setTicketData({ ...docSnap.data(), id: docSnap.id });
                    } else {
                        setError('Ticket not found');
                    }
                }
            } catch (err: any) {
                console.error("Error fetching ticket:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !ticketData) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-xl font-bold text-red-500 mb-2">Error Loading Ticket</h1>
                <p className="text-gray-400">{error || 'Ticket details unavailable.'}</p>
            </div>
        );
    }

    // Determine type for legacy vs new schema
    let type = 'unknown';
    if (ticketData.tickets) {
        // Simple logic to determine dominant type for color scheme
        if (ticketData.tickets.combo > 0) type = 'combo';
        else if (ticketData.tickets.day2 > 0) type = 'mixed'; // or day2
        else type = 'day1';
    } else {
        type = ticketData.ticketType || 'day1';
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            {purchaseId && (
                <button
                    onClick={() => router.push(`/wallet/${purchaseId}`)}
                    className="mb-6 flex items-center gap-2 text-white/40 hover:text-white transition group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Wallet</span>
                </button>
            )}
            <TicketTemplate
                userName={ticketData.buyerName || ticketData.name}
                bookingId={ticketData.ticketId || ticketData.id}
                totalAmount={ticketData.totalAmount || 0}
                ticketType={type as any}
                count={ticketData.count || 0}
                tickets={ticketData.tickets}
            />
        </div>
    );
}
