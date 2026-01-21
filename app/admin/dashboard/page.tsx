"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import EventSelect from "@/components/EventSelect";
import RegistrationsTable from "@/components/RegistrationsTable";
import AdminManagement from "@/components/AdminManagement";
import EventManagement from "@/components/EventManagement";
import EventRegistrationsList from "@/components/EventRegistrationsList";
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
  const [admins, setAdmins] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "registrations" | "admins" | "events"
  >("registrations");

  // Load admin info from localStorage
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Check localStorage first for quick loading
        const adminData = localStorage.getItem("admin");
        if (!adminData) {
          router.push("/admin/login");
          return;
        }

        // Verify session with server
        const response = await fetch("/api/admin/session");
        const data = await response.json();

        if (!data.authenticated) {
          // Session expired or invalid, clear localStorage and redirect
          localStorage.removeItem("admin");
          router.push("/admin/login");
          return;
        }

        const parsedAdmin = JSON.parse(adminData) as AdminInfo;
        setAdmin(parsedAdmin);
        setIsLoading(false);

        // Fetch events
        fetchEvents(parsedAdmin);
      } catch (error) {
        console.error("Session verification error:", error);
        localStorage.removeItem("admin");
        router.push("/admin/login");
      }
    };

    verifySession();
  }, [router]);

  // Fetch admins when switching to admins tab
  useEffect(() => {
    if (activeTab === "admins" && admin?.role === "superadmin") {
      fetchAdmins();
    }
  }, [activeTab, admin]);

  const fetchEvents = async (adminData: AdminInfo) => {
    try {
      console.log("Fetching events for:", adminData.email, adminData.role);
      const response = await fetch(`/api/admin/events?role=${adminData.role}`);
      const data = await response.json();
      console.log("Events API response:", data);

      if (data.success) {
        console.log("Setting events:", data.data.length);
        setEvents(data.data);
      } else {
        console.error("Failed to fetch events:", data.error);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admin/manage");
      const data = await response.json();
      console.log("Fetched admins data:", data);
      if (data.success) {
        console.log("Setting admins:", data.data);
        setAdmins(data.data);
      } else {
        console.error("Failed to fetch admins:", data.error);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
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
          : `registrations_${new Date().toISOString().split("T")[0]}`;

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
                Total Students Registered:{" "}
                <span className="font-bold text-blue-100">
                  {events.reduce(
                    (sum, event) => sum + event.registeredCount,
                    0,
                  )}
                </span>{" "}
                | Events:{" "}
                <span className="font-bold text-blue-100">{events.length}</span>{" "}
                | Admins:{" "}
                <span className="font-bold text-blue-100">{admins.length}</span>
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-gray-700">
              <button
                onClick={() => setActiveTab("registrations")}
                className={`pb-4 px-4 font-semibold transition ${
                  activeTab === "registrations"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Registrations{" "}
                {registrations.length > 0 && `(${registrations.length})`}
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`pb-4 px-4 font-semibold transition ${
                  activeTab === "events"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Events
              </button>
              <button
                onClick={() => {
                  setActiveTab("admins");
                  fetchAdmins();
                }}
                className={`pb-4 px-4 font-semibold transition ${
                  activeTab === "admins"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Manage Admins
              </button>
            </div>

            {/* Registrations Tab */}
            {activeTab === "registrations" && (
              <>
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
              </>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
              <EventManagement
                onUpdate={() => {
                  if (admin) {
                    fetchEvents(admin);
                  }
                }}
              />
            )}

            {/* Admins Tab */}
            {activeTab === "admins" && (
              <AdminManagement
                admins={admins}
                currentAdminId={admin.id}
                onUpdate={fetchAdmins}
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
                You manage {events.length} event{events.length !== 1 ? "s" : ""}
                . View registered students below.
              </p>
            </div>

            {/* Show all events in cards */}
            {events.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-300">
                  Your Assigned Events
                </h3>
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-6"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white">
                        {event.title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {event.description}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Date: {new Date(event.date).toLocaleDateString()} |
                        Location: {event.location}
                      </p>
                    </div>

                    <EventRegistrationsList eventId={event.id} />
                  </div>
                ))}
              </div>
            )}

            {events.length === 0 && (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-300 text-lg">
                  No events assigned to you yet.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
