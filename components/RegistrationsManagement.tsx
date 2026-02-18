"use client";

import { useState, useEffect } from "react";
import RegistrationsTable from "./RegistrationsTable";
import { useDashboard } from "./DashboardContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RegistrationsManagementProps {
  adminId: string;
  role: "superadmin" | "event_coordinator" | "finance_admin";
}

type TabType = "online" | "mainstage";

export default function RegistrationsManagement({
  adminId,
  role,
}: RegistrationsManagementProps) {
  const {
    events,
    registrations,
    isRegistrationsLoading: isLoading,
    registrationsError: error,
    fetchEvents,
    fetchRegistrations,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<TabType>("online");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

  useEffect(() => {
    fetchEvents(role);
  }, []);

  useEffect(() => {
    fetchRegistrations(role, selectedEventId);
  }, [selectedEventId]); // Re-fetch when event filter changes

  // Filter Events based on Active Tab
  // Online = isOnline: true
  // Mainstage = isOnline: false (Offline events)
  const filteredEvents = events.filter(e => {
    // In case isOnline is undefined, treat as null.
    if (activeTab === 'online') return e.isOnline === true;
    if (activeTab === 'mainstage') return e.isOnline !== true;
    return true;
  });

  // Filter Registrations based on Active Tab
  // We need to match registrations to the events that belong to the active tab
  const activeEventIds = new Set(filteredEvents.map(e => e.id));

  const currentData = registrations.filter(reg => {
    // 1. Must belong to an event in the current tab
    if (!activeEventIds.has(reg.eventId)) return false;

    // 2. If a specific event is selected, match that
    if (selectedEventId !== 'all' && reg.eventId !== selectedEventId) return false;

    return true;
  });

  const selectedEvent = Array.isArray(events)
    ? events.find((e) => e.id === selectedEventId)
    : null;

  const handleDownload = async (format: "csv" | "pdf") => {
    if (currentData.length === 0) {
      alert("No registrations to export");
      return;
    }

    // 1. Filter and Format Data based on Role
    const filteredData = currentData.map((reg, index) => {
      // Helper to format team members
      let teamDetails = "N/A";
      if (reg.teamMembers) {
        try {
          const parsed =
            typeof reg.teamMembers === "string"
              ? JSON.parse(reg.teamMembers)
              : reg.teamMembers;

          if (Array.isArray(parsed)) {
            teamDetails = parsed
              .map((m: any, idx: number) => {
                // Handle string array
                if (typeof m === "string") return `• ${m}`;

                // Handle object array with fallbacks
                const name =
                  m.name || m.fullName || m.userName || `Member ${idx + 1}`;
                const email = m.email || m.emailAddress || "";
                // Only show email if it exists
                return email ? `• ${name} (${email})` : `• ${name}`;
              })
              .join("\n");
          } else if (typeof parsed === "object") {
            // If it's an object (key-value), format nicely
            teamDetails = Object.entries(parsed)
              .map(([k, v]) => `• ${k}: ${v}`)
              .join("\n");
          } else {
            teamDetails = String(parsed);
          }
        } catch (e) {
          teamDetails = String(reg.teamMembers);
        }
      }

      // Base fields visible to everyone
      const base = {
        "Sl No": currentData.length - index,
        Name: reg.fullName,
        Email: reg.email,
        Phone: reg.phone,
        College: reg.collegeName || "N/A",
        University: reg.universityName || "N/A",
        Event: reg.eventTitle || "N/A",
        Size: reg.teamSize || 1,
        "Team Members": teamDetails,
        Date: new Date(reg.registrationDate).toLocaleDateString(),
      };

      return base;
    });

    if (format === "csv") {
      try {
        const headers = Object.keys(filteredData[0]).join(",");
        const csvContent = [
          headers,
          ...filteredData.map((reg) =>
            Object.values(reg)
              .map((val) =>
                typeof val === "string" ? `"${String(val).replace(/"/g, '""')}"` : val,
              )
              .join(","),
          ),
        ].join("\n");

        // Add BOM for Excel UTF-8 compatibility
        const blob = new Blob(["\uFEFF" + csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;

        // Generate filename
        const filenameDate = new Date().toISOString().split("T")[0];
        const tabName = activeTab;

        link.setAttribute(
          "download",
          `registrations_${tabName}_${filenameDate}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err: any) {
        console.error("CSV Download error:", err);
        alert("Failed to download CSV: " + err.message);
      }
    } else if (format === "pdf") {
      try {
        // Landscape for max width
        const doc = new jsPDF({ orientation: "landscape" });

        // Colors
        const accentColor = [220, 38, 38]; // Red-600

        // Header
        doc.setFontSize(14);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(`Swastika '26 - Registrations (${activeTab.toUpperCase()})`, 14, 15);

        doc.setFontSize(9);
        doc.setTextColor(100);
        const generatedBy = role;
        doc.text(`Generated by: ${generatedBy}`, 14, 20);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 24);
        doc.text(`Total Records: ${filteredData.length}`, 14, 28);

        const columns = Object.keys(filteredData[0]);
        const rows = filteredData.map((obj) => Object.values(obj));

        autoTable(doc, {
          head: [columns],
          body: rows,
          startY: 40,
          theme: "grid",
          styles: {
            fontSize: 8, // Readable size for landscape
            cellPadding: 3,
            overflow: "linebreak",
            valign: "middle",
          },
          headStyles: {
            fillColor: [220, 38, 38], // Red
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
          },
          columnStyles: {
            0: { cellWidth: 10, halign: "center" }, // Sl No
            1: { cellWidth: 25 }, // Name
            2: { cellWidth: 40 }, // Email
            3: { cellWidth: 22 }, // Phone
            4: { cellWidth: 20 }, // College
            5: { cellWidth: 20 }, // Uni
            6: { cellWidth: 20 }, // Event
            7: { cellWidth: 10, halign: "center" }, // Size
            8: { cellWidth: 80 }, // Team Members - Explicit large width
            9: { cellWidth: 20 }, // Date
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          margin: { top: 40, left: 7, right: 7 }, // Maximize print area
        });

        const filenameDate = new Date().toISOString().split("T")[0];
        doc.save(`registrations_${activeTab}_${filenameDate}.pdf`);
      } catch (err: any) {
        console.error("PDF Download error:", err);
        alert(
          "Failed to generate PDF. Make sure you are using a modern browser.",
        );
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this registration? This action cannot be undone.",
      )
    ) {
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

      fetchRegistrations(role, selectedEventId);
      alert("Registration deleted successfully");
    } catch (err: any) {
      console.error("Delete error:", err);
      alert("Failed to delete: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/5 p-4 sm:p-6 lg:p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-syne font-bold text-white mb-2">
              Event Registrations
            </h2>
            <p className="text-white/50 text-sm">
              View and manage all event registrations
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
            {/* Tabs: Online vs Mainstage (Live Events) */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => { setActiveTab('online'); setSelectedEventId('all'); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'online' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Online
              </button>
              <button
                onClick={() => { setActiveTab('mainstage'); setSelectedEventId('all'); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'mainstage' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Mainstage
              </button>
            </div>

            {/* Event Filter - Filtered by Active Tab */}
            <div className="w-full lg:w-auto bg-black/20 p-1.5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="text-xs font-mono text-white/50 uppercase tracking-wider px-2 hidden sm:block">
                Event:
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-black/40 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 transition-all text-sm w-full lg:w-[250px] truncate"
              >
                <option value="all">All {activeTab === 'online' ? 'Online' : 'Mainstage'} Events</option>
                {filteredEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
          <h2 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">
            Displayed Registrations
          </h2>
          <div className="flex items-end gap-2">
            {isLoading ? (
              <div className="h-10 w-24 bg-white/10 rounded animate-pulse mb-1"></div>
            ) : (
              <span className="text-4xl font-syne font-bold text-white animate-in fade-in slide-in-from-bottom-2 duration-500">
                {currentData.length}
              </span>
            )}
            <span className="text-xs font-mono text-blue-400 mb-2">
              entries
            </span>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
          <h2 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">
            Total Participants
          </h2>
          <div className="flex items-end gap-2">
            {isLoading ? (
              <div className="h-10 w-24 bg-white/10 rounded animate-pulse mb-1"></div>
            ) : (
              <span className="text-4xl font-syne font-bold text-white animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">
                {currentData.reduce(
                  (sum, reg) => sum + (Number(reg.teamSize) || 1),
                  0,
                )}
              </span>
            )}
            <span className="text-xs font-mono text-green-400 mb-2">
              people
            </span>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
          <h2 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">
            Category
          </h2>
          <div className="flex items-end gap-2">
            <span className={`text-2xl font-syne font-bold uppercase mt-2 ${activeTab === 'online' ? 'text-blue-400' : 'text-orange-400'}`}>
              {activeTab} Events
            </span>
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
        registrations={currentData}
        eventTitle={selectedEvent?.title || `All ${activeTab === 'online' ? 'Online' : 'Mainstage'} Events`}
        isLoading={isLoading}
        onDownload={handleDownload}
        onDelete={handleDelete}
        userRole={role}
      />
    </div>
  );
}
