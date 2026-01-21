import { neon } from "@neondatabase/serverless";
import { Event } from "@/types/event";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = neon(process.env.DATABASE_URL);

// Database initialization
export async function initDatabase() {
  try {
    // Create events table
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location VARCHAR(255),
        image_url TEXT,
        category VARCHAR(100),
        capacity INTEGER DEFAULT 100,
        registered_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create registrations table
    await sql`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(255) REFERENCES events(id),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        organization VARCHAR(255),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, email)
      )
    `;

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

// Helper functions for events
export async function getEvents(): Promise<Event[]> {
  try {
    const events = await sql`
      SELECT 
        id,
        title,
        description,
        date,
        location,
        image_url as "imageUrl",
        category,
        capacity,
        registered_count as "registeredCount"
      FROM events
      ORDER BY date ASC
    `;
    return events as Event[];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const events = await sql`
      SELECT 
        id,
        title,
        description,
        date,
        location,
        image_url as "imageUrl",
        category,
        capacity,
        registered_count as "registeredCount"
      FROM events
      WHERE id = ${id}
    `;
    return (events[0] as Event) || null;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export async function registerForEvent(registration: {
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  organization?: string;
}) {
  try {
    const result = await sql`
      INSERT INTO event_registrations (event_id, full_name, email, phone, organization)
      VALUES (${registration.eventId}, ${registration.fullName}, ${registration.email}, ${registration.phone}, ${registration.organization || null})
      RETURNING id
    `;

    // Update registered count
    await sql`
      UPDATE events
      SET registered_count = registered_count + 1
      WHERE id = ${registration.eventId}
    `;

    return result[0];
  } catch (error) {
    console.error("Error registering for event:", error);
    throw error;
  }
}
