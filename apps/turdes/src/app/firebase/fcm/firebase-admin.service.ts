// firebase-admin.service.ts
import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
import serviceAccount from './turdes-f2e8d-firebase-adminsdk-a5nlb-b206dab865.json';
const params = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};

@Injectable()
export class FirebaseAdminService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(params),
    });
  }

  // Push notification gönderme
  async sendPushNotification(deviceToken: string, message: string) {
    const payload = {
      notification: {
        title: 'Yardım Talebi Güncellemesi',
        body: message,
      },
    };

    return await admin.messaging().sendToDevice(deviceToken, payload);
  }
}
