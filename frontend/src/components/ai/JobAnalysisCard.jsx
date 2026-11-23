import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AI_API_END_POINT } from '../../utils/constant';
import { Badge } from '../ui/badge';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { toast } from 'sonner';
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, Briefcase, Award } from 'lucide-react';

const JobAnalysisCard = ({ jobId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${AI_API_END_POINT}/analyze-job`, { jobId }, { withCredentials: true });
      if (data.success) {
        setAnalysis(data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId && !analysis) {
      analyze();
    }
  }, [jobId]);

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-glass space-y-4">
        <div className="flex items-center gap-2 text-electric font-bold text-sm animate-pulse">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>AI is analyzing job requirements, seniority level & benchmarks...</span>
        </div>
        <LoadingSkeleton lines={5} />
      </div>
    );
  }

  if (!analysis) {
    return (
      <button
        onClick={analyze}
        className="w-full py-10 border-2 border-dashed border-electric/30 rounded-2xl bg-slate-50 hover:bg-electric-50/50 shadow-glass-sm hover:shadow-glass transition-all text-slate-800 hover:text-electric font-bold text-base flex flex-col items-center justify-center gap-2"
      >
        <Sparkles className="w-8 h-8 text-electric" />
        <span>Run Deep AI Job Analysis</span>
        <span className="text-xs text-slate-500 font-normal">Extracts required skills, experience benchmarks, and flags</span>
      </button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-slate-800">
      {/* Header / Summary Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-glass">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-electric-50 text-electric border border-electric/20 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {analysis.seniorityLevel} Level
            </span>
            <span className="text-xs font-semibold text-slate-600 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
              Expected Experience: {analysis.experienceRange?.min ?? 1}-{analysis.experienceRange?.max ?? 3} Years
            </span>
          </div>
          <button
            onClick={analyze}
            className="text-xs text-electric hover:text-electric-dim font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Re-analyze
          </button>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Required Skills Grid */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-glass">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-electric" />
          Extracted Key Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {analysis.requiredSkills?.map((s, i) => {
            const isMustHave = s.importance === 'must-have';
            return (
              <Badge
                key={i}
                className={
                  isMustHave
                    ? 'bg-gradient-to-r from-electric to-electric-dim text-white border-none font-bold shadow-glass-sm py-1.5 px-3'
                    : 'bg-slate-100 text-slate-700 font-semibold border border-slate-200 py-1.5 px-3'
                }
              >
                {s.skill} {isMustHave ? '★' : ''}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Core Responsibilities */}
      {analysis.responsibilities?.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-glass">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Core Responsibilities
          </h4>
          <ul className="space-y-2">
            {analysis.responsibilities.map((r, i) => (
              <li key={i} className="text-sm text-slate-600 font-medium flex items-start gap-2.5">
                <span className="text-electric font-bold mt-0.5">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Culture Signals & Compensation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {analysis.salaryAssessment && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-glass-sm">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Compensation Benchmark</h5>
            <p className="text-xs text-slate-700 font-medium">{analysis.salaryAssessment}</p>
          </div>
        )}
        {analysis.companyCultureSignals?.length > 0 && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-glass-sm">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Culture Indicators</h5>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {analysis.companyCultureSignals.map((c, i) => (
                <span key={i} className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Red Flags if any */}
      {analysis.redFlags?.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-glass-sm">
          <h4 className="text-rose-700 font-bold text-sm mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Job Description Flags to Note
          </h4>
          <ul className="space-y-1">
            {analysis.redFlags.map((f, i) => (
              <li key={i} className="text-xs text-rose-800 font-medium flex items-start gap-2">
                <span>•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default JobAnalysisCard;
