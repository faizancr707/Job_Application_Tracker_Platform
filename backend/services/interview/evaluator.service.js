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

function fallbackEvaluateAnswer(question, questionType, expectedTopics = [], answer = '') {
  const text = (answer || '').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  let score = 5;
  if (wordCount >= 20) score += 1;
  if (wordCount >= 45) score += 1;
  if (wordCount >= 80) score += 1;
  
  const lower = text.toLowerCase();
  const matched = (expectedTopics || []).filter(t => lower.includes(t.toLowerCase()));
  if (matched.length > 0) score += 1;
  score = Math.min(score, 9);

  const strengths = [];
  if (wordCount >= 40) {
    strengths.push('Provided a structured explanation with relevant context and details.');
  } else {
    strengths.push('Direct, concise answer that addresses the core premise of the question.');
  }
  if (matched.length > 0) {
    strengths.push(`Accurately addressed key domain concepts: ${matched.join(', ')}.`);
  } else {
    strengths.push('Communicated problem-solving mindset and clear reasoning.');
  }

  const weaknesses = [];
  if (wordCount < 40) {
    weaknesses.push('Could be more comprehensive by including concrete real-world examples.');
  }
  if (matched.length < (expectedTopics?.length || 0)) {
    const missing = (expectedTopics || []).filter(t => !lower.includes(t.toLowerCase())).slice(0, 3);
    if (missing.length > 0) {
      weaknesses.push(`Consider touching on related topics: ${missing.join(', ')}.`);
    }
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Could include quantifiable metrics (e.g. latency improvement, percentage gains).');
  }

  const tips = [
    'Use the STAR framework (Situation, Task, Action, Result) to organize answers.',
    'Highlight production architectural trade-offs and edge cases.',
    'Mention testing strategies, reliability, or scalability implications.'
  ];

  const improvedAnswer = `In addressing this, I begin by clarifying the key constraints and objective. For ${question.toLowerCase().replace(/[?.]/g, '')}, standard best practice involves utilizing ${(expectedTopics && expectedTopics.length > 0) ? expectedTopics.join(', ') : 'modular design patterns'} to ensure high performance, maintainability, and fault tolerance. In past implementations, prioritizing systematic testing and clean architectural boundaries resulted in reliable, scalable deliverables.`;

  return {
    score,
    strengths,
    weaknesses,
    improvedAnswer,
    tips
  };
}

function fallbackSummarizeSession(questions, answers, evaluations) {
  const scores = (evaluations || []).map(e => (typeof e?.score === 'number' ? e.score : 7));
  const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / (scores.length * 10)) * 100) : 75;
  const passed = avgScore >= 70;

  return {
    overallScore: avgScore,
    passed,
    summary: `Candidate completed ${questions.length} interview questions with an overall score of ${avgScore}%. Displayed good technical readiness and clear problem decomposition.`,
    strongAreas: [
      'Structured thinking and domain knowledge',
      'Clarity in conceptual articulation and problem breakdown',
      'Good awareness of core software engineering best practices'
    ],
    improvementAreas: [
      'Incorporating quantifiable business and performance metrics',
      'Articulating architectural trade-offs under high-scale conditions',
      'Expanding on edge-case recovery and automated test coverage'
    ],
    nextSteps: [
      'Practice timed mock interviews focusing on concise STAR-format responses',
      'Review system design patterns and distributed cache strategies',
      'Deepen knowledge of real-world latency optimization techniques'
    ]
  };
}

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
    console.warn('Answer evaluation LLM failed, using fallback:', err.message);
    return fallbackEvaluateAnswer(question, questionType, expectedTopics, answer);
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
    console.warn('Session summary LLM failed, using fallback:', err.message);
    return fallbackSummarizeSession(questions, answers, evaluations);
  }
}

module.exports = { evaluateAnswer, summarizeSession, fallbackEvaluateAnswer, fallbackSummarizeSession };
