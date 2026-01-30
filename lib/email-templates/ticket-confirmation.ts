
import { Purchase, Ticket, TICKET_TYPES } from '@/types/ticketing';
import { formatCurrency } from '@/lib/ticketing-utils';
import { getBaseTemplate } from './base';
import { SITE_CONFIG } from '../site-config';

export function generateTicketEmailHTML(purchase: Purchase, tickets: Ticket[]): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || SITE_CONFIG.baseUrl;

    const ticketLinksHTML = tickets.map((ticket, index) => {
        const config = TICKET_TYPES[ticket.type];
        const ticketColor = config.color === 'blue' ? '#3b82f6' : config.color === 'purple' ? '#a855f7' : '#dc2626';

        return `
      <div style="margin-bottom: 20px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; overflow: hidden;">
        <div style="height: 3px; background: ${ticketColor};"></div>
        <div style="padding: 20px; display: table; width: 100%;">
          <div style="display: table-cell; vertical-align: middle;">
            <span style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">PASS ${index + 1}</span>
            <h3 style="margin: 5px 0 0; font-size: 18px; color: #ffffff; font-family: 'Syne', sans-serif;">${config.label}</h3>
            <p style="margin: 5px 0 0; font-size: 11px; color: #a1a1aa; font-family: monospace;">${ticket.ticketId}</p>
          </div>
          <div style="display: table-cell; vertical-align: middle; text-align: right; width: 120px;">
            <a href="${SITE_CONFIG.links.ticket(ticket.ticketId)}" style="display: inline-block; padding: 10px 16px; background: ${ticketColor}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 11px; text-transform: uppercase;">VIEW PASS</a>
          </div>
        </div>
      </div>
    `;
    }).join('');

    const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; padding: 8px 16px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 9999px; color: #22c55e; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;">
        ✓ Payment Confirmed
      </div>
      <h2 style="font-family: 'Syne', sans-serif; font-size: 28px; margin: 0; color: #ffffff;">Your Passes Are Ready!</h2>
      <p style="color: #a1a1aa; margin-top: 10px;">Get ready for the ultimate techno-cultural experience.</p>
    </div>

    <div class="card">
      <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 20px; margin-bottom: 20px;">
        <p style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Attendee Details</p>
        <p style="font-size: 20px; font-weight: 800; margin: 0; color: #ffffff;">${purchase.name}</p>
        <p style="font-size: 14px; color: #a1a1aa; margin: 4px 0 0 0;">${purchase.email}</p>
      </div>
      
      <table width="100%">
        <tr>
          <td>
            <p style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">Booking ID</p>
            <p style="font-size: 14px; color: #dc2626; font-family: monospace; font-weight: 700; margin: 0;">#${purchase.purchaseId}</p>
          </td>
          <td align="right">
            <p style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">Total Paid</p>
            <p style="font-size: 20px; color: #22c55e; font-weight: 800; margin: 0;">${formatCurrency(purchase.totalAmount)}</p>
          </td>
        </tr>
      </table>
    </div>

    <div style="margin-top: 30px;">
      <p style="font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; text-align: center; margin-bottom: 15px;">Your Access Passes</p>
      ${ticketLinksHTML}
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${SITE_CONFIG.links.wallet(purchase.purchaseId)}" class="button" style="background: #ffffff; color: #000000;">
        Add to Wallet
      </a>
    </div>

    <div style="margin-top: 40px; padding: 20px; background: rgba(220, 38, 38, 0.05); border-left: 4px solid #dc2626; border-radius: 8px;">
      <h4 style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; text-transform: uppercase;">⚠️ Entry Rules</h4>
      <ul style="margin: 0; padding-left: 20px; color: #a1a1aa; font-size: 13px; line-height: 1.6;">
        <li>Arrive 30 minutes before the event starts.</li>
        <li>Present original QR code (Screenshots may not work).</li>
        <li>Valid College ID is mandatory for verification.</li>
      </ul>
    </div>
  `;

    return getBaseTemplate(content, `Your ${SITE_CONFIG.name} passes for ${purchase.name} are here!`);
}
