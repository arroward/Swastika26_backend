import EventList from "@/components/EventList";
import { getEvents } from "@/lib/db";

export default async function Home() {
  // Fetch events from database
  const events = await getEvents();

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-900/40 via-red-800/30 to-red-900/40 backdrop-blur-sm text-white py-16 border-b border-red-600/20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 text-center text-white drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            Upcoming Events
          </h1>
          <p className="text-xl text-center text-red-100 max-w-2xl mx-auto">
            Discover and register for exciting events. Connect with like-minded
            individuals and expand your horizons.
          </p>
        </div>
      </div>

      {/* Events Section */}
      <div className="container mx-auto px-4 py-12">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-red-200 text-lg">
              No events available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <EventList events={events} />
        )}
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-red-900/40 to-red-800/40 backdrop-blur-sm rounded-2xl p-8 text-white text-center shadow-xl border border-red-600/30">
          <h2 className="text-3xl font-bold mb-4 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            Ready to Join?
          </h2>
          <p className="text-lg mb-6 text-red-100">
            Click on any event card above to register and secure your spot!
          </p>
        </div>
      </div>
    </div>
  );
}
