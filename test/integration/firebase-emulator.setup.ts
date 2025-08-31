import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseEmulatorSetup {
  static setupEmulators() {
    if (process.env.NODE_ENV === 'test') {
      // Firebase Emulator host settings
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

      // Firebase admin service emulator configuration
      process.env.GOOGLE_APPLICATION_CREDENTIALS = undefined;
      process.env.FIREBASE_CONFIG = JSON.stringify({
        projectId: 'turdes-f2e8d',
        apiKey: 'fake-api-key',
        authDomain: 'localhost:9099',
        databaseURL: 'http://localhost:9000',
        storageBucket: 'localhost:9199',
      });
    }
  }

  static teardownEmulators() {
    if (process.env.NODE_ENV === 'test') {
      delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
      delete process.env.FIRESTORE_EMULATOR_HOST;
      delete process.env.FIREBASE_DATABASE_EMULATOR_HOST;
      delete process.env.FIREBASE_STORAGE_EMULATOR_HOST;
      delete process.env.FIREBASE_CONFIG;
    }
  }
}
