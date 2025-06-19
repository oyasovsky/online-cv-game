# Firebase Vector Search Setup Guide

This guide will help you migrate from ChromaDB to Firebase Vector Search for your OlgaGPT project.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install firebase firebase-admin
npm uninstall chromadb
```

### 2. Set Up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database
4. Go to Project Settings > Service Accounts
5. Click "Generate new private key" and download the JSON file

### 3. Configure Environment Variables
Create a `.env.local` file with:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Configuration (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

### 4. Test Firebase Connection
```bash
npm run setup-firebase
```

### 5. Generate Embeddings
```bash
npm run create-embeddings
```

### 6. Start Development Server
```bash
npm run dev
```

## 🔧 Configuration Details

### Firebase Service Account
The service account JSON file contains:
- `project_id`: Your Firebase project ID
- `client_email`: Service account email
- `private_key`: Private key for authentication

### Firestore Security Rules
Set up appropriate security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /olga_knowledge_base/{document} {
      allow read: if true;  // Allow public read access
      allow write: if false; // Only allow writes from your server
    }
  }
}
```

### Collection Structure
The `olga_knowledge_base` collection contains documents with:
- `content`: The text chunk
- `source`: Source file name
- `metadata`: Additional metadata
- `embedding`: Vector embedding (1536 dimensions for text-embedding-3-small)
- `createdAt`: Timestamp

## 🎯 Benefits of Firebase Vector Search

### Production Ready
- Fully managed service
- Automatic scaling
- Built-in security
- Global distribution

### Cost Effective
- Pay only for what you use
- No infrastructure management
- Integrated with Firebase ecosystem

### Easy Integration
- Simple API
- Real-time updates
- Built-in authentication
- Excellent documentation

## 🔄 Migration from ChromaDB

### What Changed
1. **Storage**: ChromaDB → Firebase Firestore
2. **Search**: ChromaDB similarity search → Firebase vector search
3. **Dependencies**: `chromadb` → `firebase` + `firebase-admin`
4. **Configuration**: Local setup → Cloud-based setup

### What Stayed the Same
1. **Embedding Generation**: Still uses OpenAI's text-embedding-3-small
2. **Content Processing**: Same chunking and cleaning logic
3. **Response Generation**: Same GPT-3.5-turbo integration
4. **UI/UX**: No changes to the frontend

## 🚨 Important Notes

### Environment Variables
- Keep your Firebase credentials secure
- Never commit `.env.local` to version control
- Use different projects for development and production

### Performance
- Firebase Vector Search is optimized for production workloads
- Initial setup may take longer than local ChromaDB
- Query performance improves with usage

### Costs
- Firebase has a generous free tier
- Monitor usage in Firebase Console
- Set up billing alerts for production

## 🆘 Troubleshooting

### Common Issues
1. **"Firebase connection failed"**
   - Check environment variables
   - Verify service account credentials
   - Ensure Firestore is enabled

2. **"No documents found"**
   - Run `npm run create-embeddings`
   - Check collection exists in Firestore
   - Verify documents were created

3. **"Permission denied"**
   - Check Firestore security rules
   - Verify service account permissions
   - Ensure collection is accessible

### Getting Help
- Check Firebase Console for errors
- Review Firestore logs
- Test with `npm run setup-firebase`
- Consult Firebase documentation

## 🎉 Next Steps

After successful setup:
1. Test the application thoroughly
2. Deploy to production (Vercel recommended)
3. Monitor performance and costs
4. Consider enabling Firebase Analytics
5. Set up monitoring and alerts 