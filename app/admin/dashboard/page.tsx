"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import EventSelect from "@/components/EventSelect";
import RegistrationsTable from "@/components/RegistrationsTable";
import { Event } from "@/types/event";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AdminInfo {
  id: string;
  email: string;
  name: string;
  role: "superadmin" | "event_coordinator";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load admin info from localStorage
  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    if (!adminData) {
      router.push("/admin/login");
      return;
    }

    const parsedAdmin = JSON.parse(adminData) as AdminInfo;
    setAdmin(parsedAdmin);
    setIsLoading(false);

    // Fetch events
    fetchEvents(parsedAdmin);
  }, [router]);

  const fetchEvents = async (adminData: AdminInfo) => {
    try {
      const response = await fetch(`/api/admin/events?role=${adminData.role}`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchRegistrations = async (eventId?: string) => {
    if (!admin) return;

    setIsLoadingData(true);
    try {
      const url = new URL("/api/admin/registrations", window.location.origin);
      url.searchParams.set("role", admin.role);

      if (admin.role === "event_coordinator" && eventId) {
        url.searchParams.set("eventId", eventId);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.success) {
        setRegistrations(data.data);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    fetchRegistrations(eventId);
  };

  const handleDownload = async (format: "csv" | "pdf") => {
    if (!admin) return;

    try {
      const url = new URL("/api/admin/download", window.location.origin);
      url.searchParams.set("role", admin.role);
      url.searchParams.set("format", format);

      if (admin.role === "event_coordinator" && selectedEventId) {
        url.searchParams.set("eventId", selectedEventId);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const filename =
        admin.role === "superadmin"
          ? `all_registrations_${new Date().toISOString().split("T")[0]}`
          : selectedEventId
            ? `registrations_${selectedEventId}_${new Date().toISOString().split("T")[0]}`
            : "registrations";

      link.setAttribute("download", `${filename}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading:", error);
      alert("Failed to download registrations");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      localStorage.removeItem("admin");
      router.push("/admin/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminHeader
        adminName={admin.name}
        adminRole={admin.role}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Super Admin View */}
        {admin.role === "superadmin" && (
          <div className="space-y-8">
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-100 mb-2">
                Super Admin Access
              </h2>
              <p className="text-blue-200">
                You have access to all participant data across all events.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedEventId(null);
                fetchRegistrations();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition duration-200"
            >
              View All Registrations
            </button>

            {registrations.length > 0 && (
              <RegistrationsTable
                registrations={registrations}
                isLoading={isLoadingData}
                onDownload={handleDownload}
              />
            )}
          </div>
        )}

        {/* Event Coordinator View */}
        {admin.role === "event_coordinator" && (
          <div className="space-y-8">
            <div className="bg-green-900 border border-green-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-green-100 mb-2">
                Event Coordinator Access
              </h2>
              <p className="text-green-200">
                You can view and download registrations for the events you
                manage.
              </p>
            </div>

            <EventSelect
              events={events}
              selectedEventId={selectedEventId}
              onEventSelect={handleEventSelect}
              isLoading={isLoadingData}
            />

            {selectedEventId && registrations.length > 0 && (
              <RegistrationsTable
                registrations={registrations}
                eventTitle={events.find((e) => e.id === selectedEventId)?.title}
                isLoading={isLoadingData}
                onDownload={handleDownload}
              />
            )}

            {selectedEventId &&
              registrations.length === 0 &&
              !isLoadingData && (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-300 text-lg">
                    No registrations for this event yet.
                  </p>
                </div>
              )}
          </div>
        )}
      </main>
    </div>
  );
}
