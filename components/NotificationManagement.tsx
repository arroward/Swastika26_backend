"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function NotificationManagement() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [deliveryErrors, setDeliveryErrors] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setStatus("Processing...");
    setDeliveryErrors([]);

    try {
      const res = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, imageUrl }),
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error(
          "Server returned non-JSON response. Check console for details.",
        );
      }

      if (res.ok && data.success) {
        setStatus(
          `Success! Sent to ${data.successCount} devices (Failed: ${data.failureCount}).`,
        );
        if (data.errors) setDeliveryErrors(data.errors);
        setTitle("");
        setBody("");
        setImageUrl("");
      } else {
        setStatus("Failed: " + (data.error || data.message || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      setStatus("Error calling API: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-2">
            Broadcast Notification
          </h2>
          <p className="text-gray-400 text-sm">
            Sends to all users in 'fcm_tokens' Firestore collection.
          </p>
        </div>

        <form
          onSubmit={handleSend}
          className="space-y-6 bg-gray-800 p-8 rounded-lg border border-gray-700"
        >
          <div>
            <label className="block text-sm font-mono text-gray-400 mb-2">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Event Alert!"
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-gray-400 mb-2">
              Body
            </label>
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Something exciting is happening..."
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-gray-400 mb-2">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="https://..."
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all font-syne uppercase tracking-wider"
          >
            {isSending ? "Sending..." : "Broadcast Now"}
          </button>

          {status && (
            <div
              className={`mt-4 p-4 rounded-lg text-center ${
                status.startsWith("Success")
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {status}
            </div>
          )}

          {deliveryErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-900/50 rounded-lg border border-red-700">
              <h3 className="font-bold text-red-200 mb-2">
                Delivery Errors ({deliveryErrors.length})
              </h3>
              <ul className="list-disc pl-5 text-red-300 text-xs max-h-40 overflow-y-auto">
                {deliveryErrors.map((err, i) => (
                  <li key={i}>{JSON.stringify(err)}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
