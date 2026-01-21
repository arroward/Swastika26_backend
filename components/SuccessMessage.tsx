interface SuccessMessageProps {
  message: string;
  title?: string;
}

export default function SuccessMessage({
  message,
  title = "Success",
}: SuccessMessageProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start">
      <div className="flex-shrink-0">
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-lg font-semibold text-green-800">{title}</h3>
        <p className="text-green-700 mt-1">{message}</p>
      </div>
    </div>
  );
}
