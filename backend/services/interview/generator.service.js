/**
 * Interview Question Generator Service
 */
const { z } = require('zod');

let _llm = null;
function getLLM() {
  if (!_llm) { const { primaryModel } = require('../ai/llm.service'); _llm = primaryModel; }
  return _llm;
}

const QuestionSetSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    type: z.string(),
    difficulty: z.enum(['junior', 'mid', 'senior']),
    expectedTopics: z.array(z.string()),
    timeLimit: z.number().describe('Suggested time in minutes'),
    hints: z.array(z.string()),
  })),
});

/**
 * Generate interview questions
 * @param {object} params
 * @param {string} params.type - 'technical'|'behavioral'|'hr'|'system_design'
 * @param {string} params.difficulty - 'junior'|'mid'|'senior'
 * @param {string} params.jobTitle
 * @param {string} params.jobRequirements
 * @param {string[]} params.candidateSkills
 * @param {number} [params.count=5]
 */
async function generateQuestions({ type, difficulty, jobTitle, jobRequirements, candidateSkills, count = 5 }) {
  const llm = getLLM();
  const reqText = Array.isArray(jobRequirements) ? jobRequirements.join(', ') : (jobRequirements || '');
  const skills = (candidateSkills || []).join(', ');

  try {
    const structuredLLM = llm.withStructuredOutput(QuestionSetSchema);
    const result = await structuredLLM.invoke(
      `Generate ${count} ${type} interview questions.\n\nDifficulty: ${difficulty}\nJob Title: ${jobTitle}\nRequirements: ${reqText}\nCandidate Skills: ${skills}\n\nFor each question provide: the question text, type, difficulty, expected topics to cover, time limit in minutes, and helpful hints.`
    );
    return result.questions;
  } catch (err) {
    console.error('Question generation failed:', err.message);
    throw new Error('Failed to generate interview questions.');
  }
}

module.exports = { generateQuestions, QuestionSetSchema };
