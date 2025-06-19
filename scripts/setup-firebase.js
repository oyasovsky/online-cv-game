require('dotenv').config({ path: '.env.local' });
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function setupFirebase() {
  try {
    console.log('🚀 Setting up Firebase Vector Search...');
    
    // Test connection
    const testDoc = db.collection('test').doc('connection-test');
    await testDoc.set({ timestamp: new Date(), message: 'Firebase connection successful' });
    await testDoc.delete();
    
    console.log('✅ Firebase connection successful!');
    console.log('📝 Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('🔑 Service Account Email:', process.env.FIREBASE_CLIENT_EMAIL);
    
    // Create the knowledge base collection if it doesn't exist
    const collectionRef = db.collection('olga_knowledge_base');
    const snapshot = await collectionRef.limit(1).get();
    
    if (snapshot.empty) {
      console.log('📚 Creating olga_knowledge_base collection...');
      // Add a placeholder document to create the collection
      await collectionRef.add({
        placeholder: true,
        message: 'Collection created for OlgaGPT knowledge base',
        createdAt: new Date()
      });
      console.log('✅ Collection created successfully!');
    } else {
      console.log('📚 Collection already exists');
    }
    
    console.log('\n🎉 Firebase setup complete!');
    console.log('📋 Next steps:');
    console.log('1. Run "npm run create-embeddings" to populate the knowledge base');
    console.log('2. Start the development server with "npm run dev"');
    console.log('3. Test the application at http://localhost:3000/olgagpt');
    
  } catch (error) {
    console.error('❌ Firebase setup failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your environment variables are set correctly');
    console.log('2. Verify your Firebase service account credentials');
    console.log('3. Ensure Firestore is enabled in your Firebase project');
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupFirebase();
} 