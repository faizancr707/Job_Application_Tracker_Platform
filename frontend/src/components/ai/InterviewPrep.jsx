import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { INTERVIEW_API_END_POINT } from '../../utils/constant';
import { Badge } from '../ui/badge';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { toast } from 'sonner';

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

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(`${INTERVIEW_API_END_POINT}/history`, { withCredentials: true });
      if (data.success) setHistory(data.data.interviews || []);
    } catch {}
  };

  const startSession = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${INTERVIEW_API_END_POINT}/generate`, { type, difficulty, count: 5 }, { withCredentials: true });
      if (data.success) {
        setSession(data.data);
        setAnswers(new Array(data.data.questions.length).fill(''));
        setEvaluations(null);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to generate questions.'); }
    setLoading(false);
  };

  const submitAnswers = async () => {
    if (!session) return;
    setEvaluating(true);
    try {
      const { data } = await axios.post(`${INTERVIEW_API_END_POINT}/${session.id}/evaluate`, { answers }, { withCredentials: true });
      if (data.success) { setEvaluations(data.data); fetchHistory(); }
    } catch (err) { toast.error(err.response?.data?.message || 'Evaluation failed.'); }
    setEvaluating(false);
  };

  const scoreColor = (s) => s >= 7 ? 'text-lime-green-dark' : s >= 4 ? 'text-burnt-orange' : 'text-terracotta';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-charcoal">
      <div className="flex items-center justify-between pb-4 border-b border-[--border-subtle]">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal tracking-tight">AI Interview Simulator</h2>
          <p className="text-sm text-charcoal-muted mt-0.5">Practice domain-specific questions with immediate scoring & model answers</p>
        </div>
        <div className="flex gap-2">
          {['practice', 'history'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
                tab === t
                  ? 'bg-burnt-orange text-white shadow-sm'
                  : 'bg-white border border-[--border-subtle] text-charcoal-muted hover:bg-warm-ivory-dark'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'practice' && !session && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-white border border-[--border-subtle] rounded-2xl p-8 space-y-6 shadow-warm-sm">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-burnt-orange mb-3 block">
                Interview Domain
              </label>
              <div className="flex gap-2 flex-wrap">
                {['technical', 'behavioral', 'hr', 'system_design'].map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
                      type === t
                        ? 'bg-burnt-orange text-white shadow-sm'
                        : 'bg-warm-ivory/60 border border-[--border-subtle] text-charcoal hover:bg-warm-ivory-dark'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-burnt-orange mb-3 block">
                Target Seniority
              </label>
              <div className="flex gap-2">
                {['junior', 'mid', 'senior'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
                      difficulty === d
                        ? 'bg-burnt-orange text-white shadow-sm'
                        : 'bg-warm-ivory/60 border border-[--border-subtle] text-charcoal hover:bg-warm-ivory-dark'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startSession}
              disabled={loading}
              className="w-full py-3.5 bg-burnt-orange hover:bg-burnt-orange-hover text-white disabled:opacity-50 rounded-xl font-semibold transition shadow-sm hover:shadow-glow-orange"
            >
              {loading ? 'Generating Mock Questions...' : '🎯 Begin Mock Interview'}
            </button>
          </div>
        </motion.div>
      )}

      {tab === 'practice' && session && !evaluations && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {session.questions.map((q, i) => (
            <div key={i} className="bg-white border border-[--border-subtle] rounded-2xl p-6 space-y-3.5 shadow-warm-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-burnt-orange/30 bg-burnt-orange-light text-burnt-orange font-bold">
                  Question {i + 1}
                </Badge>
                <Badge className="bg-warm-ivory-dark text-charcoal border-none font-semibold">
                  {q.difficulty}
                </Badge>
                {q.timeLimit && <span className="text-xs text-charcoal-dim">⏱ {q.timeLimit} min suggested</span>}
              </div>
              <p className="text-charcoal font-bold text-base">{q.question}</p>
              <textarea
                value={answers[i]}
                onChange={e => { const a = [...answers]; a[i] = e.target.value; setAnswers(a); }}
                placeholder="Write your response clearly, highlighting your approach and key concepts..."
                className="w-full bg-warm-ivory/40 border border-[--border-subtle] rounded-xl px-4 py-3 text-sm text-charcoal min-h-[120px] focus:outline-none focus:ring-2 focus:ring-burnt-orange placeholder:text-charcoal-dim resize-none"
              />
            </div>
          ))}
          <button
            onClick={submitAnswers}
            disabled={evaluating}
            className="w-full py-3.5 bg-burnt-orange hover:bg-burnt-orange-hover text-white disabled:opacity-50 rounded-xl font-semibold transition shadow-sm hover:shadow-glow-orange"
          >
            {evaluating ? 'Analyzing Responses...' : '📝 Submit & Get Instant Feedback'}
          </button>
        </motion.div>
      )}

      {tab === 'practice' && evaluations && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {evaluations.summary && (
            <div className="bg-white border border-[--border-subtle] rounded-2xl p-8 text-center shadow-warm-sm">
              <p className={`text-5xl font-extrabold ${evaluations.summary.overallScore >= 70 ? 'text-lime-green-dark' : evaluations.summary.overallScore >= 40 ? 'text-burnt-orange' : 'text-terracotta'}`}>
                {evaluations.summary.overallScore}<span className="text-2xl text-charcoal-dim">/100</span>
              </p>
              <p className="font-bold text-base mt-2 text-charcoal">
                {evaluations.summary.passed ? '✅ Strong Performance' : '⚠️ Practice Recommended'}
              </p>
              <p className="text-charcoal-muted text-sm mt-2 max-w-lg mx-auto">{evaluations.summary.summary}</p>
            </div>
          )}

          {evaluations.evaluations?.map((ev, i) => (
            <div key={i} className="bg-white border border-[--border-subtle] rounded-2xl p-6 space-y-3.5 shadow-warm-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[--border-subtle]">
                <span className="font-bold text-charcoal">Q{i + 1}: {session.questions[i]?.question?.substring(0, 50)}...</span>
                <span className={`text-xl font-extrabold ${scoreColor(ev.score)}`}>{ev.score}/10</span>
              </div>
              {ev.strengths?.length > 0 && (
                <div className="text-sm p-3 rounded-xl bg-lime-green-light border border-lime-green/30 text-charcoal">
                  <span className="text-lime-green-dark font-bold">Strengths:</span> {ev.strengths.join(', ')}
                </div>
              )}
              {ev.weaknesses?.length > 0 && (
                <div className="text-sm p-3 rounded-xl bg-red-50 border border-red-200 text-charcoal">
                  <span className="text-terracotta font-bold">Improvement Areas:</span> {ev.weaknesses.join(', ')}
                </div>
              )}
              {ev.improvedAnswer && (
                <details className="text-sm pt-1">
                  <summary className="text-burnt-orange hover:underline font-bold cursor-pointer">
                    View Benchmark Answer
                  </summary>
                  <div className="mt-2 bg-warm-ivory/60 border border-[--border-subtle] rounded-xl p-4 text-charcoal">
                    <MarkdownRenderer content={ev.improvedAnswer} />
                  </div>
                </details>
              )}
            </div>
          ))}

          <button
            onClick={() => { setSession(null); setEvaluations(null); }}
            className="px-6 py-3 bg-burnt-orange hover:bg-burnt-orange-hover text-white rounded-xl text-sm font-semibold transition shadow-sm"
          >
            Start New Practice Session
          </button>
        </motion.div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[--border-subtle] p-6 shadow-warm-sm">
              <p className="text-charcoal-muted">No mock interview sessions recorded yet.</p>
            </div>
          ) : (
            history.map(h => (
              <div key={h.id} className="bg-white border border-[--border-subtle] rounded-2xl p-5 flex items-center justify-between shadow-warm-sm hover:border-burnt-orange/40 transition">
                <div>
                  <p className="font-bold text-charcoal capitalize">{h.type?.replace('_', ' ')} Interview</p>
                  <p className="text-xs text-charcoal-dim mt-0.5">{new Date(h.createdAt).toLocaleDateString()} • {h.difficulty}</p>
                </div>
                <div className="text-right">
                  {h.overallScore !== null && (
                    <p className={`text-2xl font-extrabold ${h.overallScore >= 70 ? 'text-lime-green-dark' : h.overallScore >= 40 ? 'text-burnt-orange' : 'text-terracotta'}`}>
                      {h.overallScore}
                    </p>
                  )}
                  <Badge variant={h.status === 'completed' ? 'success' : 'secondary'} className="mt-1">
                    {h.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
