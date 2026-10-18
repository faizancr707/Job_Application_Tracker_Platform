import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AI_API_END_POINT } from '../../utils/constant';
import { Badge } from '../ui/badge';
import LoadingSkeleton from '../shared/LoadingSkeleton';

const DashboardInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInsights(); }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${AI_API_END_POINT}/dashboard-insights`, { withCredentials: true });
      if (data.success) setInsights(data.data);
    } catch {} finally { setLoading(false); }
  };

  if (loading) return <div className="p-6 space-y-4"><LoadingSkeleton lines={3} /><LoadingSkeleton lines={4} /><LoadingSkeleton lines={3} /></div>;
  if (!insights) {
    return (
      <div className="p-8 text-center bg-white border border-[--border-subtle] rounded-2xl max-w-lg mx-auto shadow-warm-sm">
        <p className="text-charcoal-muted font-medium">Unable to load insights. Apply to jobs first to unlock tracking analytics.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-4xl mx-auto space-y-6 text-charcoal">
      <div className="flex items-center justify-between pb-4 border-b border-[--border-subtle]">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal tracking-tight">AI Career Dashboard</h2>
          <p className="text-sm text-charcoal-muted mt-0.5">Aggregated metrics, response patterns, and intelligent recommendations</p>
        </div>
        <button
          onClick={fetchInsights}
          className="text-sm font-semibold text-burnt-orange hover:text-burnt-orange-hover hover:underline"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Success Rate */}
      {insights.successRate && (
        <div className="bg-white border border-[--border-subtle] rounded-2xl p-6 shadow-warm-sm flex items-center justify-between gap-6">
          <div>
            <h3 className="text-charcoal-dim text-xs font-bold uppercase tracking-wider mb-1">Application Success Rate</h3>
            <p className="text-sm text-charcoal-muted font-medium mt-1">{insights.successRate.assessment}</p>
          </div>
          <div className="text-right">
            <span className={`text-4xl font-extrabold ${insights.successRate.percentage >= 30 ? 'text-lime-green-dark' : 'text-burnt-orange'}`}>
              {insights.successRate.percentage}%
            </span>
          </div>
        </div>
      )}

      {/* Weekly Goal */}
      {insights.weeklyGoal && (
        <div className="bg-burnt-orange-light border border-burnt-orange/30 rounded-2xl p-6">
          <h3 className="text-burnt-orange font-extrabold text-base mb-1.5 flex items-center gap-2">
            <span>🎯</span> Recommended Goal This Week
          </h3>
          <p className="text-charcoal text-sm font-medium leading-relaxed">{insights.weeklyGoal}</p>
        </div>
      )}

      {/* Next Steps */}
      {insights.nextSteps?.length > 0 && (
        <div className="bg-white border border-[--border-subtle] rounded-2xl p-6 shadow-warm-sm">
          <h3 className="font-extrabold text-base mb-4 text-charcoal">🚀 Priority Actions</h3>
          <div className="space-y-3">
            {insights.nextSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-warm-ivory/50 border border-[--border-subtle]">
                <span className="bg-burnt-orange text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-charcoal font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Patterns */}
      {insights.rejectionPatterns?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-terracotta font-extrabold text-base mb-4 flex items-center gap-2">
            <span>📉</span> Application Friction Patterns
          </h3>
          <div className="space-y-3">
            {insights.rejectionPatterns.map((p, i) => (
              <div key={i} className="bg-white border border-red-200/60 rounded-xl p-4 shadow-warm-sm">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-charcoal">{p.pattern}</p>
                  <span className="text-xs font-semibold text-terracotta">{p.frequency}</span>
                </div>
                <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">💡 {p.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Demand Trends */}
      {insights.skillDemandTrends?.length > 0 && (
        <div className="bg-white border border-[--border-subtle] rounded-2xl p-6 shadow-warm-sm">
          <h3 className="font-extrabold text-base mb-3 text-charcoal">📊 Skill Demand in Your Target Industry</h3>
          <div className="flex flex-wrap gap-2">
            {insights.skillDemandTrends.map((s, i) => (
              <Badge
                key={i}
                className={
                  s.userHasIt
                    ? 'bg-lime-green-light text-lime-green-dark border-lime-green/40 font-semibold'
                    : 'bg-warm-ivory-dark text-charcoal border-none font-medium'
                }
              >
                {s.skill} {s.userHasIt ? '✓' : '✗'} <span className="ml-1 text-[10px] opacity-75">({s.demandLevel})</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up Reminders */}
      {insights.followUpReminders?.length > 0 && (
        <div className="bg-burnt-orange-light/60 border border-burnt-orange/25 rounded-2xl p-6">
          <h3 className="text-burnt-orange font-extrabold text-base mb-3 flex items-center gap-2">
            <span>📬</span> Suggested Follow-ups
          </h3>
          <div className="space-y-2.5">
            {insights.followUpReminders.map((r, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-[--border-subtle] rounded-xl p-4 gap-2 shadow-warm-sm">
                <div>
                  <p className="text-sm font-bold text-charcoal">{r.jobTitle} at {r.company}</p>
                  <p className="text-xs text-burnt-orange font-semibold">{r.daysPending} days since application</p>
                </div>
                <p className="text-xs text-charcoal-muted sm:text-right max-w-xs">{r.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardInsights;
