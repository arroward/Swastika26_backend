import Link from "next/link";
import { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const isFullyBooked = event.registeredCount >= event.capacity;
  const availableSpots = event.capacity - event.registeredCount;

  return (
    <Link href={`/${event.id}/register`}>
      <div className="group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer">
        {/* Event Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {/* Category Badge */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
            {event.category}
          </div>
          {/* Fully Booked Badge */}
          {isFullyBooked && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
              Fully Booked
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>

          <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

          {/* Event Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-700">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
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
              <span className="text-sm">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center text-gray-700">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
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
              <span className="text-sm">{event.location}</span>
            </div>
          </div>

          {/* Capacity Info */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
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
              <span className="text-sm text-gray-700">
                {isFullyBooked ? (
                  <span className="text-red-600 font-semibold">
                    No spots left
                  </span>
                ) : (
                  <span>
                    <span className="font-semibold text-green-600">
                      {availableSpots}
                    </span>{" "}
                    spots left
                  </span>
                )}
              </span>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
              Register Now →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
