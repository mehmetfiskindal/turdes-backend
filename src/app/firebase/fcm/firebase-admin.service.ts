// firebase-admin.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';

@Injectable()
export class FirebaseAdminService {
  constructor(private configService: ConfigService) {}

  private get messagingUrl(): string {
    const projectId = this.configService.get<string>(
      'FIREBASE_PROJECT_ID',
      'turdes-f2e8d',
    );
    return `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  }

  // Google Cloud Authentication için JWT oluşturuyoruz
  private async getAccessToken(): Promise<string> {
    const client = new GoogleAuth({
      credentials: {
        client_email: this.configService.get<string>(
          'FIREBASE_CLIENT_EMAIL',
          process.env.client_email,
        ),
        private_key: this.configService.get<string>(
          'FIREBASE_PRIVATE_KEY',
          process.env.private_key,
        ),
      },
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const accessToken = await client.getAccessToken();
    return accessToken;
  }

  // Push notification gönderme fonksiyonu
  public async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
  ) {
    const accessToken = await this.getAccessToken();

    const payload = {
      message: {
        token: deviceToken,
        notification: {
          title,
          body,
        },
      },
    };

    try {
      const response = await axios.post(this.messagingUrl, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Successfully sent message:', response.data);
    } catch (error) {
      console.error(
        'Error sending push notification:',
        error.response?.data || error.message,
      );
    }
  }
}
