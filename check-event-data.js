const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);

async function checkEvents() {
  const events = await sql`SELECT id, title, is_online, registration_fee FROM events LIMIT 5`;
  console.log("Events in database:");
  console.table(events);
}

checkEvents().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
