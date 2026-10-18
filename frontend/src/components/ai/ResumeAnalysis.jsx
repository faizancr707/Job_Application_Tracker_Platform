import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { RESUME_API_END_POINT } from '../../utils/constant';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { Badge } from '../ui/badge';
import ResumeUpload from './ResumeUpload';

const ResumeAnalysis = () => {
  const [resumes, setResumes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    try {
      const { data } = await axios.get(RESUME_API_END_POINT, { withCredentials: true });
      if (data.success) { setResumes(data.data); if (data.data.length > 0) loadAnalysis(data.data[0]); }
    } catch {} finally { setLoading(false); }
  };

  const loadAnalysis = async (resume) => {
    setSelected(resume);
    try {
      const { data } = await axios.get(`${RESUME_API_END_POINT}/${resume.id}/analysis`, { withCredentials: true });
      if (data.success) setAnalysis(data.data);
    } catch { setAnalysis(null); }
  };

  const ScoreGauge = ({ score, label }) => {
    const strokeColor = score >= 70 ? '#A4D65E' : score >= 40 ? '#CC5500' : '#C0392B';
    return (
      <div className="text-center">
        <div className="relative w-28 h-28 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E8DCBE" strokeWidth="3" />
            <path
              d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={strokeColor}
              strokeWidth="3.2"
              strokeDasharray={`${score}, 100`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-charcoal">{score}</span>
        </div>
        <p className="text-charcoal font-semibold text-sm mt-3">{label}</p>
      </div>
    );
  };

  if (loading) return <div className="p-6 space-y-4"><CardSkeleton /><CardSkeleton /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-charcoal">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[--border-subtle]">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal tracking-tight">Resume Quality & ATS Analysis</h2>
          <p className="text-sm text-charcoal-muted mt-0.5">Automated deep review of formatting, strength areas, and keyword coverage</p>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="space-y-4 bg-white p-8 rounded-2xl border border-[--border-subtle] shadow-warm-sm">
          <p className="text-charcoal-muted">Upload a resume to get AI-powered scoring, strengths, and targeted improvement suggestions.</p>
          <ResumeUpload onUploadComplete={() => fetchResumes()} />
        </div>
      ) : (
        <>
          {/* Resume selector */}
          <div className="flex gap-2 flex-wrap">
            {resumes.map(r => (
              <button
                key={r.id}
                onClick={() => loadAnalysis(r)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  selected?.id === r.id
                    ? 'bg-burnt-orange text-white shadow-sm'
                    : 'bg-white border border-[--border-subtle] text-charcoal hover:bg-warm-ivory-dark'
                }`}
              >
                {r.fileName} {r.isPrimary && '⭐'}
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[--border-subtle] shadow-warm-sm">
            <ResumeUpload onUploadComplete={() => fetchResumes()} />
          </div>

          {analysis && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Scores */}
              <div className="grid grid-cols-2 gap-6 bg-white border border-[--border-subtle] rounded-2xl p-8 shadow-warm-sm">
                <ScoreGauge score={analysis.qualityScore || 0} label="Quality & Structure Score" />
                <ScoreGauge score={analysis.atsScore || 0} label="ATS Parser Compatibility" />
              </div>

              {/* Strengths */}
              {analysis.strengths?.length > 0 && (
                <div className="bg-lime-green-light border border-lime-green/40 rounded-2xl p-6">
                  <h3 className="text-lime-green-dark font-extrabold text-base mb-3 flex items-center gap-2">
                    <span>💪</span> Key Resume Strengths
                  </h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-charcoal font-medium flex items-start gap-2.5">
                        <span className="text-lime-green-dark font-bold mt-0.5">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {analysis.weaknesses?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <h3 className="text-terracotta font-extrabold text-base mb-3 flex items-center gap-2">
                    <span>⚠️</span> Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-charcoal font-medium flex items-start gap-2.5">
                        <span className="text-terracotta font-bold mt-0.5">✕</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions?.length > 0 && (
                <div className="bg-white border border-[--border-subtle] rounded-2xl p-6 shadow-warm-sm">
                  <h3 className="font-extrabold text-base mb-4 text-charcoal">📋 Targeted Suggestions</h3>
                  <div className="space-y-3">
                    {analysis.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-warm-ivory/50 border border-[--border-subtle]">
                        <Badge variant={s.priority === 'high' ? 'destructive' : s.priority === 'medium' ? 'default' : 'secondary'}>
                          {s.priority}
                        </Badge>
                        <div>
                          <p className="text-sm font-bold text-charcoal">{s.section}</p>
                          <p className="text-sm text-charcoal-muted mt-0.5">{s.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {analysis.keywordRecommendations?.length > 0 && (
                <div className="bg-white border border-[--border-subtle] rounded-2xl p-6 shadow-warm-sm">
                  <h3 className="font-extrabold text-base mb-3 text-charcoal">🔑 Recommended Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywordRecommendations.map((k, i) => (
                      <Badge key={i} variant="outline" className="border-burnt-orange/30 text-burnt-orange bg-burnt-orange-light font-semibold">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default ResumeAnalysis;
