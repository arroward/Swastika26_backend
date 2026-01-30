'use client';

import React, { useState } from 'react';
import NewTicketingPanel from '@/components/NewTicketingPanel';
import AdminSearchPanel from '@/components/AdminSearchPanel';
import { Ticket, Search, BarChart3, Settings, Mail } from 'lucide-react';
import MailCenter from '@/components/MailCenter';


type TabType = 'purchases' | 'search' | 'analytics' | 'mail';


export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState<TabType>('purchases');

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Swastika 2026</h1>
                            <p className="text-sm text-gray-400">Admin Dashboard</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-500 bg-gray-800 px-3 py-1.5 rounded">
                                🔴 LIVE
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-gray-900 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        <TabButton
                            active={activeTab === 'purchases'}
                            onClick={() => setActiveTab('purchases')}
                            icon={<Ticket className="w-4 h-4" />}
                            label="Purchase Management"
                        />
                        <TabButton
                            active={activeTab === 'mail'}
                            onClick={() => setActiveTab('mail')}
                            icon={<Mail className="w-4 h-4" />}
                            label="Mail Center"
                        />
                        <TabButton
                            active={activeTab === 'search'}
                            onClick={() => setActiveTab('search')}
                            icon={<Search className="w-4 h-4" />}
                            label="Search"
                        />
                        <TabButton
                            active={activeTab === 'analytics'}
                            onClick={() => setActiveTab('analytics')}
                            icon={<BarChart3 className="w-4 h-4" />}
                            label="Analytics"
                            disabled
                        />

                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'purchases' && <NewTicketingPanel />}
                {activeTab === 'search' && <AdminSearchPanel />}
                {activeTab === 'analytics' && (
                    <div className="p-12 text-center border border-dashed border-gray-700 rounded-lg">
                        <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">Analytics Dashboard Coming Soon</p>
                    </div>
                )}
                {activeTab === 'mail' && <MailCenter />}

            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label, disabled }: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors relative
                ${active
                    ? 'text-white bg-gray-800'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            {icon}
            {label}
            {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
        </button>
    );
}
