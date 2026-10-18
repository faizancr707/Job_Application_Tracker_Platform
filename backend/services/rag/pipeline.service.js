/**
 * RAG Pipeline Service
 * Full Retrieval-Augmented Generation for career queries
 */
const { queryDocuments, queryJobs } = require('../ai/vectorStore.service');

let _llm = null;
function getLLM() {
  if (!_llm) {
    const { primaryModel } = require('./llm.service');
    _llm = primaryModel;
  }
  return _llm;
}

/**
 * Run the RAG pipeline: retrieve context → generate answer
 * @param {string} query - User query
 * @param {number} userId - User ID for scoped retrieval
 * @param {object} [additionalContext={}] - Extra context (applications, profile)
 * @returns {Promise<{answer: string, sources: Array}>}
 */
async function ragQuery(query, userId, additionalContext = {}) {
  const llm = getLLM();

  // Step 1: Retrieve relevant documents from vector store
  const [resumeResults, jobResults] = await Promise.all([
    queryDocuments('resumes', query, userId, 3),
    queryJobs(query, 5),
  ]);

  // Step 2: Assemble context
  const resumeContext = resumeResults
    .map(r => r.pageContent)
    .join('\n---\n');
  const jobContext = jobResults
    .map(r => `${r.metadata.title || 'Job'}: ${r.pageContent.substring(0, 300)}`)
    .join('\n---\n');

  const appContext = additionalContext.applications
    ? `\nRecent Applications:\n${additionalContext.applications}`
    : '';
  const profileContext = additionalContext.profile
    ? `\nUser Profile:\n${additionalContext.profile}`
    : '';

  // Step 3: Generate answer with context
  const contextBlock = [
    resumeContext && `Resume Data:\n${resumeContext}`,
    jobContext && `Relevant Jobs:\n${jobContext}`,
    appContext,
    profileContext,
  ].filter(Boolean).join('\n\n');

  try {
    const response = await llm.invoke(
      `You are a career AI assistant. Answer the user's question using ONLY the context provided below. If the context doesn't contain enough information, say so honestly. Cite specific pieces of context when possible.\n\n=== CONTEXT ===\n${contextBlock || 'No relevant context found.'}\n=== END CONTEXT ===\n\nUser Question: ${query}`
    );

    const sources = [
      ...resumeResults.map(r => ({ type: 'resume', section: r.metadata.section || 'general', score: r.score })),
      ...jobResults.map(r => ({ type: 'job', jobId: r.metadata.jobId, title: r.metadata.title, score: r.score })),
    ];

    return {
      answer: response.content,
      sources,
    };
  } catch (err) {
    console.error('RAG pipeline failed:', err.message);
    throw new Error('Failed to process your query. Please try again.');
  }
}

module.exports = { ragQuery };
