import "dotenv/config";
import { sql } from "@/lib/db";

async function setEventAsOnline() {
  try {
    // Get first event
    const events = await sql`SELECT id, title FROM events LIMIT 1`;

    if (events.length === 0) {
      console.log("No events found in database");
      return;
    }

    const eventId = events[0].id;
    console.log(
      `\nSetting event "${events[0].title}" (${eventId}) as ONLINE event...\n`,
    );

    // Update the event to be online
    await sql`
      UPDATE events 
      SET is_online = true 
      WHERE id = ${eventId}
    `;

    console.log("✅ Event updated successfully!");
    console.log(
      "\nNow when users register for this event, they will see the file upload field.",
    );

    // Verify the change
    const updated =
      await sql`SELECT id, title, is_online FROM events WHERE id = ${eventId}`;
    console.log("\nUpdated event:");
    console.table(updated);
  } catch (error) {
    console.error("❌ Error updating event:", error);
    throw error;
  }
}

setEventAsOnline()
  .then(() => {
    console.log("\nScript completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nScript failed:", error);
    process.exit(1);
  });
