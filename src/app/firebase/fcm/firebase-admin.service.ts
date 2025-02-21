// firebase-admin.service.ts

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';
import * as serviceAccount from './turdes.json'; // Firebase'den indirdiğiniz JSON dosyası

@Injectable()
export class FirebaseAdminService {
  private readonly messagingUrl =
    'https://fcm.googleapis.com/v1/projects/turdes-f2e8d/messages:send';

  // Google Cloud Authentication için JWT oluşturuyoruz
  private async getAccessToken(): Promise<string> {
    const client = new GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
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
