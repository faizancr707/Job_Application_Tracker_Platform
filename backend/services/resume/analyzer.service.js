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
  const truncatedText = resumeText.substring(0, 6000);
  const skills = (parsedData?.skills || []).join(', ');
  const name = parsedData?.name || 'Unknown';

  try {
    const structuredLLM = llm.withStructuredOutput(AnalysisSchema);
    const result = await structuredLLM.invoke(
      `You are an expert resume reviewer. Analyze this resume for quality, ATS compatibility, and provide actionable suggestions.\n\nCandidate: ${name}\nSkills: ${skills}\n\nResume:\n${truncatedText}\n\nProvide a quality score (0-100), ATS score (0-100), strengths, weaknesses, section-by-section suggestions with priorities, and keyword recommendations.`
    );

    return {
      ...result,
      analyzedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Resume analysis failed:', err.message);
    return computeBasicAnalysis(parsedData);
  }
}

/**
 * Basic non-LLM analysis as fallback
 * @param {object} parsedData
 * @returns {object}
 */
function computeBasicAnalysis(parsedData) {
  let score = 30;
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  if (parsedData?.summary) { score += 10; strengths.push('Has professional summary'); }
  else { weaknesses.push('Missing professional summary'); suggestions.push({ section: 'summary', suggestion: 'Add a 2-3 sentence professional summary', priority: 'high' }); }

  if (parsedData?.skills?.length > 5) { score += 15; strengths.push(`Lists ${parsedData.skills.length} skills`); }
  else { weaknesses.push('Few skills listed'); suggestions.push({ section: 'skills', suggestion: 'Add more relevant technical skills', priority: 'high' }); }

  if (parsedData?.experience?.length > 0) { score += 20; strengths.push(`${parsedData.experience.length} work experience entries`); }
  else { weaknesses.push('No work experience listed'); suggestions.push({ section: 'experience', suggestion: 'Add work experience with achievements', priority: 'high' }); }

  if (parsedData?.education?.length > 0) { score += 10; strengths.push('Education section present'); }
  if (parsedData?.projects?.length > 0) { score += 10; strengths.push('Projects section present'); }
  if (parsedData?.certifications?.length > 0) { score += 5; strengths.push('Certifications listed'); }

  return {
    qualityScore: Math.min(score, 100),
    atsScore: Math.min(score - 5, 100),
    strengths,
    weaknesses,
    suggestions,
    keywordRecommendations: [],
    analyzedAt: new Date().toISOString(),
  };
}

module.exports = { analyzeResume, AnalysisSchema };
