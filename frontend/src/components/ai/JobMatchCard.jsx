import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AI_API_END_POINT } from '../../utils/constant';
import { Badge } from '../ui/badge';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { toast } from 'sonner';
import { Target, RefreshCw, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

const JobMatchCard = ({ jobId, jobTitle }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runMatch = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${AI_API_END_POINT}/match`, { jobId }, { withCredentials: true });
      if (data.success) {
        setResult(data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Matching failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId && !result) {
      runMatch();
    }
  }, [jobId]);

  const scoreColor = (s) =>
    s >= 75 ? 'text-emerald-600' : s >= 50 ? 'text-electric' : 'text-amber-600';

  const scoreBg = (s) =>
    s >= 75 ? 'bg-emerald-50 border-emerald-200' : s >= 50 ? 'bg-purple-50 border-purple-200' : 'bg-amber-50 border-amber-200';

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-glass space-y-4">
        <div className="flex items-center gap-2 text-electric font-bold text-sm animate-pulse">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Comparing your profile and skills with this job...</span>
        </div>
        <LoadingSkeleton lines={5} />
      </div>
    );
  }

  if (!result) {
    return (
      <button
        onClick={runMatch}
        className="w-full py-10 border-2 border-dashed border-electric/30 rounded-2xl bg-slate-50 hover:bg-electric-50/50 shadow-glass-sm hover:shadow-glass transition-all text-slate-800 hover:text-electric font-bold text-base flex flex-col items-center justify-center gap-2"
      >
        <Target className="w-8 h-8 text-electric" />
        <span>Match My Profile to This Job</span>
        <span className="text-xs text-slate-500 font-normal">Calculates semantic compatibility, matched skills, and learning gaps</span>
      </button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-slate-800">
      {/* Overall Score Card */}
      <div className={`border rounded-2xl p-6 shadow-glass flex flex-col sm:flex-row items-center gap-6 ${scoreBg(result.overallScore)}`}>
        <div className="flex flex-col items-center justify-center">
          <div className={`text-5xl font-black ${scoreColor(result.overallScore)} tracking-tight`}>
            {result.overallScore}%
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Profile Match</span>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-slate-900 text-base">Match Assessment</h4>
            <button
              onClick={runMatch}
              className="text-xs text-electric hover:text-electric-dim font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Re-calculate
            </button>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">{result.explanation}</p>
        </div>
      </div>

      {/* Matched Skills */}
      {result.matchedSkills?.length > 0 && (
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-6 shadow-glass">
          <h4 className="text-emerald-700 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Matched Skills ({result.matchedSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.matchedSkills.map((s, i) => (
              <Badge key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold py-1.5 px-3">
                ✓ {s.skill} {s.proficiencyLevel ? `• ${s.proficiencyLevel}` : ''}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {result.missingSkills?.length > 0 && (
        <div className="bg-white border border-amber-200/80 rounded-2xl p-6 shadow-glass">
          <h4 className="text-amber-800 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-amber-600" />
            Skills to Develop ({result.missingSkills.length})
          </h4>
          <div className="space-y-2">
            {result.missingSkills.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  s.importance === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {s.importance || 'Important'}
                </span>
                <span className="text-slate-800 font-semibold">{s.skill}</span>
                {s.learnability && (
                  <span className="text-slate-400 text-xs">• {s.learnability} to acquire</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations?.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-glass-sm">
          <h4 className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-electric" />
            Actionable Next Steps
          </h4>
          <ul className="space-y-1.5">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-slate-600 font-medium flex items-start gap-2">
                <span className="text-electric font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default JobMatchCard;
