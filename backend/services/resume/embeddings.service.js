/**
 * Resume Embeddings Service
 * Chunk and embed resume content for vector search
 */
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { upsertDocuments, deleteDocuments } = require('../ai/vectorStore.service');

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', '. ', ' ', ''],
});

/**
 * Embed a resume into the vector store
 * @param {number} resumeId - Resume DB ID
 * @param {number} userId - Owner user ID
 * @param {string} rawText - Raw resume text
 * @param {object} parsedData - Structured parsed data
 * @returns {Promise<string[]>} Array of embedding IDs
 */
async function embedResume(resumeId, userId, rawText, parsedData) {
  const chunks = await splitter.createDocuments(
    [rawText],
    [{ resumeId: String(resumeId), userId: String(userId), type: 'resume' }]
  );

  // Add section-specific chunks for skills and experience
  if (parsedData?.skills?.length > 0) {
    chunks.push({
      pageContent: `Skills: ${parsedData.skills.join(', ')}`,
      metadata: { resumeId: String(resumeId), userId: String(userId), type: 'resume', section: 'skills' },
    });
  }

  if (parsedData?.experience?.length > 0) {
    const expText = parsedData.experience
      .map(e => `${e.title} at ${e.company} (${e.duration}): ${e.description}`)
      .join('\n');
    chunks.push({
      pageContent: expText,
      metadata: { resumeId: String(resumeId), userId: String(userId), type: 'resume', section: 'experience' },
    });
  }

  if (parsedData?.summary) {
    chunks.push({
      pageContent: parsedData.summary,
      metadata: { resumeId: String(resumeId), userId: String(userId), type: 'resume', section: 'summary' },
    });
  }

  const ids = chunks.map((_, i) => `resume-${resumeId}-chunk-${i}`);
  await upsertDocuments('resumes', chunks, userId, ids);
  return ids;
}

/**
 * Remove resume embeddings from vector store
 * @param {number} resumeId
 * @param {number} chunkCount - Approximate number of chunks to delete
 */
async function removeResumeEmbeddings(resumeId, chunkCount = 20) {
  const ids = Array.from({ length: chunkCount }, (_, i) => `resume-${resumeId}-chunk-${i}`);
  await deleteDocuments('resumes', ids);
}

module.exports = { embedResume, removeResumeEmbeddings };
