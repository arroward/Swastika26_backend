"use client";

import { useState, useEffect } from "react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  category: string;
  capacity: number;
  registeredCount: number;
}

interface EventManagementProps {
  onUpdate: () => void;
}

export default function EventManagement({ onUpdate }: EventManagementProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    imageUrl: "",
    category: "",
    capacity: 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      location: "",
      imageUrl: "",
      category: "",
      capacity: 100,
    });
    setError("");
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsCreating(false);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split("T")[0], // Format date for input
      location: event.location,
      imageUrl: event.imageUrl,
      category: event.category,
      capacity: event.capacity,
    });
    setError("");
  };

  const handleCancel = () => {
    setEditingEvent(null);
    setIsCreating(false);
    setFormData({
      title: "",
      description: "",
      date: "",
      location: "",
      imageUrl: "",
      category: "",
      capacity: 100,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isCreating) {
        // Create new event
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create event");
        }
      } else if (editingEvent) {
        // Update existing event
        const response = await fetch(`/api/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update event");
        }
      }

      handleCancel();
      fetchEvents();
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the event "${eventTitle}"? This will also delete all registrations for this event.`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete event");
      }

      fetchEvents();
      onUpdate();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Event Management</h2>
          <p className="text-gray-400 mt-1">Create, edit, and manage events</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition flex items-center gap-2"
          disabled={loading}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Event
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded">
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          <p className="text-lg mb-4">No events found</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
          >
            Create First Event
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-750">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">
                          {event.title}
                        </div>
                        <div className="text-xs text-gray-400 line-clamp-1">
                          {event.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {event.location}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {event.capacity}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`font-medium ${
                        event.registeredCount >= event.capacity
                          ? "text-red-400"
                          : event.registeredCount >= event.capacity * 0.8
                            ? "text-yellow-400"
                            : "text-green-400"
                      }`}
                    >
                      {event.registeredCount}
                    </span>
                    <span className="text-gray-500"> / {event.capacity}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      className="text-red-400 hover:text-red-300"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(editingEvent || isCreating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {isCreating
                ? "Create New Event"
                : `Edit Event: ${editingEvent?.title}`}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Competition">Competition</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter a URL for the event image
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Capacity *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Maximum number of participants
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition"
                >
                  {loading
                    ? "Processing..."
                    : isCreating
                      ? "Create Event"
                      : "Update Event"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
