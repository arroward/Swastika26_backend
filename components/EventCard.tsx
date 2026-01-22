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
      <div className="relative card-border overflow-hidden rounded-2xl flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/30 animate-float cursor-pointer group">
        {/* Event Image with overlay */}
        <div className="p-4 flex justify-center relative">
          <div className="w-full h-48 rounded-xl gradient-border inner-glow overflow-hidden relative">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Animated grid overlay */}
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, rgba(220, 38, 38, 0.3) 1px, transparent 1px), linear-gradient(rgba(220, 38, 38, 0.3) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 right-3 glass text-red-300 px-3 py-1.5 rounded-full text-xs font-medium border border-red-400/30 backdrop-blur-md">
              {event.category}
            </div>

            {/* Fully Booked Badge */}
            {isFullyBooked && (
              <div className="absolute top-3 left-3 bg-red-600/90 text-white px-3 py-1.5 rounded-full text-xs font-semibold border border-red-400/50 backdrop-blur-md">
                Fully Booked
              </div>
            )}
          </div>
        </div>

        {/* Divider with glow effect */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

        {/* Event Details */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="text-lg font-medium text-white group-hover:text-red-300 transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-white/70 leading-relaxed text-xs line-clamp-2">
            {event.description}
          </p>

          {/* Event Info Grid */}
          <div className="space-y-2">
            {/* Date */}
            <div className="flex items-center text-white/80">
              <svg
                className="w-4 h-4 mr-2 text-red-400"
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
              <span className="text-xs">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center text-white/80">
              <svg
                className="w-4 h-4 mr-2 text-red-400"
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
              <span className="text-xs">{event.location}</span>
            </div>

            {/* Capacity */}
            <div className="flex items-center text-white/80">
              <svg
                className="w-4 h-4 mr-2 text-red-400"
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
              <span className="text-xs">
                {isFullyBooked ? (
                  <span className="text-red-400 font-semibold">
                    No spots left
                  </span>
                ) : (
                  <span>
                    <span className="font-semibold text-green-400">
                      {availableSpots}
                    </span>{" "}
                    spots available
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-between items-center pt-3">
            <div className="text-red-400 hover:text-red-300 transition flex items-center text-xs font-medium glass px-3 py-1.5 rounded-lg border border-red-400/30 group-hover:border-red-400/50">
              Register Now
              <svg
                className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-white/50 text-xs glass px-2 py-1 rounded-full border border-white/10">
              {isFullyBooked ? "Closed" : "Open"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
