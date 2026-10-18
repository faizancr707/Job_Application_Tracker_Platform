const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
export const USER_API_END_POINT = `${BASE_URL}/user`;
export const JOB_API_END_POINT = `${BASE_URL}/job`;
export const APPLICATION_API_END_POINT = `${BASE_URL}/application`;
export const COMPANY_API_END_POINT = `${BASE_URL}/company`;

// AI API Endpoints
export const AI_API_END_POINT = `${BASE_URL}/ai`;
export const RESUME_API_END_POINT = `${BASE_URL}/resumes`;
export const INTERVIEW_API_END_POINT = `${BASE_URL}/interview`;
export const COPILOT_API_END_POINT = `${BASE_URL}/copilot`;
