import nodemailer from "nodemailer";
import { Ticket, Purchase } from "@/types/ticketing";
import { adminFirestore } from "./firebase-admin";
import {
  generateTicketEmailHTML,
  generateReminderEmailHTML,
  generateAnnouncementEmailHTML,
  generateRegistrationConfirmationEmailHTML,
} from "./email-templates";

/**
 * Email service for sending ticket emails
 */

interface SendTicketEmailParams {
  purchase: Purchase;
  tickets: Ticket[];
}

interface SendAnnouncementParams {
  to: string | string[];
  subject: string;
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
}

interface SendRegistrationConfirmationParams {
  fullName: string;
  email: string;
  eventTitle: string;
  registrationDate: string;
  upiTransactionId?: string;
  registrationFee?: number;
}

/**
 * Create email transporter
 */
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP configuration missing");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Send admin notification about an email action
 */
async function sendAdminNotification(
  title: string,
  message: string,
): Promise<void> {
  try {
    if (!adminFirestore) {
      console.warn(
        "Firebase Firestore not initialized, skipping admin notification",
      );
      return;
    }

    await adminFirestore.collection("notifications").add({
      title,
      message,
      type: "email_action",
      createdAt: new Date(),
      status: "sent",
      isAdminOnly: true,
    });
  } catch (error) {
    console.error("Error sending admin notification:", error);
    // Don't throw - this is a secondary action
  }
}

/**
 * Send ticket email to customer
 */
export async function sendTicketEmail({
  purchase,
}: SendTicketEmailParams): Promise<void> {
  const transporter = createTransporter();
  const emailHTML = generateTicketEmailHTML(purchase);

  const fromEmail =
    process.env.SMTP_FROM_EMAIL || `"Swastika '26" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from: fromEmail,
    to: purchase.buyerEmail,
    subject: `🔥 SWASTIKA'26 - Your Tickets Are Here! (Order #${purchase.purchaseId})`,
    html: emailHTML,
  });

  // Send admin notification
  await sendAdminNotification(
    "Ticket Email Sent",
    `Ticket confirmation email sent to ${purchase.buyerEmail} for order #${purchase.purchaseId}`,
  );
}

/**
 * Send ticket reminder email (24 hours before event)
 */
export async function sendTicketReminderEmail({
  purchase,
  tickets,
}: SendTicketEmailParams): Promise<void> {
  const transporter = createTransporter();
  const emailHTML = generateReminderEmailHTML(purchase, tickets || []);

  const fromEmail =
    process.env.SMTP_FROM_EMAIL || `"Swastika '26" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from: fromEmail,
    to: purchase.buyerEmail,
    subject: `⚡ Final Reminder: Swastika '26 is Tomorrow!`,
    html: emailHTML,
  });

  // Send admin notification
  await sendAdminNotification(
    "Event Reminder Email Sent",
    `Reminder email sent to ${purchase.buyerEmail} for order #${purchase.purchaseId}`,
  );
}

/**
 * Send announcement email
 */
export async function sendAnnouncementEmail({
  to,
  subject,
  title,
  message,
  ctaText,
  ctaUrl,
}: SendAnnouncementParams): Promise<void> {
  const transporter = createTransporter();
  const emailHTML = generateAnnouncementEmailHTML(
    title,
    message,
    ctaText,
    ctaUrl,
  );

  const fromEmail =
    process.env.SMTP_FROM_EMAIL || `"Swastika '26" <${process.env.SMTP_USER}>`;

  const toEmail = typeof to === "string" ? to : to.join(",");

  await transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    subject: subject,
    html: emailHTML,
  });

  // Send admin notification
  await sendAdminNotification(
    "Announcement Email Sent",
    `Announcement "${title}" sent to ${typeof to === "string" ? to : to.length + " recipients"}`,
  );
}

/**
 * Send registration confirmation email after payment verification
 */
export async function sendRegistrationConfirmationEmail({
  fullName,
  email,
  eventTitle,
  registrationDate,
  upiTransactionId,
  registrationFee,
}: SendRegistrationConfirmationParams): Promise<void> {
  const transporter = createTransporter();
  const emailHTML = generateRegistrationConfirmationEmailHTML({
    fullName,
    email,
    eventTitle,
    registrationDate,
    upiTransactionId,
    registrationFee,
  });

  const fromEmail =
    process.env.SMTP_FROM_EMAIL || `"Swastika '26" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from: fromEmail,
    to: email,
    subject: `✅ Payment Verified - Registration Confirmed for ${eventTitle}`,
    html: emailHTML,
  });

  // Send admin notification
  await sendAdminNotification(
    "Registration Confirmation Email Sent",
    `Payment confirmation email sent to ${email} for ${eventTitle}`,
  );
}
/**
 * Generic email sender for custom HTML
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const transporter = createTransporter();
  const fromEmail =
    process.env.SMTP_FROM_EMAIL || `"Swastika '26" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject,
    html,
  });
}
