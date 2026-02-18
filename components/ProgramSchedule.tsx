"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  CalendarDays,
  Download,
  Loader2,
} from "lucide-react";

interface ScheduleItem {
  id: string;
  timeStart: string;
  timeEnd: string;
  program: string;
  participants: string[];
}

const emptyItem = (): ScheduleItem => ({
  id: "",
  timeStart: "",
  timeEnd: "",
  program: "",
  participants: [],
});

type DayKey = "day1" | "day2";

// ── Single Day Table Panel ─────────────────────────────────────────────────
function DaySchedulePanel({
  day,
  label,
  date,
}: {
  day: DayKey;
  label: string;
  date: string;
}) {
  const tableRef = useRef<HTMLDivElement>(null);
  const dayNumber = day === "day1" ? 1 : 2;

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ScheduleItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<ScheduleItem>(emptyItem());
  const [newParticipantInput, setNewParticipantInput] = useState("");
  const [editParticipantInput, setEditParticipantInput] = useState("");
  const [downloading, setDownloading] = useState(false);

  // ── Fetch from DB ─────────────────────────────────────────
  const fetchSchedule = useCallback(async () => {
    setLoadingData(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/program-schedule?day=${dayNumber}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setSchedule(json.data ?? []);
    } catch (err) {
      console.error("Failed to load schedule:", err);
      setError("Failed to load schedule. Please refresh.");
    } finally {
      setLoadingData(false);
    }
  }, [dayNumber]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // ── Edit ──────────────────────────────────────────────────
  const startEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditDraft({ ...item, participants: [...item.participants] });
    setEditParticipantInput("");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };
  const saveEdit = async () => {
    if (!editDraft) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/program-schedule/${editDraft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeStart: editDraft.timeStart,
          timeEnd: editDraft.timeEnd,
          program: editDraft.program,
          participants: editDraft.participants,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setSchedule((prev) =>
        prev.map((s) => (s.id === editDraft.id ? json.data : s)),
      );
      cancelEdit();
    } catch (err) {
      console.error("Failed to save edit:", err);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };
  const deleteItem = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/program-schedule/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      setSchedule((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError("Failed to delete item.");
    } finally {
      setSaving(false);
    }
  };

  // ── Add ───────────────────────────────────────────────────
  const addParticipantToNew = () => {
    const t = newParticipantInput.trim();
    if (!t) return;
    setNewItem((p) => ({ ...p, participants: [...p.participants, t] }));
    setNewParticipantInput("");
  };
  const removeParticipantFromNew = (idx: number) =>
    setNewItem((p) => ({
      ...p,
      participants: p.participants.filter((_, i) => i !== idx),
    }));

  const addParticipantToEdit = () => {
    const t = editParticipantInput.trim();
    if (!t || !editDraft) return;
    setEditDraft((p) =>
      p ? { ...p, participants: [...p.participants, t] } : p,
    );
    setEditParticipantInput("");
  };
  const removeParticipantFromEdit = (idx: number) => {
    if (!editDraft) return;
    setEditDraft((p) =>
      p
        ? { ...p, participants: p.participants.filter((_, i) => i !== idx) }
        : p,
    );
  };

  const submitNewItem = async () => {
    if (!newItem.timeStart || !newItem.timeEnd || !newItem.program.trim())
      return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/program-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: dayNumber,
          timeStart: newItem.timeStart,
          timeEnd: newItem.timeEnd,
          program: newItem.program.trim(),
          participants: newItem.participants,
          sortOrder: schedule.length,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setSchedule((prev) => [...prev, json.data]);
      setNewItem(emptyItem());
      setNewParticipantInput("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add item:", err);
      setError("Failed to add program item.");
    } finally {
      setSaving(false);
    }
  };
  const cancelAdd = () => {
    setNewItem(emptyItem());
    setNewParticipantInput("");
    setShowAddForm(false);
  };

  // ── PDF Download ──────────────────────────────────────────
  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Header block
      doc.setFillColor(15, 15, 15);
      doc.rect(0, 0, 210, 297, "F");

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("SWASTIKA 2026", 105, 18, { align: "center" });

      doc.setFontSize(13);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 200);
      doc.text(`Program Schedule — ${label}`, 105, 26, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(date, 105, 32, { align: "center" });

      // Red divider line
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.5);
      doc.line(14, 36, 196, 36);

      // Table
      const body = schedule.map((item, idx) => [
        String(idx + 1),
        `${item.timeStart} – ${item.timeEnd}`,
        item.program,
        item.participants.length === 0
          ? "—"
          : item.participants.map((p) => `• ${p}`).join("\n"),
      ]);

      autoTable(doc, {
        startY: 42,
        head: [
          ["#", "Time Slot", "Program / Activity", "Participants / Performers"],
        ],
        body,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: [230, 230, 230],
          fillColor: [20, 20, 20],
          lineColor: [60, 60, 60],
          lineWidth: 0.2,
          overflow: "linebreak",
          valign: "top",
        },
        headStyles: {
          fillColor: [30, 30, 30],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
          lineColor: [80, 80, 80],
        },
        alternateRowStyles: {
          fillColor: [26, 26, 26],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 32 },
          2: { cellWidth: 65 },
          3: { cellWidth: "auto" },
        },
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount}  •  Swastika 2026  •  ${label}`,
          105,
          290,
          { align: "center" },
        );
      }

      doc.save(`Swastika2026-${label.replace(" ", "_")}-Schedule.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-5" ref={tableRef}>
      {/* Panel header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-white/40 font-mono uppercase tracking-widest">
            {date}
          </p>
          <p className="text-sm text-gray-400 mt-0.5">
            {loadingData ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading…
              </span>
            ) : (
              `${schedule.length} program items`
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-colors px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            title={`Download ${label} schedule as PDF`}
          >
            <Download className="w-4 h-4 text-red-400" />
            {downloading ? "Generating…" : "Download PDF"}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors px-3 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Program
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between gap-3 bg-red-900/20 border border-red-700/50 rounded-xl px-4 py-3 text-sm text-red-400">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Saving indicator */}
      {saving && (
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 w-fit">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
          Saving…
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-900 border border-red-600/40 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-red-400">
            New Program Entry — {label}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Start Time
              </label>
              <input
                type="text"
                placeholder="e.g. 10:00"
                value={newItem.timeStart}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, timeStart: e.target.value }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                End Time
              </label>
              <input
                type="text"
                placeholder="e.g. 10:15"
                value={newItem.timeEnd}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, timeEnd: e.target.value }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Program Name
            </label>
            <input
              type="text"
              placeholder="e.g. Welcome Speech"
              value={newItem.program}
              onChange={(e) =>
                setNewItem((p) => ({ ...p, program: e.target.value }))
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Participants / Performers
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a participant and press +"
                value={newParticipantInput}
                onChange={(e) => setNewParticipantInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addParticipantToNew()}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              />
              <button
                onClick={addParticipantToNew}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {newItem.participants.length > 0 && (
              <ul className="space-y-1">
                {newItem.participants.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-1.5 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-red-400">•</span>
                      {p}
                    </span>
                    <button
                      onClick={() => removeParticipantFromNew(i)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={cancelAdd}
              className="px-4 py-2 rounded-lg text-sm bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitNewItem}
              disabled={
                !newItem.timeStart ||
                !newItem.timeEnd ||
                !newItem.program.trim()
              }
              className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Add to Schedule
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-10">
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-red-400" />
                    Time Slot
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Program / Activity
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Participants / Performers
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loadingData
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-4">
                        <div className="h-3 w-4 bg-gray-800 rounded" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-6 w-24 bg-gray-800 rounded-lg" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3 w-40 bg-gray-800 rounded" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3 w-32 bg-gray-800 rounded" />
                      </td>
                      <td className="px-4 py-4" />
                    </tr>
                  ))
                : schedule.map((item, index) =>
                    editingId === item.id && editDraft ? (
                      <tr key={item.id} className="bg-gray-800/40">
                        <td className="px-4 py-3 text-gray-500 align-top">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editDraft.timeStart}
                              onChange={(e) =>
                                setEditDraft((p) =>
                                  p ? { ...p, timeStart: e.target.value } : p,
                                )
                              }
                              className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-500"
                            />
                            <span className="text-gray-500 text-xs">–</span>
                            <input
                              type="text"
                              value={editDraft.timeEnd}
                              onChange={(e) =>
                                setEditDraft((p) =>
                                  p ? { ...p, timeEnd: e.target.value } : p,
                                )
                              }
                              className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <input
                            type="text"
                            value={editDraft.program}
                            onChange={(e) =>
                              setEditDraft((p) =>
                                p ? { ...p, program: e.target.value } : p,
                              )
                            }
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="space-y-1 mb-2">
                            {editDraft.participants.map((p, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between gap-2 bg-gray-700/50 rounded px-2 py-1 text-xs"
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className="text-red-400">•</span>
                                  {p}
                                </span>
                                <button
                                  onClick={() => removeParticipantFromEdit(i)}
                                  className="text-gray-500 hover:text-red-400"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              placeholder="Add participant…"
                              value={editParticipantInput}
                              onChange={(e) =>
                                setEditParticipantInput(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && addParticipantToEdit()
                              }
                              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-500"
                            />
                            <button
                              onClick={addParticipantToEdit}
                              className="bg-gray-600 hover:bg-gray-500 px-2 rounded transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={saveEdit}
                              className="p-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/40 transition-colors"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={item.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-4 py-3 text-gray-500 text-xs align-top">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-red-300">
                            <Clock className="w-3 h-3 text-red-500" />
                            {item.timeStart} – {item.timeEnd}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className="font-medium text-white">
                            {item.program}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {item.participants.length === 0 ? (
                            <span className="text-gray-600 text-xs italic">
                              —
                            </span>
                          ) : item.participants.length === 1 ? (
                            <span className="text-gray-300 text-sm">
                              {item.participants[0]}
                            </span>
                          ) : (
                            <ul className="space-y-0.5">
                              {item.participants.map((p, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-1.5 text-gray-300 text-xs"
                                >
                                  <span className="text-red-400 mt-0.5 flex-shrink-0">
                                    •
                                  </span>
                                  {p}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
              {!loadingData && schedule.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No program items yet.</p>
                    <p className="text-xs mt-1">
                      Click &ldquo;Add Program&rdquo; to get started.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {schedule.length > 0 && (
          <div className="border-t border-gray-800 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {schedule.length} item{schedule.length !== 1 ? "s" : ""} in
              schedule
            </span>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root export ────────────────────────────────────────────────────────────
export default function ProgramSchedule() {
  const [activeDay, setActiveDay] = useState<DayKey>("day1");

  const days: { key: DayKey; label: string; date: string }[] = [
    { key: "day1", label: "Day 1", date: "February 20, 2026" },
    { key: "day2", label: "Day 2", date: "February 21, 2026" },
  ];

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <CalendarDays className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <h2 className="text-lg font-bold tracking-tight">Program Schedule</h2>
          <p className="text-xs text-white/40 font-mono">
            Swastika 2026 — Event Flow Management
          </p>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-xl p-1 w-fit">
        {days.map((d) => (
          <button
            key={d.key}
            onClick={() => setActiveDay(d.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeDay === d.key
                ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            {d.label}
            <span
              className={`text-xs font-mono ${activeDay === d.key ? "text-red-200" : "text-white/30"}`}
            >
              {d.date}
            </span>
          </button>
        ))}
      </div>

      {/* Active day panel */}
      {days.map((d) =>
        activeDay === d.key ? (
          <DaySchedulePanel
            key={d.key}
            day={d.key}
            label={d.label}
            date={d.date}
          />
        ) : null,
      )}
    </div>
  );
}
