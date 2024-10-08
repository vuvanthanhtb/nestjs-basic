import { Controller, Get, Query } from '@nestjs/common';
import { Public, ResponseMessage } from 'decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Test email')
  // @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleTestEmail(@Query('name') name: string) {
    const jobs = await this.mailService.findJobs();
    await this.mailerService.sendMail({
      to: 'vuvanthanhtb@gmail.com',
      from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Nice App! Confirm your Email',
      template: 'new-job',
      context: {
        name: name ?? 'Thanh Vu',
        jobs,
      },
    });
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  testCron() {
    console.log('test');
  }
}
