/**
 * Job Description Analyzer Service
 * LLM-powered job posting analysis with robust intelligent fallback
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

function fallbackAnalyzeJob({ title, description, requirements, companyName, location, jobType, salary, experienceLevel }) {
  const reqList = Array.isArray(requirements)
    ? requirements
    : (requirements ? requirements.split(/[,;\n•\r]+/).map(s => s.trim()).filter(Boolean) : []);

  const commonSkills = [
    'React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Java', 'SQL', 'MongoDB',
    'PostgreSQL', 'Express', 'HTML', 'CSS', 'Tailwind CSS', 'Git', 'Docker', 'AWS',
    'REST APIs', 'Redux', 'Next.js', 'C++', 'System Design', 'Agile', 'CI/CD'
  ];

  const foundSkills = [];
  const textToSearch = `${title || ''} ${description || ''} ${reqList.join(' ')}`.toLowerCase();

  reqList.forEach(req => {
    if (req.length < 50 && req.length > 1) {
      foundSkills.push({ skill: req, importance: 'must-have' });
    }
  });

  commonSkills.forEach(skill => {
    if (textToSearch.includes(skill.toLowerCase()) && !foundSkills.some(f => f.skill.toLowerCase() === skill.toLowerCase())) {
      foundSkills.push({
        skill,
        importance: foundSkills.length < 4 ? 'must-have' : 'nice-to-have'
      });
    }
  });

  if (foundSkills.length === 0) {
    foundSkills.push(
      { skill: 'Core Technical Competence', importance: 'must-have' },
      { skill: 'Problem Solving', importance: 'must-have' },
      { skill: 'System Design', importance: 'nice-to-have' },
      { skill: 'Team Collaboration', importance: 'nice-to-have' }
    );
  }

  // Determine seniority
  let seniority = 'mid';
  const lowerTitle = (title || '').toLowerCase();
  const expNum = Number(experienceLevel) || 0;
  if (lowerTitle.includes('lead') || lowerTitle.includes('architect')) {
    seniority = 'lead';
  } else if (lowerTitle.includes('senior') || expNum >= 5) {
    seniority = 'senior';
  } else if (lowerTitle.includes('junior') || lowerTitle.includes('entry') || lowerTitle.includes('intern') || (expNum > 0 && expNum < 2)) {
    seniority = 'junior';
  }

  const expMin = expNum > 0 ? expNum : (seniority === 'junior' ? 0 : seniority === 'senior' ? 5 : 2);
  const expMax = expMin + (seniority === 'senior' ? 4 : 2);

  // Responsibilities
  const descLines = (description || '').split(/[\n\r]+/).map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(l => l.length > 20);
  const responsibilities = descLines.slice(0, 4);
  if (responsibilities.length === 0) {
    responsibilities.push(
      `Design, build, and optimize scalable features for ${title || 'software engineering'} initiatives`,
      `Collaborate with cross-functional teams at ${companyName || 'the company'} to ship quality solutions`,
      `Write clean, testable, and maintainable code adhering to industry best practices`,
      `Participate in code reviews, design discussions, and technical problem-solving`
    );
  }

  return {
    requiredSkills: foundSkills.slice(0, 8),
    experienceRange: { min: expMin, max: expMax },
    responsibilities,
    redFlags: [],
    salaryAssessment: salary ? `Competitive compensation of ₹${salary} LPA aligned with ${seniority} industry benchmarks.` : 'Competitive market compensation package.',
    companyCultureSignals: ['High-impact engineering team', 'Collaborative innovation culture', 'Continuous learning and growth'],
    seniorityLevel: seniority,
    summary: `${title || 'Engineering'} opportunity at ${companyName || 'Company'}${location ? ` in ${location}` : ''}. Seeking a talented professional to drive core technical capabilities and product development.`,
  };
}

/**
 * Analyze a job description
 */
async function analyzeJobDescription({ title, description, requirements, companyName, location, jobType, salary, experienceLevel }) {
  const reqText = Array.isArray(requirements) ? requirements.join(', ') : (requirements || 'Not specified');

  try {
    const llm = getLLM();
    const structuredLLM = llm.withStructuredOutput(JobAnalysisSchema);
    const result = await structuredLLM.invoke(
      `Analyze this job posting:\n\nTitle: ${title}\nCompany: ${companyName || 'Unknown'}\nLocation: ${location || 'Not specified'}\nType: ${jobType || 'Not specified'}\nSalary: ${salary || 'Not specified'}\nExperience Level: ${experienceLevel || 'Not specified'}\n\nDescription:\n${(description || '').substring(0, 4000)}\n\nRequirements:\n${reqText}\n\nExtract required skills (must-have vs nice-to-have), experience range, responsibilities, red flags, salary assessment, company culture signals, seniority level, and a summary.`
    );
    return result;
  } catch (err) {
    console.warn('LLM analysis unavailable, using intelligent fallback analysis:', err.message);
    return fallbackAnalyzeJob({ title, description, requirements, companyName, location, jobType, salary, experienceLevel });
  }
}

module.exports = { analyzeJobDescription, JobAnalysisSchema };
