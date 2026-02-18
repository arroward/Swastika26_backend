
import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { SITE_CONFIG } from '@/lib/site-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { docId, email, name, tickets, ticketType, count, totalAmount, transactionId } = body;

        // 1. Basic Validation
        if (!docId || !email || !name || !totalAmount || (!tickets && (!ticketType || !count))) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 2. Identify Ticket Content
        let typeDisplay = '';
        let countDisplay = 0;
        let qrType = '';
        let qrCount = 0;

        if (tickets) {
            // New Schema
            const parts = [];
            let total = 0;
            if (tickets.day1 > 0) parts.push(`Day 1: ${tickets.day1}`);
            if (tickets.day2 > 0) parts.push(`Day 2: ${tickets.day2}`);
            if (tickets.combo > 0) parts.push(`Combo: ${tickets.combo}`);

            typeDisplay = parts.join(' | ');
            countDisplay = (tickets.day1 || 0) + (tickets.day2 || 0) + (tickets.combo || 0);

            // For QR, if mixed, we can use a generic type or the most prominent one.
            // Using logic: MIXED if multiple types, else specific. 
            const typesPresent = [tickets.day1 > 0, tickets.day2 > 0, tickets.combo > 0].filter(Boolean).length;
            if (typesPresent > 1) {
                qrType = 'MIXED';
            } else if (tickets.combo > 0) {
                qrType = 'combo';
            } else if (tickets.day2 > 0) {
                qrType = 'day2';
            } else {
                qrType = 'day1';
            }
            qrCount = countDisplay;

        } else {
            // Legacy Schema
            typeDisplay = ticketType === 'combo' ? 'All Access Combo' : ticketType.toUpperCase();
            countDisplay = count;
            qrType = ticketType;
            qrCount = count;
        }

        // 3. Generate Email Content
        // QR Format: SW26:{BookingID}:{TicketType}:{Count}
        // Note: The scanner primarily relies on BookingID (docId).
        const encodedQrData = encodeURIComponent(`SW26:${docId}:${qrType}:${qrCount}`);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedQrData}`;

        const isCombo = qrType === 'combo' || qrType === 'MIXED'; // Treat mixed as high value
        const typeColor = isCombo ? '#eab308' : '#ef4444';
        const typeBgColor = isCombo ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        const typeTitle = qrType === 'MIXED' ? 'MULTI-DAY ACCESS' : (qrType === 'combo' ? 'ALL ACCESS COMBO' : `${qrType.toUpperCase()} ACCESS`);

        // Event date string
        let eventDate = 'Feb 20-21, 2026';
        if (qrType === 'day1') eventDate = 'Feb 20, 2026';
        if (qrType === 'day2') eventDate = 'Feb 21, 2026';

        // Custom Ticket Description for Email
        const ticketDescriptionHtml = tickets ?
            `<div style="font-size: 14px; color: #ccc; margin-top: 5px;">
                ${tickets.day1 > 0 ? `<div>Day 1 Pass: <strong>${tickets.day1}</strong></div>` : ''}
                ${tickets.day2 > 0 ? `<div>Day 2 Pass: <strong>${tickets.day2}</strong></div>` : ''}
                ${tickets.combo > 0 ? `<div>Combo Pass: <strong>${tickets.combo}</strong></div>` : ''}
             </div>`
            :
            `<p style="margin: 2px 0 0; font-size: 14px; font-weight: 700; color: #ccc;">0${countDisplay}</p>`;


        const emailTemplate = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SWASTIKA.26 Pass</title>
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=Inter:wght@300;400;600;700;800&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Inter', Helvetica, Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050505; padding: 20px;">
        <tr>
            <td align="center">
                
                <!-- Main Ticket Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 380px; background-color: #0a0a0a; border: 1px solid #333333; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.9);">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background: linear-gradient(180deg, #111111 0%, #0a0a0a 100%); padding: 30px 20px; border-bottom: 1px solid #222;">
                            <h1 style="margin: 0; font-family: 'Pirata One', serif; font-size: 36px; color: #ffffff; letter-spacing: 2px; line-height: 1;">
                                SWASTIKA<span style="color: #ef4444;">.</span>26
                            </h1>
                            <p style="margin: 8px 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #666666;">Official Entry Pass</p>
                        </td>
                    </tr>

                    <!-- Pass Type -->
                    <tr>
                        <td align="center" style="padding: 20px 0 0 0;">
                            
                        </td>
                    </tr>

                    <!-- Attendee Details -->
                    <tr>
                        <td style="padding: 10px 30px 0 30px; text-align: center;">
                             <p style="margin: 10px 0 0; font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px;">{{ATTENDEE_NAME}}</p>
                             <p style="margin: 5px 0 0; font-size: 14px; color: #888;">{{EVENT_DATE}}</p>
                        </td>
                    </tr>

                    <!-- Ticket Splits -->
                    <tr>
                        <td align="center" style="padding: 20px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #111; border-radius: 8px; padding: 15px;">
                                <tr>
                                    <td align="left">
                                        <p style="margin: 0; font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px;">Admit</p>
                                        {{TICKET_DETAILS_HTML}}
                                    </td>
                                    <td align="right">
                                        <p style="margin: 0; font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px;">Paid</p>
                                        <p style="margin: 2px 0 0; font-size: 14px; color: #fff; font-weight: bold;">₹{{TOTAL_AMOUNT}}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- QR Code Section -->
                    <tr>
                        <td align="center" style="padding: 10px 30px 30px 30px;">
                            <div style="background-color: #ffffff; padding: 15px; border-radius: 16px; display: inline-block; box-shadow: 0 0 30px rgba(255,255,255,0.1);">
                                <img src="{{QR_URL}}" alt="QR" width="180" height="180" style="display: block; width: 180px; height: 180px;" />
                            </div>
                            
                        </td>
                    </tr>

                    <!-- Instructions -->
                   
                    
                    <!-- Footer -->
                     <tr>
                        <td align="center" style="background-color: #080808; padding: 20px; border-top: 1px solid #1a1a1a;">
                            <p style="margin: 0; font-size: 9px; color: #333; text-transform: uppercase;">MBC College of Engineering, Peermade</p>
                        </td>
                    </tr>

                </table>
                
                 <div style="margin-top: 20px; text-align: center;">
                     <p style="margin: 0; font-size: 9px; color: #444;">&copy; 2026 Swastika Event Team</p>
                </div>

            </td>
        </tr>
    </table>
</body>
</html>
`;


        // Replace placeholders with actual data
        const emailBody = emailTemplate
            .replace('{{TYPE_TITLE_SHORT}}', qrType === 'combo' ? 'VIP' : qrType.toUpperCase())
            .replace('{{BOOKING_ID_SHORT}}', docId.slice(-6).toUpperCase())
            .replace(/{{TYPE_COLOR}}/g, typeColor)
            .replace('{{TYPE_BG_COLOR}}', typeBgColor)
            .replace('{{TYPE_TITLE}}', typeTitle)
            .replace('{{ATTENDEE_NAME}}', name)
            .replace('{{EVENT_DATE}}', eventDate)
            .replace('{{TICKET_DETAILS_HTML}}', ticketDescriptionHtml)
            .replace('{{TOTAL_AMOUNT}}', totalAmount.toString())
            .replace('{{QR_URL}}', qrUrl)
            .replace('{{TICKET_VIEW_URL}}', `${SITE_CONFIG.baseUrl}/ticket/view/${docId}`)
            .replace('{{BOOKING_ID}}', docId)
            .replace('{{TRANSACTION_ID}}', transactionId);

        // 4. Send Email via Nodemailer
        // Check for environment variables
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL } = process.env;

        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
            console.error('Missing SMTP configuration');
            return NextResponse.json(
                { error: 'Server SMTP configuration missing' },
                { status: 500 }
            );
        }

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: SMTP_FROM_EMAIL || `"${SITE_CONFIG.name}" <${SMTP_USER}>`,
            to: email,
            subject: `Your Ticket for ${SITE_CONFIG.name} - ${qrType.toUpperCase()} Access`,
            html: emailBody,
        });

        // 5. Update Firestore
        // We update the doc status to verified and mailStatus to sent
        if (adminFirestore) {
            await adminFirestore.collection('proshow_passes').doc(docId).update({
                status: 'verified',
                mailStatus: 'sent',
                mailSentAt: admin.firestore.FieldValue.serverTimestamp(),
                emailSendCount: admin.firestore.FieldValue.increment(1)
            });
        } else {
            console.warn('Firestore admin not initialized, skipping DB update');
        }

        return NextResponse.json({ success: true, message: 'Ticket verified and email sent' });

    } catch (error: any) {
        console.error('Error verifying and sending ticket:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
