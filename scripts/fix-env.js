#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing .env.local private key format...');

const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  process.exit(1);
}

let content = fs.readFileSync(envPath, 'utf8');

// Find the FIREBASE_PRIVATE_KEY line and fix it
const privateKeyMatch = content.match(/FIREBASE_PRIVATE_KEY="([^"]+)"/);
if (privateKeyMatch) {
  const privateKey = privateKeyMatch[1];
  
  // Remove any actual newlines and replace with \n
  const fixedPrivateKey = privateKey.replace(/\n/g, '\\n');
  
  // Replace the line
  content = content.replace(
    /FIREBASE_PRIVATE_KEY="[^"]+"/,
    `FIREBASE_PRIVATE_KEY="${fixedPrivateKey}"`
  );
  
  fs.writeFileSync(envPath, content);
  console.log('✅ Fixed private key format!');
  console.log('📝 Private key is now on a single line with \\n characters');
} else {
  console.log('⚠️  FIREBASE_PRIVATE_KEY not found in .env.local');
}

console.log('\n🔧 Now run: npm run setup-firebase'); 