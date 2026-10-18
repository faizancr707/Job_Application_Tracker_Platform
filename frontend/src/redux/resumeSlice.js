import { createSlice } from '@reduxjs/toolkit';

const resumeSlice = createSlice({
  name: 'resume',
  initialState: {
    resumes: [],
    currentResume: null,
    analysis: null,
    uploadProgress: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; state.loading = false; },
    setResumes: (state, action) => { state.resumes = action.payload; state.loading = false; },
    setCurrentResume: (state, action) => { state.currentResume = action.payload; state.loading = false; },
    setAnalysis: (state, action) => { state.analysis = action.payload; state.loading = false; },
    setUploadProgress: (state, action) => { state.uploadProgress = action.payload; },
    addResume: (state, action) => { state.resumes.unshift(action.payload); },
    removeResume: (state, action) => {
      state.resumes = state.resumes.filter(r => r.id !== action.payload);
    },
  },
});

export const {
  setLoading, setError, setResumes, setCurrentResume, setAnalysis,
  setUploadProgress, addResume, removeResume,
} = resumeSlice.actions;
export default resumeSlice.reducer;
