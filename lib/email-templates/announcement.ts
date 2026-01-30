
import { getBaseTemplate } from './base';

export function generateAnnouncementEmailHTML(title: string, message: string, ctaText?: string, ctaUrl?: string): string {
    const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="font-family: 'Syne', sans-serif; font-size: 28px; margin: 0; color: #ffffff;">${title}</h2>
      <div style="height: 2px; width: 50px; background: #dc2626; margin: 20px auto;"></div>
    </div>

    <div style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      ${message.split('\n').map(p => `<p style="margin-bottom: 15px;">${p}</p>`).join('')}
    </div>

    ${ctaText && ctaUrl ? `
    <div style="text-align: center; margin-top: 40px;">
      <a href="${ctaUrl}" class="button">
        ${ctaText}
      </a>
    </div>
    ` : ''}
  `;

    return getBaseTemplate(content, title);
}
