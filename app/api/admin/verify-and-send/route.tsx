
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


        // User-Requested "Cyberpunk Vertical" Template
        const emailTemplate = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SWASTIKA.26 Pass</title>
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=Inter:wght@300;400;700;900&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Inter', Helvetica, Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050505; padding: 20px;">
        <tr>
            <td align="center">
                
                <!-- Main Ticket Container (Vertical) -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 380px; background-color: #0a0a0a; border: 1px solid #333333; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.9);">
                    
                    <!-- Top Image / Brand Section -->
                    <tr>
                        <td align="center" style="background: linear-gradient(180deg, #111111 0%, #0a0a0a 100%); padding: 40px 20px; border-bottom: 2px solid #222;">
                            <h1 style="margin: 0; font-family: 'Pirata One', serif; font-size: 42px; color: #ffffff; letter-spacing: 2px; line-height: 1;">
                                SWASTIKA<span style="color: #ef4444;">.</span>26
                            </h1>
                            <p style="margin: 8px 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #666666;">Proshow Access Pass</p>
                            
                            <div style="margin-top: 20px;">
                                <span style="display: inline-block; padding: 8px 16px; border: 1px solid {{TYPE_COLOR}}; background-color: rgba(239, 68, 68, 0.05); color: {{TYPE_COLOR}}; font-size: 12px; font-weight: bold; text-transform: uppercase; border-radius: 4px; letter-spacing: 1px;">
                                    {{TYPE_TITLE_SHORT}}
                                </span>
                            </div>
                        </td>
                    </tr>

                    <!-- Dashed Divider -->
                    <tr>
                        <td style="background-color: #0a0a0a; position: relative; height: 1px;">
                           <div style="height: 1px; border-top: 2px dashed #333; width: 86%; margin: 0 auto;"></div>
                           <!-- Cutout Notches -->
                           <div style="position: absolute; left: -10px; top: -10px; width: 20px; height: 20px; background-color: #050505; border-radius: 50%;"></div>
                           <div style="position: absolute; right: -10px; top: -10px; width: 20px; height: 20px; background-color: #050505; border-radius: 50%;"></div>
                        </td>
                    </tr>

                    <!-- Details Section -->
                    <tr>
                        <td style="padding: 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 25px;">
                                        <p style="margin: 0; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #555;">Attendee</p>
                                        <p style="margin: 5px 0 0; font-size: 20px; font-weight: 700; color: #fff; letter-spacing: 0.5px;">{{ATTENDEE_NAME}}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 25px;">
                                        <p style="margin: 0; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #555;">Valid Date</p>
                                        <p style="margin: 5px 0 0; font-size: 18px; font-weight: 700; color: #eee;">{{EVENT_DATE}}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <table border="0" cellpadding="0" cellspacing="0" width="80%">
                                            <tr>
                                                <td align="center" width="50%" style="border-right: 1px solid #222;">
                                                    <p style="margin: 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #555;">Admit</p>
                                                    {{TICKET_DETAILS_HTML}}
                                                </td>
                                                <td align="center" width="50%">
                                                    <p style="margin: 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #555;">Paid</p>
                                                    <p style="margin: 2px 0 0; font-size: 14px; font-weight: 700; color: #ccc;">₹{{TOTAL_AMOUNT}}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- QR Section (Bottom) -->
                    <tr>
                        <td align="center" style="background-color: #0e0e0e; padding: 30px; border-top: 1px dashed #333;">
                            <div style="background-color: #ffffff; padding: 12px; border-radius: 12px; display: inline-block;">
                                <img src="{{QR_URL}}" alt="QR" width="160" height="160" style="display: block; width: 160px; height: 160px;" />
                            </div>
                            <p style="margin: 15px 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #fff; font-weight: bold;">Scan For Entry</p>
                            <p style="margin: 6px 0 0; font-size: 10px; font-family: monospace; color: #ef4444;">{{TRANSACTION_ID}}</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                     <tr>
                        <td align="center" style="background-color: #080808; padding: 15px; border-top: 1px solid #1a1a1a;">
                            <p style="margin: 0; font-size: 9px; color: #444; text-transform: uppercase; letter-spacing: 1px;">MBC College of Engineering, Peermade</p>
                        </td>
                    </tr>

                </table>

                 <div style="margin-top: 25px; text-align: center;">
                    <a href="{{TICKET_VIEW_URL}}" style="display: inline-block; padding: 10px 20px; background-color: #ffffff; color: #000000; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 12px; letter-spacing: 0.5px;">
                        VIEW DIGITAL PASS
                    </a>
                </div>

                 <div style="margin-top: 20px; text-align: center;">
                    <a href="https://swastika.live" style="font-size: 10px; color: #444444; text-decoration: none;">&copy; 2026 Swastika Event Team</a>
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
