// firebase-admin.service.ts
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert({
        // Firebase service account JSON anahtarını buraya ekleyin
      }),
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
