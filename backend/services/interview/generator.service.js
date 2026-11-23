/**
 * Interview Question Generator Service
 * Generates tailored interview questions via LLM + rich domain question banks as fallback
 */
const { z } = require('zod');

let _llm = null;
function getLLM() {
  if (!_llm) {
    const { primaryModel } = require('../ai/llm.service');
    _llm = primaryModel;
  }
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

const DOMAIN_QUESTIONS = {
  technical: {
    junior: [
      {
        question: "Explain the difference between let, const, and var in JavaScript, and how scoping affects them.",
        type: "JavaScript Fundamentals",
        difficulty: "junior",
        expectedTopics: ["Block scope vs Function scope", "Hoisting behavior", "Re-assignment rules"],
        timeLimit: 3,
        hints: ["Think about what happens inside an if-block or loop", "Consider the temporal dead zone"]
      },
      {
        question: "What is the Virtual DOM in React, and how does reconciliation improve web performance?",
        type: "React Architecture",
        difficulty: "junior",
        expectedTopics: ["DOM manipulation costs", "Diffing algorithm", "Batching state updates"],
        timeLimit: 4,
        hints: ["Explain why real DOM operations are slow", "Mention keys in lists"]
      },
      {
        question: "How do Promises work in JavaScript, and what advantages do async/await syntax offer over callbacks?",
        type: "Asynchronous JavaScript",
        difficulty: "junior",
        expectedTopics: ["Pending/Resolved/Rejected states", "Callback hell prevention", "Error handling with try/catch"],
        timeLimit: 3,
        hints: ["Talk about readability and stack traces in async/await"]
      },
      {
        question: "Explain the difference between SQL and NoSQL databases, and when you would choose one over the other.",
        type: "Databases",
        difficulty: "junior",
        expectedTopics: ["ACID vs BASE", "Structured schemas vs Document models", "Horizontal vs Vertical scaling"],
        timeLimit: 4,
        hints: ["Give examples like PostgreSQL vs MongoDB"]
      },
      {
        question: "What is RESTful API architecture, and what do standard HTTP status codes (200, 201, 400, 401, 404, 500) represent?",
        type: "Backend & APIs",
        difficulty: "junior",
        expectedTopics: ["Stateless communication", "HTTP verbs (GET, POST, PUT, DELETE)", "Client vs Server error codes"],
        timeLimit: 3,
        hints: ["Explain idempotency in GET/PUT vs non-idempotent POST"]
      }
    ],
    mid: [
      {
        question: "Describe how the JavaScript Event Loop handles the call stack, microtask queue, and macrotask queue.",
        type: "Advanced JavaScript",
        difficulty: "mid",
        expectedTopics: ["Single-threaded runtime", "Promises in microtasks", "setTimeout/I/O in macrotasks"],
        timeLimit: 5,
        hints: ["Explain order of execution between a resolved Promise and setTimeout(0)"]
      },
      {
        question: "How would you design a caching strategy using Redis for a read-heavy API service?",
        type: "System Performance",
        difficulty: "mid",
        expectedTopics: ["Cache-aside pattern", "TTL and cache invalidation", "Cache stampede prevention"],
        timeLimit: 5,
        hints: ["Consider write-through vs write-back caching"]
      },
      {
        question: "Explain how React handles re-renders and how you optimize performance using useMemo, useCallback, and React.memo.",
        type: "React Optimization",
        difficulty: "mid",
        expectedTopics: ["Referential equality", "Expensive computations", "Preventing child re-renders"],
        timeLimit: 4,
        hints: ["Mention common pitfalls where premature memoization hurts performance"]
      },
      {
        question: "What strategies do you use for database indexing in SQL, and how do you diagnose slow queries?",
        type: "Database Optimization",
        difficulty: "mid",
        expectedTopics: ["B-Tree indexes", "EXPLAIN execution plans", "Composite indexes and selectivity"],
        timeLimit: 5,
        hints: ["Discuss table scans vs index seeks"]
      },
      {
        question: "How do you securely handle user authentication with JWTs, and how do you protect against XSS and CSRF?",
        type: "Web Security",
        difficulty: "mid",
        expectedTopics: ["HttpOnly SameSite cookies", "Short-lived access tokens + refresh tokens", "CORS policy"],
        timeLimit: 5,
        hints: ["Explain why storing JWTs in localStorage is vulnerable to XSS"]
      }
    ],
    senior: [
      {
        question: "How would you design a distributed rate limiter that handles 100,000 requests per second across multiple data centers?",
        type: "Distributed Systems",
        difficulty: "senior",
        expectedTopics: ["Token bucket / Sliding window algorithms", "Redis cluster with Lua scripts", "Eventual consistency vs Latency"],
        timeLimit: 6,
        hints: ["Consider clock skew and network partitions"]
      },
      {
        question: "Walk through the architectural trade-offs between monolithic, microservices, and modular monolith systems.",
        type: "Architecture",
        difficulty: "senior",
        expectedTopics: ["Operational complexity", "Data consistency & distributed transactions", "Team boundaries & deployment velocity"],
        timeLimit: 6,
        hints: ["Discuss the Saga pattern and event-driven communication"]
      },
      {
        question: "How would you establish zero-downtime deployment pipelines for database schema migrations in high-traffic applications?",
        type: "DevOps & Reliability",
        difficulty: "senior",
        expectedTopics: ["Expand and contract pattern", "Backwards-compatible queries", "Blue-green / Canary deployments"],
        timeLimit: 5,
        hints: ["Explain how to safely add a non-null column or rename a table without locking"]
      }
    ]
  },
  behavioral: {
    junior: [
      {
        question: "Tell me about a challenging bug you encountered in a project, and the step-by-step approach you took to resolve it.",
        type: "Problem Solving",
        difficulty: "junior",
        expectedTopics: ["Root cause analysis", "Debugging tools used", "Lessons learned to prevent recurrence"],
        timeLimit: 4,
        hints: ["Use the STAR method: Situation, Task, Action, Result"]
      },
      {
        question: "Describe a situation where you had to learn a completely new framework or tool under a tight deadline.",
        type: "Adaptability",
        difficulty: "junior",
        expectedTopics: ["Learning strategy", "Prioritizing essential knowledge", "Seeking mentorship or documentation"],
        timeLimit: 4,
        hints: ["Highlight speed of learning and practical delivery"]
      },
      {
        question: "Give an example of a time you received constructive feedback on your code. How did you react and adapt?",
        type: "Teamwork & Growth",
        difficulty: "junior",
        expectedTopics: ["Openness to feedback", "Iterative code review process", "Continuous improvement"],
        timeLimit: 3,
        hints: ["Focus on personal growth and positive collaboration"]
      }
    ],
    mid: [
      {
        question: "Describe a time when you disagreed with a colleague or tech lead on an architectural decision. How did you handle it?",
        type: "Conflict Resolution",
        difficulty: "mid",
        expectedTopics: ["Data-driven argumentation", "Active listening", "Commitment to team consensus (disagree & commit)"],
        timeLimit: 4,
        hints: ["Emphasize professional communication and project goals over ego"]
      },
      {
        question: "Tell me about a project where scope creep or changing requirements threatened delivery. How did you manage expectations?",
        type: "Project Management",
        difficulty: "mid",
        expectedTopics: ["Stakeholder communication", "Trade-off analysis", "MVP scoping"],
        timeLimit: 4,
        hints: ["Highlight proactive updates and transparency"]
      }
    ],
    senior: [
      {
        question: "How do you mentor junior and mid-level engineers to foster technical independence and engineering excellence?",
        type: "Leadership",
        difficulty: "senior",
        expectedTopics: ["Pair programming & code reviews", "Empowerment vs micromanagement", "Creating safe failure environments"],
        timeLimit: 5,
        hints: ["Share concrete examples of engineers you helped grow"]
      }
    ]
  },
  hr: {
    junior: [
      {
        question: "Why are you interested in this position and what makes our company's mission exciting to you?",
        type: "Motivation & Culture",
        difficulty: "junior",
        expectedTopics: ["Company research", "Career alignment", "Genuine passion for the domain"],
        timeLimit: 3,
        hints: ["Connect your personal values with the company's product"]
      },
      {
        question: "Where do you see yourself professionally in the next 2 to 3 years?",
        type: "Career Goals",
        difficulty: "junior",
        expectedTopics: ["Skill mastery", "Increasing technical ownership", "Long-term commitment"],
        timeLimit: 3,
        hints: ["Be realistic and demonstrate ambition for mastery"]
      }
    ],
    mid: [
      {
        question: "What workplace environment allows you to do your most impactful work, and how do you stay productive?",
        type: "Work Culture",
        difficulty: "mid",
        expectedTopics: ["Autonomous execution", "Communication habits", "Work-life balance and focus"],
        timeLimit: 3,
        hints: ["Show self-awareness and strong time management"]
      }
    ],
    senior: [
      {
        question: "What leadership values guide your decisions when navigating organizational change or high-stakes deadlines?",
        type: "Executive Alignment",
        difficulty: "senior",
        expectedTopics: ["Transparency", "Calm under pressure", "People-first problem solving"],
        timeLimit: 4,
        hints: ["Emphasize empathy combined with accountability"]
      }
    ]
  },
  system_design: {
    junior: [
      {
        question: "How would you design a URL shortener service like TinyURL from a high-level perspective?",
        type: "System Design",
        difficulty: "junior",
        expectedTopics: ["Hashing / Base62 encoding", "Database choice (Key-Value)", "Handling redirects (301 vs 302)"],
        timeLimit: 5,
        hints: ["Discuss read/write ratios and collision handling"]
      }
    ],
    mid: [
      {
        question: "Design an image upload and processing service for an e-commerce platform handling 50k uploads daily.",
        type: "System Design",
        difficulty: "mid",
        expectedTopics: ["Asynchronous worker queues", "Object storage (S3) with CDN", "Resizing & compression pipeline"],
        timeLimit: 6,
        hints: ["Avoid blocking API threads on heavy image resizing"]
      },
      {
        question: "Design a real-time notification system supporting in-app push, emails, and SMS alerts.",
        type: "System Design",
        difficulty: "mid",
        expectedTopics: ["WebSockets / Server-Sent Events", "Message brokers (Kafka/RabbitMQ)", "Deduplication & rate limiting"],
        timeLimit: 6,
        hints: ["Consider delivery guarantees: at-least-once vs at-most-once"]
      }
    ],
    senior: [
      {
        question: "Design a global real-time chat application like WhatsApp or Slack with group messaging, status presence, and message history.",
        type: "Distributed Architecture",
        difficulty: "senior",
        expectedTopics: ["WebSocket gateways with connection managers", "Pub/Sub clusters (Redis/Kafka)", "Cassandra/ScyllaDB for message storage", "Presence servers with heartbeats"],
        timeLimit: 7,
        hints: ["Address message ordering with sequence numbers and offline message queuing"]
      }
    ]
  }
};

function fallbackGenerateQuestions({ type, difficulty, jobTitle, count = 5 }) {
  const normalizedType = DOMAIN_QUESTIONS[type] ? type : 'technical';
  const normalizedDiff = ['junior', 'mid', 'senior'].includes(difficulty) ? difficulty : 'mid';

  const typeBank = DOMAIN_QUESTIONS[normalizedType] || DOMAIN_QUESTIONS.technical;
  let bank = typeBank[normalizedDiff] || typeBank.mid || [];

  if (bank.length < count) {
    // Combine across difficulties if needed
    const allDiffs = Object.values(typeBank).flat();
    bank = allDiffs;
  }

  return bank.slice(0, count).map(q => ({
    ...q,
    difficulty: normalizedDiff,
  }));
}

/**
 * Generate interview questions
 */
async function generateQuestions({ type, difficulty, jobTitle, jobRequirements, candidateSkills, count = 5 }) {
  const reqText = Array.isArray(jobRequirements) ? jobRequirements.join(', ') : (jobRequirements || '');
  const skills = (candidateSkills || []).join(', ');

  try {
    const llm = getLLM();
    const structuredLLM = llm.withStructuredOutput(QuestionSetSchema);
    const result = await structuredLLM.invoke(
      `Generate ${count} ${type} interview questions.\n\nDifficulty: ${difficulty}\nJob Title: ${jobTitle}\nRequirements: ${reqText}\nCandidate Skills: ${skills}\n\nFor each question provide: the question text, type, difficulty, expected topics to cover, time limit in minutes, and helpful hints.`
    );
    if (result && Array.isArray(result.questions) && result.questions.length > 0) {
      return result.questions;
    }
    return fallbackGenerateQuestions({ type, difficulty, jobTitle, count });
  } catch (err) {
    console.warn('LLM interview question generation failed, using curated question bank:', err.message);
    return fallbackGenerateQuestions({ type, difficulty, jobTitle, count });
  }
}

module.exports = { generateQuestions, QuestionSetSchema };
