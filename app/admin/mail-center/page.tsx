"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MailCenter from "@/components/MailCenter";
import { Loader2 } from "lucide-react";

interface Admin {
  id: string;
  email: string;
  role: "superadmin" | "event_coordinator" | "finance_admin";
  name: string;
}

export default function MailCenterPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateAccess();
  }, []);

  const validateAccess = async () => {
    try {
      const adminData = localStorage.getItem("admin");
      if (adminData) {
        const parsedAdmin = JSON.parse(adminData);
        if (parsedAdmin.role !== "superadmin") {
          router.push("/admin");
          return;
        }
        setAdmin(parsedAdmin);
      }

      const response = await fetch("/api/admin/session", {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      if (!data.authenticated || data.admin.role !== "superadmin") {
        router.push("/admin");
        return;
      }

      setAdmin(data.admin);
    } catch (error) {
      console.error("Access validation error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto py-8">
        <MailCenter />
      </div>
    </div>
  );
}
