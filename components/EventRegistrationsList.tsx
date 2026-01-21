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
}

export default function EventRegistrationsList({
  eventId,
}: EventRegistrationsListProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="mb-2 text-sm text-gray-400">
        Total Registrations: {registrations.length}
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
