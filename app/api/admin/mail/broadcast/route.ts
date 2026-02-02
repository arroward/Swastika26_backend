import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
import { sql } from "@/lib/db";
import { sendAnnouncementEmail } from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    const {
      subject,
      title,
      message,
      ctaText,
      ctaUrl,
      recipientType,
      specificEmail,
    } = await request.json();

    if (!subject || !title || !message) {
      return NextResponse.json(
        { error: "Subject, title and message are required" },
        { status: 400 },
      );
    }

    if (!adminFirestore) {
      return NextResponse.json(
        { error: "Firestore not initialized" },
        { status: 500 },
      );
    }

    let recipients: string[] = [];

    if (recipientType === "all") {
      const snapshot = await adminFirestore
        .collection("purchases")
        .where("paymentStatus", "==", "COMPLETED")
        .get();
      recipients = snapshot.docs.map((doc) => doc.data().email).filter(Boolean);
    } else if (recipientType === "admins") {
      // Fetch admin emails from database
      try {
        const adminData = await sql`SELECT email FROM admins`;
        recipients = adminData.map((admin: any) => admin.email).filter(Boolean);
      } catch (err) {
        console.error("Error fetching admin emails:", err);
        return NextResponse.json(
          { error: "Failed to fetch admin emails" },
          { status: 500 },
        );
      }
    } else if (recipientType === "specific" && specificEmail) {
      recipients = [specificEmail];
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found" },
        { status: 400 },
      );
    }

    // Deduplicate emails
    const uniqueRecipients = Array.from(new Set(recipients));

    // Send emails in batches to avoid rate limits if necessary
    // For now, we'll send them in one go or chunk them if many
    const BATCH_SIZE = 50;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < uniqueRecipients.length; i += BATCH_SIZE) {
      const batch = uniqueRecipients.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (email) => {
          try {
            await sendAnnouncementEmail({
              to: email,
              subject,
              title,
              message,
              ctaText,
              ctaUrl,
            });
            successCount++;
          } catch (err) {
            console.error(`Failed to send email to ${email}:`, err);
            failureCount++;
          }
        }),
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully sent to ${successCount} recipients. ${failureCount} failed.`,
      successCount,
      failureCount,
    });
  } catch (error) {
    console.error("Error sending mail broadcast:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
