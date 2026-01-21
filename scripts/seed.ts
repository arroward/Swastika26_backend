import { sql, initDatabase } from "../lib/db";

const sampleEvents = [
  {
    id: "tech-conference-2026",
    title: "Tech Innovation Conference 2026",
    description:
      "Join us for a full-day conference exploring the latest innovations in technology, AI, and software development. Network with industry leaders and discover cutting-edge solutions.",
    date: "2026-03-15T09:00:00Z",
    location: "San Francisco Convention Center, CA",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    category: "Technology",
    capacity: 200,
    registeredCount: 87,
  },
  {
    id: "startup-pitch-night",
    title: "Startup Pitch Night",
    description:
      "Watch innovative startups pitch their ideas to a panel of venture capitalists and angel investors. Great networking opportunity for entrepreneurs and investors alike.",
    date: "2026-02-28T18:00:00Z",
    location: "Innovation Hub, New York",
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80",
    category: "Business",
    capacity: 100,
    registeredCount: 45,
  },
  {
    id: "web3-workshop",
    title: "Web3 Development Workshop",
    description:
      "Hands-on workshop covering blockchain development, smart contracts, and decentralized applications. Perfect for developers looking to enter the Web3 space.",
    date: "2026-03-22T10:00:00Z",
    location: "Tech Campus, Austin, TX",
    imageUrl:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    category: "Workshop",
    capacity: 50,
    registeredCount: 48,
  },
  {
    id: "design-thinking-summit",
    title: "Design Thinking Summit",
    description:
      "Learn from design experts about user-centered design, prototyping, and creating exceptional user experiences. Includes interactive workshops and case studies.",
    date: "2026-04-10T09:00:00Z",
    location: "Design Center, Seattle, WA",
    imageUrl:
      "https://images.unsplash.com/photo-1558403194-611308249627?w=800&q=80",
    category: "Design",
    capacity: 150,
    registeredCount: 62,
  },
  {
    id: "ai-ml-bootcamp",
    title: "AI & Machine Learning Bootcamp",
    description:
      "Intensive 3-day bootcamp covering fundamentals of AI, machine learning algorithms, and practical implementations. Includes project work and certification.",
    date: "2026-05-05T09:00:00Z",
    location: "Data Science Institute, Boston, MA",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    category: "Technology",
    capacity: 75,
    registeredCount: 71,
  },
  {
    id: "digital-marketing-masterclass",
    title: "Digital Marketing Masterclass",
    description:
      "Master the latest digital marketing strategies including SEO, social media marketing, content marketing, and analytics. Led by industry veterans.",
    date: "2026-03-08T10:00:00Z",
    location: "Marketing Hub, Chicago, IL",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    category: "Marketing",
    capacity: 120,
    registeredCount: 34,
  },
];

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Initialize database tables
    await initDatabase();
    console.log("✅ Database tables initialized");

    // Insert sample events
    for (const event of sampleEvents) {
      await sql`
        INSERT INTO events (id, title, description, date, location, image_url, category, capacity, registered_count)
        VALUES (
          ${event.id},
          ${event.title},
          ${event.description},
          ${event.date},
          ${event.location},
          ${event.imageUrl},
          ${event.category},
          ${event.capacity},
          ${event.registeredCount}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          date = EXCLUDED.date,
          location = EXCLUDED.location,
          image_url = EXCLUDED.image_url,
          category = EXCLUDED.category,
          capacity = EXCLUDED.capacity,
          registered_count = EXCLUDED.registered_count
      `;
      console.log(`✅ Inserted/Updated event: ${event.title}`);
    }

    console.log(`🎉 Successfully seeded ${sampleEvents.length} events!`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
