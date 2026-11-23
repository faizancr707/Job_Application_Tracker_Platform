import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AI_API_END_POINT } from '../../utils/constant';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { toast } from 'sonner';
import { Sparkles, Copy, Check, RefreshCw, PenTool } from 'lucide-react';

const CoverLetterGenerator = ({ jobId }) => {
  const [result, setResult] = useState(null);
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!jobId) {
      toast.error('No job selected.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${AI_API_END_POINT}/cover-letter`,
        { jobId, tone },
        { withCredentials: true }
      );
      if (data.success) {
        setResult(data.data);
        toast.success('Tailored cover letter generated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result?.coverLetter) return;
    navigator.clipboard.writeText(result.coverLetter);
    setCopied(true);
    toast.success('Cover letter copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-glass space-y-4">
        <div className="flex items-center gap-2 text-electric font-bold text-sm animate-pulse">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Generating tailored {tone} cover letter based on your background...</span>
        </div>
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  return (
    <div className="space-y-5 text-slate-800">
      {!result ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-bold text-slate-700">Writing Tone:</span>
            {['professional', 'conversational', 'creative'].map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-200 cursor-pointer ${
                  tone === t
                    ? 'bg-gradient-to-r from-electric to-electric-dim text-white shadow-[0_2px_8px_rgba(124,58,237,0.3)]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={generate}
            className="w-full py-3.5 bg-gradient-to-r from-electric to-electric-dim hover:from-electric-dim hover:to-electric text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-[0_4px_16px_rgba(124,58,237,0.25)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <PenTool className="w-4 h-4" />
            <span>Generate Tailored Cover Letter</span>
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-electric bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                {result.tone || tone} Tone
              </span>
              <span className="text-xs text-slate-500 font-medium">Ready to submit</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="px-3.5 py-1.5 bg-electric text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_2px_8px_rgba(124,58,237,0.25)] hover:bg-electric-dim cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Letter'}</span>
            </button>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 text-slate-800 shadow-glass-inner leading-relaxed whitespace-pre-line text-sm font-normal">
            <MarkdownRenderer content={result.coverLetter} />
          </div>

          {result.keyPointsUsed?.length > 0 && (
            <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-4 shadow-glass-sm">
              <h4 className="text-electric text-xs font-bold uppercase tracking-wider mb-2">Key Profile Highlights Incorporated:</h4>
              <ul className="space-y-1">
                {result.keyPointsUsed.map((p, i) => (
                  <li key={i} className="text-xs text-slate-700 font-medium flex items-start gap-2">
                    <span className="text-electric">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 bg-white text-slate-700 font-medium border border-slate-200/80 rounded-xl text-xs transition hover:bg-slate-50 shadow-glass-sm flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Different Tone</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CoverLetterGenerator;
