/**
 * Helper function to get environment variables.
 * For deployed functions, it reads from parameters automatically set as process.env variables.
 * For local development, it reads from the `.env.local` file.
 */

// In production, the OPENAI_API_KEY parameter is set as an env var.
// For local dev, it's read from .env.local
export const getOpenAIKey = () => 
  process.env.OPENAI_API_KEY;

// These are now only used for LOCAL development, reading from .env.local
export const getFirebaseProjectId = () =>
  process.env.FIREBASE_PROJECT_ID;

export const getFirebaseClientEmail = () =>
  process.env.FIREBASE_CLIENT_EMAIL;

export const getFirebasePrivateKey = () =>
  process.env.FIREBASE_PRIVATE_KEY;

export default {
  getOpenAIKey,
  getFirebaseProjectId,
  getFirebaseClientEmail,
  getFirebasePrivateKey,
}; 