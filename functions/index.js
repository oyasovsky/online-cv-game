const functions = require("firebase-functions");
const next = require("next");

// Parameterized configuration
const { defineString } = require('firebase-functions/params');

// Define parameters for secrets/config.
// The Firebase Admin SDK automatically finds credentials in a deployed environment.
const OPENAI_API_KEY = defineString('OPENAI_API_KEY');

module.exports = {
  OPENAI_API_KEY,
};

const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
  conf: { distDir: "../.next" } // <-- This is critical!
});
const handle = app.getRequestHandler();

exports.nextjsServer = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});