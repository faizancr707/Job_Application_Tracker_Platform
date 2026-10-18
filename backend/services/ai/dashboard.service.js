/**
 * AI Dashboard Insights Service
 * Analyzes application data for actionable career insights
 */
const { z } = require('zod');

let _llm = null;
function getLLM() {
  if (!_llm) { const { fastModel } = require('./llm.service'); _llm = fastModel; }
  return _llm;
}

const InsightsSchema = z.object({
  successRate: z.object({
    percentage: z.number(),
    assessment: z.string(),
  }),
  rejectionPatterns: z.array(z.object({
    pattern: z.string(),
    frequency: z.string(),
    suggestion: z.string(),
  })),
  skillDemandTrends: z.array(z.object({
    skill: z.string(),
    demandLevel: z.enum(['high', 'medium', 'low']),
    userHasIt: z.boolean(),
  })),
  followUpReminders: z.array(z.object({
    jobTitle: z.string(),
    company: z.string(),
    daysPending: z.number(),
    suggestion: z.string(),
  })),
  nextSteps: z.array(z.string()).describe('Top 3 actionable recommendations'),
  weeklyGoal: z.string().describe('Suggested goal for the week'),
});

/**
 * Generate AI dashboard insights from user data
 * @param {object} data - User application data
 */
async function generateDashboardInsights(data) {
  const llm = getLLM();
  const { applicationStats, appliedJobsSummary, userSkills, savedJobsCount } = data;

  try {
    const structuredLLM = llm.withStructuredOutput(InsightsSchema);
    const result = await structuredLLM.invoke(
      `Analyze this job seeker's data and provide actionable insights.\n\nApplication Stats:\n${JSON.stringify(applicationStats)}\n\nApplied Jobs:\n${appliedJobsSummary}\n\nUser Skills: ${(userSkills || []).join(', ')}\nSaved Jobs: ${savedJobsCount}\n\nProvide: success rate analysis, rejection patterns (if any), skill demand trends, follow-up reminders for pending apps > 7 days, top 3 next steps, and a weekly goal.`
    );
    return result;
  } catch (err) {
    console.error('Dashboard insights failed:', err.message);
    return {
      successRate: { percentage: 0, assessment: 'Unable to calculate' },
      rejectionPatterns: [],
      skillDemandTrends: [],
      followUpReminders: [],
      nextSteps: ['Continue applying to positions matching your skills'],
      weeklyGoal: 'Apply to at least 5 new positions this week',
    };
  }
}

module.exports = { generateDashboardInsights };
