import React, { useState } from "react";

interface RegistrationsTableProps {
  registrations: any[];
  eventTitle?: string;
  isLoading: boolean;
  onDownload: (format: "csv" | "pdf") => Promise<void>;
}

export default function RegistrationsTable({
  registrations,
  eventTitle,
  isLoading,
  onDownload,
}: RegistrationsTableProps) {
  const [downloadFormat, setDownloadFormat] = useState<"csv" | "pdf">("csv");
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-300 text-lg">No registrations found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Header with title and download buttons */}
      <div className="p-6 border-b border-gray-700 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {eventTitle ? `${eventTitle} - Registrations` : "All Registrations"}
          </h2>
          <p className="text-gray-400 mt-1">
            Total: {registrations.length} registrations
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleDownload("csv")}
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {isDownloading ? "Downloading..." : "Download CSV"}
          </button>
          <button
            onClick={() => handleDownload("pdf")}
            disabled={isDownloading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
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
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            {isDownloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                College
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                University
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                Team Size
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                UPI Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                Account Holder
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                Uploaded File
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                Registration Date
              </th>
              {!eventTitle && (
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Event
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg, index) => (
              <tr
                key={reg.id || index}
                className="border-b border-gray-700 hover:bg-gray-750 transition"
              >
                <td className="px-6 py-4 text-gray-200">{reg.fullName}</td>
                <td className="px-6 py-4 text-gray-200">{reg.email}</td>
                <td className="px-6 py-4 text-gray-200">{reg.phone}</td>
                <td className="px-6 py-4 text-gray-200">
                  {reg.collegeName || "-"}
                </td>
                <td className="px-6 py-4 text-gray-200">
                  {reg.universityName || "-"}
                </td>
                <td className="px-6 py-4 text-gray-200">{reg.teamSize || 1}</td>
                <td className="px-6 py-4 text-gray-200">
                  {reg.upiTransactionId ? (
                    <span className="font-mono text-sm bg-green-900/30 px-2 py-1 rounded border border-green-600/30">
                      {reg.upiTransactionId}
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-200">
                  {reg.accountHolderName || "-"}
                </td>
                <td className="px-6 py-4 text-gray-200">
                  {reg.uploadFileUrl ? (
                    <a
                      href={reg.uploadFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
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
                          strokeWidth="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      View File
                    </a>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {new Date(reg.registrationDate).toLocaleDateString()}
                </td>
                {!eventTitle && (
                  <td className="px-6 py-4 text-gray-200 text-sm">
                    {reg.eventTitle}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
