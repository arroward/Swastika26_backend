import "dotenv/config";
import { sql } from "@/lib/db";

async function addRegistrationFeeFields() {
  try {
    console.log("Adding registration fee fields to database...");

    // Add registration_fee column to events table
    await sql`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS registration_fee INTEGER DEFAULT 0
    `;
    console.log("✓ Added registration_fee column to events table");

    // Add payment fields to event_registrations table
    await sql`
      ALTER TABLE event_registrations
      ADD COLUMN IF NOT EXISTS upi_transaction_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255)
    `;
    console.log(
      "✓ Added upi_transaction_id and account_holder_name columns to event_registrations table",
    );

    console.log("\n✅ Database schema updated successfully!");
    console.log("\nNew columns added:");
    console.log("- events.registration_fee (INTEGER)");
    console.log("- event_registrations.upi_transaction_id (VARCHAR)");
    console.log("- event_registrations.account_holder_name (VARCHAR)");
  } catch (error) {
    console.error("❌ Error updating database schema:", error);
    throw error;
  }
}

addRegistrationFeeFields()
  .then(() => {
    console.log("\nScript completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nScript failed:", error);
    process.exit(1);
  });
