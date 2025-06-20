const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Only import firebase-functions if we're in the Firebase Functions runtime
let functions;
try {
  functions = require('firebase-functions');
} catch (error) {
  // firebase-functions not available (like during build), that's okay
}

console.log('--- [START] Loading lib/firebase-admin.js ---');

let adminDb;
const apps = getApps();

if (apps.length > 0) {
  // An app is already initialized, likely by the Firebase framework.
  // We'll use this existing app instance.
  adminDb = getFirestore(apps[0]);
} else {
  // No app initialized, so we are in a local development environment.
  // Initialize one using our local credentials from the `.env.local` file.
  const { getFirebaseProjectId, getFirebaseClientEmail, getFirebasePrivateKey } = require('./env-helper');
  const projectId = getFirebaseProjectId();
  const clientEmail = getFirebaseClientEmail();
  const privateKey = getFirebasePrivateKey();

  if (projectId && clientEmail && privateKey) {
    const app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    adminDb = getFirestore(app);
  }
}

console.log('--- [END] Loading lib/firebase-admin.js ---');

module.exports = { adminDb }; 