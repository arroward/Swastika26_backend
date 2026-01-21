import React from "react";
import { Event } from "@/types/event";

interface EventSelectProps {
  events: Event[];
  selectedEventId: string | null;
  onEventSelect: (eventId: string) => void;
  isLoading: boolean;
}

export default function EventSelect({
  events,
  selectedEventId,
  onEventSelect,
  isLoading,
}: EventSelectProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-400">No events available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <label
        htmlFor="event-select"
        className="block text-gray-300 mb-2 font-semibold"
      >
        Select Event
      </label>
      <select
        id="event-select"
        value={selectedEventId || ""}
        onChange={(e) => onEventSelect(e.target.value)}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
      >
        <option value="">-- Select an event --</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.title} ({event.registeredCount}/{event.capacity} registered)
          </option>
        ))}
      </select>
    </div>
  );
}
