"use client";

import React, { useState } from "react";
import NewTicketingPanel from "@/components/NewTicketingPanel";
import { Ticket } from "lucide-react";

type TabType = "ticketing";

export default function NewTicketingAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("ticketing");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 font-sans overflow-x-hidden">
      <div className="w-full space-y-6 sm:space-y-8">
        <div className="border-b border-white/10 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
              Swastika 2026 Ticketing System
            </h1>
            <p className="text-white/40 mt-1 text-xs sm:text-sm">
              Admin Dashboard - Purchase & Ticket Management
            </p>
          </div>

          <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg sm:rounded-xl border border-white/5 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => setActiveTab("ticketing")}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${activeTab === "ticketing" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">Ticketing</span>
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <NewTicketingPanel />
        </div>
      </div>
    </div>
  );
}
