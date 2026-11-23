import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AI_API_END_POINT } from '../../utils/constant';
import { Badge } from '../ui/badge';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';

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

  return (
    <div className="bg-neu-base min-h-screen text-charcoal flex flex-col justify-between">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/20">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">AI Career Dashboard</h2>
            <p className="text-sm text-charcoal-muted mt-0.5">Aggregated metrics, response patterns, and intelligent recommendations</p>
          </div>
          <button
            onClick={fetchInsights}
            className="text-sm font-bold text-burnt-orange hover:text-burnt-orange-hover hover:underline"
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-4"><LoadingSkeleton lines={3} /><LoadingSkeleton lines={4} /><LoadingSkeleton lines={3} /></div>
        ) : !insights ? (
          <div className="p-8 text-center bg-neu-base border border-white/25 rounded-neu-lg max-w-lg mx-auto shadow-neu-raised">
            <p className="text-charcoal-muted font-medium">Unable to load insights. Apply to jobs first to unlock tracking analytics.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Success Rate */}
            {insights.successRate && (
              <div className="bg-neu-base border border-white/25 rounded-neu-lg p-6 shadow-neu-raised flex items-center justify-between gap-6">
                <div>
                  <h3 className="text-charcoal-dim text-xs font-bold uppercase tracking-wider mb-1">Application Success Rate</h3>
                  <p className="text-sm text-charcoal-muted font-medium mt-1">{insights.successRate.assessment}</p>
                </div>
                <div className="text-right">
                  <span className={`text-5xl font-extrabold ${insights.successRate.percentage >= 30 ? 'text-lime-green-dark' : 'text-burnt-orange'}`}>
                    {insights.successRate.percentage}%
                  </span>
                </div>
              </div>
            )}

            {/* Weekly Goal */}
            {insights.weeklyGoal && (
              <div className="bg-neu-base border border-burnt-orange/30 rounded-neu-lg p-6 shadow-neu-flat">
                <h3 className="text-burnt-orange font-extrabold text-base mb-1.5 flex items-center gap-2">
                  <span>🎯</span> Recommended Goal This Week
                </h3>
                <p className="text-charcoal text-sm font-medium leading-relaxed">{insights.weeklyGoal}</p>
              </div>
            )}

            {/* Next Steps */}
            {insights.nextSteps?.length > 0 && (
              <div className="bg-neu-base border border-white/25 rounded-neu-lg p-6 shadow-neu-raised">
                <h3 className="font-extrabold text-base mb-4 text-charcoal">🚀 Priority Actions</h3>
                <div className="space-y-3">
                  {insights.nextSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-neu-base shadow-neu-flat border border-white/20">
                      <span className="bg-gradient-to-br from-burnt-orange-dim to-burnt-orange text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-neu-btn">
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
              <div className="bg-neu-base border border-terracotta/30 rounded-neu-lg p-6 shadow-neu-flat">
                <h3 className="text-terracotta font-extrabold text-base mb-4 flex items-center gap-2">
                  <span>📉</span> Application Friction Patterns
                </h3>
                <div className="space-y-3">
                  {insights.rejectionPatterns.map((p, i) => (
                    <div key={i} className="bg-neu-base border border-white/20 rounded-xl p-4 shadow-neu-flat">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-charcoal">{p.pattern}</p>
                        <span className="text-xs font-bold text-terracotta">{p.frequency}</span>
                      </div>
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">💡 {p.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Demand Trends */}
            {insights.skillDemandTrends?.length > 0 && (
              <div className="bg-neu-base border border-white/25 rounded-neu-lg p-6 shadow-neu-raised">
                <h3 className="font-extrabold text-base mb-3 text-charcoal">📊 Skill Demand in Your Target Industry</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.skillDemandTrends.map((s, i) => (
                    <Badge
                      key={i}
                      className={
                        s.userHasIt
                          ? 'bg-lime-green-light text-deep-green border-lime-green/40 font-semibold shadow-neu-flat'
                          : 'bg-neu-base text-charcoal border border-white/20 font-medium shadow-neu-flat'
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
              <div className="bg-neu-base border border-burnt-orange/25 rounded-neu-lg p-6 shadow-neu-flat">
                <h3 className="text-burnt-orange font-extrabold text-base mb-3 flex items-center gap-2">
                  <span>📬</span> Suggested Follow-ups
                </h3>
                <div className="space-y-3">
                  {insights.followUpReminders.map((r, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-neu-base border border-white/20 rounded-xl p-4 gap-2 shadow-neu-flat">
                      <div>
                        <p className="text-sm font-bold text-charcoal">{r.jobTitle} at {r.company}</p>
                        <p className="text-xs text-burnt-orange font-bold">{r.daysPending} days since application</p>
                      </div>
                      <p className="text-xs text-charcoal-muted sm:text-right max-w-xs">{r.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DashboardInsights;
