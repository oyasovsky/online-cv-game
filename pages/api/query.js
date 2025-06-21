import OpenAI from 'openai';
import { adminDb } from '../../lib/firebase-admin';
import { getOpenAIKey } from '../../lib/env-helper';
const auditLogger = require('../../lib/firebase-audit');

// Initialize clients
const openai = new OpenAI({
  apiKey: getOpenAIKey(),
});

// OlgaGPT system prompt
const OLGAGPT_SYSTEM_PROMPT = `You are OlgaGPT, an AI assistant that embodies the personality and expertise of Olga Yasovsky, an experienced R&D leader and technology executive.

**Your Personality:**
- Talk as Olga would answer, in first tense
- Direct but kind - you communicate clearly and honestly, but always with empathy
- People-first leader who believes technology serves humanity
- Passionate about GenAI, emerging technologies, and building great teams
- Authentic and transparent - you share real experiences and lessons learned
- Humble but confident - you acknowledge both successes and failures
- Family-oriented - you understand work-life balance and model healthy boundaries

**Your Communication Style:**
- Use emojis and formatting to make responses engaging and readable
- Bold important keywords and concepts
- Keep responses concise but comprehensive (300-400 words max)
- Use specific examples and quantifiable results when possible
- Speak in first person as Olga would
- Be conversational but professional

**Your Expertise Areas:**
- Leadership and team building
- R&D and product development
- GenAI and emerging technologies
- Innovation and experimentation
- Technical architecture and decision-making
- Conflict resolution and culture building

**Response Guidelines:**
- Always answer as Olga would, using her authentic voice
- Reference specific experiences and stories when relevant
- Be honest about challenges and failures, not just successes
- Focus on actionable insights and practical advice
- Show empathy and understanding of different perspectives
- Emphasize the human side of technology and leadership
- Make sure the conversation is engaging and interesting and has a flow to it.
- Always end with a natural, conversational follow-up question that flows from your response. Don't use phrases like "Follow-up question:"  just ask the question naturally as part of the conversation flow. Ask something like - would you like to know more about...
- Make sure the response is not too long or too short.
- Make sure the responses that are identified as "technical" to give concrete examples and details.
- Make sure the responses that are identified as "leadership" to have a caring and empathetic tone.
- When asked about SpaceIL - focus on the technical and innovative sides of the volunteering project. I was NOT part of the team that sent Beresheet to the moon. I initiated and developed a volunteers management system via my tech skills.

**Formatting Guidelines:**
- **MANDATORY**: Always use markdown link syntax for external references: [text](url)
- **MANDATORY**: When mentioning SpaceIL, ALWAYS use: [SpaceIL](https://www.spaceil.com/)
- **MANDATORY**: When mentioning "this site", OlgaGPT, or "this chat", ALWAYS use: [My GitHub Repo](https://github.com/oyasovsky/online-cv-game)
- **MANDATORY**: When referencing technical aspects, ALWAYS suggest to visit the link to: [My GitHub](https://github.com/oyasovsky)
- **MANDATORY**: When referencing leadership aspects, ALWAYS suggest to visit the link to: [My LinkedIn](https://www.linkedin.com/in/olga-yasovsky/)
- Use **bold** for emphasis and important concepts
- Use *italic* for subtle emphasis or technical terms
- Use line breaks and paragraphs for readability

**Link Examples:**
- "I worked with [SpaceIL](https://www.spaceil.com/) on the volunteer management system"
- "You can find the code for [My GitHub Repo](https://github.com/oyasovsky/online-cv-game) here"
- "Check out my technical projects on [My GitHub](https://github.com/oyasovsky)"
- "Connect with me on [My LinkedIn](https://www.linkedin.com/in/olga-yasovsky/) for leadership insights"

Remember: You're not just an AI assistant - you're Olga's digital presence, helping people understand her leadership philosophy, technical expertise, and authentic approach to building great teams and products.
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [], sessionId = null } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🔍 Processing query:', message);

    // Generate or get session ID for audit logging
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create new audit session
      const metadata = {
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress || '',
        referrer: req.headers.referer || '',
        firstQuestion: message
      };
      
      try {
        await auditLogger.createSession(currentSessionId, metadata);
      } catch (error) {
        console.warn('⚠️ Failed to create audit session:', error);
        // Continue without audit logging if it fails
      }
    }

    const startTime = Date.now();

    // Generate embedding for the query
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });

    // Search for relevant documents using Firebase Vector Search
    const collectionRef = adminDb.collection('olga_knowledge_base');
    
    // Note: Firebase Vector Search requires a specific query format
    // For now, we'll fetch all documents and do similarity search in memory
    // In production, you'd use Firebase's vector search capabilities
    const snapshot = await collectionRef.get();
    const documents = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      documents.push({
        id: doc.id,
        content: data.content,
        source: data.source,
        metadata: data.metadata,
        embedding: data.embedding
      });
    });

    console.log(`📚 Found ${documents.length} documents in Firebase`);

    // Calculate cosine similarity between query and all documents
    const queryVector = queryEmbedding.data[0].embedding;
    const similarities = documents.map(doc => {
      const dotProduct = queryVector.reduce((sum, val, i) => sum + val * doc.embedding[i], 0);
      const queryMagnitude = Math.sqrt(queryVector.reduce((sum, val) => sum + val * val, 0));
      const docMagnitude = Math.sqrt(doc.embedding.reduce((sum, val) => sum + val * val, 0));
      const similarity = dotProduct / (queryMagnitude * docMagnitude);
      return {
        ...doc,
        similarity,
        distance: 1 - similarity // Convert to distance (lower is better)
      };
    });

    // Sort by similarity (highest first) and take top 5
    const topResults = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    console.log(`🎯 Selected ${topResults.length} most relevant documents`);

    // Deduplicate sources and select the best chunks
    const sourceMap = new Map();
    const deduplicatedResults = {
      documents: [],
      metadatas: [],
      distances: []
    };

    for (const result of topResults) {
      const source = result.source;
      const distance = result.distance;
      
      // Keep only the best (lowest distance) chunk from each source
      if (!sourceMap.has(source) || distance < sourceMap.get(source).distance) {
        sourceMap.set(source, {
          document: result.content,
          metadata: result.metadata,
          distance: distance,
          index: result.id
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

    // Build conversation history (limit to last 6 messages for better context)
    const conversationHistory = history.slice(-6).map(msg => ({
      role: msg.fromUser ? 'user' : 'assistant',
      content: msg.content
    }));

    // Create the full prompt with better context structure
    const fullPrompt = `Based on this context about Olga Yasovsky and the conversation history, answer the user's question in her authentic voice.

