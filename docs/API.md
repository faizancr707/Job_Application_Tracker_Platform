# AI-Powered Career Intelligence Platform — API Reference

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All protected routes require a JWT token set as an HTTP-only cookie (`token`).
- Login: `POST /user/login` → sets cookie
- Logout: `GET /user/logout` → clears cookie

---

## Existing Endpoints (Preserved)

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/user/register` | No | Register new user |
| POST | `/user/login` | No | Login |
| GET | `/user/logout` | Yes | Logout |
| POST | `/user/profile/update` | Yes | Update profile |
| POST | `/user/savedjob` | Yes | Save/unsave a job |

### Companies
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/company/register` | Yes | Create company |
| GET | `/company/get` | Yes | List user companies |
| GET | `/company/get/:id` | Yes | Get company by ID |
| PUT | `/company/update/:id` | Yes | Update company |

### Jobs
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/job/post` | Yes | Post new job |
| GET | `/job/get` | No | Get all jobs |
| GET | `/job/get/:id` | Yes | Get job by ID |
| GET | `/job/getadminjobs` | Yes | Get recruiter's jobs |
| PUT | `/job/update/:id` | Yes | Update job |
| DELETE | `/job/delete/:id` | Yes | Delete job |

### Applications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/application/apply/:id` | Yes | Apply for a job |
| GET | `/application/get` | Yes | Get user's applications |
| GET | `/application/:id/applicants` | Yes | Get job applicants |
| POST | `/application/status/:id/update` | Yes | Update status |

---

## AI Endpoints (New)

### Resume Management (`/resumes`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/resumes/upload` | Yes | Upload + parse resume PDF |
| GET | `/resumes` | Yes | List user's resumes |
| GET | `/resumes/:id` | Yes | Get resume details |
| GET | `/resumes/:id/analysis` | Yes | Get/trigger AI analysis |
| DELETE | `/resumes/:id` | Yes | Delete resume |
| PATCH | `/resumes/:id/set-primary` | Yes | Set as primary resume |

#### Upload Resume
```bash
curl -X POST http://localhost:8000/api/v1/resumes/upload \
  -H "Cookie: token=<jwt>" \
  -F "file=@resume.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded and processed successfully.",
  "data": {
    "id": 1,
    "fileName": "resume.pdf",
    "skills": ["React", "Node.js", "Python"],
    "qualityScore": 78,
    "status": "ready",
    "parsedData": { "name": "...", "experience": [...], "education": [...] }
  }
}
```

### AI Analysis (`/ai`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/ai/analyze-job` | Yes | Analyze a job description |
| POST | `/ai/match` | Yes | Match resume vs job |
| POST | `/ai/skill-gap` | Yes | Skill gap analysis |
| POST | `/ai/cover-letter` | Yes | Generate cover letter |
| POST | `/ai/semantic-search` | Yes | AI-powered job search |
| GET | `/ai/dashboard-insights` | Yes | Dashboard AI insights |
| GET | `/ai/usage` | Yes | Get AI usage stats |

#### Match Resume to Job
```bash
curl -X POST http://localhost:8000/api/v1/ai/match \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt>" \
  -d '{"jobId": 1}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 72,
    "matchedSkills": [{"skill": "React", "proficiencyLevel": "advanced", "evidence": "..."}],
    "missingSkills": [{"skill": "AWS", "importance": "critical", "learnability": "moderate"}],
    "partialMatches": [{"skill": "Docker", "userSkill": "Kubernetes", "similarity": 60}],
    "explanation": "Strong frontend match but missing cloud infrastructure skills.",
    "recommendations": ["Learn AWS basics", "Get Docker certification"]
  }
}
```

#### Semantic Job Search
```bash
curl -X POST http://localhost:8000/api/v1/ai/semantic-search \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt>" \
  -d '{"query": "remote React developer", "filters": {"jobType": "Remote"}}'
```

### Interview Prep (`/interview`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/interview/generate` | Yes | Generate questions |
| POST | `/interview/:id/evaluate` | Yes | Evaluate answers |
| GET | `/interview/history` | Yes | Get past sessions |
| GET | `/interview/:id` | Yes | Get session details |

#### Generate Interview
```bash
curl -X POST http://localhost:8000/api/v1/interview/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt>" \
  -d '{"type": "technical", "difficulty": "mid", "count": 5}'
```

### AI Copilot (`/copilot`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/copilot/chat` | Yes | Stream chat (SSE) |
| GET | `/copilot/sessions` | Yes | List sessions |
| GET | `/copilot/sessions/:id` | Yes | Get session messages |
| DELETE | `/copilot/sessions/:id` | Yes | Delete session |

#### Chat (Server-Sent Events)
```bash
curl -N -X POST http://localhost:8000/api/v1/copilot/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt>" \
  -d '{"message": "What jobs match my skills?"}'
```

### Health Check
```bash
GET /api/v1/health → {"success": true, "version": "2.0.0"}
```

## Rate Limits
- AI endpoints: 10 requests/minute per user
- Embedding endpoints: 30 requests/minute per user
- General: 100 requests/minute
