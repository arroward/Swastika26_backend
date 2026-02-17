const { Pool } = require("pg");
require("dotenv").config();

// Disable TLS certificate validation for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function testConnection() {
  try {
    console.log("Testing PostgreSQL connection...");
    console.log(
      "Connection string:",
      process.env.POSTGRES_URL?.replace(/:[^:@]+@/, ":****@"),
    );

    // Test connection
    const client = await pool.connect();
    console.log("✓ Connected to PostgreSQL\n");

    // List all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("Tables in database:");
    tablesResult.rows.forEach((row) => console.log(`  - ${row.table_name}`));
    console.log("");

    // Count events
    const eventsResult = await client.query("SELECT COUNT(*) FROM events");
    console.log(`Events count: ${eventsResult.rows[0].count}`);

    // Count registrations
    const regsResult = await client.query(
      "SELECT COUNT(*) FROM event_registrations",
    );
    console.log(`Registrations count: ${regsResult.rows[0].count}`);

    // Count admins
    const adminsResult = await client.query("SELECT COUNT(*) FROM admins");
    console.log(`Admins count: ${adminsResult.rows[0].count}`);

    // Sample some events
    const sampleEvents = await client.query(
      "SELECT id, title FROM events LIMIT 5",
    );
    console.log("\nSample events:");
    sampleEvents.rows.forEach((row) =>
      console.log(`  - ${row.id}: ${row.title}`),
    );

    client.release();
    await pool.end();

    console.log("\n✓ Test completed successfully");
  } catch (error) {
    console.error("✗ Error:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

testConnection();
