"use client";

import React, { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Loader2, AlertCircle, Filter, RefreshCw, Eye } from "lucide-react";

export default function PaymentVerificationPanel() {
    const [activeMode, setActiveMode] = useState<"search" | "list">("list");

    // Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<any>(null);
    const [searchVerificationStatus, setSearchVerificationStatus] = useState<any>(null);

    // List State
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [verifications, setVerifications] = useState<Record<string, any>>({});
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "verified">("all");

    // Shared State
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState<string | null>(null); // ID of item being verified

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (activeMode === "list" && selectedEventId) {
            // Clear previous list
            setRegistrations([]);
            setVerifications({});
            fetchEventData(selectedEventId);
        }
    }, [selectedEventId, activeMode]);

    const fetchEvents = async () => {
        try {
            const response = await fetch("/api/admin/events");
            // The API might return {data: [...]} or just [...]
            // Let's handle both.
            const data = await response.json();

            let eventsList = [];
            if (Array.isArray(data)) {
                eventsList = data;
            } else if (data.data && Array.isArray(data.data)) {
                eventsList = data.data;
            }

            setEvents(eventsList);
            if (eventsList.length > 0 && !selectedEventId) {
                setSelectedEventId("all");
            }
        } catch (err) {
            console.error("Failed to fetch events", err);
        }
    };

    const fetchEventData = async (eventId: string) => {
        if (!eventId) return;
        setIsLoadingList(true);
        setError("");
        try {
            // Prepare query param
            const queryParam = eventId === "all" ? "" : `?eventId=${eventId}`;

            // 1. Fetch Registrations
            const regResponse = await fetch(`/api/admin/registrations${queryParam}`);
            const regData = await regResponse.json();

            // 2. Fetch Verifications
            const verResponse = await fetch(`/api/admin/verify-payment/list${queryParam}`);
            const verData = await verResponse.json();

            if (regData.success) {
                // Filter for UPI transactions only
                const withUpi = (regData.data || []).filter((r: any) => r.upiTransactionId);
                setRegistrations(withUpi);
            }

            if (verData.success) {
                setVerifications(verData.data);
            }
        } catch (err: any) {
            setError("Failed to fetch data: " + err.message);
        } finally {
            setIsLoadingList(false);
        }
    };

    const refreshList = () => {
        if (selectedEventId) fetchEventData(selectedEventId);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        setSearchResult(null);
        setSearchVerificationStatus(null);
        setError("");

        try {
            const response = await fetch(`/api/admin/registrations/search?query=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Search failed");

            if (data.data) {
                setSearchResult(data.data);
                // Check verification status for this single result
                // We can use the list endpoint or just query directly if we had a single item endpoint
                // For now, let's reuse the list endpoint but filtered by event ID if we have it
                if (data.data.eventId) {
                    const verResponse = await fetch(`/api/admin/verify-payment/list?eventId=${data.data.eventId}`);
                    const verData = await verResponse.json();
                    if (verData.success && verData.data[data.data.id]) {
                        setSearchVerificationStatus(verData.data[data.data.id]);
                    }
                }
            } else {
                setError("No registration found.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleVerify = async (registration: any, status: "APPROVED" | "REJECTED") => {
        if (!confirm(`Mark payment as ${status}?`)) return;

        setIsVerifying(registration.id);
        try {
            const response = await fetch("/api/admin/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    registrationId: registration.id,
                    eventId: registration.eventId,
                    status,
                    details: registration
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update local state
                const newStatus = {
                    status,
                    verifiedAt: new Date().toISOString(),
                    verifiedBy: "You" // In a real app, this would be the admin's name
                };

                if (activeMode === "list") {
                    setVerifications(prev => ({
                        ...prev,
                        [registration.id]: newStatus
                    }));
                } else {
                    setSearchVerificationStatus(newStatus);
                }
            } else {
                alert("Verification failed: " + (data.error || "Unknown"));
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setIsVerifying(null);
        }
    };

    // Filter logic
    const filteredRegistrations = registrations.filter(reg => {
        const status = verifications[reg.id];
        if (filterStatus === "all") return true;
        if (filterStatus === "pending") return !status;
        if (filterStatus === "verified") return !!status;
        return true;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6 text-white">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-syne font-bold mb-1">Payment Verification</h2>
                    <p className="text-white/50 text-sm">Verify UPI transactions and log them.</p>
                </div>

                {/* Mode Toggle */}
                <div className="bg-black/40 border border-white/10 p-1 rounded-xl flex">
                    <button
                        onClick={() => setActiveMode("list")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeMode === "list" ? "bg-red-600 text-white shadow-lg" : "hover:bg-white/5 text-white/70"}`}
                    >
                        Event List
                    </button>
                    <button
                        onClick={() => setActiveMode("search")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeMode === "search" ? "bg-red-600 text-white shadow-lg" : "hover:bg-white/5 text-white/70"}`}
                    >
                        Search Single
                    </button>
                </div>
            </header>

            {/* LIST MODE */}
            {activeMode === "list" && (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between bg-white/5">
                        <div className="flex gap-4 flex-1 items-center">
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-red-500 outline-none min-w-[250px] max-w-full"
                            >
                                {events.length === 0 && <option>Loading events...</option>}
                                <option value="all">All Events</option>
                                {events.map(e => (
                                    <option key={e.id} value={e.id}>{e.title}</option>
                                ))}
                            </select>

                            <button
                                onClick={refreshList}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoadingList ? "animate-spin" : ""}`} />
                            </button>
                        </div>

                        <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10 self-start md:self-center">
                            {(["all", "pending", "verified"] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold transition-all ${filterStatus === status ? "bg-white/20 text-white" : "text-white/40 hover:text-white"}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto min-h-[400px]">
                        {isLoadingList ? (
                            <div className="flex flex-col items-center justify-center h-64 text-white/30 gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                                <p>Loading transactions...</p>
                            </div>
                        ) : filteredRegistrations.length === 0 ? (
                            <div className="text-center py-20 text-white/30 flex flex-col items-center gap-4">
                                <div className="p-4 rounded-full bg-white/5">
                                    <Filter className="w-8 h-8 opacity-50" />
                                </div>
                                <p>No UPI transactions found for this filter.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase text-xs font-mono tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Name / ID</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">UPI Details</th>
                                        {/* <th className="px-6 py-4">Proof</th> */}
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredRegistrations.map((reg) => {
                                        const verification = verifications[reg.id];
                                        return (
                                            <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-white">{reg.fullName}</div>
                                                    <div className="text-xs text-white/40 font-mono mt-0.5 select-all">#{reg.id}</div>
                                                    {(selectedEventId === "all" || !selectedEventId) && (
                                                        <div className="text-xs text-red-500/80 mt-1 font-semibold truncate max-w-[200px]">
                                                            {reg.eventTitle || events.find(e => e.id === reg.eventId)?.title}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-white/80">
                                                    <div className="text-sm font-mono">{reg.phone}</div>
                                                    <div className="text-xs text-white/40 truncate max-w-[150px]" title={reg.email}>{reg.email}</div>
                                                    {reg.collegeName && <div className="text-xs text-white/30 mt-1 truncate max-w-[150px]">{reg.collegeName}</div>}
                                                </td>
                                                <td className="px-6 py-4 text-white/80">
                                                    <div className="font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded inline-block text-xs border border-green-500/20 select-all">
                                                        {reg.upiTransactionId}
                                                    </div>
                                                    <div className="text-xs text-white/40 mt-1">
                                                        Holder: <span className="text-white/60">{reg.accountHolderName || "-"}</span>
                                                    </div>
                                                </td>
                                                {/* <td className="px-6 py-4">
                                                    {reg.uploadFileUrl ? (
                                                        <a
                                                            href={reg.uploadFileUrl}
                                                            target="_blank"
                                                            rel="noopener"
                                                            className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:underline text-xs bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-500/20 transition-colors"
                                                        >
                                                            <Eye className="w-3 h-3" /> View Receipt
                                                        </a>
                                                    ) : (
                                                        <span className="text-white/20 text-xs italic">No file</span>
                                                    )}
                                                </td> */}
                                                <td className="px-6 py-4">
                                                    {verification ? (
                                                        <div className="flex flex-col gap-1 items-start">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${verification.status === "APPROVED"
                                                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                                                }`}>
                                                                {verification.status === "APPROVED" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                                {verification.status}
                                                            </span>
                                                            <span className="text-[10px] text-white/30 font-mono pl-1">
                                                                {new Date(verification.verifiedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleVerify(reg, "APPROVED")}
                                                            disabled={isVerifying === reg.id || verification?.status === "APPROVED"}
                                                            className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all border border-transparent hover:border-green-500/30"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerify(reg, "REJECTED")}
                                                            disabled={isVerifying === reg.id || verification?.status === "REJECTED"}
                                                            className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all border border-transparent hover:border-red-500/30"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* SEARCH MODE */}
            {activeMode === "search" && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Email, Phone, or Registration ID..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                        >
                            {isSearching ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                            Search
                        </button>
                    </form>
                    {error && <p className="text-red-400 mt-4 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
                </div>
            )}

            {/* SEARCH RESULT (Shared UI modified for Search Mode) */}
            {activeMode === "search" && searchResult && (
                <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/10 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold font-syne">{searchResult.fullName}</h3>
                            <p className="text-sm text-white/50 font-mono">{searchResult.email}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Event</span>
                            <p className="font-semibold text-red-500">{searchResult.eventTitle}</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5">
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-white/40 block mb-1">Registration ID</span>
                                <span className="font-mono text-sm">{searchResult.id}</span>
                            </div>
                            <div>
                                <span className="text-xs text-white/40 block mb-1">Phone</span>
                                <span>{searchResult.phone}</span>
                            </div>
                            <div>
                                <span className="text-xs text-white/40 block mb-1">College</span>
                                <span>{searchResult.collegeName || "-"}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-white/40 block mb-1">UPI Transaction ID</span>
                                <span className="font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded inline-block">
                                    {searchResult.upiTransactionId || "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-white/40 block mb-1">File Upload</span>
                                {searchResult.uploadFileUrl ? (
                                    <a href={searchResult.uploadFileUrl} target="_blank" rel="noopener" className="text-blue-400 hover:underline">View Receipt</a>
                                ) : (
                                    <span className="text-white/30">No file uploaded</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-black/20">
                        <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Verification Actions</h4>

                        {searchVerificationStatus ? (
                            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${searchVerificationStatus.status === "APPROVED" ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {searchVerificationStatus.status === "APPROVED" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                {searchVerificationStatus.status}
                            </div>
                        ) : (
                            <div className="mb-4 text-yellow-500 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Pending Verification
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleVerify(searchResult, "APPROVED")}
                                disabled={!!isVerifying || searchVerificationStatus?.status === "APPROVED"}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                {isVerifying === searchResult.id ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                Approve Payment
                            </button>
                            <button
                                onClick={() => handleVerify(searchResult, "REJECTED")}
                                disabled={!!isVerifying || searchVerificationStatus?.status === "REJECTED"}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:bg-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                {isVerifying === searchResult.id ? <Loader2 className="animate-spin w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                Reject Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
