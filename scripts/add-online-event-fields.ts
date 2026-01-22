import "dotenv/config";
import { sql } from "@/lib/db";

async function addOnlineEventFields() {
  try {
    console.log("Adding online event fields to database...");

    // Add is_online column to events table
    await sql`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false
    `;
    console.log("✓ Added is_online column to events table");

    // Add upload_file_url field to event_registrations table
    await sql`
      ALTER TABLE event_registrations
      ADD COLUMN IF NOT EXISTS upload_file_url TEXT
    `;
    console.log("✓ Added upload_file_url column to event_registrations table");

    console.log("\n✅ Database schema updated successfully!");
    console.log("\nNew columns added:");
    console.log("- events.is_online (BOOLEAN, default false)");
    console.log("- event_registrations.upload_file_url (TEXT)");
  } catch (error) {
    console.error("❌ Error updating database schema:", error);
    throw error;
  }
}

addOnlineEventFields()
  .then(() => {
    console.log("\nScript completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nScript failed:", error);
    process.exit(1);
  });
