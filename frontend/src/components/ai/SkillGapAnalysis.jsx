import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AI_API_END_POINT } from '../../utils/constant';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

const SkillGapAnalysis = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${AI_API_END_POINT}/skill-gap`, {}, { withCredentials: true });
      if (data.success) setResult(data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Analysis failed.'); }
    setLoading(false);
  };

  if (!result && !loading) {
    return (
      <div className="text-center py-16 bg-white border border-[--border-subtle] rounded-2xl p-8 shadow-warm-sm max-w-lg mx-auto space-y-4">
        <p className="text-5xl">📊</p>
        <h3 className="text-2xl font-extrabold text-charcoal">Skill Gap Analysis</h3>
        <p className="text-charcoal-muted text-sm leading-relaxed">
          Benchmark your resume profile against your target jobs to uncover critical skill gaps and generate a structured 3-month learning roadmap.
        </p>
        <button
          onClick={analyze}
          className="px-6 py-3 bg-burnt-orange hover:bg-burnt-orange-hover text-white rounded-xl text-sm font-semibold transition shadow-sm hover:shadow-glow-orange"
        >
          Analyze My Skill Gaps
        </button>
      </div>
    );
  }

  if (loading) return <div className="p-6 space-y-4"><LoadingSkeleton lines={4} /><LoadingSkeleton lines={4} /><LoadingSkeleton lines={3} /></div>;

  const GapSection = ({ title, emoji, gaps, color }) => {
    if (!gaps?.length) return null;
    const isRed = color === 'red';
    return (
      <div className={`border rounded-2xl p-6 ${isRed ? 'bg-red-50 border-red-200' : 'bg-burnt-orange-light border-burnt-orange/30'}`}>
        <h3 className={`font-extrabold text-base mb-4 flex items-center gap-2 ${isRed ? 'text-terracotta' : 'text-burnt-orange'}`}>
          <span>{emoji}</span> {title} ({gaps.length})
        </h3>
        <div className="space-y-3">
          {gaps.map((g, i) => (
            <div key={i} className="bg-white border border-[--border-subtle] rounded-xl p-4 shadow-warm-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-charcoal">{g.skill}</span>
                {g.demandPercentage && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-warm-ivory-dark text-charcoal">
                    {g.demandPercentage}% of target jobs
                  </span>
                )}
              </div>
              {g.estimatedLearningTime && (
                <p className="text-xs text-charcoal-muted mb-2 font-medium">⏱ Estimated time: {g.estimatedLearningTime}</p>
              )}
              {g.resources?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {g.resources.map((r, j) => (
                    <Badge key={j} variant="outline" className="text-xs bg-warm-ivory/60 border-[--border-subtle] text-charcoal">
                      {r.type}: {r.suggestion}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-4xl mx-auto text-charcoal">
      <div className="flex items-center justify-between pb-4 border-b border-[--border-subtle]">
        <h2 className="text-2xl font-extrabold text-charcoal">Skill Gap Analysis</h2>
        <button
          onClick={analyze}
          className="text-sm font-semibold text-burnt-orange hover:text-burnt-orange-hover hover:underline"
        >
          ↻ Refresh Analysis
        </button>
      </div>

      {/* Readiness Score */}
      {result.overallReadiness !== undefined && (
        <div className="bg-white border border-[--border-subtle] rounded-2xl p-8 text-center shadow-warm-sm">
          <p className="text-charcoal-muted text-sm font-medium mb-1">Overall Career Readiness Score</p>
          <p className={`text-5xl font-extrabold ${result.overallReadiness >= 70 ? 'text-lime-green-dark' : result.overallReadiness >= 40 ? 'text-burnt-orange' : 'text-terracotta'}`}>
            {result.overallReadiness}%
          </p>
        </div>
      )}

      {/* Strengths */}
      {result.strengths?.length > 0 && (
        <div className="bg-lime-green-light border border-lime-green/40 rounded-2xl p-6">
          <h3 className="text-lime-green-dark font-extrabold text-base mb-3 flex items-center gap-2">
            <span>💪</span> Validated Strengths
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.strengths.map((s, i) => (
              <Badge key={i} className="bg-white text-lime-green-dark border border-lime-green/40 font-semibold shadow-xs">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <GapSection title="Critical Gaps" emoji="🔴" gaps={result.criticalGaps} color="red" />
      <GapSection title="Important Gaps" emoji="🟠" gaps={result.importantGaps} color="yellow" />

      {result.niceToHave?.length > 0 && (
        <div className="bg-white border border-[--border-subtle] rounded-2xl p-6 shadow-warm-sm">
          <h3 className="text-charcoal font-bold text-base mb-3">🟢 Nice-to-Have Additions</h3>
          <div className="flex flex-wrap gap-2">
            {result.niceToHave.map((g, i) => (
              <Badge key={i} variant="outline" className="bg-warm-ivory/60 border-[--border-subtle] text-charcoal">
                {g.skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Learning Plan */}
      {result.learningPlan && (
        <div className="bg-warm-ivory-dark/70 border border-[--border-subtle] rounded-2xl p-6 shadow-warm-sm">
          <h3 className="text-burnt-orange font-bold text-base mb-2">📚 Recommended 3-Month Action Plan</h3>
          <p className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap font-medium">{result.learningPlan}</p>
        </div>
      )}
    </motion.div>
  );
};

export default SkillGapAnalysis;
