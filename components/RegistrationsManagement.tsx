"use client";

import { useState, useEffect } from "react";
import RegistrationsTable from "./RegistrationsTable";
import { StatsSkeleton, TableSkeleton } from "./SkeletonLoaders";

interface Event {
    id: string;
    title: string;
}

interface Registration {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    collegeName?: string;
    universityName?: string;
    teamSize?: number;
    upiTransactionId?: string;
    accountHolderName?: string;
    uploadFileUrl?: string;
    registrationDate: string;
    eventId: string;
    eventTitle?: string;
}

interface RegistrationsManagementProps {
    adminId: string;
    role: "superadmin" | "event_coordinator";
}

export default function RegistrationsManagement({ adminId, role }: RegistrationsManagementProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("all");
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        fetchRegistrations();
    }, [selectedEventId]);

    const fetchEvents = async () => {
        try {
            // Get admin from localStorage to pass role
            const adminData = localStorage.getItem('admin');
            const admin = adminData ? JSON.parse(adminData) : null;

            // Use the admin events API with role parameter
            const url = admin ? `/api/admin/events?role=${admin.role}` : '/api/admin/events';
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();

            // API now returns direct array
            setEvents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching events:", error);
            setEvents([]);
            setError("Failed to load events");
        }
    };

    const fetchRegistrations = async () => {
        setIsLoading(true);
        setError("");
        try {
            // Use the admin registrations API with role and optionally eventId
            let url = `/api/admin/registrations?role=${role}`;
            if (selectedEventId !== "all") {
                url += `&eventId=${selectedEventId}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch registrations");
            }

            setRegistrations(data.success ? data.data : data);
        } catch (err: any) {
            console.error("Error fetching registrations:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (format: "csv" | "pdf") => {
        if (format === "pdf") {
            alert("PDF Export is currently handled by the print function of your browser. Use Ctrl+P on the registrations table.");
            return;
        }

        // Simple Client-side CSV Export
        try {
            if (registrations.length === 0) {
                alert("No registrations to export");
                return;
            }

            const headers = Object.keys(registrations[0]).join(",");
            const csvContent = [
                headers,
                ...registrations.map(reg =>
                    Object.values(reg).map(val =>
                        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
                    ).join(",")
                )
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", `registrations_${selectedEventId}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err: any) {
            console.error("Download error:", err);
            alert("Failed to download: " + err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this registration? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/registrations/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete");
            }

            // Remove from state
            setRegistrations(prev => prev.filter(r => r.id !== id));
            alert("Registration deleted successfully");
        } catch (err: any) {
            console.error("Delete error:", err);
            alert("Failed to delete: " + err.message);
        }
    };

    const selectedEvent = Array.isArray(events) ? events.find((e) => e.id === selectedEventId) : null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-syne font-bold text-white mb-2">
                            Event Registrations
                        </h2>
                        <p className="text-white/50 text-sm">
                            View and manage all event registrations
                        </p>
                    </div>

                    {/* Event Filter */}
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Filter by Event:</label>
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-red-500 transition-all"
                        >
                            <option value="all">All Events</option>
                            {events.map((event) => (
                                <option key={event.id} value={event.id}>
                                    {event.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <h2 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Total Registrations</h2>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-syne font-bold text-white">{registrations.length}</span>
                        <span className="text-xs font-mono text-blue-400 mb-2">entries</span>
                    </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <h2 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Total Participants</h2>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-syne font-bold text-white">
                            {registrations.reduce(
                                (sum, reg) => sum + (reg.teamSize || 1),
                                0
                            )}
                        </span>
                        <span className="text-xs font-mono text-green-400 mb-2">people</span>
                    </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <h2 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Active Events</h2>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-syne font-bold text-white">{events.length}</span>
                        <span className="text-xs font-mono text-purple-400 mb-2">events</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl">
                    <span className="font-mono text-sm">{error}</span>
                </div>
            )}

            {/* Registrations Table */}
            <RegistrationsTable
                registrations={registrations}
                eventTitle={selectedEvent?.title}
                isLoading={isLoading}
                onDownload={handleDownload}
                onDelete={handleDelete}
                userRole={role}
            />
        </div>
    );
}
