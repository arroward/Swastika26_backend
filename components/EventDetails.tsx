import { Event } from "@/types/event";

interface EventDetailsProps {
  event: Event;
  className?: string;
}

export default function EventDetails({
  event,
  className = "",
}: EventDetailsProps) {
  const isFullyBooked = event.registeredCount >= event.capacity;

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}
    >
      <img
        src={event.imageUrl}
        alt={event.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            {event.category}
          </span>
          {isFullyBooked && (
            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Fully Booked
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">{event.title}</h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {event.description}
        </p>

        <div className="space-y-4">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="font-semibold text-gray-800">Date & Time</p>
              <p className="text-gray-600">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <svg
              className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div>
              <p className="font-semibold text-gray-800">Location</p>
              <p className="text-gray-600">{event.location}</p>
            </div>
          </div>

          <div className="flex items-start">
            <svg
              className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <div>
              <p className="font-semibold text-gray-800">Capacity</p>
              <p className="text-gray-600">
                {event.registeredCount} / {event.capacity} registered
              </p>
              {!isFullyBooked && (
                <p className="text-green-600 font-semibold">
                  {event.capacity - event.registeredCount} spots remaining
                </p>
              )}
            </div>
          </div>
        </div>

        {isFullyBooked && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-semibold">
              This event is fully booked. Registration is currently closed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
