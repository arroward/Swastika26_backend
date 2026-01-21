"use client";

import { useState, useEffect } from "react";

interface Admin {
  id: string;
  email: string;
  role: "superadmin" | "event_coordinator";
  name: string;
  createdAt: string;
  eventIds?: string[];
}

interface Event {
  id: string;
  title: string;
  date: string;
  category: string;
}

interface AdminManagementProps {
  admins: Admin[];
  currentAdminId: string;
  onUpdate: () => void;
}

// Component to display assigned events for an admin
function AssignedEventsCell({
  adminId,
  role,
}: {
  adminId: string;
  role: string;
}) {
  const [eventNames, setEventNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "event_coordinator") {
      fetchAssignedEvents();
    } else {
      setLoading(false);
    }
  }, [adminId, role]);

  const fetchAssignedEvents = async () => {
    try {
      const response = await fetch(`/api/admin/manage/${adminId}/events`);
      const data = await response.json();
      if (data.success && data.eventIds && data.eventIds.length > 0) {
        // Fetch event details
        const eventsResponse = await fetch("/api/events");
        const allEvents = await eventsResponse.json();
        const names = allEvents
          .filter((e: Event) => data.eventIds.includes(e.id))
          .map((e: Event) => e.title);
        setEventNames(names);
      }
    } catch (error) {
      console.error("Error fetching assigned events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (role !== "event_coordinator") {
    return <span className="text-gray-500">-</span>;
  }

  if (loading) {
    return <span className="text-gray-400 text-xs">Loading...</span>;
  }

  if (eventNames.length === 0) {
    return <span className="text-gray-500 text-xs">No events assigned</span>;
  }

  return (
    <div className="text-xs">
      {eventNames.slice(0, 2).map((name, idx) => (
        <div key={idx} className="text-gray-300 truncate" title={name}>
          {name}
        </div>
      ))}
      {eventNames.length > 2 && (
        <div className="text-blue-400">+{eventNames.length - 2} more</div>
      )}
    </div>
  );
}

export default function AdminManagement({
  admins,
  currentAdminId,
  onUpdate,
}: AdminManagementProps) {
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "event_coordinator",
    name: "",
  });
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all events for assignment
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const events = await response.json();
      setEvents(events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      email: "",
      password: "",
      role: "event_coordinator",
      name: "",
    });
    setSelectedEventIds([]);
    setError("");
  };

  const handleEdit = async (admin: Admin) => {
    setEditingAdmin(admin);
    setIsCreating(false);
    setFormData({
      email: admin.email,
      password: "",
      role: admin.role,
      name: admin.name,
    });

    // Fetch assigned events for this admin
    if (admin.role === "event_coordinator") {
      try {
        const response = await fetch(`/api/admin/manage/${admin.id}/events`);
        const data = await response.json();
        if (data.success) {
          setSelectedEventIds(data.eventIds || []);
        }
      } catch (error) {
        console.error("Error fetching admin events:", error);
        setSelectedEventIds([]);
      }
    } else {
      setSelectedEventIds([]);
    }

    setError("");
  };

  const handleCancel = () => {
    setEditingAdmin(null);
    setIsCreating(false);
    setFormData({
      email: "",
      password: "",
      role: "event_coordinator",
      name: "",
    });
    setSelectedEventIds([]);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isCreating) {
        // Create new admin
        const response = await fetch("/api/admin/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            eventIds:
              formData.role === "event_coordinator" ? selectedEventIds : [],
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create admin");
        }
      } else if (editingAdmin) {
        // Update existing admin
        const updates: any = {};
        if (formData.email !== editingAdmin.email)
          updates.email = formData.email;
        if (formData.password) updates.password = formData.password;
        if (formData.role !== editingAdmin.role) updates.role = formData.role;
        if (formData.name !== editingAdmin.name) updates.name = formData.name;

        const response = await fetch(`/api/admin/manage/${editingAdmin.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update admin");
        }

        // Update event assignments if role is event_coordinator
        if (formData.role === "event_coordinator") {
          await fetch(`/api/admin/manage/${editingAdmin.id}/events`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventIds: selectedEventIds }),
          });
        }
      }

      handleCancel();
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adminId: string, adminName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/manage/${adminId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete admin");
      }

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
          <h2 className="text-2xl font-bold text-white">Admin Management</h2>
          <p className="text-gray-400 mt-1">
            Manage admin accounts, roles, and permissions
          </p>
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
          Add New Admin
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded">
          {error}
        </div>
      )}

      {admins.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          <p className="text-lg mb-4">No admins found</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
          >
            Create First Admin
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Assigned Events
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 text-sm text-gray-200">
                    {admin.name}
                    {admin.id === currentAdminId && (
                      <span className="ml-2 text-xs text-blue-400">(You)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-200">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        admin.role === "superadmin"
                          ? "bg-purple-900 text-purple-200"
                          : "bg-green-900 text-green-200"
                      }`}
                    >
                      {admin.role === "superadmin"
                        ? "Super Admin"
                        : "Event Coordinator"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <AssignedEventsCell adminId={admin.id} role={admin.role} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleEdit(admin)}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    {admin.id !== currentAdminId && (
                      <button
                        onClick={() => handleDelete(admin.id, admin.name)}
                        className="text-red-400 hover:text-red-300"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(editingAdmin || isCreating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {isCreating
                ? "Create New Admin"
                : `Edit Admin: ${editingAdmin?.name}`}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isCreating && editingAdmin?.id === currentAdminId}
                  required
                >
                  <option value="superadmin">Super Admin</option>
                  <option value="event_coordinator">Event Coordinator</option>
                </select>
                {!isCreating && editingAdmin?.id === currentAdminId && (
                  <p className="text-xs text-gray-400 mt-1">
                    You cannot change your own role
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {isCreating ? "Password" : "New Password"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    isCreating
                      ? "Enter password"
                      : "Leave blank to keep current password"
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={isCreating}
                />
                {!isCreating && (
                  <p className="text-xs text-gray-400 mt-1">
                    Only fill this if you want to change the password
                  </p>
                )}
              </div>

              {/* Event Assignment for Event Coordinators */}
              {formData.role === "event_coordinator" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Assign Events
                  </label>
                  <div className="bg-gray-700 border border-gray-600 rounded p-3 max-h-48 overflow-y-auto">
                    {events.length === 0 ? (
                      <p className="text-gray-400 text-sm">
                        No events available
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {events.map((event) => (
                          <label
                            key={event.id}
                            className="flex items-start cursor-pointer hover:bg-gray-600 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedEventIds.includes(event.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEventIds([
                                    ...selectedEventIds,
                                    event.id,
                                  ]);
                                } else {
                                  setSelectedEventIds(
                                    selectedEventIds.filter(
                                      (id) => id !== event.id,
                                    ),
                                  );
                                }
                              }}
                              className="mt-1 mr-2"
                            />
                            <div className="flex-1">
                              <div className="text-white text-sm">
                                {event.title}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {new Date(event.date).toLocaleDateString()} •{" "}
                                {event.category}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Select events this coordinator will manage (
                    {selectedEventIds.length} selected)
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition"
                >
                  {loading
                    ? "Processing..."
                    : isCreating
                      ? "Create Admin"
                      : "Update Admin"}
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
