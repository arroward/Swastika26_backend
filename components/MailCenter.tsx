"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export default function MailCenter() {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [recipientType, setRecipientType] = useState("test"); // 'all', 'test', 'specific', 'admins'
  const [specificEmail, setSpecificEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const applyTemplate = (t: (typeof templates)[0]) => {
    setSubject(t.subject);
    setTitle(t.title);
    setMessage(t.message);
    if (t.ctaText) setCtaText(t.ctaText);
    if (t.ctaUrl) setCtaUrl(t.ctaUrl);
    setStatus({ type: "info", message: "Template applied successfully!" });
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

    const confirmMessage =
      recipientType === "all"
        ? "ARE YOU SURE? This will send an email to ALL completed purchases!"
        : recipientType === "admins"
          ? "Send this email to ALL admins?"
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
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          message: data.message || "Broadcast sent successfully!",
        });
        if (recipientType !== "test") {
          // Reset form if sent to all or specific
          setSubject("");
          setTitle("");
          setMessage("");
          setCtaText("");
          setCtaUrl("");
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
      <header>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-syne uppercase">
          Mail <span className="text-red-500">Center</span>
        </h1>
        <p className="text-zinc-400">
          Broadcast announcements and confirmations via email.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Compose Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Send className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white font-syne uppercase tracking-wider">
              Compose Mail
            </h2>
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
                <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
                  Recipients
                </label>
                <div className="grid grid-cols-4 gap-2">
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
                    label="All Attendees"
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
                    label="Specific"
                  />
                </div>
              </div>

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
                className={`p-4 rounded-xl flex items-start gap-3 ${
                  status.type === "success"
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

        {/* Preview Section */}
        <motion.div
          layout
          className={`space-y-6 ${showPreview ? "block" : "hidden lg:block"}`}
        >
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-h-[600px] flex flex-col">
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
      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 ${
        active
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
