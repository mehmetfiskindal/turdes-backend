import { FirebaseEmulatorSetup } from './firebase-emulator.setup';

// Global test setup for integration tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Setup Firebase emulators
  FirebaseEmulatorSetup.setupEmulators();

  console.log('🔥 Firebase emulators configured for integration tests');
});

afterAll(async () => {
  // Cleanup
  FirebaseEmulatorSetup.teardownEmulators();

  console.log('✅ Integration tests cleanup completed');
});
