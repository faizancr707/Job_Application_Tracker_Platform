import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AI_API_END_POINT } from '../../utils/constant';
import { Badge } from '../ui/badge';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { toast } from 'sonner';

const JobAnalysisCard = ({ jobId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${AI_API_END_POINT}/analyze-job`, { jobId }, { withCredentials: true });
      if (data.success) setAnalysis(data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Analysis failed.'); }
    setLoading(false);
  };

  if (!analysis && !loading) {
    return (
      <button
        onClick={analyze}
        className="w-full py-8 border-2 border-dashed border-burnt-orange/30 rounded-2xl bg-warm-ivory/50 hover:bg-burnt-orange-light hover:border-burnt-orange transition text-charcoal hover:text-burnt-orange font-bold text-base flex flex-col items-center justify-center gap-2"
      >
        <span className="text-2xl">🔍</span>
        <span>Run Deep AI Job Analysis</span>
        <span className="text-xs text-charcoal-muted font-normal">Extracts required skills, experience benchmarks, and flags</span>
      </button>
    );
  }

  if (loading) return <div className="p-6 bg-white rounded-2xl border border-[--border-subtle] shadow-warm-sm"><LoadingSkeleton lines={6} /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-charcoal">
      {/* Summary */}
      <div className="bg-white border border-[--border-subtle] rounded-2xl p-6 shadow-warm-sm">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <Badge className="bg-burnt-orange-light text-burnt-orange border border-burnt-orange/30 font-bold">
            {analysis.seniorityLevel} Level
          </Badge>
          <span className="text-xs font-semibold text-charcoal-muted px-2.5 py-0.5 rounded-full bg-warm-ivory border border-[--border-subtle]">
            Expected Experience: {analysis.experienceRange?.min}-{analysis.experienceRange?.max} Years
          </span>
        </div>
        <p className="text-sm text-charcoal-muted leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Skills */}
      <div className="bg-white border border-[--border-subtle] rounded-2xl p-6 shadow-warm-sm">
        <h4 className="font-bold text-sm uppercase tracking-wider text-burnt-orange mb-3">Key Skill Requirements</h4>
        <div className="flex flex-wrap gap-2">
          {analysis.requiredSkills?.map((s, i) => {
            const isMustHave = s.importance === 'must-have';
            return (
              <Badge
                key={i}
                variant={isMustHave ? 'default' : 'outline'}
                className={
                  isMustHave
                    ? 'bg-burnt-orange text-white border-none font-bold'
                    : 'border-[--border-subtle] bg-warm-ivory/60 text-charcoal font-medium'
                }
              >
                {s.skill} {isMustHave ? '★' : ''}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Responsibilities */}
      {analysis.responsibilities?.length > 0 && (
        <div className="bg-white border border-[--border-subtle] rounded-2xl p-6 shadow-warm-sm">
          <h4 className="font-bold text-sm uppercase tracking-wider text-burnt-orange mb-2">Core Responsibilities</h4>
          <ul className="space-y-1.5">
            {analysis.responsibilities.map((r, i) => (
              <li key={i} className="text-sm text-charcoal-muted font-medium flex items-start gap-2">
                <span className="text-burnt-orange">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Red Flags */}
      {analysis.redFlags?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <h4 className="text-terracotta font-extrabold text-sm mb-2 flex items-center gap-1.5">
            <span>⚠️</span> Job Description Flags to Note
          </h4>
          <ul className="space-y-1">
            {analysis.redFlags.map((f, i) => (
              <li key={i} className="text-sm text-charcoal font-medium flex items-start gap-2">
                <span className="text-terracotta font-bold">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-right">
        <button
          onClick={analyze}
          className="text-xs text-burnt-orange hover:text-burnt-orange-hover font-semibold hover:underline"
        >
          ↻ Refresh Analysis
        </button>
      </div>
    </motion.div>
  );
};

export default JobAnalysisCard;
