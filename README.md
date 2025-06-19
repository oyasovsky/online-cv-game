# OlgaGPT - Interactive CV with RAG Assistant

This project is a futuristic personal CV website with an interactive RAG (Retrieval-Augmented Generation) assistant powered by OpenAI and Firebase Vector Search.

## 🚀 Features

- **Interactive Chat Interface**: Ask OlgaGPT anything about her experience, leadership philosophy, and values
- **RAG-Powered Responses**: AI responses are grounded in Olga's actual documents and experiences
- **Beautiful UI**: Modern glass morphism design with parallax effects
- **Typewriter Effect**: Dynamic text animation for role descriptions
- **Sample Questions**: Pre-built questions to get started quickly

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- Firebase project with Firestore enabled

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd online-cv-game
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Add your OpenAI API key
   echo "OPENAI_API_KEY=sk-your-actual-api-key-here" > .env
   ```

3. **Create embeddings for RAG**:
   ```bash
   npm run create-embeddings
   ```
   This will:
   - Load markdown files from `/data/olga_docs/`
   - Chunk them into 300-500 token segments
   - Generate embeddings using OpenAI's text-embedding-3-small
   - Store them in Firebase Vector Search for fast retrieval

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Visit the application**:
   - Home page: `http://localhost:3000`
   - Game mode: `http://localhost:3000/game`

## 📁 Project Structure

```
online-cv-game/
├── data/olga_docs/          # Markdown files with Olga's content
│   ├── leadership_philosophy.md
│   ├── product_stories.md
│   └── personal_values.md
├── pages/
│   ├── index.js             # Home page with typewriter effect
│   ├── game.js              # Interactive chat interface
│   └── api/
│       ├── chat.js          # Legacy chat endpoint
│       └── query.js         # RAG-powered query endpoint
├── components/
│   ├── Button.jsx           # Reusable button component
│   ├── ChatBubble.jsx       # Chat message component
│   ├── ParallaxBackground.js # Background effects
│   └── TypewriterEffect.jsx # Animated text component
├── scripts/
│   └── create-embeddings.js # Embedding generation script
└── styles/
    └── globals.css          # Global styles and animations
```

## 🎯 How It Works

### RAG Pipeline
1. **Content Ingestion**: Markdown files are loaded and chunked into semantic segments
2. **Embedding Generation**: Each chunk is converted to a vector using OpenAI's embedding model
3. **Vector Storage**: Embeddings are stored in Firebase Vector Search for fast similarity search
4. **Query Processing**: User questions are embedded and matched against stored vectors
5. **Context Retrieval**: Top 5 most relevant chunks are retrieved
6. **Response Generation**: GPT-3.5-turbo generates responses using retrieved context and Olga's personality

### Personality Layer
OlgaGPT is configured with a detailed system prompt that captures:
- Direct but kind communication style
- People-first leadership philosophy
- Passion for GenAI and emerging technologies
- Emphasis on psychological safety and team growth
- Authentic and transparent interactions

## 🔧 Customization

### Adding New Content
1. Add markdown files to `/data/olga_docs/`
2. Run `npm run create-embeddings` to update the knowledge base
3. Restart the development server

### Modifying Personality
Edit the `OLGAGPT_SYSTEM_PROMPT` in `/pages/api/query.js` to adjust the AI's personality and response style.

### Changing Vector Store
The system is designed to be easily adaptable to other vector stores. Currently uses Firebase Vector Search, but can be updated to use Pinecone, Supabase, or other vector databases by updating the storage functions in `scripts/create-embeddings.js` and the query logic in `/pages/api/query.js`.

## 📊 Analytics & Insights

The system logs:
- User queries (anonymous)
- Retrieved document sources
- Confidence scores for responses
- Error rates and fallback usage

This data helps improve the knowledge base and response quality over time.

## 🚀 Deployment

### Firebase Vector Search Setup

This project uses Firebase Vector Search for storing and querying embeddings. Here's how to set it up:

#### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database
4. Set up security rules for your collection

#### 2. Get Firebase Credentials
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Add the credentials to your environment variables

#### 3. Environment Variables
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

#### 4. Initialize Vector Search
1. Run `npm run create-embeddings` to generate and store embeddings
2. The script will create a collection called `olga_knowledge_base` in Firestore
3. Each document contains the text content, metadata, and embedding vector

#### 5. Firestore Security Rules
Set up appropriate security rules for your collection:

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

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure Firebase Vector Search is properly configured
- Set up environment variables
- Run `npm run build` and `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is for personal use. Please respect the personal nature of the content.

## 🆘 Troubleshooting

### Common Issues

**"Firebase connection failed"**
- Ensure Firebase project is properly configured
- Check environment variables are set correctly
- Verify service account credentials
- Ensure Firestore is enabled in your Firebase project

**"OpenAI API rate limit exceeded"**
- Reduce batch size in embedding script
- Add longer delays between requests
- Check your OpenAI usage limits

**"No relevant documents found"**
- Run `npm run create-embeddings` again
- Check that markdown files exist in `/data/olga_docs/`
- Verify API key is correct
- Ensure Firebase collection contains documents

### Getting Help
- Check the console logs for detailed error messages
- Ensure all dependencies are installed correctly
- Verify environment variables are set properly
- Run `npm run setup-firebase` to test Firebase connection
