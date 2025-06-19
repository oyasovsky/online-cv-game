require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ChromaClient } = require('chromadb');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize ChromaDB client
const chromaClient = new ChromaClient();

// Function to chunk text into 300-500 token segments with better semantic boundaries
function chunkText(text, maxTokens = 250) {
  // Split by headers first to preserve semantic structure
  const sections = text.split(/(?=^##\s+)/gm);
  const chunks = [];
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    // Split sections by subsections (###) for even more granular chunks
    const subsections = section.split(/(?=^###\s+)/gm);
    
    for (const subsection of subsections) {
      if (!subsection.trim()) continue;
      
      const words = subsection.split(/\s+/);
      let currentChunk = [];
      let currentTokenCount = 0;
      let sectionHeader = '';

      // Extract section header if present
      const headerMatch = subsection.match(/^(?:##|###)\s+(.+)$/m);
      if (headerMatch) {
        sectionHeader = headerMatch[1];
      }

      for (const word of words) {
        // Rough estimation: 1 word ≈ 1.3 tokens
        const wordTokens = Math.ceil(word.length / 4);
        
        if (currentTokenCount + wordTokens > maxTokens && currentChunk.length > 0) {
          const chunkText = currentChunk.join(' ');
          if (chunkText.trim()) {
            // Add section header to chunk for better context
            const finalChunk = sectionHeader ? `${sectionHeader}: ${chunkText}` : chunkText;
            chunks.push(finalChunk);
          }
          currentChunk = [word];
          currentTokenCount = wordTokens;
        } else {
          currentChunk.push(word);
          currentTokenCount += wordTokens;
        }
      }

      if (currentChunk.length > 0) {
        const chunkText = currentChunk.join(' ');
        if (chunkText.trim()) {
          // Add section header to chunk for better context
          const finalChunk = sectionHeader ? `${sectionHeader}: ${chunkText}` : chunkText;
          chunks.push(finalChunk);
        }
      }
    }
  }

  return chunks;
}

// Function to load and process markdown files
async function loadMarkdownFiles() {
  const docsDir = path.join(__dirname, '../data/olga_docs');
  const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.md'));
  
  const documents = [];
  
  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Remove markdown formatting for cleaner text while preserving important structure
    const cleanContent = content
      .replace(/^#\s+/gm, '') // Remove main title
      .replace(/^##\s+/gm, 'SECTION: ') // Convert section headers to readable format
      .replace(/^###\s+/gm, 'TOPIC: ') // Convert subsection headers to readable format
      .replace(/\*\*(.*?)\*\*/g, 'IMPORTANT: $1') // Convert bold to emphasis
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove code blocks
      .replace(/\n\s*\n/g, '\n') // Remove extra newlines
      .replace(/- /g, '• ') // Convert dashes to bullets for better readability
      .replace(/\*\*(.*?)\*\*/g, 'KEY: $1') // Convert bold to KEY for emphasis
      .replace(/\*\*(.*?)\*\*/g, 'KEY: $1') // Convert bold to KEY for emphasis
      .trim();
    
    const chunks = chunkText(cleanContent);
    
    chunks.forEach((chunk, index) => {
      documents.push({
        id: `${file}-${index}`,
        content: chunk,
        metadata: {
          source: file,
          chunkIndex: index,
          totalChunks: chunks.length
        }
      });
    });
  }
  
  return documents;
}

// Function to generate embeddings
async function generateEmbeddings(texts) {
  console.log('Generating embeddings for', texts.length, 'chunks...');
  
  const embeddings = [];
  const batchSize = 10; // Process in batches to avoid rate limits
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
      });
      
      embeddings.push(...response.data.map(item => item.embedding));
      
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
  
  return embeddings;
}

// Function to store in ChromaDB
async function storeInChromaDB(documents, embeddings) {
  console.log('Storing documents in ChromaDB...');
  
  try {
    // Try to get existing collection or create new one
    let collection;
    try {
      collection = await chromaClient.getCollection({
        name: 'olga_knowledge_base'
      });
      console.log('Found existing collection, clearing it...');
      await collection.delete();
    } catch (error) {
      console.log('Creating new collection...');
      collection = await chromaClient.createCollection({
        name: 'olga_knowledge_base',
        metadata: {
          description: 'Olga Yasovsky\'s knowledge base for RAG assistant'
        }
      });
    }
    
    // Prepare data for ChromaDB
    const ids = documents.map(doc => doc.id);
    const texts = documents.map(doc => doc.content);
    const metadatas = documents.map(doc => doc.metadata);
    
    // Add documents to collection
    await collection.add({
      ids: ids,
      embeddings: embeddings,
      documents: texts,
      metadatas: metadatas
    });
    
    console.log(`Successfully stored ${documents.length} documents in ChromaDB`);
    
    // Get collection info
    const count = await collection.count();
    console.log(`Collection now contains ${count} documents`);
    
  } catch (error) {
    console.error('Error storing in ChromaDB:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting embedding creation process...');
    
    // Load markdown files
    console.log('📚 Loading markdown files...');
    const documents = await loadMarkdownFiles();
    console.log(`Loaded ${documents.length} text chunks from markdown files`);
    
    // Generate embeddings
    const texts = documents.map(doc => doc.content);
    const embeddings = await generateEmbeddings(texts);
    
    // Store in ChromaDB
    await storeInChromaDB(documents, embeddings);
    
    console.log('✅ Embedding creation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in embedding creation:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { loadMarkdownFiles, generateEmbeddings, storeInChromaDB }; 