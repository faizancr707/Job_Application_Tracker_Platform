# AI Features Guide

## 1. 📄 Resume Upload & AI Parsing
Upload a PDF resume and get AI-powered extraction of:
- Contact information, name, email, phone
- Skills (categorized: technical, soft, tools)
- Work experience with dates, titles, descriptions
- Education details
- Quality score (0-100) and ATS compatibility score

**How it works:** PDF → `pdf-parse` text extraction → GPT-4o structured parsing (Zod schema validation) → Quality/ATS scoring → Vector embeddings stored for search.

**Route:** `POST /api/v1/resumes/upload` (multipart/form-data with `file` field)

---

## 2. 🔍 AI Job Description Analysis
Analyze any job posting to extract structured intelligence:
- Required vs nice-to-have skills with importance levels
- Seniority level detection (junior/mid/senior/lead)
- Experience range estimation
- Salary assessment
- Red flags (unrealistic requirements, vague descriptions)
- Company culture signals
- Key responsibilities summary

**Route:** `POST /api/v1/ai/analyze-job` — body: `{ "jobId": 1 }`

---

## 3. 🎯 Resume-Job Matching
Get an explainable match score between your resume and any job:
- **Overall score** (0-100) with explanation
- **Matched skills** — skills you have that the job needs, with proficiency levels
- **Missing skills** — gaps with importance (critical/important/nice-to-have) and learnability
- **Partial matches** — related skills with similarity assessment
- **Actionable recommendations** — specific steps to improve your candidacy

**Route:** `POST /api/v1/ai/match` — body: `{ "jobId": 1 }`

---

## 4. 📊 Skill Gap Analysis
Comprehensive analysis of your skills vs market demand:
- **Overall career readiness** percentage
- **Strengths** — skills you excel at
- **Critical gaps** — must-learn skills with estimated learning time
- **Important gaps** — high-value skills with learning resources
- **Nice-to-have** — bonus skills that differentiate
- **3-month learning plan** — prioritized study roadmap

**Route:** `POST /api/v1/ai/skill-gap`

---

## 5. 🔎 Semantic Job Search
Natural language job search powered by embeddings:
- Describe what you want in plain English: *"remote React developer with good salary"*
- Semantic similarity ranking (not just keyword matching)
- Metadata filters: location, job type
- Relevance scores per result

**Route:** `POST /api/v1/ai/semantic-search` — body: `{ "query": "...", "filters": {} }`

---

## 6. ✍️ Cover Letter Generation
Generate personalized cover letters using ONLY verified data from your resume:
- Tone selection: professional, conversational, creative
- Highlights your actual skills and experience relevant to the job
- No hallucinated credentials — strictly uses parsed resume data
- Key points used are listed for transparency

**Route:** `POST /api/v1/ai/cover-letter` — body: `{ "jobId": 1, "tone": "professional" }`

---

## 7. 🎤 Mock Interview Prep
AI-generated interview questions with evaluation:
- **Question types:** technical, behavioral, HR, system design
- **Difficulty levels:** junior, mid, senior
- **Personalized** to your skills and target job
- **AI evaluation** of your answers with:
  - Score per question (1-10)
  - Strengths and weaknesses identified
  - Improved answer suggestions
  - Overall session score and pass/fail
- **Full history** of past sessions

**Routes:**
- `POST /api/v1/interview/generate` — body: `{ "type": "technical", "difficulty": "mid", "count": 5 }`
- `POST /api/v1/interview/:id/evaluate` — body: `{ "answers": ["...", "..."] }`

---

## 8. 🤖 AI Career Copilot
Full conversational AI assistant with streaming and tool calling:
- **Streaming responses** via Server-Sent Events
- **LangGraph ReAct agent** with 7 tools:
  - Search jobs semantically
  - Analyze job descriptions
  - Match resume to jobs
  - Analyze skill gaps
  - Generate cover letters
  - Get application statistics
  - Get career recommendations
- **Chat history** persisted per session
- **Markdown rendering** with code highlighting
- **Session management** — create, list, delete conversations

**Route:** `POST /api/v1/copilot/chat` — body: `{ "message": "..." }` (SSE stream)

---

## 9. 📈 AI Dashboard Insights
Automated career intelligence from your application data:
- **Success rate** analysis with assessment
- **Rejection pattern** detection with suggestions
- **Follow-up reminders** for pending applications
- **Skill demand trends** in your target jobs
- **Weekly goals** and next-step recommendations

**Route:** `GET /api/v1/ai/dashboard-insights`

---

## 10. 🛡️ Security & Safety
- **Prompt injection guard** — blocks injection patterns (ignore instructions, jailbreak, etc.)
- **Content length limits** — max 10,000 chars per field
- **Rate limiting** — 10 AI requests/min per user
- **User data isolation** — vector store scoped by userId
- **Ownership checks** — users can only access their own data
- **Token tracking** — per-request cost and usage monitoring
- **Helmet** security headers

---

## 11. 🏗️ Infrastructure
- **Redis caching** — response caching with automatic in-memory fallback
- **BullMQ queues** — background processing with synchronous fallback
- **S3 file storage** — resume PDFs with local fallback
- **Token/cost tracking** — per-model usage logged to AiUsage table
- **Observability** — correlation IDs, structured logging, error classification
- **AI evaluation** — hallucination checks for cover letters, match score validation
