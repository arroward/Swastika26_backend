"use client";

import { useEffect, useState } from "react";

interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName?: string;
  universityName?: string;
  teamSize?: number;
  teamMembers?: string[];
  registrationDate: string;
}

interface EventRegistrationsListProps {
  eventId: string;
  eventTitle?: string;
}

export default function EventRegistrationsList({
  eventId,
  eventTitle,
}: EventRegistrationsListProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching registrations for event:", eventId);
      const response = await fetch(`/api/events/${eventId}/registrations`);
      const data = await response.json();

      console.log("API response:", data);

      if (data.success) {
        setRegistrations(data.data);
      } else {
        console.error("Failed to fetch registrations:", data.error);
        setError(data.error || "Failed to load registrations");
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setError("Error loading registrations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format: "csv" | "pdf") => {
    setIsDownloading(true);
    try {
      const url = new URL("/api/admin/download", window.location.origin);
      url.searchParams.set("eventId", eventId);
      url.searchParams.set("role", "event_coordinator");
      url.searchParams.set("format", format);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const filename = `${eventTitle || eventId}_registrations_${new Date().toISOString().split("T")[0]}`;
      link.setAttribute("download", `${filename}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading:", error);
      alert("Failed to download registrations");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400">Loading registrations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 bg-red-900/20 border border-red-700 rounded">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-900 rounded">
        <p className="text-gray-400">No registrations yet for this event.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Total Registrations: {registrations.length}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload("csv")}
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition duration-200 flex items-center gap-2 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {isDownloading ? "Downloading..." : "CSV"}
          </button>
          <button
            onClick={() => handleDownload("pdf")}
            disabled={isDownloading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition duration-200 flex items-center gap-2 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            {isDownloading ? "Downloading..." : "PDF"}
          </button>
        </div>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-3 px-4 text-gray-300 font-semibold">Name</th>
            <th className="py-3 px-4 text-gray-300 font-semibold">Email</th>
            <th className="py-3 px-4 text-gray-300 font-semibold">Phone</th>
            <th className="py-3 px-4 text-gray-300 font-semibold">College</th>
            <th className="py-3 px-4 text-gray-300 font-semibold">
              University
            </th>
            <th className="py-3 px-4 text-gray-300 font-semibold">Team Size</th>
            <th className="py-3 px-4 text-gray-300 font-semibold">
              Registered On
            </th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((registration) => (
            <tr
              key={registration.id}
              className="border-b border-gray-800 hover:bg-gray-750 transition"
            >
              <td className="py-3 px-4 text-white">{registration.fullName}</td>
              <td className="py-3 px-4 text-gray-300">{registration.email}</td>
              <td className="py-3 px-4 text-gray-300">{registration.phone}</td>
              <td className="py-3 px-4 text-gray-300">
                {registration.collegeName || "-"}
              </td>
              <td className="py-3 px-4 text-gray-300">
                {registration.universityName || "-"}
              </td>
              <td className="py-3 px-4 text-gray-300">
                {registration.teamSize || 1}
              </td>
              <td className="py-3 px-4 text-gray-400">
                {new Date(registration.registrationDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
