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
      <div className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-700/50 hover:border-cyan-500/50">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Event Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Animated corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent blur-2xl group-hover:scale-150 transition-transform duration-500" />

          {/* Category Badge */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
            {event.category}
          </div>

          {/* Online Badge */}
          {event.isOnline && !isFullyBooked && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>ONLINE</span>
            </div>
          )}

          {/* Fully Booked Badge */}
          {isFullyBooked && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
              FULLY BOOKED
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="relative p-6 space-y-4">
          {/* Title */}
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white leading-tight group-hover:from-cyan-300 group-hover:to-purple-300 transition-all duration-300">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
            {event.description}
          </p>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

          {/* Event Info */}
          <div className="space-y-3">
            {/* Date */}
            <div className="flex items-center text-slate-300 group-hover:text-cyan-300 transition-colors">
              <svg
                className="w-5 h-5 mr-3 text-cyan-400"
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
              <span className="text-sm font-medium">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center text-slate-300 group-hover:text-purple-300 transition-colors">
              <svg
                className="w-5 h-5 mr-3 text-purple-400"
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
              <span className="text-sm font-medium">{event.location}</span>
            </div>

            {/* Fee and Capacity */}
            <div className="flex items-center justify-between pt-2">
              {/* Registration Fee */}
              {event.registrationFee && event.registrationFee > 0 ? (
                <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-lg font-bold text-amber-300">
                    ₹{event.registrationFee}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                  <svg
                    className="w-5 h-5 text-emerald-400"
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
                  <span className="text-lg font-bold text-emerald-300">
                    FREE
                  </span>
                </div>
              )}

              {/* Capacity */}
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-pink-400"
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
                {isFullyBooked ? (
                  <span className="text-sm font-bold text-red-400">
                    No spots left
                  </span>
                ) : (
                  <span className="text-sm font-bold text-slate-300">
                    {availableSpots}{" "}
                    <span className="font-normal text-slate-400">
                      spots left
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Register Button */}
          <div className="pt-4">
            <div
              className={`relative w-full font-bold py-3.5 px-6 rounded-xl transition-all duration-300 text-center text-base overflow-hidden
                ${
                  isFullyBooked
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 group-hover:scale-[1.02]"
                }`}
            >
              {!isFullyBooked && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              <span className="relative flex items-center justify-center gap-2">
                {isFullyBooked ? (
                  "Event Full"
                ) : (
                  <>
                    Register Now
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
