#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking private key format...\n');

const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!privateKey) {
  console.log('❌ FIREBASE_PRIVATE_KEY not found in .env.local');
  process.exit(1);
}

console.log('📏 Private key length:', privateKey.length);
console.log('🔤 Private key starts with:', privateKey.substring(0, 50));
console.log('🔤 Private key ends with:', privateKey.substring(privateKey.length - 50));

// Check if it has proper PEM format
const hasBeginHeader = privateKey.includes('-----BEGIN PRIVATE KEY-----');
const hasEndHeader = privateKey.includes('-----END PRIVATE KEY-----');
const hasNewlines = privateKey.includes('\n');

console.log('\n🔍 PEM Format Check:');
console.log('✅ Has BEGIN header:', hasBeginHeader);
console.log('✅ Has END header:', hasEndHeader);
console.log('✅ Has newlines:', hasNewlines);

if (hasBeginHeader && hasEndHeader && hasNewlines) {
  console.log('\n✅ Private key appears to be in correct PEM format!');
} else {
  console.log('\n❌ Private key is not in correct PEM format.');
  console.log('\n📋 To fix this:');
  console.log('1. Open your Firebase service account JSON file');
  console.log('2. Copy the "private_key" value exactly as it appears');
  console.log('3. Replace the FIREBASE_PRIVATE_KEY in .env.local');
  console.log('4. Make sure it looks like this:');
  console.log('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"');
} 