#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Debugging Environment Variables...\n');

console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY?.length || 'undefined');
console.log('FIREBASE_PRIVATE_KEY starts with:', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50) || 'undefined');

console.log('\n🔍 Checking if variables are strings:');
console.log('FIREBASE_PROJECT_ID type:', typeof process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL type:', typeof process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY type:', typeof process.env.FIREBASE_PRIVATE_KEY);

console.log('\n🔍 Checking for empty or undefined values:');
console.log('FIREBASE_PROJECT_ID empty?', !process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL empty?', !process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY empty?', !process.env.FIREBASE_PRIVATE_KEY); 