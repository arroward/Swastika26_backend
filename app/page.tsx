import EventList from "@/components/EventList";
import { Event } from "@/types/event";

// Dummy events data
const dummyEvents: Event[] = [
  {
    id: "tech-summit-2026",
    title: "Tech Summit 2026",
    description:
      "Join industry leaders for a day of innovation, networking, and cutting-edge technology discussions. Learn about the latest trends in AI, cloud computing, and software development.",
    date: "2026-04-15T09:00:00Z",
    location: "San Francisco Convention Center",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    category: "Technology",
    capacity: 200,
    registeredCount: 87,
  },
  {
    id: "design-conference-2026",
    title: "Creative Design Conference",
    description:
      "Explore the future of design with workshops on UX/UI, graphic design, and creative thinking. Network with designers from around the world and showcase your portfolio.",
    date: "2026-05-20T10:00:00Z",
    location: "New York Design Center",
    imageUrl:
      "https://images.unsplash.com/photo-1558403194-611308249627?w=800&q=80",
    category: "Design",
    capacity: 150,
    registeredCount: 62,
  },
  {
    id: "startup-bootcamp-2026",
    title: "Startup Bootcamp",
    description:
      "Intensive 2-day bootcamp for aspiring entrepreneurs. Learn how to build, launch, and scale your startup with guidance from successful founders and investors.",
    date: "2026-06-10T09:00:00Z",
    location: "Austin Startup Hub",
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80",
    category: "Business",
    capacity: 100,
    registeredCount: 45,
  },
];

export default function Home() {
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
        <EventList events={dummyEvents} />
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
