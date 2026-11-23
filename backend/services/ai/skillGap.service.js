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

function fallbackAnalyzeSkillGap(currentSkills = [], currentExperience = '', targetJobs = []) {
  const skillsSet = new Set((currentSkills || []).map(s => String(s).toLowerCase().trim()));
  
  const techCatalog = [
    { skill: 'Docker & Kubernetes', category: 'DevOps & Cloud', learningTime: '2-3 weeks', demand: 85 },
    { skill: 'TypeScript', category: 'Languages', learningTime: '1-2 weeks', demand: 80 },
    { skill: 'System Design & Distributed Systems', category: 'Architecture', learningTime: '3-4 weeks', demand: 75 },
    { skill: 'GraphQL & Microservices', category: 'Backend', learningTime: '2 weeks', demand: 70 },
    { skill: 'CI/CD Pipelines (GitHub Actions)', category: 'DevOps', learningTime: '1 week', demand: 65 },
    { skill: 'Redis Caching & Data Structures', category: 'Database', learningTime: '1-2 weeks', demand: 60 },
    { skill: 'Unit & Integration Testing (Jest/Cypress)', category: 'Testing', learningTime: '1-2 weeks', demand: 55 },
    { skill: 'AWS / Cloud Architecture', category: 'Cloud', learningTime: '3-4 weeks', demand: 50 },
    { skill: 'Next.js & SSR Optimization', category: 'Frontend', learningTime: '1-2 weeks', demand: 45 },
    { skill: 'Kafka / Event Streaming', category: 'Distributed Systems', learningTime: '2-3 weeks', demand: 35 }
  ];

  const strengths = [];
  const criticalGaps = [];
  const importantGaps = [];
  const niceToHave = [];

  techCatalog.forEach(item => {
    const isPresent = skillsSet.has(item.skill.toLowerCase()) || 
                      Array.from(skillsSet).some(s => item.skill.toLowerCase().includes(s) || s.includes(item.skill.toLowerCase()));

    if (isPresent) {
      strengths.push(item.skill);
    } else {
      const gapObj = {
        skill: item.skill,
        demandPercentage: item.demand,
        currentLevel: 'none',
        requiredLevel: item.demand >= 75 ? 'advanced' : 'intermediate',
        estimatedLearningTime: item.learningTime,
        resources: [
          { type: 'project', suggestion: `Build a production service implementing ${item.skill}` },
          { type: 'course', suggestion: `Comprehensive masterclass on ${item.skill}` }
        ]
      };

      if (item.demand >= 70) {
        criticalGaps.push(gapObj);
      } else if (item.demand >= 45) {
        importantGaps.push(gapObj);
      } else {
        niceToHave.push({ skill: item.skill, demandPercentage: item.demand });
      }
    }
  });

  if (strengths.length === 0 && currentSkills.length > 0) {
    strengths.push(...currentSkills.slice(0, 4));
  }

  const readiness = Math.min(95, Math.max(55, Math.round(50 + (strengths.length * 8) - (criticalGaps.length * 4))));

  return {
    criticalGaps: criticalGaps.slice(0, 3),
    importantGaps: importantGaps.slice(0, 3),
    niceToHave: niceToHave.slice(0, 3),
    strengths: strengths.length > 0 ? strengths : ['JavaScript', 'React', 'Problem Solving'],
    overallReadiness: readiness,
    learningPlan: 'Month 1: Address core critical gaps including Docker containerization and TypeScript.\nMonth 2: Implement Redis caching, CI/CD automated deployment pipelines, and comprehensive testing.\nMonth 3: Build high-concurrency system design architectures and deploy cloud-native microservices.'
  };
}

/**
 * Analyze skill gaps between user skills and target jobs
 * @param {string[]} currentSkills - User's current skills
 * @param {string} currentExperience - Summary of user experience
 * @param {Array<{title: string, requirements: string}>} targetJobs - Jobs to analyze against
 * @returns {Promise<object>} Skill gap analysis
 */
async function analyzeSkillGap(currentSkills, currentExperience, targetJobs) {
  const llm = getLLM();
  const jobsSummary = (targetJobs || [])
    .map((j, i) => `${i + 1}. ${j.title}: ${j.requirements}`)
    .join('\n');

  try {
    const structuredLLM = llm.withStructuredOutput(SkillGapSchema);
    const result = await structuredLLM.invoke(
      `Analyze the skill gap for this candidate:\n\nCurrent Skills: ${(currentSkills || []).join(', ')}\nCurrent Experience: ${currentExperience}\n\nTarget Jobs (${(targetJobs || []).length} jobs):\n${jobsSummary}\n\nIdentify:\n1. Critical gaps (70%+ of jobs require, user lacks)\n2. Important gaps (40-70% of jobs)\n3. Nice-to-have (less than 40%)\n4. Strengths (skills user has that are in demand)\n5. Overall readiness score\n6. A 3-month learning plan`
    );
    return result;
  } catch (err) {
    console.warn('Skill gap analysis LLM failed, using fallback:', err.message);
    return fallbackAnalyzeSkillGap(currentSkills, currentExperience, targetJobs);
  }
}

module.exports = { analyzeSkillGap, fallbackAnalyzeSkillGap, SkillGapSchema };