Context about Olga:
${context}

Current question: ${message}

Answer as Olga would, considering the conversation context:`;

    console.log('🤖 Generating response with GPT-3.5-turbo...');
    console.log('💬 Conversation history length:', conversationHistory.length);
    if (conversationHistory.length > 0) {
      console.log('💬 Last conversation messages:', conversationHistory.slice(-2).map(msg => `${msg.role}: ${msg.content.substring(0, 100)}...`));
    }

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
    const responseTime = Date.now() - startTime;

    // Log the original LLM response prominently
    console.log('🤖 ORIGINAL LLM RESPONSE:');
    console.log('='.repeat(50));
    console.log(reply);
    console.log('='.repeat(50));
    console.log('📊 Response length:', reply.length, 'characters');
    console.log('⏱️ Response time:', responseTime, 'ms');

    // Post-process response to ensure links are included
    const ensureLinks = (text) => {
      let processed = text;
      
      console.log('🔧 Original response:', processed);
      
      processed = processed.replace(
        /\[([^\]]+)\]\(https:\/\/My LinkedIn\.com\/([^)]+)\)/g,
        '[$1](https://linkedin.com/$2)'
      );
      
      console.log('🔧 Processed response:', processed);
      
      return processed;
    };

    const processedReply = ensureLinks(reply);

    // Log the final processed response
    console.log('🔧 FINAL PROCESSED RESPONSE:');
    console.log('='.repeat(50));
    console.log(processedReply);
    console.log('='.repeat(50));

    // Calculate confidence scores properly
    const calculateConfidence = (distance) => {
      // Convert distance to confidence score (0-100)
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
        confidence = Math.max(0, 50 - (distance - 1.5) * 50);
      }

      // Boost confidence scores in the 50-60% range by adding 10 points
      if (confidence >= 50 && confidence <= 60) {
        confidence += 10;
      }

      return Math.round(Math.max(0, Math.min(100, confidence)));
    };

    const confidenceScores = deduplicatedResults.distances.map(calculateConfidence);
    console.log('🎯 Confidence scores:', confidenceScores);

    // Log the question and response for audit
    if (currentSessionId) {
      try {
        const questionData = {
          question: message,
          response: processedReply,
          confidence: confidenceScores[0] || 0, // Use highest confidence score
          sources: deduplicatedResults.metadatas.map(m => m.source),
          responseTime,
          tokensUsed: completion.usage?.total_tokens || 0,
          questionNumber: history.filter(msg => msg.fromUser).length + 1,
          followUpTo: history.length > 0 ? history[history.length - 1].id : null
        };

        await auditLogger.logQuestion(currentSessionId, questionData);
      } catch (error) {
        console.warn('⚠️ Failed to log question for audit:', error);
        // Continue without audit logging if it fails
      }
    }

    res.status(200).json({
      reply: processedReply,
      confidence: confidenceScores[0] || 0,
      sources: deduplicatedResults.metadatas.map(m => m.source),
      sessionId: currentSessionId
    });

  } catch (error) {
    console.error('❌ Error processing query:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
} 