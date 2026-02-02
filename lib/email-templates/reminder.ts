
import { Purchase, Ticket } from '@/types/ticketing';
import { getBaseTemplate } from './base';
import { SITE_CONFIG } from '../site-config';

export function generateReminderEmailHTML(purchase: Purchase, tickets: Ticket[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || SITE_CONFIG.baseUrl;

  const content = `
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="font-size: 60px; margin-bottom: 20px;">⚡</div>
      <h2 style="font-family: 'Syne', sans-serif; font-size: 32px; margin: 0; color: #ffffff; line-height: 1.2;">Tomorrow is<br/>The Day.</h2>
      <p style="color: #a1a1aa; margin-top: 15px; font-size: 16px;">Gear up for the ultimate techno-cultural experience at ${SITE_CONFIG.name}.</p>
    </div>

    <div style="text-align: center; margin-bottom: 40px; background: rgba(220, 38, 38, 0.1); border: 2px solid #dc2626; border-radius: 16px; padding: 25px;">
      <p style="margin: 0; font-size: 12px; color: #dc2626; font-weight: 800; text-transform: uppercase; letter-spacing: 3px;">Event Starts In</p>
      <p style="margin: 10px 0 0 0; font-size: 36px; color: #ffffff; font-weight: 800; font-family: 'Syne', sans-serif;">24 HOURS</p>
    </div>

    <div class="card">
      <p style="margin: 0 0 20px 0; font-size: 12px; color: #dc2626; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; text-align: center;">✓ Final Checklist</p>
      
      <div style="margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.03); border-left: 3px solid #22c55e; border-radius: 4px;">
        <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 600;">Entry Pass in Digital Wallet</p>
      </div>
      
      <div style="margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.03); border-left: 3px solid #3b82f6; border-radius: 4px;">
        <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 600;">Valid Institutional ID Card</p>
      </div>
      
      <div style="padding: 12px; background: rgba(255,255,255,0.03); border-left: 3px solid #a855f7; border-radius: 4px;">
        <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 600;">Arrive by 08:30 AM</p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${SITE_CONFIG.links.wallet(purchase.purchaseId)}" class="button" style="background: #ffffff; color: #000000; width: 80%; text-align: center;">
        Open Digital Wallet
      </a>
    </div>
  `;

  return getBaseTemplate(content, `${SITE_CONFIG.name} is almost here! Are you ready?`);
}
