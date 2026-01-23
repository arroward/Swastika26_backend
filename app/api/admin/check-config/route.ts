import { NextResponse } from "next/server";

export async function GET() {
  try {
    const config = {
      r2AccountId: !!process.env.R2_ACCOUNT_ID,
      r2AccessKeyId: !!process.env.R2_ACCESS_KEY_ID,
      r2SecretAccessKey: !!process.env.R2_SECRET_ACCESS_KEY,
      r2BucketName: process.env.R2_BUCKET_NAME || "Not set",
      r2PublicUrl: process.env.R2_PUBLIC_URL || "Not set",
    };

    const allConfigured =
      config.r2AccountId &&
      config.r2AccessKeyId &&
      config.r2SecretAccessKey &&
      config.r2BucketName !== "Not set";

    return NextResponse.json({
      success: true,
      configured: allConfigured,
      config,
      message: allConfigured
        ? "R2 storage is properly configured"
        : "R2 storage is not fully configured. Check environment variables.",
    });
  } catch (error) {
    console.error("Config check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check configuration" },
      { status: 500 },
    );
  }
}
