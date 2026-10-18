/**
 * Vector Store Service
 * In-memory vector store with cosine similarity for semantic search
 * Uses OpenAI embeddings directly — no external vector DB dependency needed
 * Supports user isolation via metadata filtering
 */
const { OpenAIEmbeddings } = require('@langchain/openai');

let embeddingsModel = null;

// In-memory collections: { collectionName: { id: { embedding, pageContent, metadata } } }
const collections = {};

function getEmbeddings() {
  if (!embeddingsModel) {
    embeddingsModel = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small',
    });
  }
  return embeddingsModel;
}

function getCollection(name) {
  if (!collections[name]) collections[name] = {};
  return collections[name];
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) + 1e-8);
}

/**
 * Upsert documents into a collection with user isolation metadata
 * @param {string} collectionName
 * @param {Array<{pageContent: string, metadata: object}>} documents
 * @param {number} userId - Owner user ID
 * @param {string[]} [ids] - Optional document IDs
 */
async function upsertDocuments(collectionName, documents, userId, ids) {
  const col = getCollection(collectionName);
  const embeddings = getEmbeddings();
  const texts = documents.map(d => d.pageContent);

  let vectors;
  try {
    vectors = await embeddings.embedDocuments(texts);
  } catch (err) {
    console.error('Embedding error:', err.message);
    return;
  }

  for (let i = 0; i < documents.length; i++) {
    const id = ids ? ids[i] : `${collectionName}-${Date.now()}-${i}`;
    col[id] = {
      embedding: vectors[i],
      pageContent: documents[i].pageContent,
      metadata: { ...documents[i].metadata, userId: String(userId) },
    };
  }
}

/**
 * Query documents with user isolation
 * @param {string} collectionName
 * @param {string} query - Search query
 * @param {number} userId - User ID for isolation
 * @param {number} [k=5] - Number of results
 * @param {object} [filter={}] - Additional metadata filters
 * @returns {Promise<Array<{pageContent: string, metadata: object, score: number}>>}
 */
async function queryDocuments(collectionName, query, userId, k = 5, filter = {}) {
  const col = getCollection(collectionName);
  const entries = Object.values(col);
  if (entries.length === 0) return [];

  const embeddings = getEmbeddings();
  let queryVec;
  try {
    queryVec = await embeddings.embedQuery(query);
  } catch (err) {
    console.error('Query embedding error:', err.message);
    return [];
  }

  // Filter by userId and additional metadata
  const filtered = entries.filter(entry => {
    if (entry.metadata.userId !== String(userId)) return false;
    for (const [key, val] of Object.entries(filter)) {
      if (entry.metadata[key] !== val) return false;
    }
    return true;
  });

  // Score and sort
  const scored = filtered.map(entry => ({
    pageContent: entry.pageContent,
    metadata: entry.metadata,
    score: cosineSimilarity(queryVec, entry.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

/**
 * Query jobs collection (no user isolation — jobs are shared)
 */
async function queryJobs(query, k = 10, filter = {}) {
  const col = getCollection('jobs');
  const entries = Object.values(col);
  if (entries.length === 0) return [];

  const embeddings = getEmbeddings();
  let queryVec;
  try {
    queryVec = await embeddings.embedQuery(query);
  } catch (err) {
    console.error('Job query embedding error:', err.message);
    return [];
  }

  const filtered = entries.filter(entry => {
    for (const [key, val] of Object.entries(filter)) {
      if (entry.metadata[key] !== val) return false;
    }
    return true;
  });

  const scored = filtered.map(entry => ({
    pageContent: entry.pageContent,
    metadata: entry.metadata,
    score: cosineSimilarity(queryVec, entry.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

/**
 * Delete documents by IDs from a collection
 */
async function deleteDocuments(collectionName, ids) {
  const col = getCollection(collectionName);
  for (const id of ids) {
    delete col[id];
  }
}

/**
 * Delete all documents for a user from a collection
 */
async function deleteUserDocuments(collectionName, userId) {
  const col = getCollection(collectionName);
  for (const [id, entry] of Object.entries(col)) {
    if (entry.metadata.userId === String(userId)) {
      delete col[id];
    }
  }
}

module.exports = {
  getCollection,
  upsertDocuments,
  queryDocuments,
  queryJobs,
  deleteDocuments,
  deleteUserDocuments,
  getEmbeddings,
};
