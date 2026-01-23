import { notFound } from "next/navigation";
import Link from "next/link";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { getEventById } from "@/lib/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventRegisterPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch event from database
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const isFullyBooked = event.registeredCount >= event.capacity;
  const percentageBooked = Math.round(
    (event.registeredCount / event.capacity) * 100,
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-red-950/20 to-black">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-red-600/20 to-red-900/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-red-900/20 to-black/50 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-white/5 to-red-500/5 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        {/* Moving gradient lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-white/20 to-transparent animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 py-12 md:py-20">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-12 font-semibold transition-all duration-300 hover:gap-3 group text-sm md:text-base"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Return to Events</span>
        </Link>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
          {/* Event Info Card - Premium Design */}
          <div className="lg:col-span-2">
            <div className="group">
              {/* Card Container */}
              <div className="relative bg-gradient-to-br from-red-900/10 to-black/40 backdrop-blur-xl rounded-3xl border border-red-500/10 overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-2xl hover:border-red-500/20">
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-900/0 group-hover:from-red-500/10 group-hover:to-red-900/10 transition-all duration-500 pointer-events-none"></div>

                {/* Image Container */}
                <div className="relative h-80 md:h-96 overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                  {/* Category Badge */}
                  <div className="absolute top-6 left-6 z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/40 to-red-900/40 backdrop-blur-md text-red-100 rounded-full text-xs md:text-sm font-bold border border-red-400/60 hover:border-red-300/80 transition-all hover:bg-gradient-to-r hover:from-red-600/50 hover:to-red-800/50">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      {event.category}
                    </span>
                  </div>

                  {/* Fully Booked Badge */}
                  {isFullyBooked && (
                    <div className="absolute top-6 right-6 z-10">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/70 to-red-700/70 backdrop-blur-md text-white rounded-full text-xs md:text-sm font-bold border border-red-400/60 animate-pulse">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M13.477 14.89A6 6 0 0 1 5.11 2.523a6 6 0 0 1 8.367 8.367z"
                          />
                        </svg>
                        Fully Booked
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="relative p-8 md:p-10">
                  <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent mb-3 leading-tight">
                    {event.title}
                  </h1>

                  <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8 line-clamp-3 hover:line-clamp-none transition-all">
                    {event.description}
                  </p>

                  {/* Premium Details Grid */}
                  <div className="space-y-5">
                    {/* Date Detail */}
                    <div className="flex gap-4 items-start group/item cursor-default">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center border border-red-400/30 group-hover/item:border-red-300/60 transition-all duration-300 group-hover/item:from-red-500/30 group-hover/item:to-red-600/20">
                        <svg
                          className="w-6 h-6 text-red-400"
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
                      </div>
                      <div>
                        <p className="font-semibold text-white/70 text-xs md:text-sm uppercase tracking-wide">
                          Date & Time
                        </p>
                        <p className="text-white font-bold mt-2 text-sm md:text-base">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Location Detail */}
                    <div className="flex gap-4 items-start group/item cursor-default">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/20 group-hover/item:border-white/40 transition-all duration-300 group-hover/item:from-white/15 group-hover/item:to-white/10">
                        <svg
                          className="w-6 h-6 text-white"
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
                      </div>
                      <div>
                        <p className="font-semibold text-white/70 text-xs md:text-sm uppercase tracking-wide">
                          Location
                        </p>
                        <p className="text-white font-bold mt-2 text-sm md:text-base">
                          {event.location}
                        </p>
                      </div>
                    </div>

                    {/* Capacity Detail with Progress Bar */}
                    <div className="flex gap-4 items-start group/item cursor-default">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/20 group-hover/item:border-white/40 transition-all duration-300 group-hover/item:from-white/15 group-hover/item:to-white/10">
                        <svg
                          className="w-6 h-6 text-white"
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
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white/70 text-xs md:text-sm uppercase tracking-wide">
                          Capacity
                        </p>
                        <p className="text-white font-bold mt-2 text-sm md:text-base">
                          {event.registeredCount} / {event.capacity} registered
                        </p>
                        {!isFullyBooked && (
                          <div className="mt-3 space-y-2">
                            <div className="w-full bg-white/5 rounded-full h-2 border border-white/10 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 transition-all duration-500 rounded-full"
                                style={{
                                  width: `${percentageBooked}%`,
                                  boxShadow: "0 0 20px rgba(220, 38, 38, 0.5)",
                                }}
                              ></div>
                            </div>
                            <p className="text-red-400 text-xs font-semibold">
                              {event.capacity - event.registeredCount} spots
                              remaining ({percentageBooked}% full)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isFullyBooked && (
                    <div className="mt-8 bg-gradient-to-r from-red-600/20 to-red-700/10 border border-red-500/30 rounded-xl p-6 backdrop-blur-md text-center">
                      <p className="text-red-200 font-bold text-sm md:text-base">
                        This event has reached maximum capacity.
                      </p>
                      <p className="text-red-300/70 text-xs md:text-sm mt-2">
                        Check back soon for new events
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form Section */}
          <div className="lg:col-span-3">
            {isFullyBooked ? (
              <div className="sticky top-6">
                <div className="relative bg-gradient-to-br from-red-900/10 to-black/40 backdrop-blur-xl rounded-3xl border border-red-500/10 p-12 shadow-2xl text-center group">
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-900/0 group-hover:from-red-500/10 group-hover:to-red-900/10 transition-all duration-500 rounded-3xl pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600/30 to-red-700/20 rounded-2xl mb-6 border border-red-500/50">
                      <svg
                        className="w-10 h-10 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-4">
                      Registration Closed
                    </h2>
                    <p className="text-white/70 mb-8 text-base md:text-lg leading-relaxed">
                      Unfortunately, this event has reached its maximum
                      capacity. Registration is no longer available.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 border border-red-500/50 hover:border-red-400/80 group/btn shadow-lg hover:shadow-red-500/25"
                      >
                        <svg
                          className="w-5 h-5 transition-transform group-hover/btn:rotate-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        Browse Other Events
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="sticky top-6">
                <EventRegistrationForm event={event} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div
        className="absolute top-20 right-10 w-2 h-2 bg-red-500/40 rounded-full animate-pulse"
        style={{ animationDuration: "3s" }}
      ></div>
      <div
        className="absolute bottom-40 left-10 w-2 h-2 bg-white/40 rounded-full animate-pulse"
        style={{ animationDuration: "4s", animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-red-600/40 rounded-full animate-pulse"
        style={{ animationDuration: "2.5s", animationDelay: "1s" }}
      ></div>
    </div>
  );
}
