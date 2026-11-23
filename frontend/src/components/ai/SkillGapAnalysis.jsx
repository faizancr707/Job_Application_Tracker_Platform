import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AI_API_END_POINT } from '../../utils/constant';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle, Clock, BookOpen, Layers, Compass } from 'lucide-react';
import { toast } from 'sonner';

const GapSection = ({ title, icon: Icon, gaps, badgeColor, borderColor }) => {
  if (!gaps || gaps.length === 0) return null;

  return (
    <div className={`bg-white rounded-2xl border ${borderColor} p-6 shadow-sm`}>
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-600" />
          <span>{title}</span>
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
          {gaps.length} {gaps.length === 1 ? 'skill' : 'skills'}
        </span>
      </h3>

      <div className="space-y-3">
        {gaps.map((g, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-bold text-slate-900">{g.skill}</span>
              {g.demandPercentage && (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                  {g.demandPercentage}% of target jobs
                </span>
              )}
            </div>

            {g.estimatedLearningTime && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Estimated Ramp Time: {g.estimatedLearningTime}</span>
              </div>
            )}

            {g.resources && g.resources.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1.5">
                {g.resources.map((r, j) => (
                  <span
                    key={j}
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 shadow-2xs"
                  >
                    <BookOpen className="w-3 h-3 text-electric-500" />
                    <span>
                      <strong className="capitalize">{r.type}:</strong> {r.suggestion}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SkillGapAnalysis = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analyze();
  }, []);

  const analyze = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${AI_API_END_POINT}/skill-gap`, {}, { withCredentials: true });
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Skill gap analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      {/* Forest Green Header */}
      <section className="bg-gradient-to-br from-forest-950 via-forest-900 to-emerald text-white pt-28 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#52B788_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-mist text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-electric-300" />
              <span>Career Roadmap Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              AI Skill Gap Analysis
            </h1>
            <p className="text-emerald-frost/80 text-sm sm:text-base mt-2 max-w-xl">
              Benchmark your current skills against live hiring demand and follow a tailored 3-month action plan.
            </p>
          </div>

          <button
            onClick={analyze}
            disabled={loading}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition backdrop-blur-md flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Refresh Benchmark'}</span>
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        {loading ? (
          <div className="space-y-4">
            <LoadingSkeleton lines={4} />
            <LoadingSkeleton lines={4} />
            <LoadingSkeleton lines={3} />
          </div>
        ) : result ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Readiness Score Card */}
            {result.overallReadiness !== undefined && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-electric-600" />
                    <h3 className="text-base font-bold text-slate-900">Career Readiness Score</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md">
                    Calculated by cross-referencing your proficiencies with requirements from real target roles in our ecosystem.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span
                      className={`text-4xl sm:text-5xl font-black ${
                        result.overallReadiness >= 75
                          ? 'text-emerald-600'
                          : result.overallReadiness >= 50
                          ? 'text-electric-600'
                          : 'text-amber-500'
                      }`}
                    >
                      {result.overallReadiness}%
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                      Role Competency
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validated Strengths */}
            {result.strengths && result.strengths.length > 0 && (
              <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Validated Strengths & In-Demand Skills</span>
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  You already possess these high-value competencies required across target postings:
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.strengths.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gap Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GapSection
                title="Critical Skill Gaps"
                icon={AlertCircle}
                gaps={result.criticalGaps}
                badgeColor="bg-rose-50 text-rose-700 border border-rose-200"
                borderColor="border-rose-100"
              />

              <GapSection
                title="Important Gaps"
                icon={Layers}
                gaps={result.importantGaps}
                badgeColor="bg-amber-50 text-amber-700 border border-amber-200"
                borderColor="border-amber-100"
              />
            </div>

            {/* Nice to have */}
            {result.niceToHave && result.niceToHave.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Nice-to-Have Additions</h3>
                <div className="flex flex-wrap gap-2">
                  {result.niceToHave.map((g, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700"
                    >
                      {g.skill} {g.demandPercentage ? `(${g.demandPercentage}%)` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3-Month Learning Roadmap */}
            {result.learningPlan && (
              <div className="bg-white rounded-2xl border border-electric-100 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-electric-600" />
                  <h3 className="text-base font-bold text-slate-900">Recommended 3-Month Action Roadmap</h3>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-normal p-4 bg-slate-50 rounded-xl border border-slate-100">
                  {result.learningPlan}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl p-10 border border-slate-100 text-center space-y-4 shadow-sm">
            <Compass className="w-10 h-10 text-electric-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Ready to Benchmark Your Skills?</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Click below to analyze your profile and applications against real industry requirements.
            </p>
            <button
              onClick={analyze}
              className="px-6 py-2.5 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition"
            >
              Analyze My Skill Gaps
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SkillGapAnalysis;