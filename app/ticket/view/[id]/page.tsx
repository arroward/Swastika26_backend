'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TicketTemplate from '@/components/ticket/TicketTemplate';
import { Loader2 } from 'lucide-react';

export default function ViewTicketPage() {
    const params = useParams();
    const id = params?.id as string;

    const [ticketData, setTicketData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchTicket = async () => {
            try {
                const docRef = doc(db, 'proshow_passes', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setTicketData({ ...docSnap.data(), id: docSnap.id });
                } else {
                    setError('Ticket not found');
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
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <TicketTemplate
                userName={ticketData.name}
                bookingId={ticketData.id}
                totalAmount={ticketData.totalAmount || 0}
                ticketType={type as any}
                count={ticketData.count || 0}
                tickets={ticketData.tickets}
            />
        </div>
    );
}
