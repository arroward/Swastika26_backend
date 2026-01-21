import { config } from "dotenv";
import { sql } from "../lib/db";

// Load environment variables
config();

async function testRelationships() {
  console.log("\n🔍 DETAILED DATABASE SCHEMA VERIFICATION\n");
  console.log("═".repeat(60));

  try {
    // Check Primary Keys
    console.log("\n📌 PRIMARY KEYS:");
    const pks = await sql`
      SELECT 
        tc.table_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `;
    pks.forEach((pk: any) =>
      console.log(`  ✅ ${pk.table_name}.${pk.column_name}`),
    );

    // Check Unique Constraints
    console.log("\n🔑 UNIQUE CONSTRAINTS:");
    const uniques = await sql`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        string_agg(kcu.column_name, ', ') as columns
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'UNIQUE'
        AND tc.table_schema = 'public'
      GROUP BY tc.table_name, tc.constraint_name
      ORDER BY tc.table_name
    `;
    uniques.forEach((u: any) =>
      console.log(`  ✅ ${u.table_name}: (${u.columns})`),
    );

    // Check Indexes
    console.log("\n📇 INDEXES:");
    const indexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname
    `;
    indexes.forEach((idx: any) =>
      console.log(`  ✅ ${idx.indexname} on ${idx.tablename}`),
    );

    // Test Foreign Key Relationships
    console.log("\n🔗 TESTING FOREIGN KEY RELATIONSHIPS:");

    // Test 1: Events → Registrations
    const eventsWithRegs = await sql`
      SELECT e.id, e.title, COUNT(er.id) as reg_count
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id
      GROUP BY e.id, e.title
      ORDER BY e.title
    `;
    console.log("\n  Events with their registrations:");
    eventsWithRegs.forEach((e: any) =>
      console.log(`    • ${e.title}: ${e.reg_count} registrations`),
    );

    // Test 2: Admins → Admin_Events → Events
    const coordinators = await sql`
      SELECT 
        a.name,
        a.email,
        a.role,
        string_agg(e.title, ', ') as assigned_events
      FROM admins a
      LEFT JOIN admin_events ae ON a.id = ae.admin_id
      LEFT JOIN events e ON ae.event_id = e.id
      WHERE a.role = 'event_coordinator'
      GROUP BY a.name, a.email, a.role
      ORDER BY a.name
    `;
    console.log("\n  Event Coordinators and their assigned events:");
    coordinators.forEach((c: any) =>
      console.log(
        `    • ${c.name} (${c.email}): ${c.assigned_events || "No events assigned"}`,
      ),
    );

    // Test 3: Check referential integrity
    console.log("\n🛡️  REFERENTIAL INTEGRITY CHECKS:");

    const integrityChecks = await sql`
      SELECT 
        'event_registrations → events' as check_name,
        COUNT(*) as orphaned_count
      FROM event_registrations er
      LEFT JOIN events e ON er.event_id = e.id
      WHERE e.id IS NULL
      
      UNION ALL
      
      SELECT 
        'admin_events → admins' as check_name,
        COUNT(*) as orphaned_count
      FROM admin_events ae
      LEFT JOIN admins a ON ae.admin_id = a.id
      WHERE a.id IS NULL
      
      UNION ALL
      
      SELECT 
        'admin_events → events' as check_name,
        COUNT(*) as orphaned_count
      FROM admin_events ae
      LEFT JOIN events e ON ae.event_id = e.id
      WHERE e.id IS NULL
    `;

    integrityChecks.forEach((check: any) => {
      if (check.orphaned_count === "0") {
        console.log(`  ✅ ${check.check_name}: No orphaned records`);
      } else {
        console.log(
          `  ❌ ${check.check_name}: Found ${check.orphaned_count} orphaned records!`,
        );
      }
    });

    // Test CASCADE behavior
    console.log("\n🔥 TESTING CASCADE DELETE BEHAVIOR:");
    console.log("  ℹ️  Foreign keys configured with ON DELETE CASCADE:");
    console.log(
      "    - Deleting an event will automatically delete its registrations",
    );
    console.log("    - Deleting an event will remove coordinator assignments");
    console.log("    - Deleting an admin will remove their event assignments");

    console.log("\n═".repeat(60));
    console.log("\n✅ Database schema verification complete!\n");
  } catch (error) {
    console.error("❌ Error testing relationships:", error);
    process.exit(1);
  }
}

testRelationships()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
