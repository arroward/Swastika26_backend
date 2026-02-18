import React from 'react';
import { QrCode, Info, ShieldCheck, MapPin, Calendar, Clock, Smartphone } from 'lucide-react';

interface TicketProps {
    bookingId: string;
    userName: string;
    // New Schema
    tickets?: {
        day1: number;
        day2: number;
        combo: number;
    };
    // Legacy Schema (Optional now)
    ticketType?: 'day1' | 'day2' | 'combo';
    count?: number;

    totalAmount: number;
    purchaseDate?: string;
}

export const TicketTemplate: React.FC<TicketProps> = ({
    bookingId,
    userName,
    tickets,
    ticketType,
    count,
    totalAmount,
    purchaseDate = new Date().toLocaleDateString()
}) => {

    // Logic to determine display values based on schema
    const determination = () => {
        if (tickets) {
            const hasDay1 = tickets.day1 > 0;
            const hasDay2 = tickets.day2 > 0;
            const hasCombo = tickets.combo > 0;
            const typesCount = [hasDay1, hasDay2, hasCombo].filter(Boolean).length;
            const totalCount = (tickets.day1 || 0) + (tickets.day2 || 0) + (tickets.combo || 0);

            if (typesCount > 1) {
                return {
                    title: 'MULTI-DAY ACCESS',
                    date: 'Feb 20-21, 2026',
                    color: 'from-purple-500 to-indigo-600',
                    passType: 'mixed',
                    totalCount
                };
            } else if (hasCombo) {
                return {
                    title: 'ALL ACCESS COMBO',
                    date: 'Feb 20-21, 2026',
                    color: 'from-yellow-400 to-amber-600',
                    passType: 'combo',
                    totalCount
                };
            } else if (hasDay2) {
                return {
                    title: 'DAY 2 ACCESS',
                    date: 'Feb 21, 2026',
                    color: 'from-red-500 to-rose-700',
                    passType: 'day2',
                    totalCount
                };
            } else {
                return {
                    title: 'DAY 1 ACCESS',
                    date: 'Feb 20, 2026',
                    color: 'from-blue-500 to-cyan-600',
                    passType: 'day1',
                    totalCount
                };
            }
        } else {
            const safeType = ticketType || 'day1';
            const safeCount = count || 1;

            switch (safeType) {
                case 'day1': return { title: 'DAY 1 ACCESS', date: 'Feb 20, 2026', color: 'from-blue-500 to-cyan-600', passType: 'day1', totalCount: safeCount };
                case 'day2': return { title: 'DAY 2 ACCESS', date: 'Feb 21, 2026', color: 'from-red-500 to-rose-700', passType: 'day2', totalCount: safeCount };
                case 'combo': return { title: 'ALL ACCESS COMBO', date: 'Feb 20-21, 2026', color: 'from-yellow-400 to-amber-600', passType: 'combo', totalCount: safeCount };
                default: return { title: 'EVENT PASS', date: 'Feb 2026', color: 'from-gray-500 to-gray-700', passType: 'standard', totalCount: safeCount };
            }
        }
    };

    const typeInfo = determination();
    const qrType = tickets && typeInfo.passType === 'mixed' ? 'MIXED' : (typeInfo.passType || ticketType || 'day1');
    const qrData = `SW26:${bookingId}:${qrType}:${typeInfo.totalCount}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

    return (
        <div className="font-sans w-full max-w-md mx-auto p-2 sm:p-4 animate-in fade-in duration-700">
            {/* Main Digital Pass Container */}
            <div className="relative bg-[#080808] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">

                {/* Header Section with Gradient Accent */}
                <div className={`h-2 bg-gradient-to-r ${typeInfo.color}`} />

                <div className="p-6 pb-4 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white">
                            SWASTIKA<span className="text-red-500">.</span>26
                        </h1>
                        <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-white/30">Official Entry Pass</p>
                    </div>
                    <div className="text-right">
                        <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/5 border border-white/10 text-white/80`}>
                            {typeInfo.title}
                        </div>
                    </div>
                </div>

                {/* Main Body - Holographic Style Details */}
                <div className="px-6 space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Attendee</label>
                        <p className="text-2xl font-black text-white truncate leading-tight">{userName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-white/5 rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <QrCode className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <label className="text-[9px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Event Date
                            </label>
                            <p className="font-bold text-sm text-white">{typeInfo.date}</p>
                        </div>
                        <div>
                            <label className="text-[9px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Admittance
                            </label>
                            <p className="font-bold text-sm text-white">
                                {typeInfo.totalCount} Person{typeInfo.totalCount > 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-white/5">
                            <label className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1 block">Access Types</label>
                            <div className="flex flex-wrap gap-2">
                                {tickets ? (
                                    <>
                                        {tickets.day1 > 0 && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">Day 01 Access x{tickets.day1}</span>}
                                        {tickets.day2 > 0 && <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Day 02 Access x{tickets.day2}</span>}
                                        {tickets.combo > 0 && <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold">Mega Combo Access x{tickets.combo}</span>}
                                    </>
                                ) : (
                                    <span className="text-[10px] bg-white/10 text-white/70 border border-white/10 px-2 py-0.5 rounded-full">{typeInfo.title}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Prominent QR Code Section */}
                    <div className="bg-white rounded-3xl p-6 flex flex-col items-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-4 border-white/5">
                        <div className="relative group">
                            <img
                                src={qrUrl}
                                alt="Ticket QR"
                                className="w-56 h-56 object-contain"
                            />
                            {/* Scanning line animation */}
                            <div className="absolute left-0 right-0 top-0 h-0.5 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-scan pointer-events-none" />
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-black/40 mb-1">Scan at Entrance</p>
                            <p className="text-xs font-mono font-bold text-black border-2 border-black/5 px-3 py-1 rounded-lg">
                                ID: {bookingId.substring(0, 12).toUpperCase()}
                            </p>
                        </div>
                    </div>

                    {/* Entry Instructions */}
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
                        <div className="flex items-center gap-2 text-white/80 border-b border-white/5 pb-3">
                            <Info className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-black uppercase tracking-wider">Instructions</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="mt-1"><Smartphone className="w-3 h-3 text-white/40" /></div>
                                <p className="text-[11px] text-white/60 leading-relaxed font-medium">Keep screen <strong className="text-white">brightness at 100%</strong> for faster scanning at the gate.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1"><Clock className="w-3 h-3 text-white/40" /></div>
                                <p className="text-[11px] text-white/60 leading-relaxed font-medium">Gates open at <strong className="text-white">4:30 PM</strong>. Arrive early to avoid queues.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1"><MapPin className="w-3 h-3 text-white/40" /></div>
                                <p className="text-[11px] text-white/60 leading-relaxed font-medium">Main Gate Entry. Keep your <strong className="text-white">College ID</strong> or Govt ID ready.</p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Info Footnote */}
                    <div className="flex justify-between items-center py-2 opacity-50">
                        <p className="text-[9px] font-mono text-white/40">Total Paid: ₹{totalAmount}</p>
                        <p className="text-[9px] font-mono text-white/40">{purchaseDate}</p>
                    </div>
                </div>

                {/* Bottom Notch for Boarding Pass Look */}
                <div className="relative h-12 bg-white/5 flex items-center justify-center border-t border-dashed border-white/10 group overflow-hidden">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8 bg-black border border-white/10 rounded-full" />
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 bg-black border border-white/10 rounded-full" />
                    <p className="text-[8px] tracking-[0.5em] font-black uppercase text-white/30 group-hover:text-white/60 transition-colors">
                        SWASTIKA SECURITY • DO NOT SHARE
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default TicketTemplate;

