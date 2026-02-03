"use client";

import React from "react";
import VerificationPanel from "@/components/VerificationPanel";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                Swastika 2026
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Ticket Verification
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-xs text-gray-500 bg-gray-800 px-2.5 sm:px-3 py-1.5 rounded whitespace-nowrap">
                🔴 LIVE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <VerificationPanel />
      </div>
    </div>
  );
}
