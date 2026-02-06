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
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
      <div className="w-full px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Link
              href="/admin"
              className="text-xl sm:text-2xl font-bold text-blue-400 hover:text-blue-300 truncate"
            >
              Admin Panel
            </Link>
            <div className="text-xs sm:text-sm">
              <p className="text-gray-300">
                Welcome,{" "}
                <span className="font-semibold truncate">{adminName}</span>
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Role:{" "}
                {adminRole === "superadmin"
                  ? "Super Admin"
                  : "Event Coordinator"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-200 text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
