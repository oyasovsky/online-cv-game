# OlgaGPT - Interactive CV with RAG Assistant

This project is a  personal CV website with an interactive RAG (Retrieval-Augmented Generation) assistant powered by OpenAI and Firebase Vector Search.

Visit it [Here](https://online-cv-chat.web.app/) 

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

## 📊 Audit Logging & Analytics

OlgaGPT includes a comprehensive audit logging system that tracks all chat interactions for analytics and improvement purposes.

### 📈 Analytics Dashboard

Access the analytics dashboard at `/analytics` to view:

- **Overview Metrics:** Total sessions, questions, average session duration
- **Performance Data:** Response times, confidence scores, token usage
- **Popular Content:** Most-used knowledge sources and top questions
- **Time-based Filtering:** View data for last 7 days, 30 days, 90 days, or all time

### 🔒 Privacy & Security

- **Server-only Access:** Audit logs are only accessible from your server
- **No Personal Data:** IP addresses are logged but not displayed in analytics
- **Automatic Cleanup:** Optional cleanup of old logs (90+ days) via `auditLogger.cleanupOldLogs()`

### 📊 API Endpoints

**Get Analytics:**
```bash
GET /api/analytics
GET /api/analytics?startDate=2024-01-01&endDate=2024-01-31
GET /api/analytics?sessionId=session_123456
```

## 🚀 Deployment

### Firebase Vector Search Setup

This project uses Firebase Vector Search for storing and querying embeddings. Here's how to set it up:


## 📝 License

This project is for personal use. Please respect the personal nature of the content.

