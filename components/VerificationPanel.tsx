"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, QrCode } from "lucide-react";

interface VerificationResult {
  valid: boolean;
  message: string;
  reason?: string;
}

export default function VerificationPanel() {
  const [qrCode, setQrCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [day, setDay] = useState<"day1" | "day2">("day1");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) {
      setResult({ valid: false, message: "Please enter a QR code" });
      return;
    }

    setIsScanning(true);
    setResult(null);

    try {
      const response = await fetch("/api/scan/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode: qrCode.trim(),
          day,
        }),
      });

      const data = await response.json();
      setResult({
        valid: response.ok && data.valid,
        message: data.message || "Verification failed",
        reason: data.reason,
      });

      if (response.ok) {
        setQrCode("");
      }
    } catch (error) {
      setResult({
        valid: false,
        message: "Error verifying ticket",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-syne uppercase">
          Ticket <span className="text-red-500">Verification</span>
        </h1>
        <p className="text-zinc-400">Verify ticket QR codes at the entrance</p>
      </header>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <QrCode className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white font-syne uppercase tracking-wider">
            Scan Ticket
          </h2>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Event Day
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as "day1" | "day2")}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
            >
              <option value="day1">Day 1</option>
              <option value="day2">Day 2</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              QR Code / Ticket ID
            </label>
            <input
              type="text"
              placeholder="Paste QR code or enter ticket ID..."
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              autoFocus
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all text-lg font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className="w-full px-6 py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
          >
            {isScanning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <QrCode className="w-4 h-4" />
            )}
            {isScanning ? "Verifying..." : "Verify Ticket"}
          </button>
        </form>

        {result && (
          <div
            className={`p-4 rounded-xl flex items-start gap-3 ${
              result.valid
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-500"
            }`}
          >
            {result.valid ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold text-sm">{result.message}</p>
              {result.reason && (
                <p className="text-xs opacity-75 mt-1">{result.reason}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
