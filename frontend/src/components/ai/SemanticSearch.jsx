import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AI_API_END_POINT } from '../../utils/constant';
import { Badge } from '../ui/badge';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';

const SemanticSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ location: '', jobType: '' });

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${AI_API_END_POINT}/semantic-search`, { query, filters }, { withCredentials: true });
      if (data.success) setResults(data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Search failed.'); }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-charcoal">
      <div className="pb-4 border-b border-[--border-subtle]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burnt-orange-light text-burnt-orange border border-burnt-orange/20 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-burnt-orange" />
          <span>Semantic Vector Search</span>
        </div>
        <h2 className="text-2xl font-extrabold text-charcoal tracking-tight">AI Smart Job Search</h2>
        <p className="text-charcoal-muted text-sm mt-0.5">
          Search jobs naturally by describing your ideal tech stack, compensation desires, or career vision.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-burnt-orange" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="e.g., Full stack React & Node developer in Bangalore with high ownership..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-[--border-subtle] rounded-2xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burnt-orange placeholder:text-charcoal-dim shadow-warm-sm"
          />
        </div>
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          className="px-6 py-3.5 bg-burnt-orange hover:bg-burnt-orange-hover text-white disabled:opacity-50 rounded-2xl text-sm font-semibold transition shadow-sm hover:shadow-glow-orange flex items-center gap-2"
        >
          {loading ? 'Searching...' : 'Explore Matches'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={filters.location}
          onChange={e => setFilters({ ...filters, location: e.target.value })}
          placeholder="Filter by location (e.g. Remote)"
          className="bg-white border border-[--border-subtle] rounded-xl px-3.5 py-2 text-sm text-charcoal w-56 focus:outline-none focus:ring-1 focus:ring-burnt-orange shadow-warm-sm placeholder:text-charcoal-dim"
        />
        <select
          value={filters.jobType}
          onChange={e => setFilters({ ...filters, jobType: e.target.value })}
          className="bg-white border border-[--border-subtle] rounded-xl px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-burnt-orange shadow-warm-sm"
        >
          <option value="">All Employment Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Remote">Remote</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      {/* Results */}
      {loading && (
        <div className="space-y-4">
          <LoadingSkeleton lines={3} />
          <LoadingSkeleton lines={3} />
          <LoadingSkeleton lines={3} />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3.5">
          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-[--border-subtle] rounded-2xl p-6 hover:border-burnt-orange/50 hover:shadow-warm-md transition cursor-pointer shadow-warm-sm"
              onClick={() => r.jobId && navigate(`/description/${r.jobId}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-charcoal hover:text-burnt-orange transition-colors">
                    {r.title || 'Untitled Job'}
                  </h3>
                  <p className="text-sm text-charcoal-muted font-medium mt-0.5">
                    {r.company || ''} {r.location ? `• ${r.location}` : ''}
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {r.jobType && (
                      <Badge variant="secondary" className="bg-warm-ivory-dark text-charcoal font-medium border-none">
                        {r.jobType}
                      </Badge>
                    )}
                    {r.salary && (
                      <span className="text-xs font-bold text-burnt-orange px-2.5 py-0.5 rounded-full bg-burnt-orange-light border border-burnt-orange/20">
                        ₹{Number(r.salary).toLocaleString()} LPA
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-extrabold ${r.relevanceScore >= 70 ? 'text-lime-green-dark' : r.relevanceScore >= 40 ? 'text-burnt-orange' : 'text-charcoal-dim'}`}>
                    {r.relevanceScore}%
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-dim">Semantic Fit</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[--border-subtle] p-8 shadow-warm-sm">
          <p className="text-charcoal-muted">No semantic matches found. Try broadening your description.</p>
        </div>
      )}
    </div>
  );
};

export default SemanticSearch;
