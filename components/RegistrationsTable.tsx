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
      <div className="flex justify-center items-center h-40 sm:h-64">
        <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 sm:p-8 text-center">
        <p className="text-gray-300 text-base sm:text-lg">
          No registrations found
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Header with title and download buttons */}
      <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-700 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start lg:items-center">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
            {eventTitle ? `${eventTitle} - Registrations` : "All Registrations"}
          </h2>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">
            Total: {registrations.length} registrations
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
          <button
            onClick={() => handleDownload("csv")}
            disabled={isDownloading}
            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-3 sm:px-4 rounded transition duration-200 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
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
              {isDownloading ? "Downloading..." : "Download CSV"}
            </span>
            <span className="sm:hidden">{isDownloading ? "..." : "CSV"}</span>
          </button>
          <button
            onClick={() => handleDownload("pdf")}
            disabled={isDownloading}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-2 px-3 sm:px-4 rounded transition duration-200 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
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
              {isDownloading ? "Downloading..." : "Download PDF"}
            </span>
            <span className="sm:hidden">{isDownloading ? "..." : "PDF"}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-gray-700 sticky top-0">
            <tr>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-gray-200">
                Name
              </th>
              <th className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-gray-200">
                Email
              </th>
              <th className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-gray-200">
                Phone
              </th>
              <th className="hidden lg:table-cell px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-gray-200">
                College
              </th>
              <th className="hidden lg:table-cell px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-gray-200">
                University
              </th>
              <th className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-gray-200">
                Team Size
              </th>
              <th className="hidden xl:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-gray-200">
                UPI ID
              </th>
              <th className="hidden 2xl:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-gray-200">
                Holder
              </th>
              <th className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-gray-200">
                File
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-gray-200">
                Date
              </th>
              {!eventTitle && (
                <th className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-gray-200">
                  Event
                </th>
              )}
              {userRole === "superadmin" && onDelete && (
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-gray-200">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg, index) => (
              <tr
                key={reg.id || index}
                className="border-b border-gray-700 hover:bg-gray-750 transition text-xs sm:text-sm"
              >
                <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 text-gray-200">
                  <div className="truncate font-medium">{reg.fullName}</div>
                  <div className="text-gray-400 text-xs sm:hidden truncate">
                    {reg.email}
                  </div>
                </td>
                <td className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-4 text-gray-200 truncate">
                  {reg.email}
                </td>
                <td className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-4 text-gray-200">
                  {reg.phone}
                </td>
                <td className="hidden lg:table-cell px-4 lg:px-6 py-2 sm:py-4 text-gray-200">
                  {reg.collegeName || "-"}
                </td>
                <td className="hidden lg:table-cell px-4 lg:px-6 py-2 sm:py-4 text-gray-200">
                  {reg.universityName || "-"}
                </td>
                <td className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-4 text-gray-200">
                  {reg.teamSize || 1}
                </td>
                <td className="hidden xl:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-4 text-gray-200">
                  {reg.upiTransactionId ? (
                    <span className="font-mono text-xs bg-green-900/30 px-2 py-1 rounded border border-green-600/30 truncate block">
                      {reg.upiTransactionId}
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="hidden 2xl:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-4 text-gray-200 truncate">
                  {reg.accountHolderName || "-"}
                </td>
                <td className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-4 text-gray-200">
                  {reg.uploadFileUrl ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={reg.uploadFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors hover:underline"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span className="hidden sm:inline">View</span>
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                  {new Date(reg.registrationDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                {!eventTitle && (
                  <td className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-4 text-gray-200 text-xs sm:text-sm">
                    {reg.eventTitle}
                  </td>
                )}
                {userRole === "superadmin" && onDelete && (
                  <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 text-gray-200 text-xs sm:text-sm">
                    <button
                      onClick={() => onDelete(reg.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-900/20 rounded"
                      title="Delete Registration"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
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
