import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AI_API_END_POINT } from '../../utils/constant';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { toast } from 'sonner';

const CoverLetterGenerator = ({ jobId }) => {
  const [result, setResult] = useState(null);
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!jobId) { toast.error('No job selected.'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${AI_API_END_POINT}/cover-letter`, { jobId, tone }, { withCredentials: true });
      if (data.success) setResult(data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Generation failed.'); }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.coverLetter);
    toast.success('Cover letter copied to clipboard!');
  };

  if (loading) return <div className="p-6 bg-white rounded-2xl border border-[--border-subtle] shadow-warm-sm"><LoadingSkeleton lines={8} /></div>;

  return (
    <div className="space-y-4 text-charcoal">
      {!result ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-charcoal">Writing Tone:</span>
            {['professional', 'conversational', 'creative'].map(t => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                  tone === t
                    ? 'bg-burnt-orange text-white shadow-sm'
                    : 'bg-warm-ivory/60 border border-[--border-subtle] text-charcoal hover:bg-warm-ivory-dark'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={generate}
            className="w-full py-3 bg-burnt-orange hover:bg-burnt-orange-hover text-white rounded-xl text-sm font-semibold transition shadow-sm hover:shadow-glow-orange"
          >
            ✍️ Generate Tailored Cover Letter
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white border border-[--border-subtle] rounded-2xl p-6 text-charcoal shadow-warm-sm leading-relaxed">
            <MarkdownRenderer content={result.coverLetter} />
          </div>

          {result.keyPointsUsed?.length > 0 && (
            <div className="bg-burnt-orange-light border border-burnt-orange/30 rounded-xl p-4">
              <h4 className="text-burnt-orange text-xs font-bold uppercase tracking-wider mb-2">Key Resume Highlights Incorporated:</h4>
              <ul className="space-y-1">
                {result.keyPointsUsed.map((p, i) => (
                  <li key={i} className="text-sm text-charcoal font-medium">• {p}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-warm-ivory-dark hover:bg-warm-ivory-muted text-charcoal font-semibold border border-[--border-subtle] rounded-xl text-sm transition"
            >
              📋 Copy to Clipboard
            </button>
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 bg-white hover:bg-warm-ivory-dark text-charcoal font-medium border border-[--border-subtle] rounded-xl text-sm transition"
            >
              ↻ Try Different Tone
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CoverLetterGenerator;
