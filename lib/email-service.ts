import nodemailer from 'nodemailer';
import { Ticket, Purchase } from '@/types/ticketing';
import {
  generateTicketEmailHTML,
  generateReminderEmailHTML,
  generateAnnouncementEmailHTML
} from './email-templates';

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

/**
 * Create email transporter
 */
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP configuration missing');
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
 * Send ticket email to customer
 */
export async function sendTicketEmail({ purchase }: SendTicketEmailParams): Promise<void> {
  const transporter = createTransporter();
  const emailHTML = generateTicketEmailHTML(purchase);

  const fromEmail = process.env.SMTP_FROM_EMAIL || `"Swastika '26" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from: fromEmail,
    to: purchase.buyerEmail,
    subject: `🔥 SWASTIKA'26 - Your Tickets Are Here! (Order #${purchase.purchaseId})`,
    html: emailHTML,
  });
}

/**
 * Send ticket reminder email (24 hours before event)
 */
export async function sendTicketReminderEmail({ purchase, tickets }: SendTicketEmailParams): Promise<void> {
  const transporter = createTransporter();
  const emailHTML = generateReminderEmailHTML(purchase, tickets || []);

  const fromEmail = process.env.SMTP_FROM_EMAIL || `"Swastika '26" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from: fromEmail,
    to: purchase.buyerEmail,
    subject: `⚡ Final Reminder: Swastika '26 is Tomorrow!`,
    html: emailHTML,
  });
}

/**
 * Send announcement email
 */
export async function sendAnnouncementEmail({ to, subject, title, message, ctaText, ctaUrl }: SendAnnouncementParams): Promise<void> {
  const transporter = createTransporter();
  const emailHTML = generateAnnouncementEmailHTML(title, message, ctaText, ctaUrl);

  const fromEmail = process.env.SMTP_FROM_EMAIL || `"Swastika '26" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from: fromEmail,
    to: typeof to === 'string' ? to : to.join(','),
    subject: subject,
    html: emailHTML,
  });
}
