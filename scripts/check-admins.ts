import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function checkAdmins() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    console.log("Checking admins table...");
    const result = await sql`
      SELECT id, email, role, name, created_at 
      FROM admins 
      ORDER BY created_at DESC
    `;

    console.log(`\nFound ${result.length} admins:`);
    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkAdmins();
