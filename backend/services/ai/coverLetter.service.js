/**
 * Cover Letter Generation Service
 * Generates personalized, tailored cover letters with LLM + robust fallback
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

function fallbackGenerateCoverLetter(candidateData, jobData, tone = 'professional') {
  const name = candidateData.name || 'Candidate';
  const company = jobData.companyName || 'Hiring Team';
  const role = jobData.title || 'the open position';
  const rawSkills = Array.isArray(candidateData.skills)
    ? candidateData.skills
    : (typeof candidateData.skills === 'string' ? candidateData.skills.split(/[,;]+/) : []);
  const skillsList = rawSkills.length > 0
    ? rawSkills.slice(0, 4).join(', ')
    : 'software engineering, scalable architecture, and full-stack development';

  let greeting = `Dear Hiring Team at ${company},`;
  let opening = `I am excited to submit my application for the ${role} position at ${company}. With my background in ${skillsList}, I am eager to contribute to your engineering initiatives and help build high-impact solutions.`;
  let body = `Throughout my development journey, I have prioritized writing clean, maintainable code and solving complex technical challenges efficiently. What draws me to ${company} is your reputation for technical innovation and quality product delivery. My expertise in ${skillsList} enables me to ramp up quickly, collaborate productively with cross-functional teams, and deliver robust outcomes that align with your strategic roadmap.`;
  let closing = `I would welcome the opportunity to discuss how my technical skills and enthusiasm can benefit ${company} in the ${role} role. Thank you very much for your time and consideration.`;
  let signoff = `Sincerely,\n${name}`;

  if (tone === 'conversational') {
    greeting = `Hi ${company} Team,`;
    opening = `I was thrilled to see the ${role} opening at ${company}! Having focused my work around ${skillsList}, I immediately felt that this role aligns naturally with my passions and technical strengths.`;
    body = `I love collaborating with thoughtful teams to build great software that users enjoy. What particularly stands out to me about ${company} is the culture of momentum and product excellence. With hands-on experience in ${skillsList}, I am ready to jump in, learn fast, and make meaningful contributions to your core engineering objectives.`;
    closing = `I would love the opportunity to connect and chat more about what you're working on and how I can help. Thanks so much for considering my application!`;
    signoff = `Warm regards,\n${name}`;
  } else if (tone === 'creative') {
    greeting = `Hello to the Innovators at ${company},`;
    opening = `When ambitious product vision meets disciplined engineering, remarkable digital experiences come to life. That is precisely why the ${role} opening at ${company} resonated with me.`;
    body = `As an engineer energized by complex problem-solving, my toolkit grounded in ${skillsList} enables me to bridge creative design with performant, reliable architecture. I deeply respect ${company}'s creative ambition and technological drive, and I would love to bring my proactive mindset and technical craft to your team.`;
    closing = `I look forward to discussing how we can create something exceptional together. Thank you for your review!`;
    signoff = `Best regards,\n${name}`;
  }

  const coverLetter = `${greeting}\n\n${opening}\n\n${body}\n\n${closing}\n\n${signoff}`;
  const keyPointsUsed = [
    `Proficiency in ${skillsList}`,
    `Strategic alignment with ${company}'s engineering values for the ${role} opening`,
    `Demonstrated track record of clean code, rapid onboarding, and proactive teamwork`
  ];

  return {
    coverLetter,
    keyPointsUsed,
    tone
  };
}

/**
 * Generate a cover letter using candidate data
 */
async function generateCoverLetter(candidateData, jobData, tone = 'professional') {
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
    const llm = getLLM();
    const structuredLLM = llm.withStructuredOutput(CoverLetterSchema);
    const result = await structuredLLM.invoke(
      `Write a ${tone} cover letter. CRITICAL: ONLY reference experiences, skills, and qualifications that are EXPLICITLY listed below. NEVER fabricate or embellish.\n\n=== CANDIDATE ===\nName: ${candidateData.name || 'Unknown'}\nEmail: ${candidateData.email || ''}\nPhone: ${candidateData.phone || ''}\nSummary: ${candidateData.summary || ''}\nSkills: ${skills}\nExperience:\n${experience || 'Not provided'}\nEducation: ${education || 'Not provided'}\n\n=== TARGET JOB ===\nTitle: ${jobData.title}\nCompany: ${jobData.companyName || 'the company'}\nDescription: ${(jobData.description || '').substring(0, 2000)}\nRequirements: ${jobReqs}\n\nWrite a compelling cover letter under 400 words. Reference only actual experiences from above. List the key resume points you highlighted.`
    );
    return result;
  } catch (err) {
    console.warn('LLM cover letter generation unavailable, using intelligent fallback generator:', err.message);
    return fallbackGenerateCoverLetter(candidateData, jobData, tone);
  }
}

module.exports = { generateCoverLetter, CoverLetterSchema };
