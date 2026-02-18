import { getBaseTemplate } from "./base";
import { SITE_CONFIG } from "../site-config";

interface PaymentReceivedDetails {
  fullName: string;
  email: string;
  eventTitle: string;
  amount: number;
  transactionId: string;
  date: string;
}

/**
 * Generate payment received acknowledgement email HTML
 * Sent manually by admin to acknowledge payment receipt before final verification
 */
export function generatePaymentReceivedEmailHTML(
  details: PaymentReceivedDetails,
): string {
  const content = `
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 50px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);">
        <p style="margin: 0; color: #ffffff; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Payment Received</p>
      </div>
     
      <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%); margin: 24px auto; border-radius: 2px;"></div>
    </div>

    <div style="margin-bottom: 35px;">
      <p style="color: #ffffff; font-size: 18px; line-height: 1.6; margin-bottom: 12px; font-weight: 600;">
        Hello <strong style="color: #60a5fa;">${details.fullName}</strong>,
      </p>
      <p style="color: #d4d4d8; font-size: 16px; line-height: 1.7; margin-bottom: 0;">
        We have successfully received your payment of <strong style="color: #22c55e;">₹${details.amount}</strong> for <strong style="color: #ffffff;">${details.eventTitle}</strong>. 
        Your ticket details will be issued and sent to your email shortly.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 16px; padding: 32px; margin: 35px 0;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h3 style="font-family: 'Syne', sans-serif; font-size: 16px; margin: 0; color: #ffffff; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Transaction Details</h3>
      </div>
      
      <table width="100%" style="margin-top: 10px; border-collapse: separate; border-spacing: 0;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
            <p style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 6px 0;">Transaction ID</p>
            <p style="font-size: 14px; color: #ffffff; font-family: 'Courier New', monospace; font-weight: 600; margin: 0;">${details.transactionId}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 0 0 0;">
            <p style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 6px 0;">Amount Paid</p>
            <p style="font-size: 20px; color: #22c55e; font-weight: 700; margin: 0; letter-spacing: -0.5px;">₹${details.amount}</p>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 35px; Padding: 24px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.04);">
      <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
        This is an automated acknowledgement. No further action is required at this moment.
        If you have any questions, please contact us at <a href="mailto:${SITE_CONFIG.supportEmail}" style="color: #60a5fa; text-decoration: none; transition: color 0.2s;">${SITE_CONFIG.supportEmail}</a>.
      </p>
    </div>
  `;

  return getBaseTemplate(
    content,
    `Payment Received - ${details.eventTitle}`,
  );
}
