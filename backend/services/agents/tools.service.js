/**
 * Secure Tool Calling Service
 * LangChain DynamicStructuredTool definitions for Copilot agent
 */
const { DynamicStructuredTool } = require('@langchain/core/tools');
const { z } = require('zod');

/**
 * Create tools scoped to a specific user
 * @param {number} userId - Authenticated user ID
 * @returns {Array} Array of LangChain tools
 */
function createUserTools(userId) {
  return [
    new DynamicStructuredTool({
      name: 'searchJobs',
      description: 'Search for job listings by keyword, location, or type',
      schema: z.object({
        query: z.string().describe('Search query'),
        location: z.string().optional(),
        jobType: z.string().optional(),
      }),
      func: async ({ query, location, jobType }) => {
        const { Job, Company } = require('../../models/assosiations');
        const { Op } = require('sequelize');
        const where = {};
        if (query) {
          where[Op.or] = [
            { title: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } },
          ];
        }
        if (location) where.location = { [Op.like]: `%${location}%` };
        if (jobType) where.jobType = jobType;
        const jobs = await Job.findAll({ where, include: [{ model: Company, as: 'company' }], limit: 10 });
        return JSON.stringify(jobs.map(j => ({
          id: j.id, title: j.title, company: j.company?.name,
          location: j.location, salary: j.salary, type: j.jobType,
        })));
      },
    }),

    new DynamicStructuredTool({
      name: 'getMyApplications',
      description: 'Get the authenticated user\'s job applications',
      schema: z.object({ status: z.string().optional().describe('Filter by status') }),
      func: async ({ status }) => {
        const { Application, Job, Company } = require('../../models/assosiations');
        const where = { applicantId: userId };
        if (status) where.status = status;
        const apps = await Application.findAll({
          where,
          include: [{ model: Job, as: 'job', include: [{ model: Company, as: 'company' }] }],
          order: [['createdAt', 'DESC']],
          limit: 20,
        });
        return JSON.stringify(apps.map(a => ({
          id: a.id, status: a.status, appliedAt: a.createdAt,
          job: { title: a.job?.title, company: a.job?.company?.name, location: a.job?.location },
        })));
      },
    }),

    new DynamicStructuredTool({
      name: 'getMyResume',
      description: 'Get the user\'s latest parsed resume data',
      schema: z.object({}),
      func: async () => {
        const Resume = require('../../models/resume');
        const resume = await Resume.findOne({
          where: { userId, status: 'ready' },
          order: [['createdAt', 'DESC']],
        });
        if (!resume) return JSON.stringify({ message: 'No parsed resume found. Upload a resume first.' });
        return JSON.stringify({
          skills: resume.skills, parsedData: resume.parsedData,
          qualityScore: resume.qualityScore, uploadedAt: resume.createdAt,
        });
      },
    }),

    new DynamicStructuredTool({
      name: 'getMyStats',
      description: 'Get application statistics for the user',
      schema: z.object({}),
      func: async () => {
        const { Application } = require('../../models/assosiations');
        const { fn, col } = require('sequelize');
        const stats = await Application.findAll({
          where: { applicantId: userId },
          attributes: ['status', [fn('COUNT', col('id')), 'count']],
          group: ['status'],
          raw: true,
        });
        const total = stats.reduce((sum, s) => sum + parseInt(s.count), 0);
        return JSON.stringify({ total, byStatus: stats });
      },
    }),

    new DynamicStructuredTool({
      name: 'semanticJobSearch',
      description: 'AI-powered semantic job search using natural language',
      schema: z.object({
        query: z.string().describe('Natural language job search query'),
        location: z.string().optional(),
        jobType: z.string().optional(),
      }),
      func: async ({ query, location, jobType }) => {
        const { semanticJobSearch } = require('../jobs/semanticSearch.service');
        const results = await semanticJobSearch(query, { location, jobType }, 5);
        return JSON.stringify(results);
      },
    }),

    new DynamicStructuredTool({
      name: 'getSkillGap',
      description: 'Analyze skill gaps for target jobs',
      schema: z.object({ jobId: z.number().optional().describe('Specific job ID to analyze against') }),
      func: async ({ jobId }) => {
        const Resume = require('../../models/resume');
        const { Job } = require('../../models/assosiations');
        const resume = await Resume.findOne({ where: { userId, status: 'ready' }, order: [['createdAt', 'DESC']] });
        if (!resume) return JSON.stringify({ message: 'Upload a resume first for skill gap analysis.' });
        let jobs;
        if (jobId) {
          const job = await Job.findByPk(jobId);
          jobs = job ? [{ title: job.title, requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : job.requirements }] : [];
        } else {
          const { Application } = require('../../models/assosiations');
          const apps = await Application.findAll({
            where: { applicantId: userId },
            include: [{ model: Job, as: 'job' }],
            limit: 10,
          });
          jobs = apps.map(a => ({ title: a.job?.title, requirements: Array.isArray(a.job?.requirements) ? a.job.requirements.join(', ') : '' }));
        }
        if (jobs.length === 0) return JSON.stringify({ message: 'No target jobs found. Apply to some jobs first.' });
        const { analyzeSkillGap } = require('../ai/skillGap.service');
        const result = await analyzeSkillGap(resume.skills || [], JSON.stringify(resume.parsedData?.experience || []), jobs);
        return JSON.stringify(result);
      },
    }),

    new DynamicStructuredTool({
      name: 'getInterviewHistory',
      description: 'Get past mock interview sessions with scores',
      schema: z.object({}),
      func: async () => {
        const Interview = require('../../models/interview');
        const interviews = await Interview.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: 10,
          attributes: ['id', 'type', 'difficulty', 'overallScore', 'status', 'createdAt'],
        });
        return JSON.stringify(interviews);
      },
    }),
  ];
}

module.exports = { createUserTools };
