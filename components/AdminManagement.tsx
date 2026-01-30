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
        const eventsResponse = await fetch("/api/admin/events");
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
    <div className="text-xs space-y-1">
      {eventNames.slice(0, 2).map((name, idx) => (
        <div key={idx} className="text-white/70 truncate" title={name}>
          {name}
        </div>
      ))}
      {eventNames.length > 2 && (
        <div className="text-red-400 font-mono">+{eventNames.length - 2} more</div>
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
      const response = await fetch("/api/admin/events");
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
    <>
      <div className="bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm overflow-hidden">
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-syne font-bold text-white mb-2">Admin Management</h2>
            <p className="text-white/50 text-sm">
              Manage admin accounts, roles, and permissions
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-red-900/20 font-syne uppercase tracking-wider text-sm"
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
          <div className="mx-8 mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl">
            <span className="font-mono text-sm">{error}</span>
          </div>
        )}

        {!admins || admins.length === 0 ? (
          <div className="p-16 text-center text-white/50">
            <p className="text-xl mb-6 font-mono tracking-tight">No admins found</p>
            <button
              onClick={handleCreate}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-900/20 font-syne uppercase tracking-wider text-sm"
            >
              Create First Admin
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/20 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-mono text-white/50 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-mono text-white/50 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-mono text-white/50 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-mono text-white/50 uppercase tracking-wider">
                      Assigned Events
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-mono text-white/50 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-mono text-white/50 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-white">
                        {admin.name}
                        {admin.id === currentAdminId && (
                          <span className="ml-2 text-xs text-red-400">
                            (You)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono border ${admin.role === "superadmin"
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                            : "bg-green-500/10 text-green-300 border-green-500/20"
                            }`}
                        >
                          {admin.role === "superadmin"
                            ? "Super Admin"
                            : "Event Coordinator"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <AssignedEventsCell
                          adminId={admin.id}
                          role={admin.role}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-white/50 font-mono">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="text-blue-400 hover:text-blue-300 mr-4 font-mono transition-colors"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        {admin.id !== currentAdminId && (
                          <button
                            onClick={() => handleDelete(admin.id, admin.name)}
                            className="text-red-400 hover:text-red-300 font-mono transition-colors"
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {admins.map((admin) => (
                <div key={admin.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {admin.name}
                          {admin.id === currentAdminId && (
                            <span className="ml-2 text-xs text-red-400">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-white/50 mt-1 font-mono">
                          {admin.email}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono border whitespace-nowrap ${admin.role === "superadmin"
                          ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                          : "bg-green-500/10 text-green-300 border-green-500/20"
                          }`}
                      >
                        {admin.role === "superadmin"
                          ? "Super Admin"
                          : "Event Coordinator"}
                      </span>
                    </div>

                    <div className="border-t border-white/5 pt-3">
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono mb-2">
                        Assigned Events
                      </p>
                      <div className="text-xs text-white/70">
                        <AssignedEventsCell
                          adminId={admin.id}
                          role={admin.role}
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                      <p className="text-[10px] text-white/30 font-mono">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="text-blue-400 hover:text-blue-300 text-xs font-mono"
                          disabled={loading}
                        >
                          EDIT
                        </button>
                        {admin.id !== currentAdminId && (
                          <button
                            onClick={() => handleDelete(admin.id, admin.name)}
                            className="text-red-400 hover:text-red-300 text-xs font-mono"
                            disabled={loading}
                          >
                            DELETE
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(editingAdmin || isCreating) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-2xl mx-auto shadow-2xl flex flex-col" style={{ height: 'calc(100vh - 2rem)', maxHeight: '900px' }}>
            {/* Fixed Header */}
            <div className="p-8 border-b border-white/10 flex-shrink-0">
              <h3 className="text-2xl font-syne font-bold text-white">
                {isCreating
                  ? "Create New Admin"
                  : `Edit Admin: ${editingAdmin?.name}`}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl focus:outline-none focus:border-red-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl focus:outline-none focus:border-red-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl focus:outline-none focus:border-red-500 transition-all"
                    disabled={!isCreating && editingAdmin?.id === currentAdminId}
                    required
                  >
                    <option value="superadmin">Super Admin</option>
                    <option value="event_coordinator">Event Coordinator</option>
                  </select>
                  {!isCreating && editingAdmin?.id === currentAdminId && (
                    <p className="text-xs text-white/40 mt-2 font-mono">
                      You cannot change your own role
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
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
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl focus:outline-none focus:border-red-500 transition-all placeholder-white/20"
                    required={isCreating}
                  />
                  {!isCreating && (
                    <p className="text-xs text-white/40 mt-2 font-mono">
                      Only fill this if you want to change the password
                    </p>
                  )}
                </div>

                {/* Event Assignment for Event Coordinators */}
                {formData.role === "event_coordinator" && (
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                      Assign Events
                    </label>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                      {events.length === 0 ? (
                        <p className="text-white/30 text-xs font-mono text-center py-4">
                          No events available
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {events.map((event) => (
                            <label
                              key={event.id}
                              className="flex items-start cursor-pointer hover:bg-white/5 p-3 rounded-xl transition-colors"
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
                                className="mt-1 mr-3 accent-red-500"
                              />
                              <div className="flex-1">
                                <div className="text-white text-sm font-medium">
                                  {event.title}
                                </div>
                                <div className="text-white/30 text-[10px] font-mono mt-0.5">
                                  {new Date(event.date).toLocaleDateString()} • {event.category.toUpperCase()}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-3 font-mono">
                      Select events this coordinator will manage (
                      <span className="text-red-400">{selectedEventIds.length}</span> selected)
                    </p>
                  </div>
                )}
              </div>

              {/* Sticky Footer with Buttons */}
              <div className="flex gap-3 p-8 border-t border-white/10 flex-shrink-0 bg-[#111]">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-xl transition-all font-syne uppercase tracking-widest shadow-lg shadow-red-900/20"
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
                  className="flex-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-xl transition-all border border-white/10"
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
