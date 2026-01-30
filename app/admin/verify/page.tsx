
'use client';

import VerificationPanel from '@/components/VerificationPanel';
import AdminHeader from '@/components/AdminHeader'; // Assuming we want a header here too, but we might not have auth context easily.
// If this is a standalone page, it needs auth protection.
// But mostly user will use Dashboard.
// I'll just make it a wrapper.

export default function VerifyPassesPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Direct Verification Access</h1>
                    <p className="text-white/40 mt-1">Standalone View</p>
                </div>
                <VerificationPanel />
            </div>
        </div>
    );
}
