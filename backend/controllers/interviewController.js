/**
 * Interview Controller
 * Generate questions, evaluate answers, manage sessions
 */
const Interview = require('../models/interview');
const { Job } = require('../models/assosiations');
const Resume = require('../models/resume');
const { generateQuestions } = require('../services/interview/generator.service');
const { evaluateAnswer, summarizeSession } = require('../services/interview/evaluator.service');

/**
 * POST /api/v1/interview/generate
 */
const generateInterview = async (req, res) => {
  try {
    const { jobId, type = 'technical', difficulty = 'mid', count = 5 } = req.body;
    if (!['technical', 'behavioral', 'hr', 'system_design'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid interview type.' });
    }

    let jobTitle = 'General Software Engineer';
    let jobRequirements = '';
    if (jobId) {
      const job = await Job.findByPk(jobId);
      if (job) {
        jobTitle = job.title;
        jobRequirements = Array.isArray(job.requirements) ? job.requirements.join(', ') : (job.requirements || '');
      }
    }

    const resume = await Resume.findOne({ where: { userId: req.id, status: 'ready' }, order: [['createdAt', 'DESC']] });
    const candidateSkills = resume?.skills || [];

    const questions = await generateQuestions({
      type, difficulty, jobTitle, jobRequirements, candidateSkills,
      count: Math.min(count, 10),
    });

    const interview = await Interview.create({
      userId: req.id,
      jobId: jobId || null,
      type, difficulty,
      questions,
      status: 'in_progress',
    });

    return res.status(201).json({ success: true, data: interview });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to generate questions.' });
  }
};

/**
 * POST /api/v1/interview/:id/evaluate
 */
const evaluateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });
    if (interview.userId !== req.id) return res.status(403).json({ success: false, message: 'Not authorized.' });

    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array is required.' });
    }

    const evaluations = [];
    for (let i = 0; i < interview.questions.length; i++) {
      const q = interview.questions[i];
      const answer = answers[i] || '';
      if (answer.trim()) {
        const evaluation = await evaluateAnswer(q.question, q.type, q.expectedTopics, answer);
        evaluations.push(evaluation);
      } else {
        evaluations.push({ score: 0, strengths: [], weaknesses: ['No answer provided'], improvedAnswer: '', tips: ['Try to provide an answer next time'] });
      }
    }

    const sessionSummary = await summarizeSession(interview.questions, answers, evaluations);

    await interview.update({
      answers,
      evaluations,
      overallScore: sessionSummary.overallScore,
      feedback: sessionSummary,
      status: 'completed',
    });

    return res.json({ success: true, data: { evaluations, summary: sessionSummary } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Evaluation failed.' });
  }
};

/**
 * GET /api/v1/interview/history
 */
const getInterviewHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { count, rows } = await Interview.findAndCountAll({
      where: { userId: req.id },
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      attributes: ['id', 'type', 'difficulty', 'overallScore', 'status', 'createdAt', 'jobId'],
    });
    return res.json({ success: true, data: { interviews: rows, total: count, page, totalPages: Math.ceil(count / limit) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch history.' });
  }
};

/**
 * GET /api/v1/interview/:id
 */
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });
    if (interview.userId !== req.id) return res.status(403).json({ success: false, message: 'Not authorized.' });
    return res.json({ success: true, data: interview });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch interview.' });
  }
};

module.exports = { generateInterview, evaluateInterview, getInterviewHistory, getInterviewById };
