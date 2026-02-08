"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import PaymentVerificationPanel from "./PaymentVerificationPanel";

interface MetricState {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  verificationRate: number;
  lastUpdated?: string;
}

interface RegistrationSummary {
  id: string;
  upiTransactionId?: string | null;
}

type VerificationStatus = "APPROVED" | "REJECTED" | "PENDING" | string;

interface VerificationRecord {
  registrationId: string;
  eventId?: string;
  status?: VerificationStatus;
}

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type VerificationMap = Record<string, VerificationRecord>;

const INITIAL_METRICS: MetricState = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  verificationRate: 0,
};

export default function FinanceDashboard() {
  const [metrics, setMetrics] = useState<MetricState>(INITIAL_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshMetrics();
  }, []);

  const refreshMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const [registrationsRes, verificationsRes] = await Promise.all([
        fetch("/api/admin/registrations"),
        fetch("/api/admin/verify-payment/list"),
      ]);

      const registrationsJson = (await registrationsRes.json()) as ApiResponse<
        RegistrationSummary[]
      >;
      const verificationsJson =
        (await verificationsRes.json()) as ApiResponse<VerificationMap>;

      if (!registrationsRes.ok || !registrationsJson.success) {
        throw new Error(
          registrationsJson.error || "Failed to load registrations",
        );
      }

      if (!verificationsRes.ok || !verificationsJson.success) {
        throw new Error(
          verificationsJson.error || "Failed to load verifications",
        );
      }

      const registrations = Array.isArray(registrationsJson.data)
        ? registrationsJson.data
        : [];
      const upiTransactions = registrations.filter((registration) =>
        Boolean(registration.upiTransactionId),
      );
      const verificationMap: VerificationMap = verificationsJson.data || {};

      let approved = 0;
      let rejected = 0;

      upiTransactions.forEach((registration) => {
        const status = verificationMap[registration.id]?.status;
        if (status === "APPROVED") {
          approved += 1;
        } else if (status === "REJECTED") {
          rejected += 1;
        }
      });

      const total = upiTransactions.length;
      const pending = Math.max(total - (approved + rejected), 0);
      const verificationRate =
        total === 0 ? 0 : Math.round((approved / total) * 100);

      setMetrics({
        total,
        pending,
        approved,
        rejected,
        verificationRate,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Finance metrics error", err);
      const message =
        err instanceof Error ? err.message : "Unable to refresh metrics";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    {
      title: "UPI Transactions",
      value: metrics.total,
      helper: "Total payments referencing UPI IDs",
      icon: CheckCircle,
      accent: "text-white",
    },
    {
      title: "Pending Review",
      value: metrics.pending,
      helper: "Awaiting manual verification",
      icon: Clock,
      accent: "text-yellow-400",
    },
    {
      title: "Approved",
      value: metrics.approved,
      helper: "Payments marked as valid",
      icon: CheckCircle,
      accent: "text-green-400",
    },
    {
      title: "Rejected",
      value: metrics.rejected,
      helper: "Payments flagged or invalid",
      icon: AlertCircle,
      accent: "text-red-400",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/40">
              Finance Overview
            </p>
            <h2 className="text-3xl font-syne font-bold text-white mt-1">
              Transaction Health
            </h2>
            <p className="text-white/60 text-sm mt-2 max-w-2xl">
              Keep a live pulse on every UPI payment flowing through Swastika.
              Review pending matches, confirm approvals, and ensure no disputed
              transfer goes unnoticed.
            </p>
          </div>
          <div className="flex gap-2 items-center self-start sm:self-center">
            {metrics.lastUpdated && !loading && (
              <span className="text-white/40 text-xs font-mono">
                Updated {new Date(metrics.lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refreshMetrics}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh Insights
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map(({ title, value, helper, icon: Icon, accent }) => (
            <div
              key={title}
              className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-white/40 font-mono">
                  {title}
                </p>
                <Icon className={`w-4 h-4 ${accent}`} />
              </div>
              <p className="text-3xl font-bold font-syne text-white">
                {loading ? "--" : value}
              </p>
              <p className="text-xs text-white/40 leading-relaxed">{helper}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-blue-600/20 to-red-600/10 border border-white/10 rounded-2xl p-5 gap-4">
          <div>
            <p className="text-xs font-mono tracking-[0.3em] uppercase text-white/50">
              Verification Rate
            </p>
            <p className="text-4xl font-syne font-bold text-white mt-1">
              {loading ? "--" : `${metrics.verificationRate}%`}
            </p>
            <p className="text-sm text-white/60 mt-1 max-w-lg">
              Percentage of UPI transactions that are already approved. Aim for
              100% before event day.
            </p>
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <CheckCircle className="w-10 h-10 text-green-400" />
            <p className="text-sm">
              {metrics.pending > 0
                ? `${metrics.pending} transactions still need manual review.`
                : "All UPI submissions are verified."}
            </p>
          </div>
        </div>
      </section>

      <PaymentVerificationPanel />
    </div>
  );
}
