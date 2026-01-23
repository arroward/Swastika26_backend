import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ============================================
// CLOUDFLARE R2 STORAGE (NOT AWS S3!)
// ============================================
// R2 is Cloudflare's object storage that is S3-compatible.
// This means we use the AWS SDK to interact with it, but all
// data is stored on Cloudflare's infrastructure, NOT Amazon's.
// The endpoint below points to Cloudflare's R2 service.
// ============================================

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  console.warn(
    "Warning: Cloudflare R2 environment variables are not fully configured",
  );
}

const r2Client = R2_ACCOUNT_ID
  ? new S3Client({
      region: "auto", // Cloudflare R2 uses 'auto' as the region
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, // CLOUDFLARE endpoint, NOT AWS!
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function uploadToR2(
  file: File,
  folder: string = "uploads",
): Promise<string> {
  if (!r2Client || !R2_BUCKET_NAME) {
    throw new Error("Cloudflare R2 is not configured");
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(command);

    // Generate URLs - try custom domain first, with fallback to direct R2
    let publicUrl: string;

    if (R2_PUBLIC_URL) {
      publicUrl = `${R2_PUBLIC_URL}/${fileName}`;
    } else {
      // Default to direct R2 URL
      publicUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;
    }

    console.log("File uploaded successfully to R2:", {
      fileName,
      publicUrl,
      hasCustomDomain: !!R2_PUBLIC_URL,
      directR2Url: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`,
    });

    return publicUrl;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error("Failed to upload file to storage");
  }
}

export async function uploadBase64ToR2(
  base64Data: string,
  fileName: string,
  mimeType: string,
  folder: string = "uploads",
): Promise<string> {
  if (!r2Client || !R2_BUCKET_NAME) {
    throw new Error("Cloudflare R2 is not configured");
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split(".").pop();
    const newFileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: newFileName,
      Body: buffer,
      ContentType: mimeType,
    });

    await r2Client.send(command);

    // Generate URLs - try custom domain first, with fallback to direct R2
    let publicUrl: string;

    if (R2_PUBLIC_URL) {
      publicUrl = `${R2_PUBLIC_URL}/${newFileName}`;
    } else {
      // Default to direct R2 URL
      publicUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${newFileName}`;
    }

    return publicUrl;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error("Failed to upload file to storage");
  }
}
