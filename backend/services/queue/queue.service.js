/**
 * Background Queue Service
 * BullMQ job queues with Redis, synchronous fallback without Redis
 */
const { getRedisClient } = require('../cache/redis.service');

let Queue, Worker;
try {
  ({ Queue, Worker } = require('bullmq'));
} catch {
  console.log('⚠️ BullMQ not available');
}

const queues = {};

/**
 * Get or create a named queue
 * @param {string} name - Queue name
 * @returns {object|null}
 */
function getQueue(name) {
  const redis = getRedisClient();
  if (!Queue || !redis) return null;
  if (!queues[name]) {
    queues[name] = new Queue(name, { connection: redis.options });
  }
  return queues[name];
}

/**
 * Add a job to a queue (or execute synchronously if no Redis)
 * @param {string} queueName
 * @param {string} jobName
 * @param {object} data
 * @param {object} [opts={}]
 */
async function addJob(queueName, jobName, data, opts = {}) {
  const queue = getQueue(queueName);
  if (queue) {
    await queue.add(jobName, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 30000 },
      priority: opts.priority || 2,
      ...opts,
    });
    return;
  }
  // Synchronous fallback
  console.log(`[Queue Fallback] Running ${queueName}/${jobName} synchronously`);
  try {
    const processor = syncProcessors[queueName];
    if (processor) await processor({ data, name: jobName });
  } catch (err) {
    console.error(`[Queue Fallback] ${queueName}/${jobName} failed:`, err.message);
  }
}

// Synchronous fallback processors
const syncProcessors = {
  'resume-processing': async (job) => {
    const { parseResume } = require('../resume/parser.service');
    const { analyzeResume } = require('../resume/analyzer.service');
    const { embedResume } = require('../resume/embeddings.service');
    const Resume = require('../../models/resume');
    const resume = await Resume.findByPk(job.data.resumeId);
    if (!resume) return;
    try {
      await resume.update({ status: 'processing' });
      const { rawText, parsedData, skills } = await parseResume(Buffer.from(job.data.pdfBase64, 'base64'));
      const analysis = await analyzeResume(rawText, parsedData);
      const embeddingIds = await embedResume(resume.id, resume.userId, rawText, parsedData);
      await resume.update({
        rawText, parsedData, skills,
        qualityScore: analysis.qualityScore,
        analysis, status: 'ready',
        embeddingId: embeddingIds.join(','),
      });
    } catch (err) {
      await resume.update({ status: 'failed', processingError: err.message });
    }
  },
  'job-embedding': async (job) => {
    const { embedJob } = require('../jobs/embeddings.service');
    const Job = require('../../models/job');
    const jobModel = await Job.findByPk(job.data.jobId);
    if (jobModel) await embedJob(jobModel);
  },
};

/**
 * Start BullMQ workers (call once at server startup)
 */
function startWorkers() {
  const redis = getRedisClient();
  if (!Worker || !redis) {
    console.log('⚠️ Queue workers not started (no Redis)');
    return;
  }

  new Worker('resume-processing', async (job) => {
    await syncProcessors['resume-processing'](job);
  }, { connection: redis.options, concurrency: 2 });

  new Worker('job-embedding', async (job) => {
    await syncProcessors['job-embedding'](job);
  }, { connection: redis.options, concurrency: 3 });

  console.log('✅ Queue workers started');
}

module.exports = { addJob, startWorkers, getQueue };
