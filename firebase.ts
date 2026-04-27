import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Root app initialization
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore - MUST use the firestoreDatabaseId from the config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Storage
console.log("[FIREBASE] Initializing Storage with bucket:", firebaseConfig.storageBucket);
export const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);

// Test connection strictly as per guidelines
async function testConnection() {
  try {
    // Attempting to read a dummy document to verify connectivity
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client appears to be offline.");
    }
    // Note: Permission denied is expected if the document doesn't exist and rules are tight
  }
}

testConnection();
