import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function checkAssignments() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    console.log("=== Checking Admin-Event Assignments ===\n");

    const assignments = await sql`
      SELECT 
        a.email,
        a.name,
        a.role,
        e.title as event_title
      FROM admin_events ae
      JOIN admins a ON ae.admin_id = a.id
      JOIN events e ON ae.event_id = e.id
      ORDER BY a.email
    `;

    if (assignments.length === 0) {
      console.log("❌ No event assignments found!");
      console.log("\nChecking if coordinators exist...");

      const coordinators = await sql`
        SELECT id, email, name FROM admins WHERE role = 'event_coordinator'
      `;
      console.log(`Found ${coordinators.length} coordinators:`);
      coordinators.forEach((c) => console.log(`  - ${c.email}`));

      console.log("\nChecking if events exist...");
      const events = await sql`
        SELECT id, title FROM events
      `;
      console.log(`Found ${events.length} events:`);
      events.forEach((e) => console.log(`  - ${e.title}`));
    } else {
      console.log(`✅ Found ${assignments.length} assignments:\n`);
      assignments.forEach((a) => {
        console.log(`${a.name} (${a.email})`);
        console.log(`  → ${a.event_title}\n`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkAssignments();
