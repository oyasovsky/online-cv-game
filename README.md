# OlgaGPT - Interactive CV with RAG Assistant

This project is a futuristic personal CV website with an interactive RAG (Retrieval-Augmented Generation) assistant powered by OpenAI and ChromaDB.

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
   - Store them in ChromaDB for fast retrieval

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
3. **Vector Storage**: Embeddings are stored in ChromaDB for fast similarity search
4. **Query Processing**: User questions are embedded and matched against stored vectors
5. **Context Retrieval**: Top 5 most relevant chunks are retrieved
6. **Response Generation**: GPT-4 generates responses using retrieved context and Olga's personality

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
The system is designed to be easily adaptable to other vector stores like Pinecone or Supabase. Update the storage functions in `scripts/create-embeddings.js` and the query logic in `/pages/api/query.js`.

## 📊 Analytics & Insights

The system logs:
- User queries (anonymous)
- Retrieved document sources
- Confidence scores for responses
- Error rates and fallback usage

This data helps improve the knowledge base and response quality over time.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure ChromaDB is accessible (or switch to cloud vector store)
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

**"ChromaDB connection failed"**
- Ensure ChromaDB is running locally
- Check network connectivity
- Consider switching to cloud vector store

**"OpenAI API rate limit exceeded"**
- Reduce batch size in embedding script
- Add longer delays between requests
- Check your OpenAI usage limits

**"No relevant documents found"**
- Run `npm run create-embeddings` again
- Check that markdown files exist in `/data/olga_docs/`
- Verify API key is correct

### Getting Help
- Check the console logs for detailed error messages
- Ensure all dependencies are installed correctly
- Verify environment variables are set properly
