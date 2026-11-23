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
const User = require('../models/user');
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
      const parsedId = Number(jobId) || jobId;
      const job = await Job.findByPk(parsedId, { include: [{ model: Company, as: 'company' }] });
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
    console.error('Error in analyzeJob controller:', err);
    return res.status(500).json({ success: false, message: err.message || 'Job analysis failed.' });
  }
};

/**
 * Helper to build candidate data from Resume or User Profile
 */
async function getCandidateData(userId, resumeId) {
  let resume;
  if (resumeId) {
    resume = await Resume.findByPk(resumeId);
    if (resume && resume.userId !== userId) resume = null;
  } else {
    resume = await Resume.findOne({
      where: { userId, status: 'ready' },
      order: [['isPrimary', 'DESC'], ['createdAt', 'DESC']]
    });
  }

  if (resume && resume.parsedData) {
    return resume.parsedData;
  }

  // Fallback to User profile
  const user = await User.findByPk(userId);
  if (!user) return null;

  const userSkills = Array.isArray(user.skills)
    ? user.skills
    : (typeof user.skills === 'string' ? JSON.parse(user.skills || '[]') : []);

  return {
    name: user.fullname || 'Candidate',
    email: user.email || '',
    phone: user.phoneNumber || '',
    skills: userSkills.length > 0 ? userSkills : ['Full Stack Development', 'Problem Solving', 'JavaScript', 'Database Management', 'Git'],
    summary: user.bio || `${user.fullname || 'Candidate'} is a dedicated developer with strong technical competencies.`,
    experience: user.bio ? [{ title: 'Software Developer', company: 'Engineering Projects', duration: '1-3 years', description: user.bio }] : [],
    education: []
  };
}

/**
 * POST /api/v1/ai/match
 */
const matchResume = async (req, res) => {
  try {
    const { jobId, resumeId } = req.body;
    if (!jobId) return res.status(400).json({ success: false, message: 'jobId is required.' });

    const parsedId = Number(jobId) || jobId;
    const job = await Job.findByPk(parsedId, { include: [{ model: Company, as: 'company' }] });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const candidateData = await getCandidateData(req.id, resumeId);
    if (!candidateData) {
      return res.status(400).json({ success: false, message: 'No candidate profile found. Please update your profile.' });
    }

    const result = await matchResumeToJob(candidateData, {
      title: job.title, description: job.description, requirements: job.requirements,
      companyName: job.company?.name, experienceLevel: job.experienceLevel,
    }, req.id);

    // Validate match score sanity if validator is available
    try {
      const validation = validateMatchScore(result);
      if (!validation.isValid) {
        result._validationWarnings = validation.issues;
      }
    } catch {}

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error in matchResume controller:', err);
    return res.status(500).json({ success: false, message: err.message || 'Matching failed.' });
  }
};

/**
 * POST /api/v1/ai/skill-gap
 */
