/**
 * Job Embeddings Service
 * Embed job listings for semantic search
 */
const { upsertDocuments, deleteDocuments } = require('../ai/vectorStore.service');

/**
 * Embed a job listing into the vector store
 * @param {object} job - Job model instance
 */
async function embedJob(job) {
  const requirements = Array.isArray(job.requirements)
    ? job.requirements.join(', ')
    : (job.requirements || '');

  const content = `Job Title: ${job.title}\nDescription: ${job.description || ''}\nRequirements: ${requirements}\nLocation: ${job.location || ''}\nType: ${job.jobType || ''}\nExperience: ${job.experienceLevel || ''}\nSalary: ${job.salary || ''}`;

  const metadata = {
    jobId: String(job.id),
    companyId: String(job.companyId || ''),
    location: job.location || '',
    jobType: job.jobType || '',
    salary: String(job.salary || 0),
    experienceLevel: String(job.experienceLevel || 0),
    title: job.title || '',
  };

  await upsertDocuments('jobs', [{ pageContent: content, metadata }], 0, [`job-${job.id}`]);
}

/**
 * Embed multiple jobs in batch
 * @param {Array} jobs - Array of job model instances
 */
async function embedJobsBatch(jobs) {
  for (const job of jobs) {
    try {
      await embedJob(job);
    } catch (err) {
      console.error(`Failed to embed job ${job.id}:`, err.message);
    }
  }
}

/**
 * Remove a job's embeddings
 * @param {number} jobId
 */
async function removeJobEmbedding(jobId) {
  await deleteDocuments('jobs', [`job-${jobId}`]);
}

module.exports = { embedJob, embedJobsBatch, removeJobEmbedding };
