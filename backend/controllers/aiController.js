/**
 * AI Controller
 * Handles job analysis, matching, skill gap, cover letter, semantic search, dashboard
 */
const { analyzeJobDescription } = require('../services/jobs/analyzer.service');
const { matchResumeToJob } = require('../services/ai/matching.service');
const { analyzeSkillGap } = require('../services/ai/skillGap.service');
const { generateCoverLetter } = require('../services/ai/coverLetter.service');
const { semanticJobSearch } = require('../services/jobs/semanticSearch.service');
const { generateDashboardInsights } = require('../services/ai/dashboard.service');
const { validateCoverLetter, validateMatchScore } = require('../services/ai/evaluation.service');
const Resume = require('../models/resume');
const { Job, Company, Application } = require('../models/assosiations');
const AiUsage = require('../models/aiUsage');

/**
 * POST /api/v1/ai/analyze-job
 */
const analyzeJob = async (req, res) => {
  try {
    const { jobId, title, description, requirements } = req.body;
    let jobData;

    if (jobId) {
      const job = await Job.findByPk(jobId, { include: [{ model: Company, as: 'company' }] });
      if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
      jobData = {
        title: job.title, description: job.description, requirements: job.requirements,
        companyName: job.company?.name, location: job.location, jobType: job.jobType,
        salary: job.salary, experienceLevel: job.experienceLevel,
      };
    } else if (title && description) {
      jobData = { title, description, requirements: requirements || '' };
    } else {
      return res.status(400).json({ success: false, message: 'Provide jobId or title+description.' });
    }

    const analysis = await analyzeJobDescription(jobData);
    return res.json({ success: true, data: analysis });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Job analysis failed.' });
  }
};

/**
 * POST /api/v1/ai/match
 */
const matchResume = async (req, res) => {
  try {
    const { jobId, resumeId } = req.body;
    if (!jobId) return res.status(400).json({ success: false, message: 'jobId is required.' });

    const job = await Job.findByPk(jobId, { include: [{ model: Company, as: 'company' }] });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    let resume;
    if (resumeId) {
      resume = await Resume.findByPk(resumeId);
      if (!resume || resume.userId !== req.id) return res.status(404).json({ success: false, message: 'Resume not found.' });
    } else {
      resume = await Resume.findOne({ where: { userId: req.id, status: 'ready' }, order: [['isPrimary', 'DESC'], ['createdAt', 'DESC']] });
    }
    if (!resume || !resume.parsedData) return res.status(400).json({ success: false, message: 'No parsed resume found. Upload a resume first.' });

    const result = await matchResumeToJob(resume.parsedData, {
      title: job.title, description: job.description, requirements: job.requirements,
      companyName: job.company?.name, experienceLevel: job.experienceLevel,
    }, req.id);

    // Validate match score sanity
    const validation = validateMatchScore(result);
    if (!validation.isValid) {
      result._validationWarnings = validation.issues;
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Matching failed.' });
  }
};

/**
 * POST /api/v1/ai/skill-gap
 */
const skillGap = async (req, res) => {
  try {
    const resume = await Resume.findOne({ where: { userId: req.id, status: 'ready' }, order: [['isPrimary', 'DESC'], ['createdAt', 'DESC']] });
    if (!resume || !resume.parsedData) return res.status(400).json({ success: false, message: 'Upload and parse a resume first.' });

    const applications = await Application.findAll({
      where: { applicantId: req.id },
      include: [{ model: Job, as: 'job' }],
      limit: 15,
    });

    const targetJobs = applications
      .filter(a => a.job)
      .map(a => ({
        title: a.job.title,
        requirements: Array.isArray(a.job.requirements) ? a.job.requirements.join(', ') : (a.job.requirements || ''),
      }));

    if (targetJobs.length === 0) return res.status(400).json({ success: false, message: 'Apply to some jobs first for skill gap analysis.' });

    const expSummary = (resume.parsedData.experience || []).map(e => `${e.title} at ${e.company}`).join('; ');
    const result = await analyzeSkillGap(resume.skills || [], expSummary, targetJobs);
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Skill gap analysis failed.' });
  }
};

/**
 * POST /api/v1/ai/cover-letter
 */
const coverLetter = async (req, res) => {
  try {
    const { jobId, tone = 'professional' } = req.body;
    if (!jobId) return res.status(400).json({ success: false, message: 'jobId is required.' });

    const job = await Job.findByPk(jobId, { include: [{ model: Company, as: 'company' }] });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const resume = await Resume.findOne({ where: { userId: req.id, status: 'ready' }, order: [['isPrimary', 'DESC'], ['createdAt', 'DESC']] });
    if (!resume || !resume.parsedData) return res.status(400).json({ success: false, message: 'Upload a resume first.' });

    const result = await generateCoverLetter(resume.parsedData, {
      title: job.title, description: job.description, requirements: job.requirements,
      companyName: job.company?.name,
    }, tone);

    // Validate no hallucination
    const validation = validateCoverLetter(result.coverLetter, resume.parsedData);
    if (!validation.isValid) {
      result._validationWarnings = validation.issues;
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Cover letter generation failed.' });
  }
};

/**
 * POST /api/v1/ai/semantic-search
 */
const semanticSearch = async (req, res) => {
  try {
    const { query, filters = {} } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'Search query is required.' });

    const results = await semanticJobSearch(query, filters, 10);

    // Enrich with full job data
    const jobIds = results.map(r => r.jobId).filter(Boolean);
    if (jobIds.length > 0) {
      const jobs = await Job.findAll({
        where: { id: jobIds },
        include: [{ model: Company, as: 'company' }],
      });
      const jobMap = {};
      jobs.forEach(j => { jobMap[j.id] = j; });
      results.forEach(r => {
        const job = jobMap[r.jobId];
        if (job) {
          r.title = job.title;
          r.company = job.company?.name;
          r.location = job.location;
          r.salary = job.salary;
          r.jobType = job.jobType;
          r.experienceLevel = job.experienceLevel;
        }
      });
    }

    return res.json({ success: true, data: results });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Search failed.' });
  }
};

