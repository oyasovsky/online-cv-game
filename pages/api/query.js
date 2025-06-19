import { ChromaClient } from 'chromadb';
import OpenAI from 'openai';

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chromaClient = new ChromaClient();

// OlgaGPT system prompt
const OLGAGPT_SYSTEM_PROMPT = `You are OlgaGPT, a confident R&D leader speaking to potential recruiters and hiring managers. Keep responses concise, impactful, and professional while maintaining authenticity.

**CORE PERSONALITY:**
- Direct, results-focused communication
- People-first leadership with proven outcomes
- Passion for GenAI and emerging technologies
- Authentic, transparent, and data-driven

**RESPONSE GUIDELINES:**
- Keep answers **concise** (2-3 paragraphs max)
- Lead with **key achievements** and **quantifiable results**
- Use **bold text** for important metrics, technologies, and outcomes
- Include **relevant emojis** sparingly for personality (🎯 🚀 💡 🤝)
- Structure with clear **bullet points** for key points
- Focus on **business impact** and **leadership outcomes**
- Be **specific** with examples and numbers when possible

**FORMATTING:**
- Use **bold** for key achievements, metrics, and technologies
- Break up text with bullet points for scannability
- Keep paragraphs short (2-3 sentences)
- Use line breaks to separate thoughts

**TONE:**
- Professional but approachable
- Confident without being boastful
- Focus on value delivered and team success
- Show both technical expertise and leadership skills

Remember: You're speaking to recruiters who want to quickly understand Olga's value proposition, leadership style, and technical capabilities.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🔍 Processing query:', message);

    // Get ChromaDB collection
    const collection = await chromaClient.getCollection({
      name: 'olga_knowledge_base'
    });

    // Generate embedding for the query
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });

    // Search for relevant documents (increased from 3 to 5 for better diversity)
    const searchResults = await collection.query({
      queryEmbeddings: [queryEmbedding.data[0].embedding],
      nResults: 5, // Increased from 3 to 5
    });

    console.log(`📚 Found ${searchResults.documents[0].length} relevant documents`);

    // Deduplicate sources and select the best chunks
    const sourceMap = new Map();
    const deduplicatedResults = {
      documents: [],
      metadatas: [],
      distances: []
    };

    for (let i = 0; i < searchResults.documents[0].length; i++) {
      const source = searchResults.metadatas[0][i].source;
      const distance = searchResults.distances[0][i];
      
      // Keep only the best (lowest distance) chunk from each source
      if (!sourceMap.has(source) || distance < sourceMap.get(source).distance) {
        sourceMap.set(source, {
          document: searchResults.documents[0][i],
          metadata: searchResults.metadatas[0][i],
          distance: distance,
          index: i
        });
      }
    }

    // Convert back to arrays, sorted by distance (best first)
    const sortedResults = Array.from(sourceMap.values())
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // Take top 3 unique sources

    deduplicatedResults.documents = sortedResults.map(r => r.document);
    deduplicatedResults.metadatas = sortedResults.map(r => r.metadata);
    deduplicatedResults.distances = sortedResults.map(r => r.distance);

    console.log(`🎯 Selected ${deduplicatedResults.documents.length} unique sources after deduplication`);

    // Build context from search results (truncated for speed)
    const context = deduplicatedResults.documents
      .map((doc, index) => `[Source ${index + 1}]: ${doc.substring(0, 500)}...`) // Truncate each source
      .join('\n\n');

    // Build conversation history (limit to last 3 messages for speed)
    const conversationHistory = history.slice(-3).map(msg => ({
      role: msg.fromUser ? 'user' : 'assistant',
      content: msg.content
    }));

    // Create the full prompt (simplified)
    const fullPrompt = `Based on this context about Olga Yasovsky, answer the user's question in her authentic voice:

Context:
${context}

Question: ${message}

Answer as Olga would:`;

    console.log('🤖 Generating response with GPT-3.5-turbo...');

    // Generate response using GPT-3.5-turbo (much faster than GPT-4)
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Changed from gpt-4 to gpt-3.5-turbo
      messages: [
        { role: 'system', content: OLGAGPT_SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: fullPrompt }
      ],
      max_tokens: 300, // Reduced from 500 for more concise responses
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    console.log('💬 Query processed successfully');
    console.log('📊 Context sources:', deduplicatedResults.metadatas.map(m => m.source));
    console.log('⏱️ Response length:', reply.length, 'characters');

    // Calculate confidence scores properly
    const calculateConfidence = (distance) => {
      // ChromaDB uses cosine distance (0 = perfect match, 2 = completely opposite)
      // Improved confidence calculation that's more generous for semantic matches
      // Distance 0.0-0.5: Excellent match (85-100%)
      // Distance 0.5-1.0: Good match (70-85%)
      // Distance 1.0-1.5: Fair match (50-70%)
      // Distance 1.5-2.0: Poor match (0-50%)
      
      let confidence;
      if (distance <= 0.5) {
        // Excellent match: 85-100%
        confidence = 85 + (0.5 - distance) * 30;
      } else if (distance <= 1.0) {
        // Good match: 70-85%
        confidence = 70 + (1.0 - distance) * 30;
      } else if (distance <= 1.5) {
        // Fair match: 50-70%
        confidence = 50 + (1.5 - distance) * 40;
      } else {
        // Poor match: 0-50%
        confidence = Math.max(0, 50 - (distance - 1.5) * 100);
      }
      
      // Boost scores in the 50-60% range by adding 10 points
      if (confidence >= 50 && confidence <= 60) {
        confidence += 10;
      }
      
      return Math.round(confidence); // Return as percentage (0-100)
    };

    const confidenceScores = deduplicatedResults.distances.map(calculateConfidence);

    console.log('🔍 Distances:', deduplicatedResults.distances);
    console.log('🎯 Confidence scores:', confidenceScores);

    // Return response
    res.status(200).json({ 
      reply,
      sources: deduplicatedResults.metadatas.map(m => m.source),
      confidence: confidenceScores
    });

  } catch (error) {
    console.error('❌ Error in RAG query:', error);
    
    // Fallback response if RAG fails
    const fallbackResponse = "I'm having trouble accessing my knowledge base right now, but I'd be happy to chat about my experience as an R&D leader, team management, or any other topics you're interested in. What would you like to know?";
    
    res.status(200).json({ 
      reply: fallbackResponse,
      sources: [],
      confidence: []
    });
  }
} 