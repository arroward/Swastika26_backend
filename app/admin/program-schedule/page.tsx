"use client";

import React from "react";
import ProgramSchedule from "@/components/ProgramSchedule";
import { CalendarDays } from "lucide-react";

export default function ProgramSchedulePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Program Schedule
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Swastika 2026 — Event Flow Management
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <ProgramSchedule />
      </div>
    </div>
  );
}
