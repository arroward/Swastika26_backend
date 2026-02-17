"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Send,
  Eye,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  Users,
  TestTube2,
  AtSign,
  Save,
  FileText,
  History,
  Trash2,
  Clock,
  Calendar,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

interface Draft {
  id: string;
  subject: string;
  title: string;
  message: string;
  ctaText: string;
  ctaUrl: string;
  recipientType: string;
  specificEmail: string;
  eventId?: string; // Added for event-specific drafts
  savedAt: string;
}

interface SentEmail {
  id: string;
  subject: string;
  sentAt: string;
  recipientType: string;
  recipientCount: number;
  status: "success" | "partial" | "failed";
}

export default function MailCenter() {
  const [activeTab, setActiveTab] = useState<"compose" | "drafts" | "history">(
    "compose",
  );

  // Form State
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [recipientType, setRecipientType] = useState("test");
  const [specificEmail, setSpecificEmail] = useState("");

  // Status State
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // New Features State
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [history, setHistory] = useState<SentEmail[]>([]);

  // Event Selection State
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");

  // Calculate days left for Swastika (Feb 20, 2026)
  const targetDate = new Date("2026-02-20T00:00:00");
  const today = new Date();
  const timeDiff = targetDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

  const templates = [
    {
      name: "Event Countdown ⏳",
      subject: `Only ${daysLeft} Days for ${SITE_CONFIG.name}!`,
      title: "The Countdown Has Begun.",
      message: `The clock is ticking! We are just ${daysLeft} days away from ${SITE_CONFIG.name}. \n\nGet ready for two days of pure adrenaline, innovation, and culture. Make sure you've marked your calendars and shared the hype with your friends!`,
      ctaText: "Check Schedule",
      ctaUrl: SITE_CONFIG.links.schedule,
    },
    {
      name: "Welcome Mail 🎫",
      subject: `Welcome to ${SITE_CONFIG.name}!`,
      title: "Join the Legacy.",
      message: `We are thrilled to have you with us for ${SITE_CONFIG.name}. \n\nYou are now part of South India's premier techno-cultural festival. Stay tuned for more updates regarding event timings and venue directions.`,
      ctaText: "View My Passes",
      ctaUrl: SITE_CONFIG.links.tickets,
    },
    {
      name: "Important Rule Update ⚠️",
      subject: "Notice: Important Updates for Attendees",
      title: "Safety & Guidelines.",
      message:
        "To ensure a smooth experience for everyone, please take a moment to review the latest entry guidelines and safety protocols. Remember to carry a valid ID and your digital pass.",
      ctaText: "Read Guidelines",
      ctaUrl: SITE_CONFIG.links.guidelines,
    },
  ];

  // Load from LocalStorage
  useEffect(() => {
    const savedDrafts = localStorage.getItem("mail_drafts");
    const savedHistory = localStorage.getItem("mail_history");
    if (savedDrafts) setDrafts(JSON.parse(savedDrafts));
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Fetch events for selection
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/admin/events?role=superadmin");
        const data = await res.json();
        if (Array.isArray(data)) {
          setEvents(data);
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };
    fetchEvents();
  }, []);

  // Fetch Recipient Stats
  useEffect(() => {
    const fetchStats = async () => {
      if (recipientType === "specific" || recipientType === "test") {
        setRecipientCount(1);
        return;
      }

      if (recipientType === "event" && !selectedEventId) {
        setRecipientCount(null);
        return;
      }

      setIsLoadingStats(true);
      try {
        const res = await fetch("/api/admin/mail/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientType,
            eventId: selectedEventId
          }),
        });
        const data = await res.json();
        if (data.success) {
          setRecipientCount(data.count);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    const debounce = setTimeout(fetchStats, 500);
    return () => clearTimeout(debounce);
  }, [recipientType, selectedEventId]);

  const applyTemplate = (t: (typeof templates)[0]) => {
    setSubject(t.subject);
    setTitle(t.title);
    setMessage(t.message);
    if (t.ctaText) setCtaText(t.ctaText);
    if (t.ctaUrl) setCtaUrl(t.ctaUrl);
    setStatus({ type: "info", message: "Template applied successfully!" });
  };

  const saveDraft = () => {
    if (!subject && !title) {
      setStatus({ type: "error", message: "Enter at least a subject or title to save draft" });
      return;
    }
    const newDraft: Draft = {
      id: crypto.randomUUID(),
      subject,
      title,
      message,
      ctaText,
      ctaUrl,
      recipientType,
      specificEmail,
      eventId: selectedEventId,
      savedAt: new Date().toISOString(),
    };
    const updatedDrafts = [newDraft, ...drafts];
    setDrafts(updatedDrafts);
    localStorage.setItem("mail_drafts", JSON.stringify(updatedDrafts));
    setStatus({ type: "success", message: "Draft saved successfully!" });
  };

  const loadDraft = (draft: Draft) => {
    setSubject(draft.subject);
    setTitle(draft.title);
    setMessage(draft.message);
    setCtaText(draft.ctaText);
    setCtaUrl(draft.ctaUrl);
    setRecipientType(draft.recipientType);
    setSpecificEmail(draft.specificEmail);
    setSelectedEventId(draft.eventId || "");
    setActiveTab("compose");
    setStatus({ type: "info", message: "Draft loaded!" });
  };

  const deleteDraft = (id: string) => {
    const updatedDrafts = drafts.filter((d) => d.id !== id);
    setDrafts(updatedDrafts);
    localStorage.setItem("mail_drafts", JSON.stringify(updatedDrafts));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !title || !message) {
      setStatus({
        type: "error",
        message: "Subject, Title and Message are required",
      });
      return;
    }

    if (recipientType === "specific" && !specificEmail) {
      setStatus({
        type: "error",
        message: "Please provide a specific email address",
      });
      return;
    }

    if (recipientType === "event" && !selectedEventId) {
      setStatus({
        type: "error",
        message: "Please select an event for the broadcast",
      });
      return;
    }

    const confirmMessage =
      recipientType === "all"
        ? `ARE YOU SURE? This will send an email to ALL ${recipientCount || "many"} completed purchases!`
        : recipientType === "admins"
          ? `Send this email to ALL ${recipientCount || ""} admins?`
          : recipientType === "event"
            ? `Send this email to ALL ${recipientCount || ""} attendees of the selected event?`
            : recipientType === "event_admins_stats"
              ? `Send event statistics to ALL ${recipientCount || ""} event admins?`
              : "Send this email broadcast?";

    if (!confirm(confirmMessage)) return;

    setIsSending(true);
    setStatus({ type: "info", message: "Sending broadcast..." });

    try {
      const res = await fetch("/api/admin/mail/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          title,
          message,
          ctaText,
          ctaUrl,
          recipientType,
          specificEmail,
          eventId: selectedEventId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          message: data.message || "Broadcast sent successfully!",
        });

        // Add to history
        const newHistoryItem: SentEmail = {
          id: crypto.randomUUID(),
          subject,
          sentAt: new Date().toISOString(),
          recipientType,
          recipientCount: data.successCount || recipientCount || 0,
          status: data.failureCount > 0 ? "partial" : "success",
        };
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("mail_history", JSON.stringify(updatedHistory));

        if (recipientType !== "test") {
          setSubject("");
          setTitle("");
          setMessage("");
          setCtaText("");
          setCtaUrl("");
          // Keep recipientType but maybe reset specific fields?
          // Don't reset selectedEventId as user might want to send another to same group
        }
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to send broadcast",
        });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "An error occurred" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-syne uppercase">
            Mail <span className="text-red-500">Center</span>
          </h1>
          <p className="text-zinc-400">
            Broadcast announcements and confirmations via email.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#0a0a0a] border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab("compose")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "compose"
              ? "bg-zinc-800 text-white"
              : "text-zinc-500 hover:text-white"
              }`}
          >
            <Send className="w-3 h-3" /> Compose
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "drafts"
              ? "bg-zinc-800 text-white"
              : "text-zinc-500 hover:text-white"
              }`}
          >
            <FileText className="w-3 h-3" /> Drafts
            {drafts.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {drafts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "history"
              ? "bg-zinc-800 text-white"
              : "text-zinc-500 hover:text-white"
              }`}
          >
            <History className="w-3 h-3" /> History
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Main Content Area */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "compose" && (
              <motion.div
                key="compose"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6"
              >
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <Send className="w-5 h-5 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white font-syne uppercase tracking-wider">
                      Compose Mail
                    </h2>
                  </div>
                  <button
                    onClick={saveDraft}
                    className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase font-bold tracking-wider"
                    title="Save as Draft"
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </button>
                </div>

                {/* Quick Templates */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">
                    Quick Templates
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((t, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applyTemplate(t)}
                        className="px-3 py-1.5 bg-black hover:bg-zinc-800 border border-white/10 hover:border-red-500/50 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-wider"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSend} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest">
                          Recipients
                        </label>
                        {recipientCount !== null && (
                          <span className="text-[10px] font-mono text-zinc-400">
                            {isLoadingStats ? (
                              <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                            ) : (
                              <Users className="w-3 h-3 inline mr-1" />
                            )}
                            {recipientCount} Potential Recipient{recipientCount !== 1 && 's'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-6 gap-2">
                        <RecipientTypeBtn
                          active={recipientType === "test"}
                          onClick={() => setRecipientType("test")}
                          icon={<TestTube2 className="w-4 h-4" />}
                          label="Test"
                        />
                        <RecipientTypeBtn
                          active={recipientType === "all"}
                          onClick={() => setRecipientType("all")}
                          icon={<Users className="w-4 h-4" />}
                          label="All"
                        />
                        <RecipientTypeBtn
                          active={recipientType === "event"}
                          onClick={() => setRecipientType("event")}
                          icon={<Calendar className="w-4 h-4" />}
                          label="Event"
                        />
                        <RecipientTypeBtn
                          active={recipientType === "admins"}
                          onClick={() => setRecipientType("admins")}
                          icon={<ShieldCheck className="w-4 h-4" />}
                          label="Admins"
                        />
                        <RecipientTypeBtn
                          active={recipientType === "specific"}
                          onClick={() => setRecipientType("specific")}
                          icon={<AtSign className="w-4 h-4" />}
                          label="One"
                        />
                        <RecipientTypeBtn
                          active={recipientType === "event_admins_stats"}
                          onClick={() => setRecipientType("event_admins_stats")}
                          icon={<BarChart3 className="w-4 h-4" />}
                          label="Stats"
                        />
                      </div>
                    </div>

                    {recipientType === "event" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        <select
                          value={selectedEventId}
                          onChange={(e) => setSelectedEventId(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select an Event...</option>
                          {events.map(event => (
                            <option key={event.id} value={event.id}>{event.title}</option>
                          ))}
                        </select>
                        <div className="text-[10px] text-zinc-500 mt-1 font-mono px-1">
                          Broadcast will be sent to all registered attendees of this event.
                        </div>
                      </motion.div>
                    )}

                    {recipientType === "specific" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        <input
                          type="email"
                          placeholder="Enter recipient email..."
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                          value={specificEmail}
                          onChange={(e) => setSpecificEmail(e.target.value)}
                          required
                        />
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Important Update Regarding Swastika '26"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
                        Internal Title
                      </label>
                      <input
                        type="text"
                        placeholder="The main heading inside the email"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
                        Message Content
                      </label>
                      <textarea
                        rows={8}
                        placeholder="Write your announcement here..."
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all resize-none"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
                          CTA Button Text (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Visit Website"
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                          value={ctaText}
                          onChange={(e) => setCtaText(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
                          CTA URL (Optional)
                        </label>
                        <input
                          type="url"
                          placeholder="https://..."
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                          value={ctaUrl}
                          onChange={(e) => setCtaUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {status && (
                    <div
                      className={`p-4 rounded-xl flex items-start gap-3 ${status.type === "success"
                        ? "bg-green-500/10 border border-green-500/20 text-green-400"
                        : status.type === "error"
                          ? "bg-red-500/10 border border-red-500/20 text-red-500"
                          : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                        }`}
                    >
                      {status.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                      ) : status.type === "error" ? (
                        <AlertCircle className="w-5 h-5 shrink-0" />
                      ) : (
                        <Info className="w-5 h-5 shrink-0" />
                      )}
                      <p className="text-sm">{status.message}</p>
                    </div>
                  )}

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex-1 px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                      <Eye className="w-4 h-4" />{" "}
                      {showPreview ? "Hide Preview" : "Live Preview"}
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="flex-[2] px-6 py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isSending ? "Sending..." : "Send Broadcast"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "drafts" && (
              <motion.div
                key="drafts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 min-h-[500px]"
              >
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white font-syne uppercase tracking-wider">
                    Saved Drafts
                  </h2>
                </div>

                {drafts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-mono uppercase tracking-widest">No Saved Drafts</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {drafts.map((draft) => (
                      <div key={draft.id} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white text-lg">{draft.subject || "Untitled Draft"}</h3>
                          <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md text-zinc-400 font-mono">
                            {new Date(draft.savedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-4 font-mono">{draft.message || "No content..."}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadDraft(draft)}
                            className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="w-3 h-3" /> Load
                          </button>
                          <button
                            onClick={() => deleteDraft(draft.id)}
                            className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 min-h-[500px]"
              >
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <History className="w-5 h-5 text-purple-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white font-syne uppercase tracking-wider">
                    Sent History
                  </h2>
                </div>

                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
                    <History className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-mono uppercase tracking-widest">No Sent History</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div key={item.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-white mb-1">{item.subject}</h3>
                          <div className="flex gap-3 text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(item.sentAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {item.recipientCount} Recipients
                            </span>
                            <span className={`flex items-center gap-1 ${item.status === 'success' ? 'text-green-500' : 'text-yellow-500'}`}>
                              {item.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />} {item.status}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSubject(item.subject);
                            setActiveTab('compose');
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Reuse Subject"
                        >
                          <RefreshCw className="w-4 h-4 text-zinc-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview Section - Always visible on desktop, toggled on mobile unless on other tabs */}
        <motion.div
          layout
          className={`space-y-6 ${showPreview || activeTab === 'compose' ? "block" : "hidden lg:block"}`}
        >
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-h-[600px] flex flex-col sticky top-6">
            <div className="p-4 bg-zinc-900/50 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-widest">
                <Eye className="w-3 h-3 text-red-500" /> Live Preview
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  RENDERING
                </span>
              </div>
            </div>

            {/* Template Rendering Area */}
            <div className="flex-1 bg-[#020202] overflow-y-auto p-4 custom-scrollbar">
              <div className="max-w-md mx-auto bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-b from-zinc-900 to-[#0a0a0a] p-8 text-center border-b border-white/5">
                  <h1 className="text-2xl font-black text-white font-cinzel tracking-widest">
                    SWASTIKA<span className="text-red-500">.</span>26
                  </h1>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-2">
                    Official Communication
                  </p>
                </div>

                <div className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-white font-syne">
                      {title || "Email Title Ready"}
                    </h2>
                    <div className="h-0.5 w-12 bg-red-500 mx-auto"></div>
                  </div>

                  <div className="text-zinc-400 text-sm leading-relaxed space-y-3">
                    {message ? (
                      message.split("\n").map((p, i) => <p key={i}>{p}</p>)
                    ) : (
                      <p className="italic opacity-30">
                        Your announcement message will appear here...
                      </p>
                    )}
                  </div>

                  {ctaText && (
                    <div className="pt-6 text-center">
                      <div className="inline-block px-8 py-3 bg-white text-black font-black text-xs rounded-full uppercase tracking-widest shadow-lg shadow-white/5 cursor-default">
                        {ctaText}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-8 bg-black/50 border-t border-white/5 text-center space-y-4">
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                    {SITE_CONFIG.event.college.toUpperCase()}
                  </p>
                  <div className="flex justify-center gap-4 text-[10px] items-center text-red-500/50 font-bold tracking-widest uppercase">
                    <span>Website</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                    <span>Support</span>
                  </div>
                  <p className="text-[9px] text-zinc-700">
                    © 2026 {SITE_CONFIG.name.split(" ")[0]}. All rights
                    reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function RecipientTypeBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 ${active
        ? "bg-red-500/10 border-red-500 text-white"
        : "bg-black border-white/10 text-zinc-500 hover:border-white/30"
        }`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}
