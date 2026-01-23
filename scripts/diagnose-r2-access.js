#!/usr/bin/env node

/**
 * Script to diagnose R2 file access issues
 * Run with: node scripts/diagnose-r2-access.js
 */

const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

console.log("\n📋 R2 Access Diagnostic Report\n");
console.log("═══════════════════════════════════════════════════════════\n");

// 1. Check environment variables
console.log("1️⃣  Environment Variables:");
console.log("─────────────────────────────");

const r2Config = {
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: !!process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: !!process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
};

Object.entries(r2Config).forEach(([key, value]) => {
  if (value === true) {
    console.log(`✅ ${key}: (set)`);
  } else if (value === false) {
    console.log(`❌ ${key}: (not set)`);
  } else if (value) {
    const displayValue = key.includes("KEY") ? "(set)" : value;
    console.log(`✅ ${key}: ${displayValue}`);
  } else {
    console.log(`❌ ${key}: (not set or empty)`);
  }
});

// 2. Generate test URLs
console.log("\n2️⃣  Generated Test URLs:");
console.log("─────────────────────────────");

const testFileName = "event-registrations/1769143135540-4gyntxhk4d8.jpg";
const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2BucketName = process.env.R2_BUCKET_NAME;
const r2PublicUrl = process.env.R2_PUBLIC_URL;

if (r2PublicUrl) {
  const customUrl = `${r2PublicUrl}/${testFileName}`;
  console.log(`Custom Domain URL:\n  ${customUrl}`);
}

if (r2AccountId) {
  const directUrl = `https://${r2AccountId}.r2.cloudflarestorage.com/${testFileName}`;
  console.log(`\nDirect R2 URL:\n  ${directUrl}`);
}

if (r2BucketName) {
  const bucketUrl = `https://${r2BucketName}.r2.cloudflarestorage.com/${testFileName}`;
  console.log(`\nBucket URL (alternative):\n  ${bucketUrl}`);
}

// 3. Diagnose issue
console.log("\n3️⃣  Diagnosis:");
console.log("─────────────────────────────");

if (!r2Config.R2_ACCOUNT_ID || !r2Config.R2_BUCKET_NAME) {
  console.log("❌ Missing critical R2 configuration!");
  console.log("   Fix: Set R2_ACCOUNT_ID and R2_BUCKET_NAME in .env.local");
} else if (r2Config.R2_PUBLIC_URL) {
  console.log("⚠️  Custom domain detected: " + r2Config.R2_PUBLIC_URL);
  console.log("\nIssues that could cause 404:");
  console.log("  1. Custom domain not properly configured in Cloudflare R2");
  console.log("  2. Files uploaded to different path than expected");
  console.log("  3. Custom domain not pointing to correct bucket");
  console.log("\n💡 Solutions:");
  console.log("  • Verify domain is connected to R2 in Cloudflare dashboard");
  console.log("  • Test direct R2 URL first (without custom domain)");
  console.log("  • Try removing R2_PUBLIC_URL and let it use direct R2 URL");
} else {
  console.log("✅ Using direct R2 URL (no custom domain)");
  console.log("   This should work if R2 bucket is configured correctly");
}

// 4. Test URL accessibility
console.log("\n4️⃣  Testing URL Accessibility:");
console.log("─────────────────────────────");

(async () => {
  const urlsToTest = [];

  if (r2PublicUrl) {
    urlsToTest.push({
      name: "Custom Domain",
      url: `${r2PublicUrl}/${testFileName}`,
    });
  }

  if (r2AccountId) {
    urlsToTest.push({
      name: "Direct R2",
      url: `https://${r2AccountId}.r2.cloudflarestorage.com/${testFileName}`,
    });
  }

  for (const { name, url } of urlsToTest) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok) {
        console.log(`✅ ${name}: Accessible (${response.status})`);
      } else {
        console.log(`❌ ${name}: ${response.status} ${response.statusText}`);
        if (response.status === 404) {
          console.log(`   File not found - check if file exists in R2`);
        } else if (response.status === 403) {
          console.log(
            `   Access denied - bucket may not be publicly accessible`,
          );
        }
      }
    } catch (error) {
      console.log(`❌ ${name}: Network error - ${error.message}`);
    }
  }

  console.log(
    "\n═══════════════════════════════════════════════════════════\n",
  );

  console.log("📝 Recommendations:");
  console.log("─────────────────────────────");

  if (r2Config.R2_PUBLIC_URL && r2Config.R2_PUBLIC_URL !== "(not set)") {
    console.log(
      "1. Your custom domain might not be working. Try these steps:\n",
    );
    console.log("   a) Go to Cloudflare Dashboard → R2 → Your Bucket");
    console.log("   b) Check if domain is connected in Settings → Domain");
    console.log("   c) Try using direct R2 URL instead");
    console.log("   d) Edit .env.local and remove R2_PUBLIC_URL");
    console.log("   e) Restart your server\n");
  }

  console.log(
    "2. Or, temporarily comment out R2_PUBLIC_URL to use direct R2 URL:",
  );
  console.log("   # R2_PUBLIC_URL=https://events.swastika.live\n");

  console.log("3. After fixing, test file upload again in your app");
})();
