# 🚀 AI-Powered Career Intelligence Platform

> Upgraded from a Job Application Tracker into a production-ready AI career platform with 15+ AI features.

---

## 📌 Overview

The AI-Powered Career Intelligence Platform helps job seekers:

* Track job applications with a full-featured dashboard
* **Upload resumes for AI parsing, scoring, and analysis**
* **Match resumes to jobs with explainable AI scores**
* **Get personalized skill gap analysis and learning plans**
* **Search jobs using natural language (semantic search)**
* **Generate cover letters from verified resume data**
* **Practice interviews with AI evaluation and feedback**
* **Chat with an AI Career Copilot powered by LangGraph agents**
* **View AI dashboard insights: rejection patterns, follow-ups, trends**

Built with a **production-ready backend** and a **modular React frontend**.

---

## 🧠 Architecture

```
Frontend (React 19 + Vite) → Express 5 API → AI Services (OpenAI GPT-4o) → MySQL + Vector Store
                                            → LangGraph Agent (7 tools)
                                            → Redis Cache + S3 Storage
```

> See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full system diagrams.

---

## ⚙️ Tech Stack

### Frontend
* React 19, Vite 6, React Router v7
* Redux Toolkit + redux-persist
* shadcn/ui + Tailwind CSS + Framer Motion
* react-markdown, react-dropzone, recharts

### Backend
* Node.js, Express 5.1
* Sequelize ORM + MySQL
* OpenAI GPT-4o / GPT-4o-mini / text-embedding-3-small
* LangChain + LangGraph (agent framework)
* Redis (caching) + BullMQ (queues)
* AWS S3 (file storage)

### Security
* JWT Authentication + bcrypt
* Helmet, CORS, rate limiting
* Prompt injection protection
* User data isolation

---

## 🤖 AI Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 📄 Resume AI | Upload PDF → parse, score, extract skills, embed |
| 2 | 🔍 Job Analysis | Analyze any job: skills, seniority, red flags, culture |
| 3 | 🎯 Resume Matching | Explainable match score + matched/missing/partial skills |
| 4 | 📊 Skill Gap | Career readiness %, learning priorities, 3-month plan |
| 5 | 🔎 Semantic Search | Natural language job search with relevance ranking |
| 6 | ✍️ Cover Letters | AI-generated from only verified resume data |
| 7 | 🎤 Interview Prep | Technical/behavioral/HR/system-design with AI scoring |
| 8 | 🤖 Career Copilot | LangGraph agent with streaming chat + 7 tools |
| 9 | 📈 AI Dashboard | Rejection patterns, follow-up reminders, skill trends |
| 10 | 🛡️ Security | Prompt guard, rate limits, user isolation, token tracking |
| 11 | ⚡ Infrastructure | Redis cache, BullMQ queues, S3 storage (all with fallbacks) |

> See [docs/AI-FEATURES.md](docs/AI-FEATURES.md) for detailed feature documentation.

---

## 🎯 Original Features (Preserved)

* 🔐 JWT authentication (login, signup, logout)
* 📊 Job CRUD (create, update, delete, search, filter)
* 📝 Application management (apply, track status, view applicants)
* 🏢 Company management (create, update, logo upload)
* 💼 Admin panel (post jobs, manage applicants, update status)
* ⭐ Save jobs for later
* 🎨 Dark theme UI with animations

---

## 📁 Project Structure

```
backend/
├── config/ai.config.js          # AI model configs + env validation
├── controllers/                 # 8 route handlers
├── middlewares/                 # auth, rateLimiter, promptGuard, ownership
├── models/                      # 9 Sequelize models
├── routes/                      # 8 Express routers
├── services/
│   ├── ai/                      # 12 core AI services
│   ├── resume/                  # parser, analyzer, embeddings
│   ├── jobs/                    # analyzer, search, embeddings
│   ├── interview/               # generator, evaluator
│   ├── agents/                  # LangGraph copilot (7 tools)
│   ├── rag/                     # RAG pipeline
│   ├── cache/                   # Redis with in-memory fallback
│   └── queue/                   # BullMQ with sync fallback
└── utils/                       # db, s3, localFileStorage

frontend/src/
├── components/
│   ├── ai/                      # 10 AI feature components
│   ├── admin/                   # Admin panel components
│   ├── auth/                    # Login, Signup
│   ├── shared/                  # Navbar, Footer, MarkdownRenderer
│   └── ui/                      # shadcn/ui components
├── redux/                       # 6 Redux slices
└── utils/                       # API constants

docs/
├── API.md                       # Full API reference
├── ARCHITECTURE.md              # System architecture
└── AI-FEATURES.md               # AI feature guide
```

---

## ⚡ Getting Started

### 1️⃣ Clone Repo
```bash
git clone https://github.com/faizancr707/Job-Application-Tracker-App
cd Job-Application-Tracker-App
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install --legacy-peer-deps
```

Create `.env` (see `.env.example`):
```env
# Required
DATABASE_NAME=job_tracker
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=sk-your-openai-key

# Optional
PORT=8000
FRONTEND_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket
AWS_REGION=us-east-1
```

Run:
```bash
npm start
# or: node index.js
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### 4️⃣ Verify
- Backend health: http://localhost:8000/api/v1/health
- Frontend: http://localhost:5173

---

## 🔌 API Endpoints

### Existing
```
POST   /api/v1/user/register
POST   /api/v1/user/login
GET    /api/v1/user/logout
POST   /api/v1/job/post
GET    /api/v1/job/get
POST   /api/v1/application/apply/:id
```

### AI (New)
```
POST   /api/v1/resumes/upload          # Upload + AI parse resume
POST   /api/v1/ai/analyze-job          # AI job analysis
POST   /api/v1/ai/match                # Resume-job matching
POST   /api/v1/ai/skill-gap            # Skill gap analysis
POST   /api/v1/ai/cover-letter         # Cover letter generation
POST   /api/v1/ai/semantic-search      # AI job search
GET    /api/v1/ai/dashboard-insights   # Dashboard AI insights
POST   /api/v1/interview/generate      # Mock interview
POST   /api/v1/interview/:id/evaluate  # Answer evaluation
POST   /api/v1/copilot/chat            # AI copilot (SSE stream)
```

> See [docs/API.md](docs/API.md) for complete API reference.

---

## 🔒 Security

* Helmet HTTP security headers
* JWT authentication with HTTP-only cookies
* Per-user rate limiting (10 AI req/min)
* Prompt injection detection and blocking
* User data isolation in vector store
* Token and cost tracking per request
* Input sanitization and length limits

---

## 👨‍💻 Author

**Faizan Alam**
* GitHub: https://github.com/faizancr707

---

## ⭐ Support

If you like this project, give it a ⭐
