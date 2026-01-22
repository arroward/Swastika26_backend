import EventList from "@/components/EventList";
import Navbar from "@/components/Navbar";
import { getEvents } from "@/lib/db";

export default async function Home() {
  // Fetch events from database
  const events = await getEvents();

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Events Section */}
      <div className="container mx-auto px-4 py-12 pt-28 md:pt-32">
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
    </div>
  );
}
