import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule],
  providers: [MailService],
  exports: [MailService], // MailService'i dışa aktarıyoruz böylece diğer modüller kullanabilir
})
export class MailModule {}
