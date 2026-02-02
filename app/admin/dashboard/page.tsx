"use client";

import React from "react";
import VerificationPanel from "@/components/VerificationPanel";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Swastika 2026
              </h1>
              <p className="text-sm text-gray-400">Ticket Verification</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 bg-gray-800 px-3 py-1.5 rounded">
                🔴 LIVE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <VerificationPanel />
      </div>
    </div>
  );
}
