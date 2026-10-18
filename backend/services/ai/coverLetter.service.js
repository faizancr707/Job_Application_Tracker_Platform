/**
 * Cover Letter Generation Service
 * Uses ONLY verified user data — no hallucination
 */
const { z } = require('zod');

let _llm = null;
function getLLM() {
  if (!_llm) {
    const { primaryModel } = require('./llm.service');
    _llm = primaryModel;
  }
  return _llm;
}

const CoverLetterSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter text'),
  keyPointsUsed: z.array(z.string()).describe('Key points from resume that were highlighted'),
  tone: z.string().describe('The tone used'),
});

/**
 * Generate a cover letter using only verified candidate data
 * @param {object} candidateData - Resume parsed data + user profile
 * @param {object} jobData - Target job details
 * @param {string} [tone='professional'] - Tone: professional, conversational, creative
 * @returns {Promise<object>} Generated cover letter
 */
async function generateCoverLetter(candidateData, jobData, tone = 'professional') {
  const llm = getLLM();
  const skills = (candidateData.skills || []).join(', ');
  const experience = (candidateData.experience || [])
    .map(e => `${e.title} at ${e.company} (${e.duration}): ${e.description}`)
    .join('\n');
  const education = (candidateData.education || [])
    .map(e => `${e.degree} from ${e.institution} (${e.year})`)
    .join('; ');
  const jobReqs = Array.isArray(jobData.requirements)
    ? jobData.requirements.join(', ')
    : (jobData.requirements || '');

  try {
    const structuredLLM = llm.withStructuredOutput(CoverLetterSchema);
    const result = await structuredLLM.invoke(
      `Write a ${tone} cover letter. CRITICAL: ONLY reference experiences, skills, and qualifications that are EXPLICITLY listed below. NEVER fabricate or embellish.\n\n=== CANDIDATE ===\nName: ${candidateData.name || 'Unknown'}\nEmail: ${candidateData.email || ''}\nPhone: ${candidateData.phone || ''}\nSummary: ${candidateData.summary || ''}\nSkills: ${skills}\nExperience:\n${experience || 'Not provided'}\nEducation: ${education || 'Not provided'}\n\n=== TARGET JOB ===\nTitle: ${jobData.title}\nCompany: ${jobData.companyName || 'the company'}\nDescription: ${(jobData.description || '').substring(0, 2000)}\nRequirements: ${jobReqs}\n\nWrite a compelling cover letter under 400 words. Reference only actual experiences from above. List the key resume points you highlighted.`
    );
    return result;
  } catch (err) {
    console.error('Cover letter generation failed:', err.message);
    throw new Error('Failed to generate cover letter. Please try again.');
  }
}

module.exports = { generateCoverLetter, CoverLetterSchema };
