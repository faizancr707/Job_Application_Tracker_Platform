/**
 * Amazon SES (Simple Email Service) Notification Service
 * Sends automated, branded transactional emails for application pipeline updates.
 */

let SESClient = null;
let SendEmailCommand = null;

try {
  const sesSdk = require('@aws-sdk/client-ses');
  SESClient = sesSdk.SESClient;
  SendEmailCommand = sesSdk.SendEmailCommand;
} catch (e) {
  // Graceful fallback if SES SDK is not installed in local environment
}

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_SES_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || 'notifications@hirehub.careers';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_USE_IAM_ROLE = process.env.AWS_USE_IAM_ROLE === 'true' || process.env.NODE_ENV === 'production';

const hasExplicitKeys = Boolean(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY);
const isSESConfigured = Boolean(
  SESClient &&
  process.env.AWS_SES_FROM_EMAIL &&
  (hasExplicitKeys || AWS_USE_IAM_ROLE)
);

let sesClient = null;
if (isSESConfigured) {
  const clientConfig = { region: AWS_REGION };
  if (hasExplicitKeys) {
    clientConfig.credentials = {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };
  }
  sesClient = new SESClient(clientConfig);
  console.log(`[Amazon SES] Initialized email client (From: ${AWS_SES_FROM_EMAIL}, auth: ${hasExplicitKeys ? 'keys' : 'IAM Role'})`);
} else {
  console.log('[Amazon SES] Credentials or SES SDK not active. Status emails will log to console.');
}

/**
 * Status message configuration
 */
const STATUS_METADATA = {
  review: {
    subject: 'Application Update: Your Profile is Under Review',
    headline: 'Your Application is Being Reviewed! 🔍',
    badgeColor: '#1E40AF',
    badgeBg: '#EFF6FF',
    message: 'The hiring team has moved your application into the review stage. Your qualifications and portfolio are currently being assessed by the hiring manager.',
    callToAction: 'View Application Status',
  },
  interview: {
    subject: 'Interview Invitation: Congratulations!',
    headline: 'You Have Been Selected for an Interview! 🎯',
    badgeColor: '#6B21A8',
    badgeBg: '#FAF5FF',
    message: 'Exciting news! The recruitment team was impressed with your application and wants to invite you to the interview rounds. Check your portal for scheduling details or prepare with our AI Copilot.',
    callToAction: 'Prepare with AI Copilot',
  },
  accepted: {
    subject: 'Offer Extended: Congratulations on Your Job Offer!',
    headline: 'Congratulations! An Offer Has Been Extended! 🏆',
    badgeColor: '#065F46',
    badgeBg: '#ECFDF5',
    message: 'We are delighted to share that the hiring team has selected you for this role and extended an offer. Access your dashboard to view the next onboarding steps.',
    callToAction: 'Review Offer Details',
  },
  rejected: {
    subject: 'Application Status Update',
    headline: 'Update on Your Application',
    badgeColor: '#475569',
    badgeBg: '#F8FAFC',
    message: 'Thank you for taking the time to apply and interview with the team. While they have decided to move forward with another candidate for this specific role, your profile remains in their talent network for future openings.',
    callToAction: 'Explore More Positions',
  },
  pending: {
    subject: 'Application Received: Confirmation',
    headline: 'Application Successfully Submitted! 📥',
    badgeColor: '#1B4332',
    badgeBg: '#F7F4EE',
    message: 'Your application has been received and logged into our system. We will notify you as soon as the recruiting team reviews your profile.',
    callToAction: 'View Live Tracker',
  },
};

/**
 * Generate branded HTML email
 */
function buildHtmlTemplate({ applicantName, jobTitle, companyName, newStatus, portalUrl }) {
  const meta = STATUS_METADATA[newStatus] || STATUS_METADATA.pending;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E8E2D5; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #143D2B 0%, #1B4332 100%); padding: 32px 36px; text-align: left;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 4px 12px; background: rgba(255,255,255,0.15); border-radius: 999px; color: #F7F4EE; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">HIREHUB APPLICATION OS</span>
                    <h1 style="margin: 12px 0 0 0; color: #FFFFFF; font-size: 22px; font-weight: 800; line-height: 1.3;">${meta.headline}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">
                Hello <strong>${applicantName}</strong>,
              </p>

              <div style="background-color: #FAF8F5; border-radius: 14px; padding: 18px 20px; border: 1px solid #E8E2D5; margin: 24px 0;">
                <table width="100%">
                  <tr>
                    <td>
                      <span style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;">Position</span>
                      <div style="font-size: 16px; font-weight: 800; color: #1B4332; margin-top: 2px;">${jobTitle}</div>
                      <div style="font-size: 13px; color: #475569; margin-top: 2px;">${companyName}</div>
                    </td>
                    <td align="right">
                      <span style="display: inline-block; padding: 6px 14px; background-color: ${meta.badgeBg}; color: ${meta.badgeColor}; border-radius: 999px; font-size: 12px; font-weight: 800;">
                        ${newStatus.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 14px; line-height: 1.7; color: #475569;">
                ${meta.message}
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" style="display: inline-block; background-color: #1B4332; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 2px 8px rgba(27,67,50,0.25);">
                      ${meta.callToAction} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #94A3B8; text-align: center; margin-top: 20px;">
                Log into HireHub anytime to review interview prep questions or track other positions.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 36px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                &copy; ${new Date().getFullYear()} HireHub Platform • AWS Powered Intelligent Recruitment System
              </p>
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
 * Send application status notification email via Amazon SES
 * @param {Object} params
 * @param {string} params.toEmail
 * @param {string} params.applicantName
 * @param {string} params.jobTitle
 * @param {string} params.companyName
 * @param {string} params.newStatus
 * @param {string} [params.portalUrl]
 */
async function sendApplicationStatusEmail({
  toEmail,
  applicantName = 'Applicant',
  jobTitle = 'Position',
  companyName = 'Company',
  newStatus = 'pending',
  portalUrl = (process.env.FRONTEND_URL || 'http://localhost:5173') + '/tracker',
}) {
  const meta = STATUS_METADATA[newStatus] || STATUS_METADATA.pending;
  const htmlBody = buildHtmlTemplate({ applicantName, jobTitle, companyName, newStatus, portalUrl });

  if (isSESConfigured && sesClient && SendEmailCommand) {
    const params = {
      Source: AWS_SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Subject: {
          Data: `${meta.subject} - ${jobTitle} at ${companyName}`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `Hello ${applicantName},\n\nUpdate on your application for ${jobTitle} at ${companyName}.\nStatus: ${newStatus.toUpperCase()}\n\n${meta.message}\n\nView details: ${portalUrl}`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    try {
      const response = await sesClient.send(new SendEmailCommand(params));
      console.log(`[Amazon SES] Email sent to ${toEmail} (MessageId: ${response.MessageId})`);
      return { success: true, messageId: response.MessageId };
    } catch (err) {
      console.error(`[Amazon SES] Send failed for ${toEmail}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Graceful development simulation
  console.log(`[Amazon SES Simulator] Email to: ${toEmail} | Subject: ${meta.subject} | Status: ${newStatus}`);
  return { success: true, simulated: true };
}

module.exports = {
  isSESConfigured,
  sendApplicationStatusEmail,
};
