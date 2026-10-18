import { createSlice } from '@reduxjs/toolkit';

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    jobAnalysis: null,
    matchResult: null,
    skillGap: null,
    coverLetter: null,
    dashboardInsights: null,
    searchResults: [],
    copilotSessions: [],
    currentSessionId: null,
    currentMessages: [],
    interviewSessions: [],
    currentInterview: null,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; state.loading = false; },
    setJobAnalysis: (state, action) => { state.jobAnalysis = action.payload; state.loading = false; },
    setMatchResult: (state, action) => { state.matchResult = action.payload; state.loading = false; },
    setSkillGap: (state, action) => { state.skillGap = action.payload; state.loading = false; },
    setCoverLetter: (state, action) => { state.coverLetter = action.payload; state.loading = false; },
    setDashboardInsights: (state, action) => { state.dashboardInsights = action.payload; state.loading = false; },
    setSearchResults: (state, action) => { state.searchResults = action.payload; state.loading = false; },
    setCopilotSessions: (state, action) => { state.copilotSessions = action.payload; },
    setCurrentSessionId: (state, action) => { state.currentSessionId = action.payload; },
    setCurrentMessages: (state, action) => { state.currentMessages = action.payload; },
    addMessage: (state, action) => { state.currentMessages.push(action.payload); },
    appendToLastMessage: (state, action) => {
      const last = state.currentMessages[state.currentMessages.length - 1];
      if (last && last.role === 'assistant') {
        last.content += action.payload;
      }
    },
    setInterviewSessions: (state, action) => { state.interviewSessions = action.payload; state.loading = false; },
    setCurrentInterview: (state, action) => { state.currentInterview = action.payload; state.loading = false; },
    clearAIState: (state) => {
      state.jobAnalysis = null; state.matchResult = null; state.skillGap = null;
      state.coverLetter = null; state.error = null;
    },
  },
});

export const {
  setLoading, setError, setJobAnalysis, setMatchResult, setSkillGap,
  setCoverLetter, setDashboardInsights, setSearchResults, setCopilotSessions,
  setCurrentSessionId, setCurrentMessages, addMessage, appendToLastMessage,
  setInterviewSessions, setCurrentInterview, clearAIState,
} = aiSlice.actions;
export default aiSlice.reducer;
