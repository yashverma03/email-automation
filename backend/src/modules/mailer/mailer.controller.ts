import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailLog } from './interfaces/email-log.interface';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send')
  async sendEmails(@Body() body: SendEmailDto): Promise<EmailLog[]> {
    return this.mailerService.sendEmails(body.toEmails);
  }
}
