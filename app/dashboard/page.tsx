"use client";

import React, { useState, useEffect } from "react";
import UnifiedTicketManagement from "@/components/UnifiedTicketManagement";
import EventManagement from "@/components/EventManagement";
import NotificationManagement from "@/components/NotificationManagement";
import AdminManagement from "@/components/AdminManagement";
import RegistrationsManagement from "@/components/RegistrationsManagement";
import MailCenter from "@/components/MailCenter";
import { DashboardProvider } from "@/components/DashboardContext";
import PaymentVerificationPanel from "@/components/PaymentVerificationPanel";
import {
  Calendar,
  Bell,
  Users,
  CheckCircle,
  LogOut,
  ClipboardList,
  Loader2,
  Mail,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";

type TabType =
  | "registrations"
  | "events"
  | "notifications"
  | "admins"
  | "verify"
  | "verify-payment"
  | "mail";

interface Admin {
  id: string;
  email: string;
  role: "superadmin" | "event_coordinator";
  name: string;
  createdAt: string;
  eventIds?: string[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("registrations");
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    validateSession();
  }, []);

  const validateSession = async () => {
    try {
      setLoading(true);
      setSessionError(null);

      // First check localStorage for quick UI update
      const adminData = localStorage.getItem("admin");
      if (adminData) {
        const parsedAdmin = JSON.parse(adminData);
        setAdmin(parsedAdmin);
      }

      // Validate session with server
      const response = await fetch("/api/admin/session", {
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        setSessionError("Session expired");
        localStorage.removeItem("admin");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
        return;
      }

      if (!response.ok) {
        throw new Error(`Session check failed (${response.status})`);
      }

      const data = await response.json();

      if (!data.authenticated) {
        throw new Error("Not authenticated");
      }

      // Update admin data from server
      setAdmin(data.admin);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      // Fetch admins if superadmin
      if (data.admin.role === "superadmin") {
        await fetchAdmins();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Session validation error:", error);
      setSessionError(
        error instanceof Error ? error.message : "Session validation failed",
      );
      localStorage.removeItem("admin");

      // Redirect to login after a brief delay to show error
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admin/manage");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();

      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response text:", text);
        setAdmins([]);
        setLoading(false);
        return;
      }

      if (data.success) {
        const adminsData = data.admins || data.data;
        if (Array.isArray(adminsData)) {
          setAdmins(adminsData);
        } else {
          console.error("Invalid response format:", data);
          setAdmins([]);
        }
      } else {
        console.error("API returned success: false", data);
        setAdmins([]);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("admin");
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {sessionError ? sessionError : "Loading dashboard..."}
          </p>
          {sessionError && (
            <p className="text-gray-500 text-sm mt-2">
              Redirecting to login...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* ... (rest of the component) */}
        {/* Header */}
        <div className="bg-black/40 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
          <div className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
            <div className="flex items-center justify-between gap-3">
              {/* ... content ... */}
              <div className="min-w-0 flex items-center gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-syne font-bold tracking-tight truncate">
                    Swastika '26
                  </h1>
                  <p className="hidden sm:block text-[10px] font-mono text-white/50 uppercase tracking-widest">
                    Admin Dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-white/50 text-[10px] font-mono">Welcome,</div>
                  <div className="font-syne font-semibold text-sm truncate max-w-[150px]">
                    {admin.name}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-medium transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-black/20 border-b border-white/10 backdrop-blur-sm overflow-x-auto">
          <div className="w-full px-3 sm:px-4 lg:px-6">
            <div className="flex gap-1 overflow-x-auto pb-0 min-w-min">
              <TabButton
                active={activeTab === "registrations"}
                onClick={() => setActiveTab("registrations")}
                icon={<ClipboardList className="w-4 h-4" />}
                label="Registrations"
              />
              {/* Events - Superadmin Only */}
              {admin.role === "superadmin" && (
                <TabButton
                  active={activeTab === "events"}
                  onClick={() => setActiveTab("events")}
                  icon={<Calendar className="w-4 h-4" />}
                  label="Events"
                />
              )}
              {/* Notifications - Superadmin Only */}
              {admin.role === "superadmin" && (
                <TabButton
                  active={activeTab === "notifications"}
                  onClick={() => setActiveTab("notifications")}
                  icon={<Bell className="w-4 h-4" />}
                  label="Notifications"
                />
              )}
              {/* Admin Management - Superadmin Only */}
              {admin.role === "superadmin" && (
                <TabButton
                  active={activeTab === "admins"}
                  onClick={() => setActiveTab("admins")}
                  icon={<Users className="w-4 h-4" />}
                  label="Admin Management"
                />
              )}
              {/* Mail Center - Superadmin Only */}
              {admin.role === "superadmin" && (
                <TabButton
                  active={activeTab === "mail"}
                  onClick={() => setActiveTab("mail")}
                  icon={<Mail className="w-4 h-4" />}
                  label="Mail Center"
                />
              )}

              {/* Payment Verification - Superadmin Only */}
              {admin.role === "superadmin" && (
                <TabButton
                  active={activeTab === "verify-payment"}
                  onClick={() => setActiveTab("verify-payment")}
                  icon={<CreditCard className="w-4 h-4" />}
                  label="Payment Verification"
                />
              )}

              {/* Ticket Verification - Superadmin Only */}
              {admin.role === "superadmin" && (
                <TabButton
                  active={activeTab === "verify"}
                  onClick={() => setActiveTab("verify")}
                  icon={<CheckCircle className="w-4 h-4" />}
                  label="Ticket Verification"
                />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
          {activeTab === "verify-payment" && admin.role === "superadmin" && (
            <PaymentVerificationPanel />
          )}
          {activeTab === "verify" && admin.role === "superadmin" && (
            <UnifiedTicketManagement />
          )}
          {activeTab === "registrations" && (
            <RegistrationsManagement adminId={admin.id} role={admin.role} />
          )}
          {activeTab === "events" && admin.role === "superadmin" && (
            <EventManagement onUpdate={() => { }} />
          )}
          {activeTab === "notifications" && admin.role === "superadmin" && (
            <NotificationManagement />
          )}
          {activeTab === "admins" && admin.role === "superadmin" && (
            <AdminManagement
              admins={admins}
              currentAdminId={admin.id}
              onUpdate={fetchAdmins}
            />
          )}
          {activeTab === "mail" && admin.role === "superadmin" && <MailCenter />}
        </div>
      </div>
    </DashboardProvider>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
                flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all relative whitespace-nowrap font-mono
                ${active
          ? "text-white bg-white/10"
          : "text-white/50 hover:text-white hover:bg-white/5"
        }
            `}
    >
      {icon}
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
      )}
    </button>
  );
}
