"use client";

import { useEffect, useState } from "react";
import { Event } from "@/types/event";

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
    registrationFee: 0,
    isOnline: false,
    rules: "[]",
    priceAmount: 0,
  });
  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    imageUrl: "",
    category: "",
    capacity: "",
    registrationFee: "",
    isOnline: "",
    rules: "",
    priceAmount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/events");
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : data.data || []);
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
      registrationFee: 0,
      isOnline: false,
      rules: "[]",
      priceAmount: 0,
    });
    setFieldErrors({
      title: "",
      description: "",
      date: "",
      location: "",
      imageUrl: "",
      category: "",
      capacity: "",
      registrationFee: "",
      isOnline: "",
      rules: "",
      priceAmount: "",
    });
    setError("");
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsCreating(false);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split("T")[0],
      location: event.location,
      imageUrl: event.imageUrl,
      category: event.category,
      capacity: event.capacity,
      registrationFee: event.registrationFee || 0,
      isOnline: event.isOnline || false,
      rules: JSON.stringify(event.rules || []),
      priceAmount: event.priceAmount || 0,
    });
    setFieldErrors({
      title: "",
      description: "",
      date: "",
      location: "",
      imageUrl: "",
      category: "",
      capacity: "",
      registrationFee: "",
      isOnline: "",
      rules: "",
      priceAmount: "",
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
      registrationFee: 0,
      isOnline: false,
      rules: "[]",
      priceAmount: 0,
    });
    setFieldErrors({
      title: "",
      description: "",
      date: "",
      location: "",
      imageUrl: "",
      category: "",
      capacity: "",
      registrationFee: "",
      isOnline: "",
      rules: "",
      priceAmount: "",
    });
    setError("");
  };

  const validateForm = () => {
    const errors = {
      title: "",
      description: "",
      date: "",
      location: "",
      imageUrl: "",
      category: "",
      capacity: "",
      registrationFee: "",
      isOnline: "",
      rules: "",
      priceAmount: "",
    };

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.imageUrl.trim()) errors.imageUrl = "Image URL is required";
    if (!formData.category) errors.category = "Category is required";

    if (!Number.isFinite(formData.capacity) || formData.capacity < 1) {
      errors.capacity = "Capacity must be at least 1";
    }

    if (
      !Number.isFinite(formData.registrationFee) ||
      formData.registrationFee < 0
    ) {
      errors.registrationFee = "Fee must be 0 or more";
    }

    if (!Number.isFinite(formData.priceAmount) || formData.priceAmount < 0) {
      errors.priceAmount = "Price amount must be 0 or more";
    }

    try {
      const parsedRules = JSON.parse(formData.rules || "[]");
      if (!Array.isArray(parsedRules)) {
        errors.rules = "Rules must be a JSON array";
      }
    } catch {
      errors.rules = "Rules must be valid JSON";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      if (selectedDate < today) {
        errors.date = "Date cannot be in the past";
      }
    }

    setFieldErrors(errors);
    return !Object.values(errors).some((value) => value !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    setError("");

    try {
      const parsedRules = JSON.parse(formData.rules || "[]");

      if (isCreating) {
        // Create new event
        const response = await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            capacity: Number(formData.capacity),
            registrationFee: Number(formData.registrationFee),
            priceAmount: Number(formData.priceAmount),
            rules: parsedRules,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create event");
        }
      } else if (editingEvent) {
        // Update existing event
        const response = await fetch(`/api/admin/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            capacity: Number(formData.capacity),
            registrationFee: Number(formData.registrationFee),
            priceAmount: Number(formData.priceAmount),
            rules: parsedRules,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update event");
        }
      }

      handleCancel();
      await fetchEvents();
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
        `Are you sure you want to delete event "${eventTitle}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete event");
      }

      await fetchEvents();
      onUpdate();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10 backdrop-blur-sm overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-syne font-bold text-white mb-1 sm:mb-2 truncate">
              Event Management
            </h2>
            <p className="text-white/50 text-xs sm:text-sm">
              Create, edit, and manage events
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 font-syne uppercase tracking-wider text-xs sm:text-sm flex-shrink-0"
            disabled={loading}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
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
            <span className="hidden sm:inline">Add New Event</span>
            <span className="sm:hidden">Add Event</span>
          </button>
        </div>

        {error && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg sm:rounded-xl text-xs sm:text-sm">
            <span className="font-mono">{error}</span>
          </div>
        )}

        {events.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-white/50">
            <p className="text-base sm:text-lg mb-4 font-mono">
              No events found
            </p>
            <button
              onClick={handleCreate}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-lg sm:rounded-xl transition-all shadow-lg shadow-red-900/20 text-sm sm:text-base"
            >
              Create First Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/20 border-b border-white/10">
                <tr>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-mono text-white/50 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="hidden md:table-cell px-4 lg:px-6 py-4 text-left text-xs font-mono text-white/50 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-mono text-white/50 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-mono text-white/50 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-mono text-white/50 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-mono text-white/50 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-white/5 transition-colors text-xs sm:text-sm"
                  >
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        {event.imageUrl && (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl object-cover border border-white/10 flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-white truncate">
                            {event.title}
                          </div>
                          <div className="text-xs text-white/50 line-clamp-1 hidden sm:block">
                            {event.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 lg:px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-mono border border-blue-500/30">
                        {event.category}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-white/70 font-mono whitespace-nowrap">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 text-sm text-white/70">
                      {event.location}
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-white/70 font-mono whitespace-nowrap">
                      <span
                        className={`font-medium ${event.registeredCount >= event.capacity
                          ? "text-red-400"
                          : event.registeredCount >= event.capacity * 0.8
                            ? "text-yellow-400"
                            : "text-green-400"
                          }`}
                      >
                        {event.registeredCount}
                      </span>
                      <span className="text-white/30"> / {event.capacity}</span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-400 hover:text-blue-300 font-mono transition-colors text-xs sm:text-sm"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          className="text-red-400 hover:text-red-300 font-mono transition-colors text-xs sm:text-sm"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(editingEvent || isCreating) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-3 sm:p-4">
          <div
            className="bg-[#111] border border-white/10 rounded-2xl sm:rounded-3xl w-full max-w-2xl mx-auto shadow-2xl flex flex-col"
            style={{ height: "calc(100vh - 1.5rem)", maxHeight: "900px" }}
          >
            {/* Fixed Header */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg sm:text-2xl font-syne font-bold text-white truncate">
                {isCreating
                  ? "Create New Event"
                  : `Edit Event: ${editingEvent?.title}`}
              </h3>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/40 border border-white/10 text-white rounded-lg sm:rounded-xl focus:outline-none focus:border-red-500 transition-all text-sm"
                    required
                  />
                  {fieldErrors.title && (
                    <p className="text-red-400 text-xs mt-1">
                      {fieldErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/40 border border-white/10 text-white rounded-lg sm:rounded-xl focus:outline-none focus:border-red-500 transition-all resize-none text-sm"
                    required
                  />
                  {fieldErrors.description && (
                    <p className="text-red-400 text-xs mt-1">
                      {fieldErrors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/40 border border-white/10 text-white rounded-lg sm:rounded-xl focus:outline-none focus:border-red-500 transition-all text-sm"
                      required
                    />
                    {fieldErrors.date && (
                      <p className="text-red-400 text-xs mt-1">
                        {fieldErrors.date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/40 border border-white/10 text-white rounded-lg sm:rounded-xl focus:outline-none focus:border-red-500 transition-all text-sm"
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
                    {fieldErrors.category && (
                      <p className="text-red-400 text-xs mt-1">
                        {fieldErrors.category}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/40 border border-white/10 text-white rounded-lg sm:rounded-xl focus:outline-none focus:border-red-500 transition-all text-sm"
                    required
                  />
                  {fieldErrors.location && (
                    <p className="text-red-400 text-xs mt-1">
                      {fieldErrors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/40 border border-white/10 text-white rounded-lg sm:rounded-xl focus:outline-none focus:border-red-500 transition-all placeholder-white/20 text-sm"
                  />
                  <p className="text-xs text-white/40 mt-1.5 font-mono">
                    Enter a URL for the event image
                  </p>
                  {fieldErrors.imageUrl && (
                    <p className="text-red-400 text-xs mt-1">
                      {fieldErrors.imageUrl}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
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
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/40 border border-white/10 text-white rounded-lg sm:rounded-xl focus:outline-none focus:border-red-500 transition-all text-sm"
                      required
                    />
                    {fieldErrors.capacity && (
                      <p className="text-red-400 text-xs mt-1">
                        {fieldErrors.capacity}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                      Registration Fee
                    </label>
                    <input
                      type="number"
                      value={formData.registrationFee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationFee: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/40 border border-white/10 text-white rounded-lg sm:rounded-xl focus:outline-none focus:border-red-500 transition-all text-sm"
                    />
                    {fieldErrors.registrationFee && (
                      <p className="text-red-400 text-xs mt-1">
                        {fieldErrors.registrationFee}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky Footer with Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 lg:p-8 border-t border-white/10 flex-shrink-0 bg-[#111]">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 sm:py-4 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all font-syne uppercase tracking-widest shadow-lg shadow-red-900/20 text-sm"
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
                  className="w-full sm:flex-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-4 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all border border-white/10 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
