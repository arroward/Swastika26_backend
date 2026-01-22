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

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-red-400 hover:text-red-300 mb-6 font-semibold"
        >
          <svg
            className="w-5 h-5 mr-2"
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
          Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Info Card */}
          <div className="card-border rounded-2xl shadow-xl overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="glass text-red-300 px-4 py-1 rounded-full text-sm font-semibold border border-red-400/30">
                  {event.category}
                </span>
                {isFullyBooked && (
                  <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Fully Booked
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">
                {event.title}
              </h1>

              <p className="text-white/80 mb-6 leading-relaxed">
                {event.description}
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 mr-3 text-red-400 flex-shrink-0 mt-1"
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
                    <p className="font-semibold text-white">Date & Time</p>
                    <p className="text-white/70">
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
                    className="w-6 h-6 mr-3 text-red-400 flex-shrink-0 mt-1"
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
                    <p className="font-semibold text-white">Location</p>
                    <p className="text-white/70">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 mr-3 text-red-400 flex-shrink-0 mt-1"
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
                    <p className="font-semibold text-white">Capacity</p>
                    <p className="text-white/70">
                      {event.registeredCount} / {event.capacity} registered
                    </p>
                    {!isFullyBooked && (
                      <p className="text-green-400 font-semibold">
                        {event.capacity - event.registeredCount} spots remaining
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {isFullyBooked && (
                <div className="mt-6 bg-red-900/30 border border-red-600/50 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-red-200 font-semibold">
                    This event is fully booked. Registration is currently
                    closed.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Registration Form */}
          <div>
            {isFullyBooked ? (
              <div className="card-border rounded-2xl shadow-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/30 rounded-full mb-4 border border-red-600/30">
                  <svg
                    className="w-8 h-8 text-red-400"
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
                <h2 className="text-2xl font-bold text-white mb-4">
                  Registration Closed
                </h2>
                <p className="text-white/70 mb-6">
                  Unfortunately, this event has reached its maximum capacity.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-red-600/80 hover:bg-red-600 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold transition-all border border-red-500/50"
                >
                  Browse Other Events
                </Link>
              </div>
            ) : (
              <EventRegistrationForm event={event} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
