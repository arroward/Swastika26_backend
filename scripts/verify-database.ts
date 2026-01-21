import { config } from "dotenv";
import { sql } from "../lib/db";

// Load environment variables
config();

async function verifyDatabase() {
  console.log("🔍 Verifying Database Schema and Relationships...\n");

  try {
    // Check if all tables exist
    console.log("📋 Checking Tables:");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;

    const tableNames = tables.map((t: any) => t.table_name);
    const requiredTables = [
      "events",
      "event_registrations",
      "admins",
      "admin_events",
    ];

    requiredTables.forEach((tableName) => {
      if (tableNames.includes(tableName)) {
        console.log(`  ✅ ${tableName} table exists`);
      } else {
        console.log(`  ❌ ${tableName} table is missing!`);
      }
    });

    // Check foreign key constraints
    console.log("\n🔗 Checking Foreign Key Constraints:");
    const constraints = await sql`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule,
        rc.update_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name
    `;

    if (constraints.length === 0) {
      console.log("  ⚠️  No foreign key constraints found!");
    } else {
      constraints.forEach((c: any) => {
        console.log(
          `  ✅ ${c.table_name}.${c.column_name} → ${c.foreign_table_name}.${c.foreign_column_name}`,
        );
        console.log(
          `     ON DELETE: ${c.delete_rule}, ON UPDATE: ${c.update_rule}`,
        );
      });
    }

    // Check events table structure
    console.log("\n📊 Events Table Structure:");
    const eventsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `;
    eventsColumns.forEach((col: any) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} ${col.is_nullable === "NO" ? "NOT NULL" : "NULL"}`,
      );
    });

    // Check event_registrations table structure
    console.log("\n📊 Event Registrations Table Structure:");
    const regColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'event_registrations'
      ORDER BY ordinal_position
    `;
    regColumns.forEach((col: any) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} ${col.is_nullable === "NO" ? "NOT NULL" : "NULL"}`,
      );
    });

    // Check admins table structure
    console.log("\n📊 Admins Table Structure:");
    const adminsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'admins'
      ORDER BY ordinal_position
    `;
    adminsColumns.forEach((col: any) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} ${col.is_nullable === "NO" ? "NOT NULL" : "NULL"}`,
      );
    });

    // Check admin_events table structure
    console.log("\n📊 Admin Events Junction Table Structure:");
    const adminEventsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'admin_events'
      ORDER BY ordinal_position
    `;
    adminEventsColumns.forEach((col: any) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} ${col.is_nullable === "NO" ? "NOT NULL" : "NULL"}`,
      );
    });

    // Check data counts
    console.log("\n📈 Data Counts:");
    const eventCount = await sql`SELECT COUNT(*) as count FROM events`;
    console.log(`  Events: ${eventCount[0].count}`);

    const regCount =
      await sql`SELECT COUNT(*) as count FROM event_registrations`;
    console.log(`  Registrations: ${regCount[0].count}`);

    const adminCount = await sql`SELECT COUNT(*) as count FROM admins`;
    console.log(`  Admins: ${adminCount[0].count}`);

    const adminEventCount =
      await sql`SELECT COUNT(*) as count FROM admin_events`;
    console.log(`  Admin-Event Assignments: ${adminEventCount[0].count}`);

    // Check for orphaned records
    console.log("\n🔍 Checking for Orphaned Records:");

    // Orphaned registrations (event_id not in events)
    const orphanedRegs = await sql`
      SELECT COUNT(*) as count 
      FROM event_registrations er
      LEFT JOIN events e ON er.event_id = e.id
      WHERE e.id IS NULL
    `;
    if (orphanedRegs[0].count > 0) {
      console.log(
        `  ⚠️  Found ${orphanedRegs[0].count} orphaned registrations!`,
      );
    } else {
      console.log(`  ✅ No orphaned registrations`);
    }

    // Orphaned admin_events (admin_id not in admins)
    const orphanedAdminEvents = await sql`
      SELECT COUNT(*) as count 
      FROM admin_events ae
      LEFT JOIN admins a ON ae.admin_id = a.id
      WHERE a.id IS NULL
    `;
    if (orphanedAdminEvents[0].count > 0) {
      console.log(
        `  ⚠️  Found ${orphanedAdminEvents[0].count} orphaned admin_events (invalid admin_id)!`,
      );
    } else {
      console.log(`  ✅ No orphaned admin_events (admin_id)`);
    }

    // Orphaned admin_events (event_id not in events)
    const orphanedEventAssignments = await sql`
      SELECT COUNT(*) as count 
      FROM admin_events ae
      LEFT JOIN events e ON ae.event_id = e.id
      WHERE e.id IS NULL
    `;
    if (orphanedEventAssignments[0].count > 0) {
      console.log(
        `  ⚠️  Found ${orphanedEventAssignments[0].count} orphaned admin_events (invalid event_id)!`,
      );
    } else {
      console.log(`  ✅ No orphaned admin_events (event_id)`);
    }

    // Check registered_count accuracy
    console.log("\n🔢 Verifying Registered Count Accuracy:");
    const countCheck = await sql`
      SELECT 
        e.id,
        e.title,
        e.registered_count,
        COUNT(er.id) as actual_count
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id
      GROUP BY e.id, e.title, e.registered_count
      HAVING e.registered_count != COUNT(er.id)
    `;

    if (countCheck.length > 0) {
      console.log(
        `  ⚠️  Found ${countCheck.length} events with incorrect registered_count:`,
      );
      countCheck.forEach((event: any) => {
        console.log(
          `     ${event.title}: stored=${event.registered_count}, actual=${event.actual_count}`,
        );
      });
    } else {
      console.log(`  ✅ All event registered_count values are accurate`);
    }

    console.log("\n✨ Database verification complete!\n");
  } catch (error) {
    console.error("❌ Error verifying database:", error);
    throw error;
  }
}

verifyDatabase()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
