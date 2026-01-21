import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file FIRST
config({ path: resolve(process.cwd(), ".env") });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env file");
  process.exit(1);
}

import { sql, initDatabase } from "../lib/db";

const sampleEvents = [
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
