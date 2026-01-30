import nodemailer from 'nodemailer';
import { Ticket, Purchase, TICKET_TYPES } from '@/types/ticketing';
import { getQRCodeImageUrl, formatCurrency, formatDate } from '@/lib/ticketing-utils';

/**
 * Email service for sending ticket emails
 */

interface SendTicketEmailParams {
  purchase: Purchase;
  tickets: Ticket[];
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
 * Generate ticket email HTML
 */
function generateTicketEmailHTML(purchase: Purchase, tickets: Ticket[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://swastika.live';

  // Group tickets by type
  const ticketsByType = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.type]) acc[ticket.type] = [];
    acc[ticket.type].push(ticket);
    return acc;
  }, {} as Record<string, Ticket[]>);

  // Generate ticket cards
  const ticketLinksHTML = tickets.map((ticket, index) => {
    const config = TICKET_TYPES[ticket.type];
    const ticketColor = config.color === 'blue' ? '#3b82f6' : config.color === 'purple' ? '#a855f7' : '#ef4444';
    const ticketGlow = config.color === 'blue' ? 'rgba(59, 130, 246, 0.3)' : config.color === 'purple' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(239, 68, 68, 0.3)';

    return `
      <div style="margin-bottom: 24px; background: linear-gradient(135deg, #0e0e0e 0%, #0a0a0a 100%); border: 1px solid #1f1f1f; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset; transition: all 0.3s ease;">
        <div style="height: 4px; background: linear-gradient(90deg, ${ticketColor}, transparent);"></div>
        <div style="padding: 24px; display: table; width: 100%;">
          <div style="display: table-cell; vertical-align: middle;">
            <span style="display: inline-block; font-size: 9px; color: #666; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; background: rgba(255,255,255,0.03); padding: 4px 10px; border-radius: 6px; margin-bottom: 8px;">PASS ${index + 1}</span>
            <h3 style="margin: 8px 0 0; font-size: 22px; color: #fff; font-weight: 900; letter-spacing: -0.5px;">${config.label}</h3>
            <p style="margin: 6px 0 0; font-size: 11px; color: #555; font-family: 'Courier New', monospace; font-weight: 600; letter-spacing: 0.5px;">${ticket.ticketId}</p>
          </div>
          <div style="display: table-cell; vertical-align: middle; text-align: right; width: 140px;">
            <a href="${baseUrl}/ticket/${ticket.ticketId}" style="display: inline-block; padding: 14px 20px; background: linear-gradient(135deg, ${ticketColor}, ${ticketColor}dd); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 10px 30px ${ticketGlow}, 0 0 0 1px rgba(255,255,255,0.1) inset;">VIEW PASS →</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Space+Grotesk:wght@700&display=swap');
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%); color: #fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%); padding: 30px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" style="max-width: 620px; background: linear-gradient(180deg, #0d0d0d 0%, #050505 100%); border: 1px solid #1f1f1f; border-radius: 28px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03) inset;">
          
          <!-- Animated Header -->
          <tr>
            <td style="padding: 50px 40px; text-align: center; background: linear-gradient(135deg, #1a0a0a 0%, #0a0a0a 50%, #0a0a1a 100%); position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, #ef4444, transparent);"></div>
              
              <div style="margin-bottom: 24px;">
                <span style="display: inline-block; font-size: 11px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 5px; border: 2px solid #ef4444; padding: 8px 20px; border-radius: 50px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05)); box-shadow: 0 0 30px rgba(239, 68, 68, 0.3), 0 0 60px rgba(239, 68, 68, 0.1) inset;">✦ OFFICIAL ACCESS ✦</span>
              </div>
              
              <h1 style="margin: 0; font-family: 'Space Grotesk', 'Inter', sans-serif; font-size: 56px; font-weight: 700; background: linear-gradient(135deg, #ffffff 0%, #ef4444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -2px; line-height: 1; text-shadow: 0 0 80px rgba(239, 68, 68, 0.5);">
                SWASTIKA<span style="color: #ef4444; -webkit-text-fill-color: #ef4444;">.</span>26
              </h1>
              
              <p style="margin: 20px auto 0; max-width: 400px; font-size: 15px; color: #999; font-weight: 500; letter-spacing: 0.5px;">Your exclusive pass to the ultimate techno-cultural experience</p>
              
              <div style="margin-top: 30px; height: 1px; background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.5), transparent);"></div>
            </td>
          </tr>

          <!-- Success Badge -->
          <tr>
            <td style="padding: 0 40px 35px; text-align: center;">
              <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.03)); border: 1.5px solid rgba(34, 197, 94, 0.3); border-radius: 16px; padding: 18px; box-shadow: 0 8px 32px rgba(34, 197, 94, 0.1);">
                <p style="margin: 0; color: #22c55e; font-size: 15px; font-weight: 700; letter-spacing: 0.5px;">
                  <span style="font-size: 18px; margin-right: 8px;">✓</span>
                  PAYMENT CONFIRMED
                </p>
              </div>
            </td>
          </tr>

          <!-- Premium Order Card -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="background: linear-gradient(135deg, #0f0f0f 0%, #0a0a0a 100%); border: 1px solid #222; border-radius: 24px; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset;">
                <table width="100%">
                  <tr>
                    <td style="padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <p style="margin: 0; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Attendee Details</p>
                      <p style="margin: 12px 0 0; font-size: 22px; color: #fff; font-weight: 800; letter-spacing: -0.5px;">${purchase.name}</p>
                      <p style="margin: 6px 0 0; font-size: 14px; color: #888; font-weight: 500;">${purchase.email}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 24px;">
                      <table width="100%">
                        <tr>
                          <td style="vertical-align: top;">
                            <p style="margin: 0; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Booking Reference</p>
                            <p style="margin: 10px 0 0; font-size: 14px; color: #ef4444; font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: 1px;">#${purchase.purchaseId}</p>
                          </td>
                          <td style="text-align: right; vertical-align: top;">
                            <p style="margin: 0; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Total Paid</p>
                            <p style="margin: 10px 0 0; font-size: 28px; color: #22c55e; font-weight: 900; letter-spacing: -1px; text-shadow: 0 0 20px rgba(34, 197, 94, 0.3);">${formatCurrency(purchase.totalAmount)}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Passes Section -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="margin-bottom: 28px; text-align: center; position: relative;">
                <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #333, transparent);"></div>
                <h2 style="position: relative; display: inline-block; margin: 0; padding: 0 20px; font-size: 13px; color: #777; text-transform: uppercase; letter-spacing: 3px; font-weight: 900; background: #050505;">YOUR ACCESS PASSES</h2>
              </div>
              ${ticketLinksHTML}
            </td>
          </tr>

          <!-- Premium CTA -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${baseUrl}/wallet/${purchase.purchaseId}" style="display: block; padding: 22px 32px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #fff; text-decoration: none; border-radius: 16px; font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 3px; box-shadow: 0 20px 50px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset; transition: all 0.3s ease;">
                ⚡ ADD TO WALLET
              </a>
              <p style="margin: 18px 0 0; font-size: 13px; color: #666; font-weight: 500;">Instant access • Offline ready • Secure</p>
            </td>
          </tr>

          <!-- Important Info -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.02)); border-left: 4px solid #ef4444; border-radius: 12px; padding: 24px; box-shadow: 0 10px 40px rgba(239, 68, 68, 0.1);">
                <h4 style="margin: 0 0 16px; font-size: 15px; color: #fff; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">⚠️ Essential Guidelines</h4>
                <ul style="margin: 0; padding-left: 20px; color: #999; font-size: 14px; line-height: 1.8; font-weight: 500;">
                  <li style="margin-bottom: 8px;">Arrive <strong style="color: #ef4444;">30 minutes early</strong> for smooth entry</li>
                  <li style="margin-bottom: 8px;">Present <strong style="color: #ef4444;">original QR code</strong> (screenshots invalid)</li>
                  <li style="margin-bottom: 8px;"><strong style="color: #ef4444;">Valid college ID</strong> mandatory for verification</li>
                  <li>Management reserves <strong style="color: #ef4444;">admission rights</strong></li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Premium Footer -->
          <tr>
            <td style="padding: 35px 40px; background: linear-gradient(180deg, #050505 0%, #000000 100%); border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 3px; font-weight: 700;">MAR BASELIOS COLLEGE OF ENGINEERING</p>
              <p style="margin: 6px 0 0; font-size: 10px; color: #444; letter-spacing: 2px;">Peermade • Kerala • India</p>
              
              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.03);">
                <a href="https://swastika.live" style="color: #777; text-decoration: none; font-size: 12px; font-weight: 600; margin: 0 12px; transition: color 0.3s;">Website</a>
                <span style="color: #333; margin: 0 4px;">•</span>
                <a href="mailto:support@swastika.live" style="color: #777; text-decoration: none; font-size: 12px; font-weight: 600; margin: 0 12px; transition: color 0.3s;">Support</a>
              </div>
              
              <p style="margin: 20px 0 0; font-size: 10px; color: #333;">© 2026 Swastika. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send ticket email to customer
 */
export async function sendTicketEmail({ purchase, tickets }: SendTicketEmailParams): Promise<void> {
  const transporter = createTransporter();
  const emailHTML = generateTicketEmailHTML(purchase, tickets);

  const fromEmail = process.env.SMTP_FROM_EMAIL || `"Swastika '26" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from: fromEmail,
    to: purchase.email,
    subject: `🔥 SWASTIKA'26 - Your Passes Are Here! (Order #${purchase.purchaseId})`,
    html: emailHTML,
  });
}

