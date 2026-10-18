import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AI_API_END_POINT } from '../../utils/constant';
import { Badge } from '../ui/badge';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { toast } from 'sonner';

const JobMatchCard = ({ jobId, jobTitle }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runMatch = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${AI_API_END_POINT}/match`, { jobId }, { withCredentials: true });
      if (data.success) setResult(data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Matching failed.'); }
    setLoading(false);
  };

  const scoreColor = (s) => s >= 70 ? 'text-lime-green-dark' : s >= 40 ? 'text-burnt-orange' : 'text-terracotta';

  if (!result && !loading) {
    return (
      <button
        onClick={runMatch}
        className="w-full py-8 border-2 border-dashed border-burnt-orange/30 rounded-2xl bg-warm-ivory/50 hover:bg-burnt-orange-light hover:border-burnt-orange transition text-charcoal hover:text-burnt-orange font-bold text-base flex flex-col items-center justify-center gap-2"
      >
        <span className="text-2xl">🎯</span>
        <span>Match My Resume to This Job</span>
        <span className="text-xs text-charcoal-muted font-normal">Calculates semantic compatibility, matched skills, and learning gaps</span>
      </button>
    );
  }

  if (loading) return <div className="p-6 bg-white rounded-2xl border border-[--border-subtle] shadow-warm-sm"><LoadingSkeleton lines={5} /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-charcoal">
      {/* Score */}
      <div className="bg-white border border-[--border-subtle] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-warm-sm">
        <div className={`text-5xl font-extrabold ${scoreColor(result.overallScore)}`}>
          {result.overallScore}%
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-charcoal-muted leading-relaxed font-medium">{result.explanation}</p>
        </div>
      </div>

      {/* Matched Skills */}
      {result.matchedSkills?.length > 0 && (
        <div className="bg-lime-green-light border border-lime-green/40 rounded-2xl p-5">
          <h4 className="text-lime-green-dark font-extrabold text-sm mb-3">
            ✅ Matched Skills ({result.matchedSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.matchedSkills.map((s, i) => (
              <Badge key={i} className="bg-white text-lime-green-dark border border-lime-green/40 font-semibold shadow-xs">
                {s.skill} • {s.proficiencyLevel}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {result.missingSkills?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <h4 className="text-terracotta font-extrabold text-sm mb-3">
            ❌ Missing Skills ({result.missingSkills.length})
          </h4>
          <div className="space-y-2">
            {result.missingSkills.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Badge variant={s.importance === 'critical' ? 'destructive' : 'secondary'} className={s.importance === 'critical' ? 'bg-terracotta text-white font-bold' : 'bg-warm-ivory-dark text-charcoal font-medium'}>
                  {s.importance}
                </Badge>
                <span className="text-charcoal font-semibold">{s.skill}</span>
                <span className="text-charcoal-dim text-xs">• {s.learnability} to learn</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partial Matches */}
      {result.partialMatches?.length > 0 && (
        <div className="bg-burnt-orange-light border border-burnt-orange/30 rounded-2xl p-5">
          <h4 className="text-burnt-orange font-extrabold text-sm mb-2">
            ⚠️ Partially Matched Skills ({result.partialMatches.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.partialMatches.map((s, i) => (
              <Badge key={i} variant="outline" className="border-burnt-orange/40 bg-white text-burnt-orange font-semibold">
                {s.jobSkill} ~ {s.resumeSkill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="text-right">
        <button
          onClick={runMatch}
          className="text-xs text-burnt-orange hover:text-burnt-orange-hover font-semibold hover:underline"
        >
          ↻ Re-calculate Match
        </button>
      </div>
    </motion.div>
  );
};

export default JobMatchCard;
