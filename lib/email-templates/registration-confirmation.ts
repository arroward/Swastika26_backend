import { getBaseTemplate } from "./base";
import { SITE_CONFIG } from "../site-config";

interface RegistrationDetails {
  fullName: string;
  email: string;
  eventTitle: string;
  registrationDate: string;
  upiTransactionId?: string;
  registrationFee?: number;
}

/**
 * Generate registration confirmation email HTML
 * Sent after payment verification is approved
 */
export function generateRegistrationConfirmationEmailHTML(
  details: RegistrationDetails,
): string {
  const registrationDate = new Date(
    details.registrationDate,
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const content = `
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);">
        <p style="margin: 0; color: #ffffff; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px;">Payment Verified</p>
      </div>
      <h2 style="font-family: 'Syne', sans-serif; font-size: 32px; margin: 10px 0; color: #ffffff; font-weight: 900;">You're All Set!</h2>
      <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%); margin: 24px auto; border-radius: 2px;"></div>
    </div>

    <div style="margin-bottom: 35px;">
      <p style="color: #ffffff; font-size: 18px; line-height: 1.6; margin-bottom: 12px; font-weight: 600;">
        Hey <strong style="color: #dc2626;">${details.fullName}</strong>
      </p>
      <p style="color: #d4d4d8; font-size: 16px; line-height: 1.7; margin-bottom: 0;">
        Your payment has been successfully verified and your registration for <strong style="color: #dc2626; font-weight: 700;">${details.eventTitle}</strong> is now <strong style="color: #22c55e;">confirmed</strong>. Get ready for an incredible experience at ${SITE_CONFIG.name}!
      </p>
    </div>

    <div style="background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid rgba(220, 38, 38, 0.2); border-radius: 20px; padding: 32px; margin: 35px 0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h3 style="font-family: 'Syne', sans-serif; font-size: 20px; margin: 0; color: #ffffff; font-weight: 800;">Registration Details</h3>
      </div>
      
      <table width="100%" style="margin-top: 20px;">
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <p style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2.5px; margin: 0 0 6px 0; font-weight: 600;">Event Name</p>
            <p style="font-size: 17px; color: #dc2626; font-weight: 800; margin: 0; letter-spacing: 0.3px;">${details.eventTitle}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <p style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2.5px; margin: 0 0 6px 0; font-weight: 600;">Registration Date</p>
            <p style="font-size: 14px; color: #e5e5e5; margin: 0; font-weight: 500;">${registrationDate}</p>
          </td>
        </tr>
        ${
          details.upiTransactionId
            ? `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <p style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2.5px; margin: 0 0 6px 0; font-weight: 600;">Transaction ID</p>
            <p style="font-size: 13px; color: #22c55e; font-family: 'Courier New', monospace; font-weight: 700; margin: 0; background: rgba(34, 197, 94, 0.1); padding: 6px 10px; border-radius: 6px; display: inline-block;">${details.upiTransactionId}</p>
          </td>
        </tr>
        `
            : ""
        }
        ${
          details.registrationFee && details.registrationFee > 0
            ? `
        <tr>
          <td style="padding: 14px 0;">
            <p style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2.5px; margin: 0 0 6px 0; font-weight: 600;">Amount Paid</p>
            <p style="font-size: 24px; color: #22c55e; font-weight: 900; margin: 0;">₹${details.registrationFee}</p>
          </td>
        </tr>
        `
            : ""
        }
      </table>
    </div>

    <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%); border-left: 4px solid #3b82f6; padding: 24px; border-radius: 12px; margin: 35px 0;">
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #60a5fa; font-weight: 800; text-transform: uppercase; letter-spacing: 2.5px;">Event Timing</p>
      <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; line-height: 1.7; font-weight: 600;">
        <span style="color: #60a5fa;">Reporting Time:</span> 9:00 AM onwards
      </p>
      <p style="margin: 0; color: #d4d4d8; fo5px 0;">
      <a href="${SITE_CONFIG.baseUrl}" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 8px 30px rgba(220, 38, 38, 0.4); transition: all 0.3s ease;">
        Visit ${SITE_CONFIG.name}
      </a>
    </div>

    <div style="text-align: center; margin-top: 40px; padding: 24px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);">
      <p style="margin: 0 0 12px 0; color: #ffffff; font-size: 15px; line-height: 1.7; font-weight: 600;">
        We can't wait to see you at ${SITE_CONFIG.name}!
      </p>
      <p style="margin: 0 0 8px 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
        Get ready for an unforgettable experience filled with innovation, culture, and excitement.
      </p>
      <p style="margin: 0; color: #71717a; font-size: 12px; line-height: 1.5;">
        Questions? Reach out to us at <a href="mailto:${SITE_CONFIG.supportEmail}" style="color: #60a5fa; text-decoration: none; font-weight: 600;">${SITE_CONFIG.supportEmail}</a>
      </p>
    </div>

    <div style="margin-top: 35px; padding-top: 24px; border-top: 2px solid rgba(220, 38, 38, 0.2); text-align: center;">
      <p style="margin: 0; color: #71717a; font-size: 11px; line-height: 1.5; text-transform: uppercase; letter-spacing: 1.5px;">
        ${SITE_CONFIG.event.college}
      </p>
      <p style="margin: 8px 0 0 0; color: #52525b; font-size: 11px;">
        ${SITE_CONFIG.event.dates} • ${SITE_CONFIG.event.location}
      </ul>
    </div>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${SITE_CONFIG.baseUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 20px rgba(220, 38, 38, 0.3);">
        Visit ${SITE_CONFIG.name}
      </a>
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
      <p style="margin: 0 0 10px 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
        We're excited to see you at ${SITE_CONFIG.name}! Stay tuned for more updates about the event schedule and venue details.
      </p>
      <p style="margin: 0; color: #71717a; font-size: 12px; line-height: 1.5;">
        If you have any questions or concerns, please don't hesitate to contact our support team.
      </p>
    </div>
  `;

  return getBaseTemplate(
    content,
    `Registration Confirmed - ${details.eventTitle}`,
  );
}
