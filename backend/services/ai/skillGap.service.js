/**
 * Skill Gap Analysis Service
 * Identifies missing skills across target jobs and provides learning priorities
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

const SkillGapSchema = z.object({
  criticalGaps: z.array(z.object({
    skill: z.string(),
    demandPercentage: z.number().describe('Percentage of target jobs requiring this skill'),
    currentLevel: z.enum(['none', 'beginner', 'intermediate']),
    requiredLevel: z.enum(['intermediate', 'advanced', 'expert']),
    estimatedLearningTime: z.string().describe('e.g. 2-4 weeks'),
    resources: z.array(z.object({
      type: z.enum(['course', 'project', 'certification', 'book']),
      suggestion: z.string(),
    })),
  })).describe('Skills appearing in 70%+ of target jobs that user lacks'),
  importantGaps: z.array(z.object({
    skill: z.string(),
    demandPercentage: z.number(),
    currentLevel: z.enum(['none', 'beginner', 'intermediate']),
    requiredLevel: z.enum(['intermediate', 'advanced', 'expert']),
    estimatedLearningTime: z.string(),
    resources: z.array(z.object({
      type: z.enum(['course', 'project', 'certification', 'book']),
      suggestion: z.string(),
    })),
  })).describe('Skills appearing in 40-70% of target jobs'),
  niceToHave: z.array(z.object({
    skill: z.string(),
    demandPercentage: z.number(),
  })).describe('Skills appearing in less than 40% of jobs'),
  strengths: z.array(z.string()).describe('Skills the user already has that are in high demand'),
  overallReadiness: z.number().min(0).max(100).describe('How ready the user is for their target roles'),
  learningPlan: z.string().describe('Suggested 3-month learning plan summary'),
});

/**
 * Analyze skill gaps between user skills and target jobs
 * @param {string[]} currentSkills - User's current skills
 * @param {string} currentExperience - Summary of user experience
 * @param {Array<{title: string, requirements: string}>} targetJobs - Jobs to analyze against
 * @returns {Promise<object>} Skill gap analysis
 */
async function analyzeSkillGap(currentSkills, currentExperience, targetJobs) {
  const llm = getLLM();
  const jobsSummary = targetJobs
    .map((j, i) => `${i + 1}. ${j.title}: ${j.requirements}`)
    .join('\n');

  try {
    const structuredLLM = llm.withStructuredOutput(SkillGapSchema);
    const result = await structuredLLM.invoke(
      `Analyze the skill gap for this candidate:\n\nCurrent Skills: ${currentSkills.join(', ')}\nCurrent Experience: ${currentExperience}\n\nTarget Jobs (${targetJobs.length} jobs):\n${jobsSummary}\n\nIdentify:\n1. Critical gaps (70%+ of jobs require, user lacks)\n2. Important gaps (40-70% of jobs)\n3. Nice-to-have (less than 40%)\n4. Strengths (skills user has that are in demand)\n5. Overall readiness score\n6. A 3-month learning plan`
    );
    return result;
  } catch (err) {
    console.error('Skill gap analysis failed:', err.message);
    throw new Error('Failed to analyze skill gaps. Please try again.');
  }
}

module.exports = { analyzeSkillGap, SkillGapSchema };
