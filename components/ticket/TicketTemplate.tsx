import React from 'react';

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
            // New Schema Logic
            const hasDay1 = tickets.day1 > 0;
            const hasDay2 = tickets.day2 > 0;
            const hasCombo = tickets.combo > 0;
            const typesCount = [hasDay1, hasDay2, hasCombo].filter(Boolean).length;
            const totalCount = (tickets.day1 || 0) + (tickets.day2 || 0) + (tickets.combo || 0);

            if (typesCount > 1) {
                return {
                    title: 'MULTI-DAY ACCESS',
                    date: 'Feb 20-21, 2026',
                    color: 'border-purple-500',
                    passType: 'mixed',
                    totalCount
                };
            } else if (hasCombo) {
                return {
                    title: 'ALL ACCESS COMBO',
                    date: 'Feb 20-21, 2026',
                    color: 'border-yellow-500',
                    passType: 'combo',
                    totalCount
                };
            } else if (hasDay2) {
                return {
                    title: 'DAY 2 ACCESS',
                    date: 'Feb 21, 2026',
                    color: 'border-red-500',
                    passType: 'day2',
                    totalCount
                };
            } else {
                return {
                    title: 'DAY 1 ACCESS',
                    date: 'Feb 20, 2026',
                    color: 'border-blue-500',
                    passType: 'day1',
                    totalCount
                };
            }
        } else {
            // Legacy Logic
            const safeType = ticketType || 'day1';
            const safeCount = count || 1;

            switch (safeType) {
                case 'day1': return { title: 'DAY 1 ACCESS', date: 'Feb 20, 2026', color: 'border-blue-500', passType: 'day1', totalCount: safeCount };
                case 'day2': return { title: 'DAY 2 ACCESS', date: 'Feb 21, 2026', color: 'border-red-500', passType: 'day2', totalCount: safeCount };
                case 'combo': return { title: 'ALL ACCESS COMBO', date: 'Feb 20-21, 2026', color: 'border-yellow-500', passType: 'combo', totalCount: safeCount };
                default: return { title: 'EVENT PASS', date: 'Feb 2026', color: 'border-gray-500', passType: 'standard', totalCount: safeCount };
            }
        }
    };

    const typeInfo = determination();

    // QR Data construction
    // We prioritize the determined "Pass Type" for the QR payload or use a generic marker if mixed
    const qrType = tickets && typeInfo.passType === 'mixed' ? 'MIXED' : (typeInfo.passType || ticketType || 'day1');
    const qrCount = typeInfo.totalCount;

    // QR Format: SW26:{BookingID}:{Type}:{Count} 
    const qrData = `SW26:${bookingId}:${qrType}:${qrCount}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    return (
        <div className="font-sans w-full max-w-md mx-auto p-4">
            {/* Main Ticket Container - Compact Boarding Pass Style */}
            <div className={`relative flex flex-col bg-[#0a0a0a] border ${typeInfo.color} rounded-xl overflow-hidden shadow-2xl transition-colors duration-300`}>

                {/* Header */}
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black tracking-tight font-cinzel text-white leading-none">
                            SWASTIKA<span className="text-red-500">.</span>26
                        </h1>
                        <p className="text-[10px] tracking-widest uppercase text-white/40 mt-1">Proshow Access</p>
                    </div>
                    <div className={`px-2 py-1 rounded border ${typeInfo.color} bg-black/50 backdrop-blur-sm`}>
                        <span className={`text-xs font-bold uppercase tracking-wider
                            ${typeInfo.passType === 'combo' ? 'text-yellow-400' :
                                typeInfo.passType === 'mixed' ? 'text-purple-400' : 'text-red-400'}
                        `}>
                            {typeInfo.title}
                        </span>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 relative">
                    {/* Background Noise */}
                    <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,#fff_0px,#fff_1px,transparent_1px,transparent_10px)] pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <p className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">Attendee</p>
                            <p className="font-bold text-xl text-white truncate">{userName}</p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">Date</p>
                            <p className="font-semibold text-sm text-white">{typeInfo.date}</p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">Entry</p>
                            {tickets ? (
                                <div className="text-sm font-bold text-white">
                                    {typeInfo.totalCount} Person{typeInfo.totalCount > 1 ? 's' : ''}
                                    <div className="flex gap-1 mt-0.5">
                                        {tickets.day1 > 0 && <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">D1:{tickets.day1}</span>}
                                        {tickets.day2 > 0 && <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">D2:{tickets.day2}</span>}
                                        {tickets.combo > 0 && <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded">C:{tickets.combo}</span>}
                                    </div>
                                </div>
                            ) : (
                                <p className="font-bold text-sm text-white">{count || 1} Person{(count || 1) > 1 ? 's' : ''}</p>
                            )}
                        </div>
                    </div>

                    <div className="relative z-10 pt-4 mt-2 border-t border-dashed border-white/10 flex justify-between items-end">
                        <div className="font-mono text-[10px] text-white/30">
                            ID: {bookingId.toUpperCase()}
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-widest text-white/40">Total</p>
                            <p className="text-lg font-bold text-white">₹{totalAmount}</p>
                        </div>
                    </div>
                </div>

                {/* Tear-off / QR Section */}
                <div className="relative border-t-2 border-dashed border-black bg-white/10 p-4 flex items-center justify-between gap-4">
                    {/* Cutout Notches */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#000000] rounded-full"></div>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#000000] rounded-full"></div>

                    <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-widest text-white/50 mb-1">Scan for Entry</p>
                        <p className="text-[8px] text-white/30 leading-tight">Must present this unique QR code at the venue gate for validation.</p>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg shrink-0">
                        <img
                            src={qrUrl}
                            alt="Ticket QR"
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                </div>

            </div>
            <p className="text-center text-white/20 text-[10px] mt-2 font-mono">
                NON-TRANSFERABLE • VALID FOR ONE ENTRY
            </p>
        </div>
    );
};

export default TicketTemplate;
