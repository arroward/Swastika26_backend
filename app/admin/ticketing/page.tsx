'use client';

import NewTicketingPanel from '@/components/NewTicketingPanel';

export default function NewTicketingAdminPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Swastika 2026 Ticketing System</h1>
                    <p className="text-white/40 mt-1">Admin Dashboard - Purchase & Ticket Management</p>
                </div>
                <NewTicketingPanel />
            </div>
        </div>
    );
}
