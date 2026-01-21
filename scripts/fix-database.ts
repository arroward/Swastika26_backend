import { config } from "dotenv";
import { sql } from "../lib/db";

// Load environment variables
config();

async function fixDatabaseRelationships() {
  console.log("🔧 Fixing Database Relationships...\n");

  try {
    // Step 1: Remove orphaned registrations
    console.log("1️⃣ Removing orphaned event registrations...");
    const orphanedRegsResult = await sql`
      DELETE FROM event_registrations
      WHERE event_id NOT IN (SELECT id FROM events)
      RETURNING id
    `;
    console.log(
      `   Removed ${orphanedRegsResult.length} orphaned registrations\n`,
    );

    // Step 2: Remove orphaned admin_events
    console.log("2️⃣ Removing orphaned admin_events...");
    const orphanedAdminEvents = await sql`
      DELETE FROM admin_events
      WHERE admin_id NOT IN (SELECT id FROM admins)
        OR event_id NOT IN (SELECT id FROM events)
      RETURNING admin_id, event_id
    `;
    console.log(
      `   Removed ${orphanedAdminEvents.length} orphaned admin_events\n`,
    );

    // Step 3: Fix registered_count for all events
    console.log("3️⃣ Fixing registered_count for all events...");
    const fixedCounts = await sql`
      UPDATE events e
      SET registered_count = (
        SELECT COUNT(*) 
        FROM event_registrations er 
        WHERE er.event_id = e.id
      )
      WHERE e.registered_count != (
        SELECT COUNT(*) 
        FROM event_registrations er 
        WHERE er.event_id = e.id
      )
      RETURNING id, title, registered_count
    `;
    if (fixedCounts.length > 0) {
      console.log(
        `   Fixed registered_count for ${fixedCounts.length} events:`,
      );
      fixedCounts.forEach((event: any) => {
        console.log(
          `     - ${event.title}: ${event.registered_count} registrations`,
        );
      });
    } else {
      console.log(`   All registered_count values are already correct`);
    }
    console.log();

    // Step 4: Ensure foreign key constraints exist (drop and recreate if needed)
    console.log("4️⃣ Verifying foreign key constraints...");

    // Check if constraints exist
    const existingConstraints = await sql`
      SELECT constraint_name, table_name
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
        AND table_schema = 'public'
        AND table_name IN ('event_registrations', 'admin_events')
    `;

    console.log(
      `   Found ${existingConstraints.length} foreign key constraints\n`,
    );

    // Recreate event_registrations constraint if needed
    try {
      // Drop old constraint if it exists without CASCADE
      await sql`
        ALTER TABLE event_registrations
        DROP CONSTRAINT IF EXISTS event_registrations_event_id_fkey
      `;

      // Add new constraint with CASCADE
      await sql`
        ALTER TABLE event_registrations
        ADD CONSTRAINT event_registrations_event_id_fkey
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
      `;
      console.log(
        "   ✅ event_registrations foreign key constraint added with CASCADE",
      );
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log(
          "   ℹ️  event_registrations foreign key constraint already exists",
        );
      } else {
        console.error(
          "   ⚠️  Could not update event_registrations constraint:",
          error.message,
        );
      }
    }

    // Verify admin_events constraints
    try {
      // Drop and recreate admin_id constraint
      await sql`
        ALTER TABLE admin_events
        DROP CONSTRAINT IF EXISTS admin_events_admin_id_fkey
      `;

      await sql`
        ALTER TABLE admin_events
        ADD CONSTRAINT admin_events_admin_id_fkey
        FOREIGN KEY (admin_id)
        REFERENCES admins(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
      `;
      console.log(
        "   ✅ admin_events.admin_id foreign key constraint added with CASCADE",
      );
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("   ℹ️  admin_events.admin_id constraint already exists");
      } else {
        console.error(
          "   ⚠️  Could not update admin_events.admin_id constraint:",
          error.message,
        );
      }
    }

    try {
      // Drop and recreate event_id constraint
      await sql`
        ALTER TABLE admin_events
        DROP CONSTRAINT IF EXISTS admin_events_event_id_fkey
      `;

      await sql`
        ALTER TABLE admin_events
        ADD CONSTRAINT admin_events_event_id_fkey
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
      `;
      console.log(
        "   ✅ admin_events.event_id foreign key constraint added with CASCADE\n",
      );
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("   ℹ️  admin_events.event_id constraint already exists\n");
      } else {
        console.error(
          "   ⚠️  Could not update admin_events.event_id constraint:",
          error.message,
        );
      }
    }

    // Step 5: Add indexes for better performance
    console.log("5️⃣ Adding indexes for better performance...");

    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id 
        ON event_registrations(event_id)
      `;
      console.log("   ✅ Index on event_registrations.event_id");
    } catch (error) {
      console.log(
        "   ℹ️  Index on event_registrations.event_id already exists",
      );
    }

    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_admin_events_admin_id 
        ON admin_events(admin_id)
      `;
      console.log("   ✅ Index on admin_events.admin_id");
    } catch (error) {
      console.log("   ℹ️  Index on admin_events.admin_id already exists");
    }

    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_admin_events_event_id 
        ON admin_events(event_id)
      `;
      console.log("   ✅ Index on admin_events.event_id");
    } catch (error) {
      console.log("   ℹ️  Index on admin_events.event_id already exists");
    }

    console.log("\n✨ Database relationships fixed successfully!\n");
    console.log("Run 'npm run verify-db' to verify all changes.\n");
  } catch (error) {
    console.error("❌ Error fixing database relationships:", error);
    throw error;
  }
}

fixDatabaseRelationships()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
