import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { EmailLog } from './interfaces/email-log.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: Number(this.configService.get<number>('MAIL_PORT')),
      secure: Number(this.configService.get<number>('MAIL_PORT')) === 465, // true if port 465
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  private getLogFilePath(isSuccess: boolean) {
    const filePrefix = isSuccess ? 'success' : 'failure';
    return path.join(
      process.cwd(),
      `src/modules/mailer/logs/${filePrefix}-email.log`,
    );
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
    const resumePath =
      '/home/yash/yash-files/Documents/Job/Resume/Yash_Verma_Full_Stack_Resume.pdf';

    for (const email of toEmails) {
      try {
        const info = await this.transporter.sendMail({
          from: this.configService.getOrThrow('MAIL_FROM'),
          to: email,
          subject,
          text,
          attachments: [
            {
              filename: 'Yash_Verma_Full_Stack_Resume.pdf',
              path: resumePath,
            },
          ],
        });
        this.log(
          `SUCCESS: Email sent to ${email} - MessageID: ${info.messageId}`,
          this.getLogFilePath(true),
        );
        results.push({ email, status: 'success' });
      } catch (err) {
        this.log(
          `FAILED: Email to ${email} - Error: ${err.message}`,
          this.getLogFilePath(false),
        );
        results.push({ email, status: 'failed', error: err.message });
      }
    }

    return results;
  }

  private log(message: string, filePath: string) {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Append log message
    const logMsg = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(filePath, logMsg, { encoding: 'utf8' });
    // Also log via NestJS logger
    this.logger.log(message, 'MailerService');
  }
}