const skillGap = async (req, res) => {
  try {
    const resume = await Resume.findOne({ where: { userId: req.id, status: 'ready' }, order: [['isPrimary', 'DESC'], ['createdAt', 'DESC']] });
    const user = await User.findByPk(req.id);

    const userSkills = resume?.skills || (Array.isArray(user?.skills) ? user.skills : []);
    const candidateData = resume?.parsedData || {
      skills: userSkills,
      experience: user?.bio ? [{ title: 'Professional', company: 'Experience' }] : []
    };

    const applications = await Application.findAll({
      where: { applicantId: req.id },
      include: [{ model: Job, as: 'job' }],
      limit: 15,
    });

    let targetJobs = applications
      .filter(a => a.job)
      .map(a => ({
        title: a.job.title,
        requirements: Array.isArray(a.job.requirements) ? a.job.requirements.join(', ') : (a.job.requirements || ''),
      }));

    if (targetJobs.length === 0) {
      // Pull recent jobs from DB
      const recentJobs = await Job.findAll({ limit: 6, order: [['createdAt', 'DESC']] });
      if (recentJobs && recentJobs.length > 0) {
        targetJobs = recentJobs.map(j => ({
          title: j.title,
          requirements: Array.isArray(j.requirements) ? j.requirements.join(', ') : (j.requirements || '')
        }));
      } else {
        targetJobs.push(
          { title: 'Full Stack Developer', requirements: 'React, Node.js, JavaScript, SQL, REST APIs, Git' },
          { title: 'Frontend Developer', requirements: 'React, TypeScript, CSS, HTML, State Management' }
        );
      }
    }

    const expSummary = (candidateData.experience || []).map(e => `${e.title} at ${e.company || 'Projects'}`).join('; ');
    const effectiveSkills = userSkills.length > 0 ? userSkills : ['JavaScript', 'React', 'Problem Solving'];
    const result = await analyzeSkillGap(effectiveSkills, expSummary, targetJobs);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error in skillGap controller:', err);
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

    const parsedId = Number(jobId) || jobId;
    const job = await Job.findByPk(parsedId, { include: [{ model: Company, as: 'company' }] });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const candidateData = await getCandidateData(req.id);
    if (!candidateData) {
      return res.status(400).json({ success: false, message: 'No candidate profile found. Please update your profile.' });
    }

    const result = await generateCoverLetter(candidateData, {
      title: job.title, description: job.description, requirements: job.requirements,
      companyName: job.company?.name,
    }, tone);

    // Validate no hallucination if validator is available
    try {
      const validation = validateCoverLetter(result.coverLetter, candidateData);
      if (!validation.isValid) {
        result._validationWarnings = validation.issues;
      }
    } catch {}

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error in coverLetter controller:', err);
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

    let results = [];
    try {
      results = await semanticJobSearch(query, filters, 10);
    } catch (vectorErr) {
      console.warn('Vector search warning:', vectorErr.message);
    }

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

    // If vector search returned 0 results or had no embeddings, query MySQL Job table with keyword/relevance fallback
    if (!results || results.length === 0) {
      const { Op } = require('sequelize');
      const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
      
      const whereConditions = [];
      keywords.forEach(kw => {
        whereConditions.push(
          { title: { [Op.like]: `%${kw}%` } },
          { description: { [Op.like]: `%${kw}%` } },
          { requirements: { [Op.like]: `%${kw}%` } },
          { location: { [Op.like]: `%${kw}%` } }
        );
      });

      if (filters.location) {
        whereConditions.push({ location: { [Op.like]: `%${filters.location}%` } });
      }

      let dbJobs = [];
      if (whereConditions.length > 0) {
        dbJobs = await Job.findAll({
          where: { [Op.or]: whereConditions },
          include: [{ model: Company, as: 'company' }],
          limit: 15,
        });
      }

      // If still empty (e.g. general query like "developer" or non-matching term), return all recent jobs
      if (!dbJobs || dbJobs.length === 0) {
        dbJobs = await Job.findAll({
          include: [{ model: Company, as: 'company' }],
          limit: 10,
          order: [['createdAt', 'DESC']]
        });
      }

      results = dbJobs.map((job, idx) => {
        const text = `${job.title} ${job.description} ${job.requirements} ${job.location}`.toLowerCase();
        const matchCount = keywords.filter(kw => text.includes(kw)).length;
        const relevance = Math.min(98, Math.max(70, Math.round(75 + (matchCount / (keywords.length || 1)) * 22) - (idx * 2)));

        return {
          rank: idx + 1,
          jobId: job.id,
          title: job.title,
          company: job.company?.name || 'Top Company',
          location: job.location,
          salary: job.salary,
          jobType: job.jobType,
          experienceLevel: job.experienceLevel,
          relevanceScore: relevance,
          snippet: job.description ? (job.description.length > 180 ? job.description.substring(0, 180) + '...' : job.description) : 'Great opportunity matching your search parameters.'
        };
      });
    }

    return res.json({ success: true, data: results });
  } catch (err) {
    console.error('Error in semanticSearch controller:', err);
    return res.status(500).json({ success: false, message: err.message || 'Search failed.' });
  }
};

/**
 * GET /api/v1/ai/dashboard-insights
 */
const dashboardInsights = async (req, res) => {
  try {
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
    const user = await User.findByPk(req.id);

    const userSkills = resume?.skills || (Array.isArray(user?.skills) ? user.skills : []);

    const insights = await generateDashboardInsights({
      applicationStats: stats,
      appliedJobsSummary: summary || 'No applications yet',
      userSkills,
      savedJobsCount: 0,
    });

    return res.json({ success: true, data: insights });
  } catch (err) {
    console.error('Error in dashboardInsights controller:', err);
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
