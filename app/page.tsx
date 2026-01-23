import EventList from "@/components/EventList";
import Navbar from "@/components/Navbar";
import { getEvents } from "@/lib/db";
import LightRays from "@/components/LightRays";

export default async function Home() {
  // Fetch events from database
  const events = await getEvents();

  return (
    <div className="min-h-screen relative bg-black">
      <Navbar />
      <div className="fixed inset-0 z-0 w-screen h-screen">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="w-full h-full"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>
      {/* Events Section */}
      <div className="container mx-auto px-4 py-12 pt-28 md:pt-32 relative z-10">
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
