/**
 * @file embeddings.service.js
 * @description Embeddings service
 */

const { OpenAIEmbeddings } = require('@langchain/openai');
const aiConfig = require('../../config/ai.config');

const embeddings = new OpenAIEmbeddings({
  modelName: aiConfig.models.embedding,
  dimensions: 1536,
  maxRetries: 3,
  openAIApiKey: aiConfig.env.OPENAI_API_KEY,
});

// Simple LRU Cache
const MAX_CACHE_SIZE = 1000;
const embeddingCache = new Map();

function getFromCache(text) {
  if (embeddingCache.has(text)) {
    const value = embeddingCache.get(text);
    // Refresh position
    embeddingCache.delete(text);
    embeddingCache.set(text, value);
    return value;
  }
  return null;
}

function setToCache(text, vector) {
  if (embeddingCache.size >= MAX_CACHE_SIZE) {
    const firstKey = embeddingCache.keys().next().value;
    embeddingCache.delete(firstKey);
  }
  embeddingCache.set(text, vector);
}

/**
 * Embed single text
 * @param {string} text 
 * @returns {Promise<any>}
 */
async function embedText(text) {
  try {
    const cached = getFromCache(text);
    if (cached) return { success: true, data: cached };

    const vector = await embeddings.embedQuery(text);
    setToCache(text, vector);
    return { success: true, data: vector };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Embed multiple texts
 * @param {Array<string>} texts 
 * @returns {Promise<any>}
 */
async function embedBatch(texts) {
  try {
    const results = [];
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const batchVectors = await embeddings.embedDocuments(batch);
      results.push(...batchVectors);
    }
    
    return { success: true, data: results };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Embed a document object
 * @param {Object} doc {pageContent, metadata}
 * @returns {Promise<any>}
 */
async function embedDocument(doc) {
  try {
    const vector = await embeddings.embedQuery(doc.pageContent);
    return { 
      success: true, 
      data: {
        vector,
        metadata: doc.metadata
      } 
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = {
  embeddings,
  embedText,
  embedBatch,
  embedDocument
};
