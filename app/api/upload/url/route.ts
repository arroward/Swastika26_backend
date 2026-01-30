
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || "",
        secretAccessKey: R2_SECRET_ACCESS_KEY || "",
    },
});

export async function POST(req: NextRequest) {
    try {
        const { filename, fileType } = await req.json();

        if (!filename || !fileType) {
            return NextResponse.json(
                { error: "Filename and fileType are required" },
                { status: 400 }
            );
        }

        const uniqueFilename = `uploads/${Date.now()}-${filename.replace(/\s+/g, "-")}`;

        // Create base command
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: uniqueFilename,
            ContentType: fileType,
            ACL: "public-read", // Ensure public readability if allowed by bucket policy
        });

        // Generate signed URL
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // Construct public URL, or fallback to direct R2 URL
        const publicUrl = R2_PUBLIC_URL
            ? `${R2_PUBLIC_URL}/${uniqueFilename}`
            : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${uniqueFilename}`; // Note: Direct R2 URLs might require proper DNS or workers if public access isn't open directly

        return NextResponse.json({ signedUrl, publicUrl, key: uniqueFilename });
    } catch (error: any) {
        console.error("Error generating signed URL:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate upload URL" },
            { status: 500 }
        );
    }
}
