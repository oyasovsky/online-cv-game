#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Environment Setup Helper');
console.log('=====================================\n');

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('Please backup your current .env.local file and run this script again.\n');
  process.exit(1);
}

console.log('📝 Creating .env.local template...\n');

const envTemplate = `# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Firebase Configuration (Client-side)
# Get these from your Firebase project settings > General > Your apps > Web app config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Firebase Admin Configuration (Server-side)
# Get these from your Firebase project settings > Service accounts > Generate new private key
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour_private_key_here_with_newlines_as_\\\\n\\n-----END PRIVATE KEY-----\\n"
`;

fs.writeFileSync(envPath, envTemplate);

console.log('✅ Created .env.local template!');
console.log('\n📋 Next steps:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Create a new project or select existing one');
console.log('3. Enable Firestore Database');
console.log('4. Get your web app config from Project Settings > General > Your apps');
console.log('5. Get your service account key from Project Settings > Service accounts');
console.log('6. Replace the placeholder values in .env.local with your actual credentials');
console.log('\n🔧 After updating .env.local, run:');
console.log('   npm run setup-firebase');
console.log('   npm run create-embeddings');
console.log('   npm run dev'); 