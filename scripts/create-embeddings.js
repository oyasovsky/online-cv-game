require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');
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

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to clean and chunk text
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
}

function chunkText(text, maxChunkSize = 1000, overlap = 200) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const sentenceWithPunctuation = sentence.trim() + '.';
    
    if (currentChunk.length + sentenceWithPunctuation.length <= maxChunkSize) {
      currentChunk += (currentChunk ? ' ' : '') + sentenceWithPunctuation;
    } else {
      if (currentChunk) {
        chunks.push(cleanText(currentChunk));
      }
      currentChunk = sentenceWithPunctuation;
    }
  }

  if (currentChunk) {
    chunks.push(cleanText(currentChunk));
  }

  return chunks;
}

// Function to load markdown files
async function loadMarkdownFiles() {
  const docsDir = path.join(__dirname, '..', 'data', 'olga_docs');
  const documents = [];

  try {
    const files = await fs.readdir(docsDir);
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(docsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Split content into chunks
        const chunks = chunkText(content);
        
        chunks.forEach((chunk, index) => {
          documents.push({
            content: chunk,
            source: file,
            chunkIndex: index,
            metadata: {
              source: file,
              chunkIndex: index,
              totalChunks: chunks.length
            }
          });
        });
      }
    }
  } catch (error) {
    console.error('Error loading markdown files:', error);
    throw error;
  }

  return documents;
}

// Function to generate embeddings
async function generateEmbeddings(texts) {
  console.log(`Generating embeddings for ${texts.length} chunks...`);
  
  const embeddings = [];
  const batchSize = 10; // Process in batches to avoid rate limits
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);
    
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
      });
      
      embeddings.push(...response.data.map(item => item.embedding));
      
      // Add a small delay to avoid rate limits
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error generating embeddings for batch ${Math.floor(i / batchSize) + 1}:`, error);
      throw error;
    }
  }
  
  return embeddings;
}

// Function to store in Firebase Vector Search
async function storeInFirebase(documents, embeddings) {
  console.log('Storing documents in Firebase Vector Search...');
  
  const collectionRef = db.collection('olga_knowledge_base');
  
  // Clear existing documents
  const existingDocs = await collectionRef.get();
  if (!existingDocs.empty) {
    console.log('Found existing collection, clearing it...');
    const batch = db.batch();
    existingDocs.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
  
  // Store new documents with embeddings
  const batch = db.batch();
  
  documents.forEach((doc, index) => {
    const docRef = collectionRef.doc();
    batch.set(docRef, {
      content: doc.content,
      source: doc.source,
      chunkIndex: doc.chunkIndex,
      metadata: doc.metadata,
      embedding: embeddings[index],
      createdAt: new Date()
    });
  });
  
  await batch.commit();
  console.log(`Successfully stored ${documents.length} documents in Firebase`);
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
    
    // Store in Firebase
    await storeInFirebase(documents, embeddings);
    
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

module.exports = { loadMarkdownFiles, generateEmbeddings, storeInFirebase }; 