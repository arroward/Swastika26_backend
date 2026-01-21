"use client";

import { useEffect, useState } from "react";

interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  organization?: string;
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

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/registrations?eventId=${eventId}`,
      );
      const data = await response.json();

      if (data.success) {
        setRegistrations(data.data);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
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
            <th className="py-3 px-4 text-gray-300 font-semibold">
              Organization
            </th>
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
                {registration.organization || "-"}
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
