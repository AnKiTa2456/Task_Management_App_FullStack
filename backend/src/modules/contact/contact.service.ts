import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  async handleSubmission(dto: CreateContactDto): Promise<void> {
    this.logger.log(`New contact submission from ${dto.email}`);

    // Try to send email — gracefully fails if SMTP not configured
    try {
      await this.sendEmail(dto);
    } catch (err) {
      this.logger.warn(`Email send failed (SMTP not configured?): ${(err as Error).message}`);
    }
  }

  private async sendEmail(dto: CreateContactDto): Promise<void> {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      this.logger.warn('SMTP_USER / SMTP_PASS not set — skipping email send.');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass },
    });

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#4f46e5">📬 New Contact Form Submission — TaskFlow</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <tr><td style="padding:8px;font-weight:bold;width:130px">Name</td><td style="padding:8px">${dto.name}</td></tr>
          <tr style="background:#f8fafc"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px"><a href="mailto:${dto.email}">${dto.email}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${dto.phone}</td></tr>
        </table>
        <div style="margin-top:20px;background:#f8fafc;border-left:4px solid #4f46e5;padding:16px;border-radius:4px">
          <strong>Message:</strong>
          <p style="margin-top:8px;color:#334155">${dto.message.replace(/\n/g, '<br>')}</p>
        </div>
        <p style="margin-top:20px;font-size:12px;color:#94a3b8">
          Sent via TaskFlow contact form · ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    await transporter.sendMail({
      from:    `"TaskFlow Contact" <${smtpUser}>`,
      to:      'p.ankita10101@gmail.com',
      replyTo: dto.email,
      subject: `New Contact: ${dto.name} — ${dto.email}`,
      html,
    });

    this.logger.log(`Contact email sent to p.ankita10101@gmail.com`);
  }
}
