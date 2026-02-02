"use client";

import React, { useState } from "react";
import {
  Search,
  Loader2,
  Ticket,
  ShoppingCart,
  Calendar,
  User,
  Mail,
  Phone,
  QrCode,
  AlertCircle,
} from "lucide-react";

interface SearchResults {
  tickets: any[];
  purchases: any[];
}

export default function AdminSearchPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "all" | "ticket" | "purchase" | "email" | "phone"
  >("all");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`,
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to search");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-2">
          Search Tickets & Purchases
        </h2>
        <p className="text-gray-400 text-sm">
          Find tickets and purchases by ID, email, phone, or name
        </p>
      </div>

      {/* Search Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Enter ticket ID, purchase ID, email, phone, or name..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>
        </div>

        {/* Search Type Filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "All" },
            { value: "ticket", label: "Tickets Only" },
            { value: "purchase", label: "Purchases Only" },
            { value: "email", label: "By Email" },
            { value: "phone", label: "By Phone" },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setSearchType(type.value as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                searchType === type.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Tickets Results */}
          {results.tickets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-500" />
                Tickets ({results.tickets.length})
              </h3>
              <div className="space-y-2">
                {results.tickets.map((ticket) => (
                  <TicketResultCard key={ticket.ticketId} ticket={ticket} />
                ))}
              </div>
            </div>
          )}

          {/* Purchases Results */}
          {results.purchases.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-500" />
                Purchases ({results.purchases.length})
              </h3>
              <div className="space-y-2">
                {results.purchases.map((purchase) => (
                  <PurchaseResultCard
                    key={purchase.purchaseId}
                    purchase={purchase}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.tickets.length === 0 && results.purchases.length === 0 && (
            <div className="p-8 text-center border border-dashed border-gray-700 rounded-lg">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">
                No results found for "{searchQuery}"
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TicketResultCard({ ticket }: { ticket: any }) {
  const statusColors = {
    ACTIVE: "bg-green-500/20 text-green-500 border-green-500/30",
    USED: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    CANCELLED: "bg-red-500/20 text-red-500 border-red-500/30",
    TRANSFERRED: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  };

  const typeColors: Record<string, string> = {
    DAY_1: "bg-blue-500/20 text-blue-400",
    DAY_2: "bg-purple-500/20 text-purple-400",
    COMBO: "bg-red-500/20 text-red-400",
    BOTH_DAYS: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <QrCode className="w-4 h-4 text-gray-500" />
            <span className="font-mono text-sm text-white font-bold">
              {ticket.ticketId}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${typeColors[ticket.type]}`}
            >
              {ticket.type.replace("_", " ")}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${statusColors[ticket.status]}`}
            >
              {ticket.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {ticket.holderName && (
              <div className="flex items-center gap-2 text-gray-400">
                <User className="w-3 h-3" />
                {ticket.holderName}
              </div>
            )}
            {ticket.holderEmail && (
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-3 h-3" />
                {ticket.holderEmail}
              </div>
            )}
            {ticket.holderPhone && (
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-3 h-3" />
                {ticket.holderPhone}
              </div>
            )}
            <div className="text-gray-500 text-xs">
              Purchase: <span className="font-mono">{ticket.purchaseId}</span>
            </div>
          </div>

          {ticket.scans && ticket.scans.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Scans: {ticket.scans.length}/{ticket.maxScans}
              {ticket.scans.map((scan: any, i: number) => (
                <span key={i} className="ml-2 text-blue-400">
                  {scan.day} @ {scan.location}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 text-xs text-gray-500">
          <div>
            Created:{" "}
            {new Date(ticket.createdAt?.seconds * 1000).toLocaleDateString()}
          </div>
          {ticket.allowedDays && (
            <div className="text-gray-600">
              Valid: {ticket.allowedDays.join(", ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PurchaseResultCard({ purchase }: { purchase: any }) {
  const statusColors = {
    PENDING: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    COMPLETED: "bg-green-500/20 text-green-500 border-green-500/30",
    FAILED: "bg-red-500/20 text-red-500 border-red-500/30",
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-gray-500" />
            <span className="font-mono text-sm text-white font-bold">
              {purchase.purchaseId}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${statusColors[purchase.paymentStatus]}`}
            >
              {purchase.paymentStatus}
            </span>
            {purchase.emailSent && (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                EMAIL SENT
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-2">
            <div className="flex items-center gap-2 text-white">
              <User className="w-3 h-3 text-gray-500" />
              {purchase.name}
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Mail className="w-3 h-3" />
              {purchase.email}
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Phone className="w-3 h-3" />
              {purchase.phone}
            </div>
            <div className="text-white font-bold">₹{purchase.totalAmount}</div>
          </div>

          {purchase.paymentId && (
            <div className="text-xs text-gray-500">
              Payment ID:{" "}
              <span className="font-mono">{purchase.paymentId}</span>
            </div>
          )}

          {purchase.tickets && purchase.tickets.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Tickets: {purchase.tickets.length}
              <span className="ml-2 font-mono text-gray-600">
                [{purchase.tickets.slice(0, 3).join(", ")}
                {purchase.tickets.length > 3 &&
                  ` +${purchase.tickets.length - 3} more`}
                ]
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(
              purchase.purchaseDate?.seconds * 1000,
            ).toLocaleDateString()}
          </div>
          <div className="text-gray-600">
            {new Date(
              purchase.purchaseDate?.seconds * 1000,
            ).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
