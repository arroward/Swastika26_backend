import React, { useState } from "react";

interface RegistrationsTableProps {
  registrations: any[];
  eventTitle?: string;
  isLoading: boolean;
  onDownload: (format: "csv" | "pdf") => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  userRole?: string;
}

export default function RegistrationsTable({
  registrations,
  eventTitle,
  isLoading,
  onDownload,
  onDelete,
  userRole,
}: RegistrationsTableProps) {
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format: "csv" | "pdf") => {
    setIsDownloading(true);
    try {
      await onDownload(format);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 sm:h-64">
        <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/10 backdrop-blur-sm">
        <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
          <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-white/50 text-base sm:text-lg font-mono">
          No registrations found
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm shadow-xl">
      {/* Header with title and download buttons */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-white/10 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start lg:items-center bg-black/20">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate font-syne">
            {eventTitle ? `${eventTitle} - Registrations` : "All Registrations"}
          </h2>
          <p className="text-white/50 mt-1 text-xs sm:text-sm font-mono">
            Total: <span className="text-white font-bold">{registrations.length}</span> registrations
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
          <button
            onClick={() => handleDownload("csv")}
            disabled={isDownloading}
            className="flex-1 sm:flex-none bg-green-900/40 hover:bg-green-800/60 text-green-400 border border-green-500/30 text-xs sm:text-sm font-mono font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden sm:inline">
              Download CSV
            </span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button
            onClick={() => handleDownload("pdf")}
            disabled={isDownloading}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-red-900/20"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span className="hidden sm:inline">
              Download PDF
            </span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {/* Mobile Card View (Simplified) */}
      <div className="md:hidden space-y-4 p-4">
        {registrations.map((reg, index) => (
          <div
            key={reg.id || index}
            className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-bold text-lg font-syne">{reg.fullName}</h3>
                <p className="text-white/60 text-sm">{reg.email}</p>
              </div>
              <span className="text-[10px] text-white/50 font-mono bg-white/5 px-2 py-1 rounded-full border border-white/10">
                {new Date(reg.registrationDate).toLocaleDateString()}
              </span>
            </div>

            {!eventTitle && (
              <p className="text-sm text-white/80"><span className="text-white/40 text-xs font-mono uppercase tracking-wider block mb-0.5">Event</span> {reg.eventTitle}</p>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedRegistration(reg)}
                className="text-blue-400 hover:text-blue-300 text-xs font-mono uppercase tracking-wider"
              >
                VIEW DETAILS
              </button>

              {userRole === "superadmin" && onDelete && (
                <button
                  onClick={() => onDelete(reg.id)}
                  className="text-red-400 hover:text-red-300 text-xs font-mono uppercase tracking-wider"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (Simplified) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-black/20 text-xs uppercase font-mono text-white/50 tracking-wider">
            <tr>
              <th className="px-6 py-4 font-normal">Name</th>
              <th className="px-6 py-4 font-normal">Contact</th>
              <th className="px-6 py-4 font-normal">Date</th>
              {!eventTitle && (
                <th className="px-6 py-4 font-normal">Event</th>
              )}
              <th className="px-6 py-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {registrations.map((reg, index) => (
              <tr key={reg.id || index} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-white">{reg.fullName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white/80">{reg.email}</div>
                  <div className="text-white/40 text-xs font-mono mt-0.5">{reg.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-white/60 font-mono text-xs">
                    {new Date(reg.registrationDate).toLocaleDateString()}
                  </span>
                </td>
                {!eventTitle && (
                  <td className="px-6 py-4 text-white/80 font-medium">
                    {reg.eventTitle}
                  </td>
                )}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-4">
                    <button
                      onClick={() => setSelectedRegistration(reg)}
                      className="text-blue-400 hover:text-blue-300 text-xs font-mono uppercase tracking-wider transition-colors"
                    >
                      Details
                    </button>
                    {userRole === "superadmin" && onDelete && (
                      <button
                        onClick={() => onDelete(reg.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-mono uppercase tracking-wider transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedRegistration(null)}>
          <div
            className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden my-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex justify-between items-start bg-[#111] z-10 shrink-0">
              <div className="pr-8">
                <h3 className="text-xl sm:text-2xl font-bold font-syne text-white leading-tight">{selectedRegistration.fullName}</h3>
                <p className="text-white/50 text-xs sm:text-sm mt-1">{selectedRegistration.eventTitle}</p>
              </div>
              <button
                onClick={() => setSelectedRegistration(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Personal Info */}
              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 border-b border-white/10 pb-2">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-[10px] uppercase text-white/30 block mb-1 font-mono">Email</label>
                    <div className="text-white text-sm break-all">{selectedRegistration.email}</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-white/30 block mb-1 font-mono">Phone</label>
                    <div className="text-white text-sm font-mono">{selectedRegistration.phone}</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-white/30 block mb-1 font-mono">College</label>
                    <div className="text-white text-sm">{selectedRegistration.collegeName || "-"}</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-white/30 block mb-1 font-mono">University</label>
                    <div className="text-white text-sm">{selectedRegistration.universityName || "-"}</div>
                  </div>
                </div>
              </section>

              {/* Team Info */}
              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 border-b border-white/10 pb-2">Participation Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-[10px] uppercase text-white/30 block mb-1 font-mono">Registration Date</label>
                    <div className="text-white text-sm">{new Date(selectedRegistration.registrationDate).toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-white/30 block mb-1 font-mono">Team Size</label>
                    <div className="text-white text-lg font-mono">{selectedRegistration.teamSize || 1}</div>
                  </div>
                  {selectedRegistration.teamMembers && (
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-[10px] uppercase text-white/30 block mb-1 font-mono">Team Details</label>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 max-h-60 overflow-y-auto custom-scrollbar">
                        {(() => {
                          try {
                            const members = typeof selectedRegistration.teamMembers === 'string'
                              ? JSON.parse(selectedRegistration.teamMembers)
                              : selectedRegistration.teamMembers;

                            if (Array.isArray(members)) {
                              return (
                                <div className="space-y-2">
                                  {members.map((m: any, idx: number) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm p-2 rounded hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors">
                                      <span className="font-bold text-white">{m.name || `Member ${idx + 1}`}</span>
                                      <span className="text-white/50 font-mono">{m.email}</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            } else if (typeof members === 'object' && members !== null) {
                              return (
                                <div className="space-y-1">
                                  {Object.entries(members).map(([key, value]: [string, any]) => (
                                    <div key={key} className="text-sm">
                                      <span className="text-white/50 uppercase text-xs">{key}:</span> <span className="text-white">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return <div className="text-white/70 text-sm whitespace-pre-wrap">{String(selectedRegistration.teamMembers)}</div>;
                          } catch (e) {
                            return <div className="text-white/70 text-sm whitespace-pre-wrap">{String(selectedRegistration.teamMembers)}</div>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Payment Info */}
              {userRole === "superadmin" && (
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 border-b border-white/10 pb-2">Payment Verification</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-[10px] uppercase text-white/30 block mb-1 font-mono">UPI Transaction ID</label>
                        <div className="font-mono text-green-400 text-sm sm:text-base bg-green-900/10 inline-block px-2 py-1 rounded border border-green-500/20 break-all">
                          {selectedRegistration.upiTransactionId || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-white/30 block mb-1 font-mono">Account Holder</label>
                        <div className="text-white text-sm">{selectedRegistration.accountHolderName || "-"}</div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-white/30 block mb-1 font-mono">Proof of Payment</label>
                      {selectedRegistration.uploadFileUrl ? (
                        <div className="mt-2">
                          <a
                            href={selectedRegistration.uploadFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-bold text-xs uppercase tracking-wide shadow-lg shadow-blue-900/20 w-full sm:w-auto justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            View Receipt File
                          </a>
                        </div>
                      ) : (
                        <span className="text-white/30 italic text-sm">No file uploaded</span>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-white/10 bg-white/5 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedRegistration(null)}
                className="w-full sm:w-auto px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm uppercase tracking-wide"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
