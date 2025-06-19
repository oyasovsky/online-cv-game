const functions = require('firebase-functions');
     const { createServer } = require('http');
     const { parse } = require('url');
     const next = require('next');

     const dev = process.env.NODE_ENV !== 'production';
     const app = next({ dev });
     const handle = app.getRequestHandler();

     exports.nextjsServer = functions.https.onRequest((req, res) => {
       return app.prepare().then(() => {
         const parsedUrl = parse(req.url, true);
         return handle(req, res, parsedUrl);
       });
     });