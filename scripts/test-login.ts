import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function testLogin() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const email = "mathewsvinoy@gmail.com";
    const password = "admin123";
    const hashedPassword = hashPassword(password);

    console.log("Testing login for:", email);
    console.log("Hashed password:", hashedPassword);

    const result = await sql`
      SELECT id, email, role, name, password
      FROM admins 
      WHERE email = ${email}
    `;

    if (result.length === 0) {
      console.log("\n❌ Admin not found");
      process.exit(1);
    }

    const admin = result[0];
    console.log("\n✅ Admin found:", admin.email, "-", admin.role);
    console.log("Password in DB:", admin.password);
    console.log(
      "Password match:",
      admin.password === hashedPassword ? "✅ YES" : "❌ NO",
    );

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testLogin();
