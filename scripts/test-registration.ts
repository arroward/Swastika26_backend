import { config } from "dotenv";
import { sql } from "../lib/db";

config();

async function createTestRegistration() {
  console.log("Creating test registration...");

  await sql`
    INSERT INTO event_registrations (event_id, full_name, email, phone, organization)
    VALUES ('tech-summit-2026', 'John Doe', 'john@example.com', '1234567890', 'Test Org')
    ON CONFLICT DO NOTHING
  `;

  await sql`
    UPDATE events SET registered_count = registered_count + 1 WHERE id = 'tech-summit-2026'
  `;

  console.log("✅ Test registration created");

  const regs =
    await sql`SELECT * FROM event_registrations WHERE event_id = 'tech-summit-2026'`;
  console.log("Total registrations:", regs.length);
  console.log("Registrations:", regs);

  process.exit(0);
}

createTestRegistration().catch(console.error);
