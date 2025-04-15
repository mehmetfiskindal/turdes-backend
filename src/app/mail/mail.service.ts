import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Mail;
  private mailFrom: string;
  private testAccount: any; // Ethereal test hesabı için
  private useTestAccount = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      // Önce normal SMTP sunucusu ile bağlantı kurmayı deneyelim
      await this.setupRealTransporter();

      // Eğer gerçek transporter başarısız olursa test hesabı oluşturalım
      if (!this.transporter) {
        await this.setupTestTransporter();
      }
    } catch (error) {
      this.logger.error('Failed to initialize mail transporter:', error);
      // Ana uygulama çalışmaya devam etsin, sadece e-posta gönderimi devre dışı kalacak
    }
  }

  // Gerçek SMTP sunucusuyla bağlantı kurma
  private async setupRealTransporter() {
    const mailHost = this.configService.get<string>('MAIL_HOST');
    const mailPort = this.configService.get<number>('MAIL_PORT');
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPassword = this.configService.get<string>('MAIL_PASSWORD');
    this.mailFrom = this.configService.get<string>('MAIL_FROM');

    if (
      !mailHost ||
      !mailPort ||
      !mailUser ||
      !mailPassword ||
      !this.mailFrom
    ) {
      this.logger.warn(
        'SMTP configuration incomplete. Some environment variables are missing.',
      );
      return;
    }

    try {
      // Bağlantı timeout'larını arttırarak daha fazla zaman tanıyalım
      this.transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailPort === 465,
        auth: {
          user: mailUser,
          pass: mailPassword,
        },
        connectionTimeout: 15000, // 15 saniye
        greetingTimeout: 15000,
        socketTimeout: 15000,
        debug: true, // Daha fazla debug bilgisi
      });

      // Bağlantıyı test ediyoruz
      await this.transporter.verify();
      this.logger.log(
        `SMTP connection established successfully with ${mailHost}:${mailPort}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to connect to SMTP server (${mailHost}:${mailPort}):`,
        error,
      );
      this.transporter = null;
    }
  }

  // Test hesabı oluşturma ve yapılandırma (Ethereal)
  private async setupTestTransporter() {
    try {
      this.logger.warn('Using Ethereal test account for email sending');

      // Ethereal.email test hesabı oluştur
      this.testAccount = await nodemailer.createTestAccount();

      // Test hesabı bilgileriyle transporter oluştur
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: this.testAccount.user,
          pass: this.testAccount.pass,
        },
      });

      this.useTestAccount = true;
      this.mailFrom = this.testAccount.user;
      this.logger.log(
        `Ethereal test account created: ${this.testAccount.user}`,
      );
    } catch (error) {
      this.logger.error('Failed to create Ethereal test account:', error);
      this.transporter = null;
    }
  }

  async sendMail(
    to: string | string[],
    subject: string,
    html: string,
    from?: string,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.error(
        'Transporter is not initialized. Cannot send email. Check configuration.',
      );
      return false;
    }

    const sender = from || this.mailFrom;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"TURDES" <${sender}>`,
      to: to,
      subject: subject,
      html: html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      if (this.useTestAccount) {
        // Test hesabı kullanıldığında, e-postayı görüntülemek için URL göster
        const previewUrl = nodemailer.getTestMessageUrl(info);
        this.logger.log(`Test email sent. Preview URL: ${previewUrl}`);
      } else {
        this.logger.log(
          `Email sent successfully. To: ${to}, Message ID: ${info.messageId}`,
        );
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  // Doğrulama e-postası gönderen yardımcı metod
  async sendVerificationEmail(
    userEmail: string,
    userName: string,
    verificationLink: string,
  ): Promise<boolean> {
    const subject = 'E-posta Adresinizi Doğrulayın';
    const html = `
      <h2>E-posta Doğrulama</h2>
      <p>Merhaba ${userName},</p>
      <p>E-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
      <p><a href="${verificationLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">E-posta Adresimi Doğrula</a></p>
      <p>Veya bu URL'yi tarayıcınıza kopyalayıp yapıştırın:</p>
      <p>${verificationLink}</p>
      <p>Bu bağlantı 30 dakika boyunca geçerlidir.</p>
      <p>Teşekkürler,<br />TURDES Ekibi</p>
    `;
    return this.sendMail(userEmail, subject, html);
  }

  // Şifre sıfırlama e-postası gönderen yardımcı metod
  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetLink: string,
  ): Promise<boolean> {
    const subject = 'Parola Sıfırlama İsteği';
    const html = `
      <h2>Parolanızı mı Unuttunuz?</h2>
      <p>Merhaba ${userName},</p>
      <p>Hesabınız için bir parola sıfırlama isteği aldık. Parolanızı sıfırlamak için aşağıdaki düğmeye tıklayın:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Parolamı Sıfırla</a>
      </p>
      <p>Bu bağlantı 1 saat boyunca geçerlidir.</p>
      <p>Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz. Hesabınız güvende kalacaktır.</p>
      <p>Teşekkürler,<br />TURDES Ekibi</p>
    `;
    return this.sendMail(userEmail, subject, html);
  }

  // Hoş geldiniz e-postası gönderen yardımcı metod (e-posta doğrulaması sonrası)
  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
  ): Promise<boolean> {
    const subject = "TURDES'e Hoş Geldiniz!";
    const html = `
      <h2>Hoş Geldiniz!</h2>
      <p>Merhaba ${userName},</p>
      <p>E-posta adresiniz başarıyla doğrulandı. TURDES platformuna hoş geldiniz!</p>
      <p>Artık hesabınızı kullanarak platforma giriş yapabilir ve tüm özelliklere erişebilirsiniz.</p>
      <p>Teşekkürler,<br />TURDES Ekibi</p>
    `;
    return this.sendMail(userEmail, subject, html);
  }
}
