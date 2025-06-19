#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const app = initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
});

const db = getFirestore(app);

console.log('🔧 Setting up Firestore security rules for audit collection...');

const auditRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Knowledge base collection - allow public read, server-only write
    match /olga_knowledge_base/{document} {
      allow read: if true;
      allow write: if false; // Only allow writes from your server
    }
    
    // Audit logs collection - server-only access
    match /chat_audit_logs/{document} {
      allow read, write: if false; // Only allow access from your server
    }
  }
}
`;

async function setupAuditRules() {
  try {
    console.log('📝 Current Firestore rules:');
    console.log(auditRules);
    
    console.log('\n⚠️  IMPORTANT: You need to manually update your Firestore security rules.');
    console.log('📋 Copy the rules above and paste them in your Firebase Console:');
    console.log('   https://console.firebase.google.com/project/YOUR_PROJECT/firestore/rules');
    
    console.log('\n🔒 These rules ensure:');
    console.log('   ✅ Public read access to knowledge base (for RAG queries)');
    console.log('   ✅ Server-only write access to knowledge base (for embeddings)');
    console.log('   ✅ Server-only access to audit logs (for privacy)');
    
    console.log('\n🚀 After updating the rules, your audit logging will be secure!');
    
  } catch (error) {
    console.error('❌ Error setting up audit rules:', error);
    process.exit(1);
  }
}

setupAuditRules(); 