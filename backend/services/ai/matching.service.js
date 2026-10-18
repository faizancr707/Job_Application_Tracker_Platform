/**
 * Resume-vs-Job Matching Service
 * Hybrid matching: vector similarity + LLM structured analysis
 */
const { z } = require('zod');
const { queryDocuments } = require('../ai/vectorStore.service');

let _llm = null;
function getLLM() {
  if (!_llm) {
    const { primaryModel } = require('./llm.service');
    _llm = primaryModel;
  }
  return _llm;
}

const MatchResultSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall match score'),
  matchedSkills: z.array(z.object({
    skill: z.string(),
    proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    evidence: z.string().describe('Evidence from resume'),
  })).describe('Skills the candidate has that match requirements'),
  missingSkills: z.array(z.object({
    skill: z.string(),
    importance: z.enum(['critical', 'important', 'optional']),
    learnability: z.enum(['easy', 'moderate', 'hard']),
  })).describe('Required skills the candidate lacks'),
  partialMatches: z.array(z.object({
    skill: z.string().describe('Required skill'),
    userSkill: z.string().describe('Candidate\'s related skill'),
    similarity: z.number().min(0).max(100),
    gap: z.string().describe('What the gap is'),
  })).describe('Partially matching skills'),
  experienceMatch: z.object({
    required: z.string(),
    actual: z.string(),
    score: z.number().min(0).max(100),
    assessment: z.string(),
  }),
  educationMatch: z.object({
    required: z.string(),
    actual: z.string(),
    score: z.number().min(0).max(100),
    assessment: z.string(),
  }),
  explanation: z.string().describe('Detailed match explanation'),
  recommendations: z.array(z.string()).describe('Actionable recommendations'),
});

/**
 * Match a resume against a job description
 * @param {object} resumeData - Parsed resume data
 * @param {object} jobData - Job details
 * @param {number} userId - User ID for vector store queries
 * @returns {Promise<object>} Match result
 */
async function matchResumeToJob(resumeData, jobData, userId) {
  const llm = getLLM();
  const candidateSkills = (resumeData.skills || []).join(', ');
  const candidateExp = (resumeData.experience || [])
    .map(e => `${e.title} at ${e.company} (${e.duration})`)
    .join('; ');
  const candidateEdu = (resumeData.education || [])
    .map(e => `${e.degree} from ${e.institution}`)
    .join('; ');
  const jobReqs = Array.isArray(jobData.requirements)
    ? jobData.requirements.join(', ')
    : (jobData.requirements || '');

  try {
    const structuredLLM = llm.withStructuredOutput(MatchResultSchema);
    const result = await structuredLLM.invoke(
      `Match this resume against the job description. ONLY reference skills and experiences EXPLICITLY stated in the resume. Never invent or assume skills.\n\n=== RESUME ===\nName: ${resumeData.name || 'Unknown'}\nSkills: ${candidateSkills || 'Not listed'}\nExperience: ${candidateExp || 'Not listed'}\nEducation: ${candidateEdu || 'Not listed'}\nSummary: ${resumeData.summary || 'Not provided'}\n\n=== JOB ===\nTitle: ${jobData.title}\nCompany: ${jobData.companyName || 'Unknown'}\nRequirements: ${jobReqs}\nDescription: ${(jobData.description || '').substring(0, 3000)}\nExperience Level: ${jobData.experienceLevel || 'Not specified'}\n\nProvide: overall match score (0-100), matched skills with evidence, missing skills with importance, partial matches, experience match, education match, detailed explanation, and recommendations.`
    );
    return result;
  } catch (err) {
    console.error('Matching failed:', err.message);
    throw new Error('Failed to match resume to job. Please try again.');
  }
}

module.exports = { matchResumeToJob, MatchResultSchema };
