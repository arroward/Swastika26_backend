import "dotenv/config";
import { sql, initDatabase } from "../lib/db";
import crypto from "crypto";

// Simple password hash function (matches the one in API)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function seedAdmins() {
  try {
    console.log("Starting admin seed...");

    // Initialize database first
    await initDatabase();

    // Create a superadmin
    const superadminId = crypto.randomUUID();
    const superadminPassword = hashPassword("mathews"); // Change this password!

    await sql`
      INSERT INTO admins (id, email, password, role, name)
      VALUES (
        ${superadminId},
        'mathewsvinoy@gmail.com',
        ${superadminPassword},
        'superadmin',
        'Super Admin'
      )
      ON CONFLICT (email) DO UPDATE
      SET password = ${superadminPassword}
    `;

    console.log("✓ Superadmin created:");
    console.log("  Email: superadmin@swastika26.com");
    console.log("  Password: superadmin123");
    console.log("  Role: superadmin");

    // Get sample events to assign to coordinators
    const events = await sql`
      SELECT id, title FROM events LIMIT 2
    `;

    if (events.length > 0) {
      // Create an event coordinator for the first event
      const coordinatorId = crypto.randomUUID();
      const coordinatorPassword = hashPassword("coordinator123"); // Change this password!

      const coordinator = await sql`
        INSERT INTO admins (id, email, password, role, name)
        VALUES (
          ${coordinatorId},
          'coordinator@swastika26.com',
          ${coordinatorPassword},
          'event_coordinator',
          'Event Coordinator'
        )
        ON CONFLICT (email) DO UPDATE
        SET password = ${coordinatorPassword}
        RETURNING id
      `;

      const actualCoordinatorId = coordinator[0].id;

      // Assign the coordinator to the first event
      await sql`
        INSERT INTO admin_events (admin_id, event_id)
        VALUES (${actualCoordinatorId}, ${events[0].id})
        ON CONFLICT (admin_id, event_id) DO NOTHING
      `;

      console.log("\n✓ Event Coordinator created:");
      console.log("  Email: coordinator@swastika26.com");
      console.log("  Password: coordinator123");
      console.log("  Role: event_coordinator");
      console.log(`  Assigned Event: ${events[0].title}`);

      // If there's a second event, create another coordinator
      if (events.length > 1) {
        const coordinator2Id = crypto.randomUUID();
        const coordinator2Password = hashPassword("coordinator2_123");

        const coordinator2 = await sql`
          INSERT INTO admins (id, email, password, role, name)
          VALUES (
            ${coordinator2Id},
            'coordinator2@swastika26.com',
            ${coordinator2Password},
            'event_coordinator',
            'Event Coordinator 2'
          )
          ON CONFLICT (email) DO UPDATE
          SET password = ${coordinator2Password}
          RETURNING id
        `;

        const actualCoordinator2Id = coordinator2[0].id;

        await sql`
          INSERT INTO admin_events (admin_id, event_id)
          VALUES (${actualCoordinator2Id}, ${events[1].id})
          ON CONFLICT (admin_id, event_id) DO NOTHING
        `;

        console.log("\n✓ Event Coordinator 2 created:");
        console.log("  Email: coordinator2@swastika26.com");
        console.log("  Password: coordinator2_123");
        console.log("  Role: event_coordinator");
        console.log(`  Assigned Event: ${events[1].title}`);
      }
    } else {
      console.log(
        "\n⚠ No events found. Create events first before assigning coordinators.",
      );
      console.log(
        "Event coordinators can be created later by running this script again.",
      );
    }

    console.log("\n✅ Admin seed completed successfully!");
    console.log(
      "\n⚠️  IMPORTANT: Change the default passwords before deploying to production!",
    );
  } catch (error) {
    console.error("Error seeding admins:", error);
    throw error;
  }
}

seedAdmins()
  .then(() => {
    console.log("\nYou can now login at /admin with the credentials above.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
