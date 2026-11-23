import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { INTERVIEW_API_END_POINT } from '../../utils/constant';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import { Sparkles, MessageSquare, Award, Clock, ArrowRight, RotateCcw, CheckCircle2, AlertTriangle, BookOpen, ChevronDown, History } from 'lucide-react';
import { toast } from 'sonner';

const DOMAINS = [
  { id: 'technical', label: 'Technical & Coding', desc: 'Algorithms, data structures & clean code principles' },
  { id: 'system_design', label: 'System Design', desc: 'High concurrency, distributed architectures & databases' },
  { id: 'behavioral', label: 'Behavioral & Culture', desc: 'Conflict resolution, ownership & leadership stories' },
  { id: 'hr', label: 'HR & Fit', desc: 'Career trajectory, compensation expectations & motivation' },
];

const SENIORITIES = [
  { id: 'junior', label: 'Junior (0-2 YOE)' },
  { id: 'mid', label: 'Mid-Level (2-5 YOE)' },
  { id: 'senior', label: 'Senior / Lead (5+ YOE)' },
];

const InterviewPrep = () => {
  const [type, setType] = useState('technical');
  const [difficulty, setDifficulty] = useState('mid');
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [evaluations, setEvaluations] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [tab, setTab] = useState('practice');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(`${INTERVIEW_API_END_POINT}/history`, { withCredentials: true });
      if (data.success && data.data) {
        setHistory(data.data.interviews || []);
      }
    } catch {}
  };

  const startSession = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${INTERVIEW_API_END_POINT}/generate`,
        { type, difficulty, count: 5 },
        { withCredentials: true }
      );
      if (data.success && data.data) {
        setSession(data.data);
        setAnswers(new Array(data.data.questions?.length || 5).fill(''));
        setEvaluations(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async () => {
    if (!session) return;
    setEvaluating(true);
    try {
      const { data } = await axios.post(
        `${INTERVIEW_API_END_POINT}/${session.id}/evaluate`,
        { answers },
        { withCredentials: true }
      );
      if (data.success && data.data) {
        setEvaluations(data.data);
        fetchHistory();
        toast.success('Answers evaluated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      {/* Forest Green Header */}
      <section className="bg-gradient-to-br from-forest-950 via-forest-900 to-emerald text-white pt-28 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#52B788_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-mist text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-electric-300" />
              <span>Interactive Simulator</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              AI Mock Interview Simulator
            </h1>
            <p className="text-emerald-frost/80 text-sm sm:text-base mt-2 max-w-xl">
              Sharpen your responses against real company interview questions with instant scoring, strengths, and model answers.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15 shrink-0">
            <button
              onClick={() => setTab('practice')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                tab === 'practice'
                  ? 'bg-white text-forest-950 shadow-sm'
                  : 'text-emerald-frost/80 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Practice</span>
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                tab === 'history'
                  ? 'bg-white text-forest-950 shadow-sm'
                  : 'text-emerald-frost/80 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History ({history.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        {tab === 'practice' && !session && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
                  Select Interview Domain
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DOMAINS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setType(d.id)}
                      className={`p-4 rounded-xl text-left border transition ${
                        type === d.id
                          ? 'border-electric-500 bg-electric-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className={`text-sm font-bold ${type === d.id ? 'text-electric-800' : 'text-slate-800'}`}>
                        {d.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
                  Target Seniority Level
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {SENIORITIES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setDifficulty(s.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                        difficulty === s.id
                          ? 'bg-electric-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={startSession}
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-electric-600 to-electric hover:from-electric-700 hover:to-electric-600 text-white font-bold rounded-xl text-sm sm:text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Curated Questions...</span>
                    </>
                  ) : (
                    <>
                      <span>🎯 Begin Mock Interview (5 Questions)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* In-Session Question Answering */}
        {tab === 'practice' && session && !evaluations && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-electric-50 text-electric-700 border border-electric-100 capitalize">
                  {session.type?.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500 capitalize">• {session.difficulty} level</span>
              </div>
              <button
                onClick={() => {
                  setSession(null);
                  setAnswers([]);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {session.questions?.map((q, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      Question {i + 1} of {session.questions.length}
                    </span>
                    {q.type && (
                      <span className="text-[11px] font-semibold text-slate-500 capitalize">
                        {q.type}
                      </span>
                    )}
                  </div>
                  {q.timeLimit && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{q.timeLimit} min suggested</span>
                    </span>
                  )}
                </div>

                <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {q.question}
                </p>

                {q.expectedTopics && q.expectedTopics.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400">Key concepts:</span>
                    {q.expectedTopics.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <textarea
                  value={answers[i] || ''}
                  onChange={(e) => {
                    const updated = [...answers];
                    updated[i] = e.target.value;
                    setAnswers(updated);
                  }}
                  rows={4}
                  placeholder="Draft your answer here clearly with technical structure, constraints, or the STAR framework..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500 focus:bg-white resize-y"
                />

                <div className="flex justify-end">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {(answers[i] || '').trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>
            ))}

            <button
              onClick={submitAnswers}
              disabled={evaluating}
              className="w-full py-4 bg-gradient-to-r from-electric-600 to-electric hover:from-electric-700 hover:to-electric-600 text-white font-bold rounded-xl text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {evaluating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Answers & Benchmarking...</span>
                </>
              ) : (
                <>
                  <Award className="w-5 h-5 text-electric-200" />
                  <span>Submit & Receive AI Diagnostic Feedback</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Evaluation Results */}
        {tab === 'practice' && evaluations && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Session Summary Card */}
            {evaluations.summary && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  <span
                    className={`px-3 py-1 rounded-full font-extrabold ${
                      evaluations.summary.passed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {evaluations.summary.passed ? '✅ Passed Interview Threshold' : '⚠️ Practice Recommended'}
                  </span>
                </div>

                <div>
                  <span className="text-5xl font-black text-slate-900">
                    {evaluations.summary.overallScore || 75}
                  </span>
                  <span className="text-xl text-slate-400 font-bold"> / 100</span>
                </div>

                <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                  {evaluations.summary.summary}
                </p>

                {/* Strong & Improvement Areas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4 border-t border-slate-100">
                  {evaluations.summary.strongAreas && (
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                        Strong Areas
                      </p>
                      <ul className="space-y-1.5">
                        {evaluations.summary.strongAreas.map((sa, idx) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{sa}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluations.summary.improvementAreas && (
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                        Refinement Areas
                      </p>
                      <ul className="space-y-1.5">
                        {evaluations.summary.improvementAreas.map((ia, idx) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">→</span>
                            <span>{ia}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Per-Question Evaluation Cards */}
            {evaluations.evaluations?.map((ev, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">
                    Question {i + 1}: {session.questions[i]?.question}
                  </h4>
                  <span
                    className={`text-sm font-black px-3 py-1 rounded-full ${
                      (ev.score || 0) >= 7
                        ? 'bg-emerald-50 text-emerald-700'
                        : (ev.score || 0) >= 5
                        ? 'bg-electric-50 text-electric-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {ev.score || 0} / 10
                  </span>
                </div>

                {/* Candidate's submitted response */}
                {answers[i] && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <p className="font-bold text-slate-500 mb-1">Your Response:</p>
                    <p className="italic leading-relaxed">{answers[i]}</p>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {ev.strengths && ev.strengths.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <p className="font-bold text-emerald-800 mb-1">Strengths:</p>
                      <p className="text-slate-700">{ev.strengths.join(' • ')}</p>
                    </div>
                  )}
                  {ev.weaknesses && ev.weaknesses.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                      <p className="font-bold text-amber-800 mb-1">Areas to Refine:</p>
                      <p className="text-slate-700">{ev.weaknesses.join(' • ')}</p>
                    </div>
                  )}
                </div>

                {/* Benchmark Ideal Answer */}
                {ev.improvedAnswer && (
                  <details className="text-xs pt-1 group">
                    <summary className="font-bold text-electric-600 hover:text-electric-700 cursor-pointer flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View Benchmark Model Answer</span>
                      <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                      <MarkdownRenderer content={ev.improvedAnswer} />
                    </div>
                  </details>
                )}
              </div>
            ))}

            <div className="flex justify-center pt-2">
              <button
                onClick={() => {
                  setSession(null);
                  setEvaluations(null);
                }}
                className="px-8 py-3 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-sm font-bold shadow-md transition"
              >
                Start New Practice Session
              </button>
            </div>
          </motion.div>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-100 text-center space-y-2 shadow-sm">
                <History className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No mock sessions recorded yet</p>
                <p className="text-xs text-slate-400">Complete a practice session to see performance logs.</p>
              </div>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-sm hover:border-slate-200 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 capitalize">
                        {h.type?.replace('_', ' ')} Interview
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                        {h.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(h.createdAt).toLocaleDateString()} at{' '}
                      {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right">
                    {h.overallScore !== null && (
                      <span className="text-xl font-extrabold text-slate-800">
                        {h.overallScore} <span className="text-xs text-slate-400">/ 100</span>
                      </span>
                    )}
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          h.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default InterviewPrep;