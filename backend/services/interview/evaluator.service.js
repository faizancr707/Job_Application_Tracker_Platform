/**
 * Interview Answer Evaluator Service
 */
const { z } = require('zod');

let _llm = null;
function getLLM() {
  if (!_llm) { const { primaryModel } = require('../ai/llm.service'); _llm = primaryModel; }
  return _llm;
}

const EvaluationSchema = z.object({
  score: z.number().min(1).max(10),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvedAnswer: z.string().describe('An ideal answer'),
  tips: z.array(z.string()).describe('Specific improvement tips'),
});

const SessionSummarySchema = z.object({
  overallScore: z.number().min(0).max(100),
  passed: z.boolean(),
  summary: z.string(),
  strongAreas: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

/**
 * Evaluate a single interview answer
 */
async function evaluateAnswer(question, questionType, expectedTopics, answer) {
  const llm = getLLM();
  try {
    const structuredLLM = llm.withStructuredOutput(EvaluationSchema);
    const result = await structuredLLM.invoke(
      `Evaluate this interview answer.\n\nQuestion: ${question}\nType: ${questionType}\nExpected Topics: ${(expectedTopics || []).join(', ')}\n\nCandidate Answer:\n${answer}\n\nScore 1-10, list strengths, weaknesses, provide an improved answer, and specific tips.`
    );
    return result;
  } catch (err) {
    console.error('Answer evaluation failed:', err.message);
    throw new Error('Failed to evaluate answer.');
  }
}

/**
 * Generate overall session summary
 */
async function summarizeSession(questions, answers, evaluations) {
  const llm = getLLM();
  const details = questions.map((q, i) => (
    `Q${i + 1}: ${q.question}\nAnswer: ${answers[i] || 'No answer'}\nScore: ${evaluations[i]?.score || 'N/A'}/10`
  )).join('\n\n');

  try {
    const structuredLLM = llm.withStructuredOutput(SessionSummarySchema);
    return await structuredLLM.invoke(
      `Summarize this mock interview session:\n\n${details}\n\nProvide overall score (0-100), pass/fail (70+ = pass), summary, strong areas, improvement areas, and next steps.`
    );
  } catch (err) {
    console.error('Session summary failed:', err.message);
    return { overallScore: 0, passed: false, summary: 'Unable to generate summary.', strongAreas: [], improvementAreas: [], nextSteps: [] };
  }
}

module.exports = { evaluateAnswer, summarizeSession };
