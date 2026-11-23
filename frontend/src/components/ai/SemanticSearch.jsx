import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AI_API_END_POINT } from '../../utils/constant';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, MapPin, Briefcase, IndianRupee, ArrowRight, Zap, Filter } from 'lucide-react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';

const SUGGESTED_QUERIES = [
  'Full Stack React & Node developer',
  'Frontend Engineer with Tailwind & TypeScript',
  'Backend Engineer high scale microservices',
  'Remote Software Engineer competitive salary',
];

const SemanticSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({ location: '', jobType: '' });

  // Load baseline jobs on initial mount
  useEffect(() => {
    executeSearch('Full stack developer');
  }, []);

  const executeSearch = async (searchQuery = query) => {
    const q = (searchQuery || '').trim();
    if (!q) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const { data } = await axios.post(
        `${AI_API_END_POINT}/semantic-search`,
        { query: q, filters },
        { withCredentials: true }
      );
      if (data.success) {
        setResults(data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (suggestion) => {
    setQuery(suggestion);
    executeSearch(suggestion);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      {/* Top Forest Green Header */}
      <section className="bg-gradient-to-br from-forest-950 via-forest-900 to-emerald text-white pt-28 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#52B788_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-mist text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-electric-300" />
            <span>Semantic Vector Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            AI Smart Job Search
          </h1>
          <p className="text-emerald-frost/80 text-sm sm:text-base mt-2 max-w-2xl">
            Search roles by describing what you want naturally — our vector model pairs your intent with ideal engineering roles.
          </p>

          {/* Search Box Card */}
          <div className="mt-8 bg-white/90 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl shadow-xl border border-white/40 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                placeholder="e.g., Full stack React & Node developer in Bangalore with high ownership..."
                className="w-full pl-11 pr-4 py-3 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm sm:text-base font-medium focus:outline-none"
              />
            </div>
            <button
              onClick={() => executeSearch()}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-electric-600 to-electric hover:from-electric-700 hover:to-electric-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-electric-200" />
                  <span>Search Matches</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Query Suggestion Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-emerald-frost/70">Popular:</span>
            {SUGGESTED_QUERIES.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleChipClick(sq)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white/90 px-3 py-1 rounded-full border border-white/10 transition backdrop-blur-sm"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Results Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        {/* Filters bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
            <Filter className="w-4 h-4 text-electric-600" />
            <span>Refine Results</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                onBlur={() => executeSearch()}
                placeholder="Location (e.g. Bangalore)"
                className="pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric-500 text-slate-700 w-48"
              />
            </div>

            <select
              value={filters.jobType}
              onChange={(e) => {
                setFilters({ ...filters, jobType: e.target.value });
                setTimeout(() => executeSearch(), 50);
              }}
              className="py-1.5 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric-500 text-slate-700 cursor-pointer"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            <LoadingSkeleton lines={3} />
            <LoadingSkeleton lines={3} />
            <LoadingSkeleton lines={3} />
          </div>
        )}

        {/* Results listing */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Found {results.length} Semantically Relevant Roles
              </p>
            </div>

            <AnimatePresence>
              {results.map((r, i) => (
                <motion.div
                  key={r.jobId || i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => r.jobId && navigate(`/description/${r.jobId}`)}
                  className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-electric-200 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-electric-700 transition-colors">
                        {r.title || 'Software Engineer'}
                      </h3>
                      {r.company && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {r.company}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {r.snippet || 'High-impact engineering opportunity aligned with modern stack requirements.'}
                    </p>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {r.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {r.location}
                        </span>
                      )}
                      {r.jobType && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          {r.jobType}
                        </span>
                      )}
                      {r.salary && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          <IndianRupee className="w-3 h-3" />
                          {Number(r.salary).toLocaleString()} LPA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score pill & CTA */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-electric-50 border border-electric-100 text-electric-700 font-extrabold text-sm shadow-xs">
                        <Sparkles className="w-3 h-3 text-electric-500" />
                        <span>{r.relevanceScore || 85}% Fit</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (r.jobId) navigate(`/description/${r.jobId}`);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-electric-700 transition"
                    >
                      <span>View Opening</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 && hasSearched && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No matching roles found</h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Try modifying keywords, removing filters, or searching for broader terms like &quot;developer&quot; or &quot;engineer&quot;.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SemanticSearch;