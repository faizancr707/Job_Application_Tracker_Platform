# Architecture — AI-Powered Career Intelligence Platform

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                  │
│  ┌─────┐ ┌──────────┐ ┌─────────┐ ┌──────┐ ┌────────┐  │
│  │Redux│ │AI Comps  │ │Copilot  │ │Resume│ │Existing│  │
│  │Store│ │(10 pages)│ │SSE Chat │ │Upload│ │  Pages │  │
│  └──┬──┘ └────┬─────┘ └────┬────┘ └──┬───┘ └───┬────┘  │
│     │         │            │         │          │        │
│     └─────────┴──────┬─────┴─────────┴──────────┘        │
└──────────────────────┼───────────────────────────────────┘
                       │ HTTP / SSE
┌──────────────────────┼───────────────────────────────────┐
│              Backend (Express 5 / Node.js)               │
│  ┌────────────────────────────────────────────────┐      │
│  │         Middleware Layer                        │      │
│  │  isAuth │ rateLimiter │ promptGuard │ helmet   │      │
│  └────────────────────┬───────────────────────────┘      │
│                       │                                   │
│  ┌────────────────────┴───────────────────────────┐      │
│  │             Routes Layer                        │      │
│  │  user │ job │ company │ application             │      │
│  │  ai   │ resume │ interview │ copilot            │      │
│  └────────────────────┬───────────────────────────┘      │
│                       │                                   │
│  ┌────────────────────┴───────────────────────────┐      │
│  │           Controllers Layer                     │      │
│  │  userCtrl │ jobCtrl │ companyCtrl │ appCtrl     │      │
│  │  aiCtrl │ resumeCtrl │ interviewCtrl │ copilot  │      │
│  └────────────────────┬───────────────────────────┘      │
│                       │                                   │
│  ┌────────────────────┴───────────────────────────┐      │
│  │              Services Layer                     │      │
│  │  ┌──────────────────────────────┐               │      │
│  │  │   AI Services (OpenAI)       │               │      │
│  │  │  llm │ embeddings │ prompts  │               │      │
│  │  │  matching │ skillGap │ cover  │               │      │
│  │  │  dashboard │ evaluation      │               │      │
│  │  └──────────────────────────────┘               │      │
│  │  ┌──────────────────────────────┐               │      │
│  │  │   Domain Services            │               │      │
│  │  │  resume: parser │ analyzer   │               │      │
│  │  │  jobs: analyzer │ search     │               │      │
│  │  │  interview: gen │ eval       │               │      │
│  │  │  RAG pipeline │ agents       │               │      │
│  │  └──────────────────────────────┘               │      │
│  │  ┌──────────────────────────────┐               │      │
│  │  │   Infrastructure Services    │               │      │
│  │  │  vectorStore │ redis/cache   │               │      │
│  │  │  queue │ s3 │ tokenTracker   │               │      │
│  │  │  observability               │               │      │
│  │  └──────────────────────────────┘               │      │
│  └────────────────────────────────────────────────┘      │
│                       │                                   │
│  ┌────────────────────┴───────────────────────────┐      │
│  │               Data Layer                        │      │
│  │  MySQL/Sequelize │ In-Memory VectorStore        │      │
│  │  Redis Cache     │ AWS S3 / Local Storage       │      │
│  └────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, Vite 6, Redux Toolkit | SPA with state management |
| UI | shadcn/ui, Tailwind CSS, Framer Motion | Component library + animations |
| Backend | Express 5.1, Node.js | API server |
| AI/LLM | OpenAI GPT-4o / GPT-4o-mini | Text generation + analysis |
| Embeddings | OpenAI text-embedding-3-small | Semantic similarity |
| Vector Store | In-memory cosine similarity | Semantic search (no external DB) |
| Agent Framework | LangChain, LangGraph | Tool calling + agent workflow |
| Database | MySQL + Sequelize ORM | Relational data |
| Cache | Redis (with in-memory fallback) | Response caching |
| Queue | BullMQ (with sync fallback) | Background processing |
| File Storage | AWS S3 (with local fallback) | Resume PDFs, profile images |
| Auth | JWT + bcrypt | Authentication |
| Security | Helmet, rate limiting, prompt guard | API protection |

