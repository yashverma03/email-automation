import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { EmailLog } from './interfaces/email-log.interface';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly logFile = path.join(__dirname, '..logs/email.log');

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  private getEmailContent() {
    const subject = 'Exploring Software Engineering Opportunities';
    const text = `
      Hi,

      I am currently working as a Software Engineer at Oats Tech with 1.3 years of hands-on experience in full-stack web development. Over this period, I have contributed to a variety of impactful projects, including Property Management application, AI-powered chrome extension, Content Management System (CMS), Car Service Booking platform and Home Interior Design web application.

      I am proficient in full stack web development: frontend (HTML, CSS, JavaScript, Typescript, React.js), backend (Node.js, Express.js, Nest.js, Redis, Kafka), databases (PostgreSQL, MySQL, MongoDB) and devops (AWS, Docker, Linux).

      I'm reaching out to explore if there are any internal openings or upcoming roles in your team. I would be glad to connect and discuss how I can contribute to your team. Please find my resume attached for your reference.

      Resume- https://drive.google.com/file/d/1_52R52MmukcObe3ZaWhOmkq3tUAA7hVi

      Best regards,
      Yash Verma
      📧 vermayash2003@gmail.com
      📞 +91 8130957794
    `;
    return { subject, text };
  }

  async sendEmails(toEmails: string[]) {
    const results: EmailLog[] = [];
    const { subject, text } = this.getEmailContent();

    for (const email of toEmails) {
      try {
        const info = await this.transporter.sendMail({
          from: process.env.MAIL_FROM,
          to: email,
          subject,
          text,
        });
        this.log(
          `SUCCESS: Email sent to ${email} - MessageID: ${info.messageId}`,
        );
        results.push({ email, status: 'success' });
      } catch (err) {
        this.log(`FAILED: Email to ${email} - Error: ${err.message}`);
        results.push({ email, status: 'failed', error: err.message });
      }
    }

    return results;
  }

  private log(message: string) {
    // Ensure directory exists
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Append log
    const logMsg = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(this.logFile, logMsg, { encoding: 'utf8' });
    // Also log via NestJS logger
    this.logger.log(message, 'MailerService');
  }
}
