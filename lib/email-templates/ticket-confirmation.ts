
import { Purchase, Ticket, TICKET_TYPES } from '@/types/ticketing';
import { formatCurrency } from '@/lib/ticketing-utils';
import { getBaseTemplate } from './base';
import { SITE_CONFIG } from '../site-config';

export function generateTicketEmailHTML(purchase: Purchase): string {
  const walletUrl = SITE_CONFIG.links.wallet(purchase.purchaseId);

  const content = `
    <div style="text-align: left; margin-bottom: 30px;">
      <h2 style="font-family: 'Syne', sans-serif; font-size: 24px; margin: 0; color: #ffffff;">Hi ${purchase.buyerName}, your order is confirmed.</h2>
      <p style="color: #a1a1aa; margin-top: 10px; font-size: 16px; line-height: 1.5;">
        Click below to view your unique passes. Every pass has its own secure code.
      </p>
    </div>

    <div style="text-align: center; margin: 40px 0; padding: 30px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;">
      <p style="color: #ffffff; font-size: 14px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Click below to access your digital tickets</p>
      <a href="${walletUrl}" class="button" style="background: #ffffff; color: #000000; padding: 16px 32px; font-size: 16px; font-weight: 800; border-radius: 12px; display: inline-block;">
        VIEW YOUR TICKETS
      </a>
    </div>

    <div style="margin-top: 30px; padding: 20px; border-radius: 12px; background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.1);">
      <p style="margin: 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
        <strong style="color: #3b82f6;">Security Message:</strong> You can share this link with your friends to give them their individual tickets. Anyone with access to this link can view and use the tickets.
      </p>
    </div>

    <div style="margin-top: 40px; border-top: 1px solid rgba(255, 255, 255, 0.05); pt-20">
      <table width="100%" style="margin-top: 20px;">
        <tr>
          <td>
            <p style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">Booking ID</p>
            <p style="font-size: 14px; color: #dc2626; font-family: monospace; font-weight: 700; margin: 0;">#${purchase.purchaseId}</p>
          </td>
          <td align="right">
            <p style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">Total Paid</p>
            <p style="font-size: 16px; color: #22c55e; font-weight: 800; margin: 0;">${formatCurrency(purchase.totalAmount)}</p>
          </td>
        </tr>
      </table>
    </div>
  `;

  return getBaseTemplate(content, `Your ${SITE_CONFIG.name} tickets are ready!`);
}
