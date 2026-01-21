import React from "react";
import Link from "next/link";

interface AdminHeaderProps {
  adminName: string;
  adminRole: string;
  onLogout: () => Promise<void>;
}

export default function AdminHeader({
  adminName,
  adminRole,
  onLogout,
}: AdminHeaderProps) {
  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await onLogout();
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-2xl font-bold text-blue-400 hover:text-blue-300"
            >
              Admin Panel
            </Link>
            <div className="hidden sm:block">
              <p className="text-gray-300 text-sm">
                Welcome, <span className="font-semibold">{adminName}</span>
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Role:{" "}
                {adminRole === "superadmin"
                  ? "Super Admin"
                  : "Event Coordinator"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
