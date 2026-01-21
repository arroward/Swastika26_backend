"use client";

import AdminLoginForm from "@/components/AdminLoginForm";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if already logged in
    const admin = localStorage.getItem("admin");
    if (admin) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store admin info in localStorage
      localStorage.setItem("admin", JSON.stringify(data.admin));

      // Redirect to dashboard
      router.push("/admin/dashboard");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return <AdminLoginForm onLogin={handleLogin} isLoading={isLoading} />;
}
