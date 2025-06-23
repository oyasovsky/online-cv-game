import OpenAI from 'openai';
import { adminDb } from '../../lib/firebase-admin';
import { getOpenAIKey } from '../../lib/env-helper';
const auditLogger = require('../../lib/firebase-audit');

// Timeline data for career path questions
const timelineData = [
  {
    "id": 1,
    "year": "2024–Present",
    "title": "R&D Group Manager – GenAI SDLC Tools",
    "company": "AT&T Israel",
    "description": "Spearheading AT&T Israel's GenAI initiative to build internal productivity tools that accelerate the Software Development Lifecycle (SDLC).",
    "impact": "Launched GenAI-powered solutions like JumpStart and AskDev, improving developer productivity through code generation, repo insights, and automated support ticket analysis. Enabled collaboration between AI models and developers through custom LLM pipelines, RAG architecture, and graph-driven knowledge engines.",
    "lessons": "The future of software development is automated—but human-centered. Leading this frontier requires technical depth, vision, and relentless iteration.",
    "category": "innovation"
  },
  {
    "id": 2,
    "year": "2021–2024",
    "title": "R&D Group Manager – AT&T Field Operations",
    "company": "AT&T",
    "description": "Led multiple Scrum teams responsible for developing AT&T's mission-critical dispatching and technician management systems.",
    "impact": "Modernized the legacy tech stack, improved system resilience and scale, and enabled real-time technician dispatch for millions of users. Introduced Agile/SAFe practices across 5–7 teams, significantly improving delivery predictability and operational efficiency.",
    "lessons": "Managing complex enterprise-scale field systems taught me how to lead across reliability, performance, and user impact—at massive scale.",
    "category": "leadership"
  },
  {
    "id": 3,
    "year": "2016–2020",
    "title": "Software Team Lead",
    "company": "AT&T",
    "description": "Led 2–3 Scrum teams (~6 people each), set roadmaps, managed technical planning, and enforced best practices across testing and CI/CD.",
    "impact": "Built robust dev pipelines, streamlined delivery, and mentored engineers through complex architecture upgrades.",
    "lessons": "Leadership is about clarity, structure, and empowering others. When your team has autonomy and trust, results follow.",
    "category": "leadership"
  },
  {
    "id": 4,
    "year": "2011–2016",
    "title": "Senior FullStack Developer",
    "company": "AT&T",
    "description": "Developed and maintained full-stack solutions for IoT platforms and 4G network management systems.",
    "impact": "Delivered customer-facing dashboards, billing systems, and management tools using Angular, Node.js, and Java. Participated in international demos (CES, etc.).",
    "lessons": "Being a bridge between frontend polish and backend power shaped my product intuition and technical versatility.",
    "category": "technical"
  },
  {
    "id": 5,
    "year": "2008–2012",
    "title": "Java/J2EE Developer",
    "company": "Amdocs",
    "description": "Built enterprise web applications using Java, web services, and Hibernate for global telecom clients.",
    "impact": "Improved code maintainability and performance in large-scale deployments. Contributed to best-practice guidelines.",
    "lessons": "Discipline, modularity, and documentation were core to enterprise dev culture—and became core to me.",
    "category": "technical"
  },
  {
    "id": 6,
    "year": "2004–2005",
    "title": "Technical Support Engineer",
    "company": "eTeacher Ltd.",
    "description": "Supported a live desktop-sharing classroom platform with international users.",
    "impact": "Resolved high-pressure issues in real time, enhancing customer satisfaction and feeding product improvements.",
    "lessons": "Support builds your empathy muscles. It's where user pain turns into product insight.",
    "category": "support"
  }
];

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
- When asked about SpaceIL - focus on the technical and innovative sides of the volunteering project. I was NOT part of the team that sent Beresheet to the moon. I initiated and developed a volunteers management system via my tech skills. Describe the solution of the system in depth and my part as being the Creator of this vision. Then discuss tech stack and being prod grade since 2021 with hundreds of users.

