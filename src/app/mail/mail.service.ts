import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer'; // Mail tipini import et

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Mail; // Mail tipini kullan
  private mailFrom: string;

  constructor(private readonly configService: ConfigService) {
    // Yapılandırmayı OnModuleInit içinde yapalım ki ConfigService kesin yüklensin
  }

  // Modül başlatıldığında transporter'ı yapılandır
  async onModuleInit() {
    // Ortam değişkenlerinden MailerSend bilgilerini oku
    const mailHost = this.configService.get<string>('MAIL_HOST');
    const mailPort = this.configService.get<number>('MAIL_PORT');
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPassword = this.configService.get<string>('MAIL_PASSWORD'); // MailerSend şifresi/token'ı
    this.mailFrom = this.configService.get<string>('MAIL_FROM'); // Gönderen adresini al

    if (
      !mailHost ||
      !mailPort ||
      !mailUser ||
      !mailPassword ||
      !this.mailFrom
    ) {
      this.logger.error(
        'MailerSend SMTP configuration (MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD, MAIL_FROM) is missing or incomplete in environment variables.',
      );
      // Uygulamanın başlamasını engelleyebilir veya hata fırlatabilirsiniz
      // throw new Error('MailerSend SMTP configuration missing');
      return; // Transporter oluşturulamaz.
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        // port 587 genellikle STARTTLS kullanır (secure: false)
        // port 465 SSL kullanır (secure: true)
        secure: mailPort === 465,
        auth: {
          user: mailUser,
          pass: mailPassword,
        },
        // Gerekirse timeout gibi ek ayarlar eklenebilir
        // connectionTimeout: 10000, // 10 saniye
        // greetingTimeout: 10000,
        // socketTimeout: 10000,
      });

      this.logger.log(
        `Nodemailer transporter configured for MailerSend user ${mailUser} on ${mailHost}:${mailPort}`,
      );

      // Bağlantıyı doğrula (Opsiyonel ama önerilir)
      await this.transporter.verify();
      this.logger.log(
        `Nodemailer transporter verified successfully for ${mailUser}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to configure or verify Nodemailer transporter for ${mailUser}:`,
        error,
      );
      // Transporter null kalacak veya hata fırlatılacak
      this.transporter = null; // Hata durumunda transporter'ı null yapalım
    }
  }

  async sendMail(
    to: string | string[],
    subject: string,
    html: string,
    from?: string, // İsteğe bağlı olarak göndericiyi override etme imkanı
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.error(
        'Transporter is not initialized. Cannot send email. Check configuration.',
      );
      return false;
    }

    const sender = from || this.mailFrom; // Özel gönderici yoksa varsayılanı kullan

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"TURDES" <${sender}>`, // Gönderen adı ve e-posta
      to: to, // Alıcı veya alıcılar
      subject: subject,
      html: html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent successfully via MailerSend. To: ${to}, Message ID: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email via MailerSend. To: ${to}, Subject: ${subject}`,
        error,
      );
      // Hata detaylarını loglamak önemlidir (örn: kimlik doğrulama hatası vs.)
      // console.error(error); // Daha fazla detay için
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
