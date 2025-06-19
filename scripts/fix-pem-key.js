#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing PEM private key format...');

const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  process.exit(1);
}

let content = fs.readFileSync(envPath, 'utf8');

// Find the FIREBASE_PRIVATE_KEY line
const privateKeyMatch = content.match(/FIREBASE_PRIVATE_KEY="([^"]+)"/);
if (privateKeyMatch) {
  const privateKey = privateKeyMatch[1];
  
  // Replace \\n with actual newlines to create proper PEM format
  const fixedPrivateKey = privateKey.replace(/\\n/g, '\n');
  
  // Replace the line with the properly formatted key
  content = content.replace(
    /FIREBASE_PRIVATE_KEY="[^"]+"/,
    `FIREBASE_PRIVATE_KEY="${fixedPrivateKey}"`
  );
  
  fs.writeFileSync(envPath, content);
  console.log('✅ Fixed private key to proper PEM format!');
  console.log('📝 Private key now has actual newlines for PEM format');
} else {
  console.log('⚠️  FIREBASE_PRIVATE_KEY not found in .env.local');
}

console.log('\n🔧 Now run: npm run setup-firebase'); 