import nodemailer from 'nodemailer';
import { IFormEntry } from './formEntryService';
import { IEmailConfiguration } from './formConfigurationService';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize email transporter
   */
  static async initializeTransporter() {
    console.log('[EmailService] Initializing email transporter');

    // Check if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpPort) {
      console.log('[EmailService] SMTP not configured, using test account');
      // Create a test account for development
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('[EmailService] Test email account created:', testAccount.user);
    } else {
      // Use configured SMTP
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpPort === '465',
        auth: smtpUser && smtpPass ? {
          user: smtpUser,
          pass: smtpPass,
        } : undefined,
      });

      console.log('[EmailService] SMTP transporter configured');
    }
  }

  /**
   * Get or create transporter
   */
  static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      await this.initializeTransporter();
    }
    return this.transporter!;
  }

  /**
   * Send form submission notification email
   */
  static async sendFormNotification(
    entry: IFormEntry,
    emailConfig: IEmailConfiguration,
    siteUrl?: string
  ): Promise<{ success: boolean; messageId?: string; testUrl?: string; error?: string }> {
    try {
      if (!emailConfig.enabled) {
        console.log('[EmailService] Email notifications disabled for this form');
        return { success: false, error: 'Email notifications disabled' };
      }

      console.log('[EmailService] Sending form notification email', { siteUrl });

      const transporter = await this.getTransporter();

      // Build email HTML
      const emailHtml = this.buildFormEmailHtml(entry, emailConfig, siteUrl);
      const emailText = this.buildFormEmailText(entry, emailConfig, siteUrl);

      // Send email to all recipients
      const results = await Promise.all(
        emailConfig.recipients.map(async (recipient) => {
          const mailOptions = {
            from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
            to: recipient,
            replyTo: emailConfig.replyTo || entry.customer_email || emailConfig.fromEmail,
            subject: emailConfig.subject,
            text: emailText,
            html: emailHtml,
          };

          const info = await transporter.sendMail(mailOptions);
          console.log('[EmailService] Email sent to:', recipient, 'MessageId:', info.messageId);

          // Get test URL if using Ethereal
          const testUrl = nodemailer.getTestMessageUrl(info);
          if (testUrl) {
            console.log('[EmailService] Preview URL:', testUrl);
          }

          return { success: true, messageId: info.messageId, testUrl: testUrl || undefined };
        })
      );

      return results[0] || { success: true };
    } catch (error: any) {
      console.error('[EmailService] Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Build HTML email content
   */
  private static buildFormEmailHtml(entry: IFormEntry, emailConfig: IEmailConfiguration, siteUrl?: string): string {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9fafb; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #4b5563; }
          .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #2563eb; }
          .footer { margin-top: 20px; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${emailConfig.subject}</h2>
          </div>
          <div class="content">
    `;

    if (emailConfig.customMessage) {
      html += `<p>${emailConfig.customMessage}</p>`;
    }

    html += `<h3>Form Submission Details</h3>`;

    // Add basic info
    html += `
      <div class="field">
        <div class="label">Submission Date:</div>
        <div class="value">${new Date(entry.created_at).toLocaleString()}</div>
      </div>
    `;

    if (entry.customer_name) {
      html += `
        <div class="field">
          <div class="label">Customer Name:</div>
          <div class="value">${entry.customer_name}</div>
        </div>
      `;
    }

    if (entry.customer_email) {
      html += `
        <div class="field">
          <div class="label">Email:</div>
          <div class="value"><a href="mailto:${entry.customer_email}">${entry.customer_email}</a></div>
        </div>
      `;
    }

    if (entry.customer_phone) {
      html += `
        <div class="field">
          <div class="label">Phone:</div>
          <div class="value"><a href="tel:${entry.customer_phone}">${entry.customer_phone}</a></div>
        </div>
      `;
    }

    // Add all form fields if configured
    if (emailConfig.includeAllFields && entry.data) {
      Object.entries(entry.data).forEach(([key, value]) => {
        if (key !== 'name' && key !== 'email' && key !== 'phone') {
          const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          html += `
            <div class="field">
              <div class="label">${label}:</div>
              <div class="value">${value}</div>
            </div>
          `;
        }
      });
    }

    html += `
          </div>
          <div class="footer">
            <p>This email was sent from your website contact form.</p>
            ${siteUrl ? `<p><a href="${siteUrl}" style="color: #2563eb; text-decoration: none;">Visit ${siteUrl}</a></p>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  /**
   * Build plain text email content
   */
  private static buildFormEmailText(entry: IFormEntry, emailConfig: IEmailConfiguration, siteUrl?: string): string {
    let text = `${emailConfig.subject}\n\n`;

    if (emailConfig.customMessage) {
      text += `${emailConfig.customMessage}\n\n`;
    }

    text += `Form Submission Details:\n`;
    text += `------------------------\n\n`;
    text += `Submission Date: ${new Date(entry.created_at).toLocaleString()}\n`;

    if (entry.customer_name) {
      text += `Customer Name: ${entry.customer_name}\n`;
    }

    if (entry.customer_email) {
      text += `Email: ${entry.customer_email}\n`;
    }

    if (entry.customer_phone) {
      text += `Phone: ${entry.customer_phone}\n`;
    }

    if (emailConfig.includeAllFields && entry.data) {
      text += `\n`;
      Object.entries(entry.data).forEach(([key, value]) => {
        if (key !== 'name' && key !== 'email' && key !== 'phone') {
          const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          text += `${label}: ${value}\n`;
        }
      });
    }

    text += `\n------------------------\n`;
    text += `This email was sent from your website contact form.\n`;
    if (siteUrl) {
      text += `Visit: ${siteUrl}\n`;
    }

    return text;
  }

  /**
   * Test email configuration
   */
  static async testEmailConfig(emailConfig: IEmailConfiguration): Promise<{
    success: boolean;
    messageId?: string;
    testUrl?: string;
    error?: string;
  }> {
    try {
      console.log('[EmailService] Testing email configuration');

      const transporter = await this.getTransporter();

      const mailOptions = {
        from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
        to: emailConfig.recipients[0],
        subject: 'Test Email - Form Configuration',
        text: 'This is a test email to verify your email configuration is working correctly.',
        html: '<p>This is a test email to verify your email configuration is working correctly.</p>',
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('[EmailService] Test email sent successfully. MessageId:', info.messageId);

      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        console.log('[EmailService] Preview URL:', testUrl);
      }

      return { success: true, messageId: info.messageId, testUrl: testUrl || undefined };
    } catch (error: any) {
      console.error('[EmailService] Error sending test email:', error);
      return { success: false, error: error.message };
    }
  }
}

export default EmailService;