## Data Models

### Existing (Preserved)
- **User** — fullname, email, password, role, skills (JSON), resume URL
- **Company** — name, description, website, location, logo, userId
- **Job** — title, description, salary, location, jobType, experienceLevel, companyId
- **Application** — jobId, applicantId, status (pending/accepted/rejected)
- **SavedJob** — userId, jobId

### New AI Models
- **Resume** — userId, fileName, fileUrl, rawText, parsedData (JSON), skills (JSON), qualityScore, analysis (JSON), status, isPrimary
- **Interview** — userId, type, difficulty, questions (JSON), answers (JSON), evaluations (JSON), overallScore, status
- **ChatHistory** — userId, sessionId, role, content
- **AiUsage** — userId, feature, model, inputTokens, outputTokens, cost, latencyMs

## AI Pipeline Architecture

### Resume Processing Pipeline
```
PDF Upload → Multer → S3/Local Storage → pdf-parse text extraction
  → LLM structured parsing (name, skills, experience, education)
  → Resume quality + ATS scoring → Vector embeddings → Store
```

### Job Matching Pipeline
```
User Resume (parsed) + Job Description
  → LLM analysis with structured output (Zod schema)
  → Matched/Missing/Partial skills with confidence scores
  → Explainable recommendations
```

### Copilot Agent (LangGraph)
```
User Message → Prompt Guard → LangGraph ReAct Agent
  → Tool Selection (7 tools: search, match, analyze, etc.)
  → Tool Execution with user-scoped data
  → Streaming SSE Response → Chat History Persistence
```

### RAG Pipeline
```
Query → Embed → Multi-collection vector search (resumes, jobs)
  → Context assembly with metadata → LLM generation with sources
```

## File Structure
```
backend/
├── config/ai.config.js         # AI model configs, env validation
├── controllers/                # Route handlers
│   ├── aiController.js         # Job analysis, matching, skill gap
│   ├── resumeController.js     # Resume CRUD + AI processing
│   ├── interviewController.js  # Mock interview sessions
│   └── copilotController.js    # SSE streaming chat
├── middlewares/
│   ├── isAuth.js               # JWT authentication
│   ├── rateLimiter.js          # Per-user rate limiting
│   ├── promptGuard.js          # Injection detection
│   └── ownership.js            # Resource ownership checks
├── models/                     # Sequelize models
├── routes/                     # Express routers
├── services/
│   ├── ai/                     # Core AI services
│   ├── resume/                 # Resume parsing + analysis
│   ├── jobs/                   # Job analysis + search
│   ├── interview/              # Question gen + evaluation
│   ├── agents/                 # LangGraph copilot agent
│   ├── rag/                    # RAG pipeline
│   ├── cache/                  # Redis service
│   └── queue/                  # BullMQ service
└── utils/                      # S3, DB connection

frontend/src/
├── components/
│   ├── ai/                     # 10 AI feature components
│   │   ├── CopilotChat.jsx     # Streaming chat UI
│   │   ├── ResumeUpload.jsx    # Drag-drop upload
│   │   ├── ResumeAnalysis.jsx  # Score gauges + insights
│   │   ├── JobAnalysisCard.jsx # Job description AI analysis
│   │   ├── JobMatchCard.jsx    # Resume-job matching
│   │   ├── CoverLetterGenerator.jsx
│   │   ├── InterviewPrep.jsx   # Mock interviews
│   │   ├── SemanticSearch.jsx  # AI job search
│   │   ├── SkillGapAnalysis.jsx
│   │   └── DashboardInsights.jsx
│   ├── shared/MarkdownRenderer.jsx
│   └── shared/LoadingSkeleton.jsx
├── redux/
│   ├── aiSlice.js              # AI state management
│   └── resumeSlice.js          # Resume state management
└── utils/constant.js           # API endpoints
```
