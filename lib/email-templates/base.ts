
import { SITE_CONFIG } from "../site-config";

/**
 * Shared layout components for email templates
 */

export const emailStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&family=Cinzel+Decorative:wght@700&display=swap');
  
  body { 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important; 
    margin: 0; 
    padding: 0; 
    background-color: #020202; 
    color: #ffffff;
  }
  
  .container {
    max-width: 600px;
    margin: 0 auto;
    background: #0a0a0a;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  
  .header {
    background: linear-gradient(180deg, #1a0a0a 0%, #0a0a0a 100%);
    padding: 40px 20px;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .content {
    padding: 40px 30px;
  }
  
  .footer {
    padding: 30px;
    background: #050505;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    color: #a1a1aa;
    font-size: 12px;
  }
  
  .button {
    display: inline-block;
    padding: 16px 32px;
    background: #ffffff;
    color: #000000;
    text-decoration: none;
    border-radius: 9999px;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 20px 0;
  }
  
  .card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
  }
  
  .accent-red {
    color: #dc2626;
  }
  
  .text-muted {
    color: #a1a1aa;
  }
`;

export function getBaseTemplate(content: string, previewText: string = "") {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SITE_CONFIG.name}</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${previewText}
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #020202; padding: 40px 10px;">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <h1 style="font-family: 'Cinzel Decorative', serif; font-size: 32px; margin: 0; color: #ffffff; letter-spacing: 2px;">
              SWASTIKA<span class="accent-red">.</span>26
            </h1>
            <p style="font-family: 'Syne', sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; color: #a1a1aa; margin-top: 10px;">
              Official Communication
            </p>
          </div>
          
          <div class="content">
            ${content}
          </div>
          
          <div class="footer">
            <p style="margin-bottom: 15px; font-weight: 600; color: #ffffff;">${SITE_CONFIG.event.college.toUpperCase()}</p>
            <p>${SITE_CONFIG.event.location}, Idukki, Kerala - 685531</p>
            <div style="margin-top: 20px;">
              <a href="${SITE_CONFIG.baseUrl}" style="color: #dc2626; text-decoration: none; margin: 0 10px;">Website</a>
              <a href="mailto:${SITE_CONFIG.supportEmail}" style="color: #dc2626; text-decoration: none; margin: 0 10px;">Support</a>
            </div>
            <p style="margin-top: 25px; font-size: 10px; opacity: 0.5;">© 2026 Swastika. All rights reserved.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