/**
 * Send ticket reminder email (24 hours before event)
 */
export async function sendTicketReminderEmail({ purchase, tickets }: SendTicketEmailParams): Promise<void> {
  const transporter = createTransporter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://swastika.live';

  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Space+Grotesk:wght@700&display=swap');
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%); color: #fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%); padding: 30px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 620px; background: linear-gradient(180deg, #0d0d0d 0%, #050505 100%); border: 1px solid #1f1f1f; border-radius: 28px; padding: 60px 40px; text-align: center; box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03) inset;">
          <tr>
            <td>
              <!-- Animated Icon -->
              <div style="margin-bottom: 30px; position: relative;">
                <div style="font-size: 80px; line-height: 1; filter: drop-shadow(0 0 40px rgba(239, 68, 68, 0.6));">⚡</div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120px; height: 120px; background: radial-gradient(circle, rgba(239, 68, 68, 0.2), transparent); border-radius: 50%; animation: pulse 2s infinite;"></div>
              </div>
              
              <!-- Main Heading -->
              <h1 style="margin: 0; font-family: 'Space Grotesk', 'Inter', sans-serif; font-size: 48px; font-weight: 700; background: linear-gradient(135deg, #ffffff 0%, #ef4444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -2px; line-height: 1.2;">
                Tomorrow is<br/>the day.
              </h1>
              
              <p style="margin: 24px auto 0; max-width: 450px; font-size: 17px; color: #999; font-weight: 500; line-height: 1.6; letter-spacing: 0.3px;">
                Gear up for the ultimate techno-cultural experience at <strong style="color: #fff;">Swastika '26</strong>
              </p>
              
              <!-- Countdown Badge -->
              <div style="margin: 40px auto; display: inline-block; background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05)); border: 2px solid #ef4444; border-radius: 20px; padding: 20px 40px; box-shadow: 0 0 40px rgba(239, 68, 68, 0.3);">
                <p style="margin: 0; font-size: 12px; color: #ef4444; font-weight: 900; text-transform: uppercase; letter-spacing: 3px;">EVENT STARTS IN</p>
                <p style="margin: 8px 0 0; font-size: 42px; color: #fff; font-weight: 900; letter-spacing: -2px; text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);">24 HOURS</p>
              </div>
              
              <!-- Checklist Card -->
              <div style="background: linear-gradient(135deg, #0f0f0f 0%, #0a0a0a 100%); border: 1px solid #222; border-radius: 24px; padding: 35px; margin-bottom: 40px; text-align: left; box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset;">
                <p style="margin: 0 0 24px; font-size: 13px; color: #ef4444; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; text-align: center;">✓ FINAL CHECKLIST</p>
                
                <div style="margin-bottom: 18px; padding: 16px; background: rgba(255,255,255,0.02); border-left: 3px solid #22c55e; border-radius: 8px;">
                  <span style="color: #22c55e; font-size: 18px; margin-right: 12px; font-weight: 900;">✓</span>
                  <span style="color: #fff; font-size: 16px; font-weight: 600;">Entry Pass in Digital Wallet</span>
                </div>
                
                <div style="margin-bottom: 18px; padding: 16px; background: rgba(255,255,255,0.02); border-left: 3px solid #3b82f6; border-radius: 8px;">
                  <span style="color: #3b82f6; font-size: 18px; margin-right: 12px; font-weight: 900;">✓</span>
                  <span style="color: #fff; font-size: 16px; font-weight: 600;">Valid Institutional ID Card</span>
                </div>
                
                <div style="padding: 16px; background: rgba(255,255,255,0.02); border-left: 3px solid #a855f7; border-radius: 8px;">
                  <span style="color: #a855f7; font-size: 18px; margin-right: 12px; font-weight: 900;">✓</span>
                  <span style="color: #fff; font-size: 16px; font-weight: 600;">Arrive by 08:30 AM</span>
                </div>
              </div>

              <!-- Premium CTA -->
              <a href="${baseUrl}/wallet/${purchase.purchaseId}" style="display: block; padding: 24px 40px; background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%); color: #000; text-decoration: none; border-radius: 16px; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 3px; box-shadow: 0 20px 50px rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(255,255,255,0.1) inset; margin-bottom: 40px;">
                🎫 OPEN DIGITAL WALLET
              </a>
              
              <!-- Footer Info -->
              <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05);">
                <p style="margin: 0; font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 3px; font-weight: 700;">MAR BASELIOS COLLEGE OF ENGINEERING</p>
                <p style="margin: 8px 0 0; font-size: 10px; color: #444; letter-spacing: 2px;">Peermade • Kerala</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const fromEmail = process.env.SMTP_FROM_EMAIL || `"Swastika '26" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from: fromEmail,
    to: purchase.email,
    subject: `⚡ Final Reminder: Swastika '26 is Tomorrow!`,
    html: emailHTML,
  });
}
