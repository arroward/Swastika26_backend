"use client";

import React, { useState } from "react";
import NewTicketingPanel from "@/components/NewTicketingPanel";
import { Ticket } from "lucide-react";

type TabType = "ticketing";

export default function NewTicketingAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("ticketing");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="border-b border-white/10 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Swastika 2026 Ticketing System
            </h1>
            <p className="text-white/40 mt-1">
              Admin Dashboard - Purchase & Ticket Management
            </p>
          </div>

          <div className="flex gap-2 bg-zinc-900 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab("ticketing")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ticketing" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
            >
              <Ticket className="w-4 h-4" /> Ticketing
            </button>
          </div>
        </div>

        <NewTicketingPanel />
      </div>
    </div>
  );
}
