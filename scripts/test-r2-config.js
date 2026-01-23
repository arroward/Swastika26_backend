#!/usr/bin/env node

/**
 * Script to test R2 configuration and file access
 * Run with: node scripts/test-r2-config.js
 */

// Check if running in Node.js environment
if (typeof process === "undefined") {
  console.error("This script must be run in Node.js");
  process.exit(1);
}

// Load environment variables
require("dotenv").config({ path: ".env.local" });

console.log("\n🔍 Checking R2 Configuration...\n");

const checks = {
  R2_ACCOUNT_ID: !!process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: !!process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: !!process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: !!process.env.R2_BUCKET_NAME,
  R2_PUBLIC_URL: !!process.env.R2_PUBLIC_URL,
};

console.log("Environment Variables Status:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Object.entries(checks).forEach(([key, value]) => {
  const status = value ? "✅" : "❌";
  const displayValue = value
    ? key === "R2_PUBLIC_URL"
      ? process.env[key]
      : "(set)"
    : "(not set)";
  console.log(`${status} ${key}: ${displayValue}`);
});

const allRequired =
  checks.R2_ACCOUNT_ID &&
  checks.R2_ACCESS_KEY_ID &&
  checks.R2_SECRET_ACCESS_KEY &&
  checks.R2_BUCKET_NAME;

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

if (allRequired) {
  console.log("✅ All required R2 configuration variables are set!\n");

  if (!checks.R2_PUBLIC_URL) {
    console.log("⚠️  Warning: R2_PUBLIC_URL is not set.");
    console.log("   Files will be accessed through API proxy route.");
    console.log("   This is fine for private buckets.\n");
    console.log("   To enable public access:");
    console.log("   1. Go to Cloudflare Dashboard → R2 → Your Bucket");
    console.log("   2. Enable public access to get a public URL");
    console.log("   3. Set R2_PUBLIC_URL in .env.local\n");
  } else {
    console.log("✅ R2_PUBLIC_URL is configured for public access!\n");
  }

  console.log("📝 Next Steps:");
  console.log("   1. Make sure your R2 bucket exists in Cloudflare");
  console.log("   2. Test file upload by registering for an online event");
  console.log("   3. Check server logs for any upload errors");
  console.log("   4. Verify files appear in admin registrations table\n");
} else {
  console.log("❌ R2 is NOT properly configured!\n");
  console.log("📝 To fix this:");
  console.log("   1. Copy .env.example to .env.local");
  console.log("   2. Fill in your Cloudflare R2 credentials");
  console.log(
    "   3. Get credentials from: Cloudflare Dashboard → R2 → Manage R2 API Tokens",
  );
  console.log("   4. Restart your development server\n");
}
