/**
 * Job Description Analyzer Service
 * LLM-powered job posting analysis
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

const JobAnalysisSchema = z.object({
  requiredSkills: z.array(z.object({
    skill: z.string(),
    importance: z.enum(['must-have', 'nice-to-have']),
  })).describe('Skills extracted from the job description'),
  experienceRange: z.object({
    min: z.number().describe('Minimum years of experience'),
    max: z.number().describe('Maximum years of experience'),
  }).describe('Required experience range'),
  responsibilities: z.array(z.string()).describe('Key responsibilities'),
  redFlags: z.array(z.string()).describe('Potential red flags in the job posting'),
  salaryAssessment: z.string().describe('Assessment of the salary range'),
  companyCultureSignals: z.array(z.string()).describe('Indicators of company culture'),
  seniorityLevel: z.enum(['junior', 'mid', 'senior', 'lead', 'principal']).describe('Detected seniority level'),
  summary: z.string().describe('Brief summary of the position'),
});

/**
 * Analyze a job description
 * @param {object} params - Job details
 * @param {string} params.title - Job title
 * @param {string} params.description - Job description
 * @param {string|string[]} params.requirements - Job requirements
 * @param {string} [params.companyName] - Company name
 * @param {string} [params.location] - Job location
 * @param {string} [params.jobType] - Job type
 * @param {number} [params.salary] - Salary
 * @param {number} [params.experienceLevel] - Experience level
 * @returns {Promise<object>} Structured analysis
 */
async function analyzeJobDescription({ title, description, requirements, companyName, location, jobType, salary, experienceLevel }) {
  const llm = getLLM();
  const reqText = Array.isArray(requirements) ? requirements.join(', ') : (requirements || 'Not specified');

  try {
    const structuredLLM = llm.withStructuredOutput(JobAnalysisSchema);
    const result = await structuredLLM.invoke(
      `Analyze this job posting:\n\nTitle: ${title}\nCompany: ${companyName || 'Unknown'}\nLocation: ${location || 'Not specified'}\nType: ${jobType || 'Not specified'}\nSalary: ${salary || 'Not specified'}\nExperience Level: ${experienceLevel || 'Not specified'}\n\nDescription:\n${(description || '').substring(0, 4000)}\n\nRequirements:\n${reqText}\n\nExtract required skills (must-have vs nice-to-have), experience range, responsibilities, red flags, salary assessment, company culture signals, seniority level, and a summary.`
    );
    return result;
  } catch (err) {
    console.error('Job analysis failed:', err.message);
    throw new Error('Failed to analyze job description. Please try again.');
  }
}

module.exports = { analyzeJobDescription, JobAnalysisSchema };
