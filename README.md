# 💼 HireHub — AI-Powered Job Tracker & Career Intelligence Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai&logoColor=white)](https://openai.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agents-FF6B6B)](https://langchain.com/)

> **HireHub** is a next-generation Career Intelligence and Job Application Tracking platform. Built with a modular React 19 frontend and a resilient Node.js / Express backend, HireHub bridges the gap between job seekers and employers with real-time application tracking, recruiter workflows, and a full suite of **15+ AI-powered career copilot tools**.

---

## 📑 Table of Contents

- [✨ Key Highlights](#-key-highlights)
- [🎨 Modern UI & Design System](#-modern-ui--design-system)
- [🤖 AI Feature Suite](#-ai-feature-suite)
- [👥 User Workflows](#-user-workflows)
  - [For Job Seekers](#for-job-seekers)
  - [For Recruiters & Admins](#for-recruiters--admins)
- [🏛️ System Architecture](#️-system-architecture)
- [⚙️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Verification & Testing](#4-verification--testing)
- [🔌 API Reference](#-api-reference)
- [🔒 Enterprise Security](#-enterprise-security)
- [👨‍💻 Author & Contact](#-author--contact)
- [📄 License & Support](#-license--support)

---

## ✨ Key Highlights

- 🎯 **Unified Job Application Lifecycle**: Complete pipeline from search, bookmarking, and custom cover letters to real-time status tracking (`Pending`, `Reviewing`, `Accepted`, `Rejected`).
- 🤖 **Agentic AI Career Copilot**: Multi-turn conversational assistant powered by LangGraph with 7 autonomous tools, RAG search, and streaming responses (SSE).
- 📄 **Deep Resume Parsing & Scoring**: Instant PDF parsing, ATS readability auditing, structured skill extraction, and vector embedding generation.
- 🔍 **Explainable Job-Resume Matcher**: Transparent match scores breaking down exact matched, missing, and partial skill alignments.
- 📊 **Dynamic Skill Gap Roadmaps**: 3-month structured preparation roadmaps tailored to bridge missing requirements for targeted positions.
- 🔎 **Natural Language Semantic Search**: Intent-based vector search matching candidates to relevant jobs even without exact keyword matches.
- 🎤 **Mock Interview Simulator**: Technical, behavioral, HR, and system design interview rounds with automated rubric grading and constructive feedback.
- 💼 **Full Recruiter Management Suite**: Company registration, logo management, role posting, applicant filtering, and real-time candidate status updates.
- 🛡️ **Production-Ready Fallbacks**: Automatic graceful degradation for Redis (memory cache), BullMQ (synchronous), and AWS S3 (local file storage).

---

## 🎨 Modern UI & Design System

HireHub features a custom, high-contrast, accessibility-first theme engineered for optimal clarity, warmth, and visual hierarchy:

- **Primary Colors**:
  - 🟠 **Burnt Orange (`#CC5500`)**: Primary actions, CTAs, highlight badges, active nav indicators.
  - 🍦 **Warm Ivory (`#FFF8E7`)**: Soothing ambient canvas and background surfaces.
  - 🌿 **Lime Green (`#A4D65E`)**: Success states, accepted application badges, vibrant accents.
- **Accessible Typography Palette (WCAG 2.1 Compliant)**:
  - 🟤 **Deep Brown (`#713000`)**: H1 and H2 display headings.
  - ⬛ **Dark Charcoal (`#29251F`)**: Section titles, card headings, and form labels.
  - 🪨 **Warm Charcoal (`#49443C`)**: Body copy, descriptions, and paragraphs.
  - 🌫️ **Muted Brown-Gray (`#71695E`)**: Secondary metadata, timestamps, and placeholder text.
  - 🔗 **Burnt Orange Links (`#A84300`)**: Underlined interactive links with Deep Brown hover transitions.
  - ⚪ **Pure White (`#FFFFFF`)**: High-contrast text on primary buttons.
  - 🟢 **Deep Green (`#356B16`)**: Verified success alerts and approval badges.
  - 🌙 **Dark Mode Ready**: Automatic semantic translation to Warm Ivory (`#FFF8E7`) headings and Soft Ivory-Gray (`#D6D0C4`) body text.

---

## 🤖 AI Feature Suite

HireHub embeds specialized AI services to power every stage of a candidate's job hunt:

| # | Feature | Engine / Model | Description |
|---|---------|----------------|-------------|
| 1 | **AI Career Copilot** | LangGraph + GPT-4o | Streaming chat assistant with 7 integrated tools to query jobs, assess skills, and answer career questions. |
| 2 | **Resume Parser & Scorer** | GPT-4o-mini | Parses uploaded PDFs into structured JSON, calculates an ATS score, and benchmarks key accomplishments. |
| 3 | **Resume Matcher** | Vector Cosine + GPT-4o | Compares parsed resume vectors against job requirements with explainable matched, missing, and partial skills. |
| 4 | **Skill Gap Analysis** | GPT-4o | Detects deficiencies against target roles and generates prioritized 3-month step-by-step learning roadmaps. |
| 5 | **Semantic Job Search** | `text-embedding-3-small` | Natural language search understanding conceptual queries (e.g. *"remote react role with high scale"*). |
| 6 | **Verified Cover Letters** | GPT-4o-mini | Generates targeted cover letters grounded strictly in real resume achievements without hallucinations. |
| 7 | **Mock Interview Studio** | GPT-4o | Generates scenario-based technical and behavioral questions; evaluates submitted answers with scoring rubrics. |
| 8 | **Application Insights** | Analytical AI | Identifies rejection patterns, suggests optimal follow-up timing, and analyzes skill trends in your industry. |
| 9 | **Prompt Injection Guard** | Security Middleware | Real-time heuristic and pattern detection defending against adversarial AI prompt overrides. |
| 10 | **Token Cost Tracker** | Telemetry | Tracks prompt tokens, completion tokens, and estimated cost per user session. |

---

## 👥 User Workflows

### For Job Seekers
1. **Discover & Search**: Browse curated job listings or use **Semantic AI Search** using conversational phrases.
2. **Instant Match Check**: Open any job description to evaluate your resume fit percentage and view missing skills.
3. **Generate Materials**: Produce tailored, verified cover letters for the specific opening in one click.
4. **Apply & Track**: Submit applications and track progress on the **Applied Jobs Table** with live status badges.
5. **Prepare for Interviews**: Launch an **AI Mock Interview** tailored to the job description and receive structured critiques.
6. **Career Copilot**: Ask questions anytime via the floating AI Copilot on salary benchmarks, strategy, or resume tweaks.

### For Recruiters & Admins
1. **Company Profiles**: Register organizations and upload corporate logos to Amazon S3 (or local disk).
2. **Job Postings**: Publish vacancies with salary brackets, requirements, tags, and experience thresholds.
3. **Applicant Tracking**: Review candidate submissions, view applicant profiles, and inspect attached resumes.
4. **Decision Management**: Transition applicant statuses across `Pending`, `Reviewing`, `Accepted`, or `Rejected`.

---

## 🏛️ System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │               CLIENT BROWSER                 │
                    │       React 19 + Vite 6 + Tailwind CSS       │
                    │   shadcn/ui + Framer Motion + Redux Toolkit  │
                    └──────────────────────┬───────────────────────┘
                                           │ HTTP / SSE Stream
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │               EXPRESS 5.1 API                │
                    │  Middlewares: Auth (JWT), RateLimiter, CORS  │
                    │        Helmet, PromptGuard, Ownership        │
                    └───────┬──────────────────────────────┬───────┘
                            │                              │
             ┌──────────────┴──────────────┐               │
             ▼                             ▼               ▼
┌────────────────────────┐   ┌───────────────────────────┐   ┌────────────────────────┐
│      CORE SERVICES     │   │        AI SERVICES        │   │    INFRASTRUCTURE      │
│ • User & Auth Handler  │   │ • LangGraph Agent (7 tools│   │ • Redis Cache          │
│ • Job CRUD & Filters   │   │ • Semantic Search (Vector)│   │   (Memory fallback)    │
│ • Applications Pipeline│   │ • ATS Resume Evaluator    │   │ • BullMQ Worker Queue  │
│ • Company Management   │   │ • Mock Interview Evaluator│   │   (Sync fallback)      │
└────────────┬───────────┘   └─────────────┬─────────────┘   │ • AWS S3 Bucket        │
             │                             │                 │   (Local disk fallback)│
             ▼                             ▼                 └────────────────────────┘
┌────────────────────────┐   ┌───────────────────────────┐
│     MySQL DATABASE     │   │       OPENAI APIS         │
│  Sequelize ORM (MySQL) │   │ • GPT-4o / GPT-4o-mini    │
│  9 Relational Models   │   │ • text-embedding-3-small  │
└────────────────────────┘   └───────────────────────────┘
```

> For deep architectural specifications, data models, and sequence diagrams, refer to [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## ⚙️ Tech Stack

### Frontend
- **Core**: [React 19](https://react.dev/), [Vite 6](https://vitejs.dev/), [React Router v7](https://reactrouter.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/), [Redux Persist](https://github.com/rt2zz/redux-persist)
- **UI & Animation**: [Tailwind CSS 3.4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
- **Icons & Visuals**: [Lucide React](https://lucide.dev/), [Recharts](https://recharts.org/), [Sonner](https://sonner.emilkowal.ski/)
- **Utilities**: [Axios](https://axios-http.com/), [react-dropzone](https://react-dropzone.js.org/), [react-markdown](https://github.com/remarkjs/react-markdown)

### Backend
- **Runtime & Server**: [Node.js](https://nodejs.org/), [Express 5.1](https://expressjs.com/)
- **Database & ORM**: [MySQL 8](https://www.mysql.com/), [Sequelize 6](https://sequelize.org/)
- **AI & Agents**: [LangChain](https://js.langchain.com/), [LangGraph](https://langchain-ai.github.io/langgraphjs/), [OpenAI SDK](https://github.com/openai/openai-node)
- **Caching & Queues**: [ioredis](https://github.com/redis/ioredis), [BullMQ](https://bullmq.io/)
- **Cloud Storage**: [AWS SDK v3 (S3)](https://aws.amazon.com/sdk-for-javascript/) with local storage fallback
- **Security**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [helmet](https://helmetjs.github.io/), [cors](https://github.com/expressjs/cors)

---

## 📁 Project Structure

```
Job-Application-Tracker-App/
├── backend/
│   ├── config/              # AI models config, OpenAI setup, environment validation
│   ├── controllers/         # Authentication, Job, Company, Application & AI controllers
│   ├── middlewares/         # JWT verification, prompt injection guard, rate limiting
│   ├── models/              # Sequelize models (User, Job, Company, Application, AI records)
│   ├── routes/              # Express API route declarations
│   ├── services/
│   │   ├── agents/          # LangGraph autonomous Career Copilot with 7 tools
│   │   ├── ai/              # Core AI services (matching, scoring, roadmaps, cover letters)
│   │   ├── cache/           # Redis caching provider with in-memory fallback
│   │   ├── interview/       # Question generation & answer evaluation engines
│   │   ├── jobs/            # Job analysis & vector embedding pipeline
│   │   ├── queue/           # BullMQ asynchronous queue with synchronous fallback
│   │   ├── rag/             # Retrieval-augmented generation pipeline
│   │   └── resume/          # PDF text extraction, ATS parser, and embedding services
│   └── utils/               # MySQL connector, AWS S3 uploader, local storage handlers
│
├── frontend/
│   ├── public/              # Static public assets
│   └── src/
│       ├── components/
│       │   ├── admin/       # Recruiter & Admin job/company management panels
│       │   ├── ai/          # 10+ interactive AI widgets (Copilot, Matcher, Gap Analyzer)
│       │   ├── auth/        # Login, Signup, Protected Route guards
│       │   ├── shared/      # Navigation bar, Footer, Markdown renderers
│       │   └── ui/          # Accessible shadcn/ui components
│       ├── hooks/           # Custom React hooks (useGetAllJobs, useGetAppliedJobs, etc.)
│       ├── redux/           # Redux slices (auth, job, company, application)
│       ├── utils/           # API endpoints, design tokens, helper methods
│       ├── App.jsx          # Application routes and layout wrappers
│       ├── index.css        # Centralized CSS design tokens and typography rules
│       └── main.jsx         # React DOM entry point
│
└── docs/
    ├── AI-FEATURES.md       # Comprehensive feature documentation & prompting methodology
    ├── API.md               # Complete REST and SSE endpoint documentation
    └── ARCHITECTURE.md      # Detailed system design, data flow diagrams & schemas
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or v20.x installed
- **MySQL**: Running local instance or remote connection
- **OpenAI API Key**: Active key with access to `gpt-4o`, `gpt-4o-mini`, and `text-embedding-3-small`
- *(Optional)* **Redis**: For caching (in-memory fallback active if absent)

### 1. Clone Repository
```bash
git clone https://github.com/faizancr707/Job-Application-Tracker-App.git
cd Job-Application-Tracker-App
```

### 2. Backend Setup
```bash
cd backend
npm install --legacy-peer-deps
```

Create `.env` file in the `backend/` directory:
```env
# Server
PORT=8000
FRONTEND_URL=http://localhost:5173

# Database (MySQL)
DATABASE_NAME=job_tracker
DATABASE_USER=root
DATABASE_PASSWORD=your_mysql_password
DATABASE_HOST=localhost

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# OpenAI (Required for AI Features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Redis Cache (Falls back to In-Memory if omitted)
REDIS_URL=redis://localhost:6379

# Optional: AWS S3 (Falls back to Local File Storage if omitted)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_s3_bucket_name
AWS_REGION=us-east-1
```

Start the backend server:
```bash
npm start
# or: node index.js
```
*The database tables will synchronize automatically via Sequelize on first boot.*

### 3. Frontend Setup
```bash
cd ../frontend
npm install --legacy-peer-deps
npm run dev
```

### 4. Verification & Testing
- **API Health Check**: `http://localhost:8000/api/v1/health`
- **Frontend App**: `http://localhost:5173`
- **Run Frontend Build**: `npm run build` *(in `frontend/`)*

---

## 🔌 API Reference

### Core Services
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/v1/user/signup` | Register a new job seeker or recruiter account |
| `POST` | `/api/v1/user/login` | Authenticate user and receive JWT session cookie |
| `GET`  | `/api/v1/user/logout` | Clear user session |
| `POST` | `/api/v1/job/post` | Post an employment vacancy *(Recruiter only)* |
| `GET`  | `/api/v1/job/get` | Retrieve active job openings with search filters |
| `GET`  | `/api/v1/job/get/:id` | Fetch detailed job listing by ID |
| `POST` | `/api/v1/application/apply/:id` | Submit an application for a job |
| `GET`  | `/api/v1/application/get` | Fetch all applications submitted by candidate |
| `POST` | `/api/v1/company/register` | Register an employer company *(Recruiter only)* |

### AI Career Services
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/v1/resumes/upload` | Upload PDF/DOCX resume for ATS parsing & vectorization |
| `POST` | `/api/v1/ai/analyze-job` | Extract seniority, tech requirements, culture & red flags |
| `POST` | `/api/v1/ai/match` | Compute explainable score & skill breakdown vs job |
| `POST` | `/api/v1/ai/skill-gap` | Generate readiness score & 3-month prioritized learning plan |
| `POST` | `/api/v1/ai/cover-letter` | Generate personalized cover letter from verified resume data |
| `POST` | `/api/v1/ai/semantic-search` | Vector search over jobs using conversational intent queries |
| `GET`  | `/api/v1/ai/dashboard-insights`| Calculate rejection trends, follow-up alerts & skill trends |
| `POST` | `/api/v1/interview/generate` | Generate mock interview questions (Technical, HR, System) |
| `POST` | `/api/v1/interview/:id/evaluate`| Submit answer and receive AI rubric score & feedback |
| `POST` | `/api/v1/copilot/chat` | Multi-turn streaming chat with LangGraph Career Copilot |

> For complete payload examples and status codes, see [docs/API.md](docs/API.md).

---

## 🔒 Enterprise Security

- **Strict User Isolation**: All vector embeddings, resume files, and AI conversations are scoped to the authenticated user ID.
- **Prompt Injection Defense**: Input sanitization blocks injection attacks, model jailbreak attempts, and system prompt leakage.
- **Rate Limiting**: Built-in limits on AI endpoints prevent Denial of Service and API quota depletion.
- **Secure Authentication**: Password hashing with `bcryptjs` (10 rounds) and HTTP-only signed cookies for JWT sessions.
- **Header Protection**: Standard security headers configured via `helmet` and strict CORS whitelisting.

---

## 👨‍💻 Author & Contact

**Faizan Alam**
- 🌐 **Portfolio**: [faizan-alam-sde-portfolio.vercel.app](https://faizan-alam-sde-portfolio.vercel.app/)
- 💻 **GitHub**: [@faizancr707](https://github.com/faizancr707)
- 💼 **LinkedIn**: [Faizan Alam](https://www.linkedin.com/in/faizan-alam-06897a20b/)
- 📸 **Instagram**: [@faizanalamasharafi](https://www.instagram.com/in/faizanalamasharafi/)

---

## 📄 License & Support

This project is open-source and available under the [MIT License](LICENSE).

If you found **HireHub** helpful or inspiring, please consider starring ⭐ the repository!
