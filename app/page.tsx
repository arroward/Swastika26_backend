import EventList from "@/components/EventList";
import { getEvents } from "@/lib/db";

export default async function Home() {
  // Fetch events from database
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 text-center">
            Upcoming Events
          </h1>
          <p className="text-xl text-center text-blue-100 max-w-2xl mx-auto">
            Discover and register for exciting events. Connect with like-minded
            individuals and expand your horizons.
          </p>
        </div>
      </div>

      {/* Events Section */}
      <div className="container mx-auto px-4 py-12">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No events available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <EventList events={events} />
        )}
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-lg mb-6 text-purple-100">
            Click on any event card above to register and secure your spot!
          </p>
        </div>
      </div>
    </div>
  );
}
