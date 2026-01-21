"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [session, setSession] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Check localStorage
    const adminData = localStorage.getItem("admin");
    if (adminData) {
      setLocalStorageData(JSON.parse(adminData));
    }

    // Check session cookie via API
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setSession(data.admin);
        } else {
          setError("No active session");
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Session Debug</h1>

      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">localStorage Data:</h2>
          <pre className="text-sm overflow-auto">
            {localStorageData
              ? JSON.stringify(localStorageData, null, 2)
              : "No data"}
          </pre>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Session Cookie Data:</h2>
          <pre className="text-sm overflow-auto">
            {session ? JSON.stringify(session, null, 2) : error || "Loading..."}
          </pre>
        </div>

        <div className="space-x-4">
          <button
            onClick={() => {
              fetch("/api/admin/logout", { method: "POST" })
                .then(() => {
                  localStorage.removeItem("admin");
                  window.location.href = "/admin/login";
                })
                .catch(console.error);
            }}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>

          <a
            href="/admin/login"
            className="inline-block bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </a>

          <a
            href="/admin/dashboard"
            className="inline-block bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
