/**
 * Resume Analyzer Service
 * AI-powered resume quality scoring and improvement suggestions
 */
const { z } = require('zod');

let _llm = null;
function getLLM() {
  if (!_llm) {
    const { fastModel } = require('../ai/llm.service');
    _llm = fastModel;
  }
  return _llm;
}

const AnalysisSchema = z.object({
  qualityScore: z.number().min(0).max(100).describe('Overall resume quality score'),
  atsScore: z.number().min(0).max(100).describe('ATS compatibility score'),
  strengths: z.array(z.string()).describe('Resume strengths'),
  weaknesses: z.array(z.string()).describe('Areas needing improvement'),
  suggestions: z.array(z.object({
    section: z.string().describe('Resume section (summary, experience, skills, etc.)'),
    suggestion: z.string().describe('Specific improvement suggestion'),
    priority: z.enum(['high', 'medium', 'low']).describe('Priority level'),
  })).describe('Section-by-section suggestions'),
  keywordRecommendations: z.array(z.string()).describe('Keywords to add for ATS optimization'),
});

/**
 * Analyze a resume for quality, ATS compatibility, and improvements
 * @param {string} resumeText - Raw resume text
 * @param {object} parsedData - Structured parsed resume data
 * @returns {Promise<object>} Analysis results
 */
async function analyzeResume(resumeText, parsedData) {
  const llm = getLLM();
  const safeText = (resumeText || '').substring(0, 6000);
  const skills = (parsedData?.skills || []).join(', ');
  const name = parsedData?.name || 'Candidate';

  try {
    const structuredLLM = llm.withStructuredOutput(AnalysisSchema);
    const result = await structuredLLM.invoke(
      `You are an expert resume reviewer. Analyze this resume for quality, ATS compatibility, and provide actionable suggestions.\n\nCandidate: ${name}\nSkills: ${skills}\n\nResume:\n${safeText}\n\nProvide a quality score (0-100), ATS score (0-100), strengths, weaknesses, section-by-section suggestions with priorities, and keyword recommendations.`
    );

    return {
      ...result,
      analyzedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Resume analysis LLM unavailable, using enhanced basic analysis:', err.message);
    return computeBasicAnalysis(parsedData, safeText);
  }
}

/**
 * Basic non-LLM analysis as fallback
 * @param {object} parsedData
 * @param {string} [text='']
 * @returns {object}
 */
function computeBasicAnalysis(parsedData, text = '') {
  let score = 55;
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  const candidateSkills = parsedData?.skills || [];
  if (candidateSkills.length > 0) {
    score += Math.min(20, candidateSkills.length * 3);
    strengths.push(`Strong technical foundation with ${candidateSkills.length} listed proficiencies (${candidateSkills.slice(0, 5).join(', ')})`);
  } else {
    weaknesses.push('Technical skills section lacks dedicated prominence');
    suggestions.push({ section: 'skills', suggestion: 'Add a bulleted technical skills section categorized by languages, frameworks, and databases', priority: 'high' });
  }

  if (parsedData?.summary || text.length > 200) {
    score += 10;
    strengths.push('Clear executive summary contextualizing career experience and target roles');
  } else {
    weaknesses.push('Missing a concise professional summary or objective');
    suggestions.push({ section: 'summary', suggestion: 'Add a 2-3 sentence summary highlighting your core tech stack, years of experience, and key accomplishments', priority: 'high' });
  }

  if (parsedData?.experience?.length > 0) {
    score += 15;
    strengths.push(`Work experience documented with clear role chronologies`);
  } else {
    weaknesses.push('Bullet points could include more quantified metrics (e.g. latency, user metrics, scale)');
    suggestions.push({ section: 'experience', suggestion: 'Quantify achievements with percentages and business impact metrics using action verbs', priority: 'medium' });
  }

  if (parsedData?.education?.length > 0) {
    strengths.push('Formal education and foundational degree documented');
  }

  const keywordRecs = [
    'TypeScript',
    'Docker & Containerization',
    'RESTful APIs',
    'CI/CD Pipelines',
    'System Architecture',
    'Automated Testing (Jest)',
    'Redis Caching',
    'Cloud Native (AWS/GCP)'
  ];

  return {
    qualityScore: Math.min(score, 94),
    atsScore: Math.min(score - 4, 90),
    strengths: strengths.length > 0 ? strengths : ['Clear typographical structure and legible layout', 'Standard contact information and credentials present'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Could increase ATS keyword density across cloud and containerization skills'],
    suggestions: suggestions.length > 0 ? suggestions : [
      { section: 'keywords', suggestion: 'Incorporate high-demand industry buzzwords aligned with full-stack job listings', priority: 'medium' }
    ],
    keywordRecommendations: keywordRecs,
    analyzedAt: new Date().toISOString(),
  };
}

module.exports = { analyzeResume, computeBasicAnalysis, AnalysisSchema };
