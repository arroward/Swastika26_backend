
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
      eventId, // Added for event filtering
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

    interface Recipient {
      email: string;
      name?: string;
      eventTitle?: string;
      stats?: { eventName: string; count: number }[];
    }

    let recipients: Recipient[] = [];

    if (recipientType === "all") {
      // Fetch unique emails from event_registrations
      try {
        const result = await sql`
          SELECT DISTINCT ON (email) 
            email, 
            full_name as name 
          FROM event_registrations
        `;
        recipients = result.map((row: any) => ({
          email: row.email,
          name: row.name,
        })).filter((r: Recipient) => Boolean(r.email));
      } catch (err) {
        console.error("Error fetching registration emails:", err);
        return NextResponse.json(
          { error: "Failed to fetch registration emails" },
          { status: 500 },
        );
      }
    } else if (recipientType === "event" && eventId) {
      // Fetch registrations for specific event
      try {
        const result = await sql`
          SELECT 
            r.email, 
            r.full_name as name,
            e.title as event_title
          FROM event_registrations r
          JOIN events e ON r.event_id = e.id
          WHERE r.event_id = ${eventId}
        `;
        recipients = result.map((row: any) => ({
          email: row.email,
          name: row.name,
          eventTitle: row.event_title
        })).filter((r: Recipient) => Boolean(r.email));
      } catch (err) {
        console.error("Error fetching event registration emails:", err);
        return NextResponse.json(
          { error: "Failed to fetch registration emails for event" },
          { status: 500 },
        );
      }
    } else if (recipientType === "admins") {
      // Fetch admin emails from database
      try {
        const adminData = await sql`SELECT email, name FROM admins`;
        recipients = adminData.map((admin: any) => ({
          email: admin.email,
          name: admin.name
        })).filter((r: Recipient) => Boolean(r.email));
      } catch (err) {
        console.error("Error fetching admin emails:", err);
        return NextResponse.json(
          { error: "Failed to fetch admin emails" },
          { status: 500 },
        );
      }
    } else if (recipientType === "specific" && specificEmail) {
      recipients = [{ email: specificEmail, name: "Valued Member" }];
    } else if (recipientType === "test") {
      // Send only to the specific email provided OR the admin executing (but we don't have session here easily without cookie parse)
      // Usually 'test' sends to a specific email field or a fallback. 
      // Assuming 'specificEmail' is used for test recipient
      if (specificEmail) {
        recipients = [{ email: specificEmail, name: "Test User" }];
      } else {
        return NextResponse.json(
          { error: "Test email address required" },
          { status: 400 },
        );
      }
    } else if (recipientType === "event_admins_stats") {
      try {
        const rows = await sql`
          SELECT 
            a.email, 
            a.name, 
            e.title as event_title, 
            e.registered_count 
          FROM admins a
          JOIN admin_events ae ON a.id = ae.admin_id
          JOIN events e ON ae.event_id = e.id
        `;

        const adminsMap = new Map<string, { name: string, stats: { eventName: string, count: number }[] }>();

        rows.forEach((row: any) => {
          if (!adminsMap.has(row.email)) {
            adminsMap.set(row.email, { name: row.name, stats: [] });
          }
          adminsMap.get(row.email)!.stats.push({
            eventName: row.event_title,
            count: row.registered_count
          });
        });

        recipients = Array.from(adminsMap.entries()).map(([email, data]) => ({
          email,
          name: data.name,
          stats: data.stats
        }));
      } catch (err) {
        console.error("Error fetching event admin stats:", err);
        return NextResponse.json(
          { error: "Failed to fetch event admin stats" },
          { status: 500 },
        );
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found" },
        { status: 400 },
      );
    }

    // Deduplicate emails based on unique email string
    const uniqueRecipientsMap = new Map();
    recipients.forEach(r => {
      if (!uniqueRecipientsMap.has(r.email)) {
        uniqueRecipientsMap.set(r.email, r);
      }
    });
    const uniqueRecipients = Array.from(uniqueRecipientsMap.values());

    // Send emails in batches
    const BATCH_SIZE = 50;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < uniqueRecipients.length; i += BATCH_SIZE) {
      const batch = uniqueRecipients.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (recipient) => {
          try {
            // Personalize content
            let personalizedSubject = subject;
            let personalizedTitle = title;
            let personalizedMessage = message;

            if (recipient.name) {
              const firstName = recipient.name.split(' ')[0];
              personalizedSubject = personalizedSubject.replace(/{{name}}/g, firstName).replace(/{{fullname}}/g, recipient.name);
              personalizedTitle = personalizedTitle.replace(/{{name}}/g, firstName).replace(/{{fullname}}/g, recipient.name);
              personalizedMessage = personalizedMessage.replace(/{{name}}/g, firstName).replace(/{{fullname}}/g, recipient.name);
            }

            if (recipient.eventTitle) {
              personalizedSubject = personalizedSubject.replace(/{{event}}/g, recipient.eventTitle);
              personalizedTitle = personalizedTitle.replace(/{{event}}/g, recipient.eventTitle);
              personalizedMessage = personalizedMessage.replace(/{{event}}/g, recipient.eventTitle);
            }

            if (recipient.stats) {
              // Generate stats table
              const statsRows = recipient.stats.map((s: { eventName: string; count: number }) => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #333;">${s.eventName}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right; font-weight: bold;">${s.count}</td>
                </tr>
              `).join('');

              const table = `
                <div style="margin-top: 25px; background: #111; border-radius: 8px; overflow: hidden; border: 1px solid #333;">
                  <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; color: #fff;">
                    <thead>
                      <tr style="background-color: #222;">
                        <th style="padding: 12px; text-align: left; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; color: #aaa;">Event Name</th>
                        <th style="padding: 12px; text-align: right; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; color: #aaa;">Registrations</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${statsRows}
                    </tbody>
                  </table>
                </div>
              `;

              personalizedMessage += table;
            }

            await sendAnnouncementEmail({
              to: recipient.email,
              subject: personalizedSubject,
              title: personalizedTitle,
              message: personalizedMessage,
              ctaText,
              ctaUrl,
            });
            successCount++;
          } catch (err) {
            console.error(`Failed to send email to ${recipient.email}:`, err);
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