**Formatting Guidelines:**
- **MANDATORY**: Always use markdown link syntax for external references: [text](url)
- **MANDATORY**: When mentioning SpaceIL, ALWAYS use: [SpaceIL](https://www.spaceil.com/)
- **MANDATORY**: When mentioning SpaceIL, ALWAYS emphasize this was a volunteering pro-bono project initiated by me
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

    // Generate or get session ID for audit logging (moved to beginning)
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

    // Check if this is a career path/timeline question
    const careerKeywords = [
      'career path', 'career progression', 'career journey', 'career timeline',
      'work history', 'job history', 'professional background', 'career background',
      'career development', 'career growth', 'career advancement', 'career trajectory',
      'work experience', 'professional experience', 'career progression',
      'how did you get here', 'what was your path', 'career story',
      'timeline', 'progression', 'journey', 'path', 'background'
    ];
    
    const isCareerQuestion = careerKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isCareerQuestion) {
      const timelineResponse = `My career has been a dynamic journey of growth—from hands-on software development to leading innovation at scale. Each step has deepened my expertise and expanded my impact. Here's a look at the path that shaped me.`;

      return res.status(200).json({
        reply: timelineResponse,
        timeline: timelineData,
        confidence: 95,
        sources: ['olga_cv'],
        sessionId: currentSessionId
      });
    }

    // Check if this is an innovation-related question
    const innovationKeywords = [
      'innovation', 'innovative', 'innovate', 'experiment', 'experimentation', 
      // Hands-on technology and up-to-date skills
      'hands-on', 'hands on', 'coding', 'programming', 'development',
      'up to date', 'up-to-date', 'current technology', 'latest technology',
      'modern tech', 'modern technology', 'technical skills', 'coding skills',
      'side project', 'side projects', 'personal project', 'personal projects',
      'build', 'building', 'create', 'creating', 'develop', 'developing'
    ];
    
    // Specific question IDs that should trigger the image
    const innovationTriggerQuestionIds = [
      'how-do-you-stay-current-with-technology',
      'how-do-you-stay-technical-without-becoming-the-bottleneck',
      'how-do-you-balance-innovation-with-delivery'
    ];
    
    // Check if this is an innovation question based on keywords OR specific question IDs
    const isInnovationQuestion = innovationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    ) || innovationTriggerQuestionIds.some(questionId => 
      message.toLowerCase().includes(questionId.toLowerCase())
    );

    // Check if this is a meetup/speaking question
    const meetupKeywords = [
      'meetup', 'meetups', 'convention', 'conventions', 'speaking', 'speak',
      'presentation', 'presentations', 'talk', 'talks', 'conference', 'conferences',
      'public speaking', 'community', 'tech community', 'speaking engagement'
    ];
    
    const meetupTriggerQuestionIds = [
      'do-you-speak-at-meetups-and-conventions'
    ];
    
    const isMeetupQuestion = meetupKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    ) || meetupTriggerQuestionIds.some(questionId => 
      message.toLowerCase().includes(questionId.toLowerCase())
    );

    // Check if this is a SpaceIL-related question
    const spaceilKeywords = [
      'spaceil', 'space il', 'beresheet', 'moon', 'lunar', 'space mission',
      'volunteer', 'volunteering', 'volunteer management', 'volunteer system',
      'israel space', 'israeli space', 'space israel'
    ];
    
    const spaceilTriggerQuestionIds = [
      'tell-me-about-volunteering'
    ];
    
    const isSpaceilQuestion = spaceilKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    ) || spaceilTriggerQuestionIds.some(questionId => 
      message.toLowerCase().includes(questionId.toLowerCase())
    );

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


    // Post-process response to ensure links are included
    const ensureLinks = (text) => {
      let processed = text;
            
      processed = processed.replace(
        /\[([^\]]+)\]\(https:\/\/My LinkedIn\.com\/([^)]+)\)/g,
        '[$1](https://linkedin.com/$2)'
      );
      
      
      return processed;
    };

    const processedReply = ensureLinks(reply);

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
      sessionId: currentSessionId,
      ...(isInnovationQuestion && { image: '/coding-project.jpg' }),
      ...(isMeetupQuestion && { 
        carousel: {
          images: [
            {
              src: '/convention1.jpg',
              subtitle: '🎤 Speaking at AI-Dev 2024 convention, AT&T being the sponsor.'
            },
            {
              src: '/convention2.jpg',
              subtitle: '🌟 Running the AT&T SDLC GenAI productivy solutions booth at AI-Dev 2024'
            },
            {
              src: '/convention3.jpg',
              subtitle: '🌟 Speaking in Girl\'s Week 2023-24'
            },
            {
              src: '/convention4.jpg',
              subtitle: '💡 Sharing innovation strategies and AI implementation for the TDP Junior program meetup'
            }
          ]
        }
      }),
      ...(isSpaceilQuestion && { image: '/spaceil-demo.jpg' })
    });

  } catch (error) {
    console.error('❌ Error processing query:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
} 