/**
 * GET /api/v1/ai/dashboard-insights
 */
const dashboardInsights = async (req, res) => {
  try {
    const { fn, col } = require('sequelize');

    const applications = await Application.findAll({
      where: { applicantId: req.id },
      include: [{ model: Job, as: 'job', include: [{ model: Company, as: 'company' }] }],
      order: [['createdAt', 'DESC']],
    });

    const stats = {};
    applications.forEach(a => { stats[a.status] = (stats[a.status] || 0) + 1; });

    const summary = applications.slice(0, 15).map(a =>
      `${a.job?.title || 'Unknown'} at ${a.job?.company?.name || 'Unknown'} - Status: ${a.status} (${new Date(a.createdAt).toLocaleDateString()})`
    ).join('\n');

    const resume = await Resume.findOne({ where: { userId: req.id, status: 'ready' }, order: [['createdAt', 'DESC']] });

    const insights = await generateDashboardInsights({
      applicationStats: stats,
      appliedJobsSummary: summary || 'No applications yet',
      userSkills: resume?.skills || [],
      savedJobsCount: 0,
    });

    return res.json({ success: true, data: insights });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to generate insights.' });
  }
};

/**
 * GET /api/v1/ai/usage
 */
const getUsageStats = async (req, res) => {
  try {
    const { fn, col } = require('sequelize');
    const usage = await AiUsage.findAll({
      where: { userId: req.id },
      attributes: [
        'feature',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('inputTokens')), 'totalInputTokens'],
        [fn('SUM', col('outputTokens')), 'totalOutputTokens'],
        [fn('SUM', col('cost')), 'totalCost'],
      ],
      group: ['feature'],
      raw: true,
    });
    return res.json({ success: true, data: usage });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch usage.' });
  }
};

module.exports = { analyzeJob, matchResume, skillGap, coverLetter, semanticSearch, dashboardInsights, getUsageStats };
