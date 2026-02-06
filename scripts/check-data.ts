import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

import { sql } from "../lib/db";

async function checkData() {
  try {
    const events = await sql`SELECT count(*) FROM events`;
    console.log("Events count:", events[0].count);

    const registrations = await sql`SELECT count(*) FROM event_registrations`;
    console.log("Registrations count:", registrations[0].count);

    const admins = await sql`SELECT count(*) FROM admins`;
    console.log("Admins count:", admins[0].count);

    const adminEvents = await sql`SELECT count(*) FROM admin_events`;
    console.log("Admin Events count:", adminEvents[0].count);
  } catch (e) {
    console.error("Error:", e);
  }
}

checkData();
