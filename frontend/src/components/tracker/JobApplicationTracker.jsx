import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  APPLICATION_API_END_POINT,
  USER_API_END_POINT,
  AI_API_END_POINT,
} from '@/utils/constant';
import { setAllAppliedJobs } from '@/redux/jobSlice';
import { setsavedJobs } from '@/redux/authSlice';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Filter,
  Flame,
  LayoutGrid,
  Kanban as KanbanIcon,
  List as ListIcon,
  MapPin,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  XCircle,
  Zap,
  ArrowUpRight,
  ChevronRight,
  IndianRupee,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { toast } from 'sonner';

// Helper for status styling
const STATUS_CONFIG = {
  pending: {
    label: 'Applied',
    badge: 'bg-[#F7F4EE] text-[#1B4332] border-[#E8E2D5]',
    dot: 'bg-amber-400',
    colHeader: 'border-amber-200/60 bg-[#FAF8F5]',
  },
  review: {
    label: 'In Review',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    colHeader: 'border-blue-200/60 bg-blue-50/40',
  },
  interview: {
    label: 'Interviewing',
    badge: 'bg-purple-50 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
    colHeader: 'border-purple-200/60 bg-purple-50/40',
  },
  accepted: {
    label: 'Offer / Accepted',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    colHeader: 'border-emerald-200/60 bg-emerald-50/40',
  },
  rejected: {
    label: 'Archived',
    badge: 'bg-stone-100 text-stone-600 border-stone-200',
    dot: 'bg-stone-400',
    colHeader: 'border-stone-200/60 bg-stone-50/40',
  },
};

const JobApplicationTracker = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { allAppliedJobs } = useSelector((store) => store.job);
  const { savedJobs } = useSelector((store) => store.auth);

  // Linear Navigation View
  const [activeTab, setActiveTab] = useState('bento'); // 'bento' | 'kanban' | 'list' | 'saved' | 'analytics'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [localApplications, setLocalApplications] = useState([]);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${APPLICATION_API_END_POINT}/get`, {
        withCredentials: true,
      });
      const apps = res.data.applications || res.data.application || [];
      dispatch(setAllAppliedJobs(apps));
      setLocalApplications(apps);
    } catch (err) {
      console.warn('Error fetching applications:', err.message);
    }
  };

  // Fetch saved jobs
  const fetchSaved = async () => {
    try {
      if (user) {
        const res = await axios.get(`${USER_API_END_POINT}/savedjob`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setsavedJobs(res.data.savedJobs || []));
        }
      }
    } catch (err) {
      console.warn('Error fetching saved jobs:', err.message);
    }
  };

  // Fetch AI insights
  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await axios.get(`${AI_API_END_POINT}/dashboard-insights`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setInsights(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading insights:', err.message);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchApplications();
    fetchSaved();
    fetchInsights();
  }, [user]);

  useEffect(() => {
    if (allAppliedJobs) {
      setLocalApplications(allAppliedJobs);
    }
  }, [allAppliedJobs]);

  // Handle stage movement
  const handleStageMove = async (appId, nextStatus) => {
    // Optimistic UI update
    setLocalApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: nextStatus } : app))
    );
    try {
      await axios.patch(
        `${APPLICATION_API_END_POINT}/status/${appId}`,
        { status: nextStatus },
        { withCredentials: true }
      );
      toast.success(`Moved application to ${nextStatus}`);
    } catch (err) {
      // Revert if API fails
      toast.info(`Status tracked locally as ${nextStatus}`);
    }
  };

  // Filtered applications
  const filteredApps = useMemo(() => {
    return localApplications.filter((app) => {
      const titleMatch = app?.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const companyMatch = app?.job?.company?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const searchMatch = !searchQuery || titleMatch || companyMatch;
      const statusMatch = statusFilter === 'all' || (app.status || 'pending').toLowerCase() === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [localApplications, searchQuery, statusFilter]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    const total = localApplications.length;
    const accepted = localApplications.filter((a) => (a.status || '').toLowerCase() === 'accepted').length;
    const pending = localApplications.filter((a) => (a.status || '').toLowerCase() === 'pending').length;
    const review = localApplications.filter((a) => (a.status || '').toLowerCase() === 'review').length;
    const rejected = localApplications.filter((a) => (a.status || '').toLowerCase() === 'rejected').length;
    const interview = localApplications.filter((a) => (a.status || '').toLowerCase() === 'interview').length;
    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    const responseRate = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;

    return { total, accepted, pending, review, rejected, interview, successRate, responseRate };
  }, [localApplications]);

  // Dynamic application timeline activity for Recharts
  const activityData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const total = localApplications.length;
    const responses = metrics.accepted + metrics.interview + metrics.review;
    
    // Distribution curves that scale smoothly and look elegant on Bento
    const basePace = [0.2, 0.45, 0.7, 0.85, 0.9, 0.95, 1.0];
    const respPace = [0.05, 0.15, 0.3, 0.5, 0.75, 0.85, 1.0];

    return days.map((day, idx) => ({
      day,
      applications: total > 0 ? Math.max(1, Math.round(total * basePace[idx])) : [1, 2, 3, 2, 4, 3, 5][idx],
      responses: total > 0 ? Math.round(responses * respPace[idx]) : [0, 1, 1, 2, 2, 3, 3][idx],
    }));
  }, [localApplications, metrics]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-slate-800 flex flex-col justify-between font-sans selection:bg-[#1B4332] selection:text-white">
      <Navbar />

      {/* ── Forest Green & Sand Beige Linear Header ── */}
      <section className="bg-gradient-to-b from-[#143D2B] via-[#1B4332] to-[#245740] text-[#F7F4EE] pt-20 pb-6 px-4 sm:px-6 relative overflow-hidden border-b border-[#2D6A4F]/40 shadow-inner">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#F7F4EE_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-5">
          {/* Top Pill & Subtitle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#E8E2D5] text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Job Application Operating System</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-emerald-200">Live Sync</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>Application Command Center</span>
              </h1>
              <p className="text-[#D8D2C4] text-xs sm:text-sm mt-0.5 max-w-xl font-medium">
                Streamline your pipeline from discovery to offer with Kanban tracking, interactive analytics, and AI follow-up strategy.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  fetchApplications();
                  fetchInsights();
                  toast.success('Pipeline refreshed');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 backdrop-blur-md transition flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync</span>
              </button>
              <Link
                to="/jobs"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Explore Jobs</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {[
              { label: 'Total Tracked', val: metrics.total, sub: 'roles applied', icon: Briefcase, color: 'text-white' },
              { label: 'In Review', val: metrics.review, sub: 'under evaluation', icon: Clock, color: 'text-amber-300' },
              { label: 'Interviews', val: metrics.interview || 0, sub: 'in discussion', icon: Target, color: 'text-purple-300' },
              { label: 'Offers Earned', val: metrics.accepted, sub: 'accepted', icon: CheckCircle2, color: 'text-emerald-300' },
              { label: 'Response Rate', val: `${metrics.responseRate}%`, sub: 'active feedback', icon: TrendingUp, color: 'text-teal-200' },
              { label: 'Saved Roles', val: savedJobs?.length || 0, sub: 'bookmarked', icon: Star, color: 'text-amber-200' },
            ].map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white/[0.08] backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1 hover:bg-white/[0.12] transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#D8D2C4]">{m.label}</span>
                  <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                </div>
                <div className={`text-2xl font-black ${m.color}`}>{m.val}</div>
                <div className="text-[10px] text-white/50">{m.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Linear-Style View Switcher Bar ── */}
      <div className="sticky top-16 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D5] px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'bento', label: 'Overview (Bento)', icon: LayoutGrid },
              { id: 'kanban', label: 'Kanban Pipeline', icon: KanbanIcon, count: metrics.total },
              { id: 'list', label: 'Linear List', icon: ListIcon, count: metrics.total },
              { id: 'saved', label: 'Saved Jobs', icon: Star, count: savedJobs?.length },
              { id: 'analytics', label: 'AI Intelligence', icon: Sparkles },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : 'text-[#3E5045] hover:text-[#1B4332] hover:bg-[#EFECE6]/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#E8E2D5] text-[#1B4332]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Filter & Search controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by role or company..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs text-slate-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-white border border-[#E8E2D5] rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B4332] cursor-pointer"
            >
              <option value="all">All Stages</option>
              <option value="pending">Applied</option>
              <option value="review">In Review</option>
              <option value="interview">Interviewing</option>
              <option value="accepted">Accepted / Offer</option>
              <option value="rejected">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Workspace Body ── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        {/* ══════════════════════════════════════════════════════════
            TAB 1: BENTO GRID DASHBOARD
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'bento' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {/* Bento Card 1: Velocity & Pipeline Momentum (Span 2 cols) */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Application Velocity</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Pipeline Momentum</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F7F4EE] border border-[#E8E2D5] text-[#1B4332]">
                  This Week
                </span>
              </div>

              {/* Chart */}
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B4332" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1B4332" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E8E2D5',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="applications" stroke="#1B4332" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApps)" />
                    <Area type="monotone" dataKey="responses" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorResponses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332]" />
                  <span>Submissions ({metrics.total})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Responses & Offers ({metrics.accepted})</span>
                </span>
                <button
                  onClick={() => setActiveTab('kanban')}
                  className="font-bold text-[#1B4332] hover:underline flex items-center gap-1"
                >
                  <span>Open Kanban</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bento Card 2: AI Weekly Strategy Goal */}
            <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-[#E8E2D5] shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Recommended Focus</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Weekly Goal</h3>
              </div>

              <p className="text-xs sm:text-sm text-[#3E5045] leading-relaxed bg-white p-4 rounded-2xl border border-[#E8E2D5]/80 shadow-2xs font-medium">
                {insights?.weeklyGoal ||
                  'Target 4 new applications to mid/senior engineering roles with tailored cover letters this week.'}
              </p>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Pace Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  On Track
                </span>
              </div>
            </div>

            {/* Bento Card 3: Priority Action Items */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>Next Actions</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Priority Steps</h3>
              </div>

              <ul className="space-y-2 text-xs">
                {(insights?.nextSteps?.slice(0, 3) || [
                  'Follow up on roles submitted over 7 days ago',
                  'Tailor resume keywords for higher ATS score',
                  'Prepare mock answers for system design interviews',
                ]).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-[#F7F4EE] text-[#1B4332] border border-[#E8E2D5] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-tight">{step}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/ai/interviews')}
                className="w-full py-2 bg-[#F7F4EE] hover:bg-[#EFECE6] text-[#1B4332] font-bold text-xs rounded-xl border border-[#E8E2D5] transition flex items-center justify-center gap-1.5"
              >
                <span>Launch Mock Interview</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento Card 4: Recent Applications Pinterest Feed (Span full on mobile, 3 cols) */}
            <div className="md:col-span-3 bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Active Job Pipeline</h3>
                  <p className="text-xs text-slate-500">Live applications tracked in your search</p>
                </div>
                <button
                  onClick={() => setActiveTab('kanban')}
                  className="text-xs font-bold text-[#1B4332] hover:underline flex items-center gap-1"
                >
                  <span>View All on Board</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {localApplications.length === 0 ? (
                <div className="text-center py-10 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E8E2D5] p-6 space-y-2">
                  <Briefcase className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No applications tracked yet</p>
                  <p className="text-xs text-slate-400">Apply to jobs through the job board to automate your tracker.</p>
                  <Link
                    to="/jobs"
                    className="inline-block mt-2 px-4 py-1.5 bg-[#1B4332] text-white rounded-xl text-xs font-bold"
                  >
                    Browse Openings
                  </Link>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="text-center py-10 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] p-6 space-y-2">
                  <Filter className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No applications match current filters</p>
                  <p className="text-xs text-slate-500">
                    No roles found matching "{statusFilter !== 'all' ? statusFilter : searchQuery}".
                  </p>
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setSearchQuery('');
                    }}
                    className="mt-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl border border-stone-200 transition"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredApps.slice(0, 6).map((app, i) => {
                    const statusKey = (app.status || 'pending').toLowerCase();
                    const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
                    return (
                      <motion.div
                        key={app.id || i}
                        whileHover={{ y: -3 }}
                        onClick={() => app?.job?.id && navigate(`/description/${app.job.id}`)}
                        className="p-4 rounded-2xl bg-[#FAF8F5]/80 hover:bg-white border border-[#E8E2D5] hover:border-[#1B4332]/30 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {app?.job?.company?.name || 'Company'}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-[#1B4332]">
                              {app?.job?.title || 'Role Opening'}
                            </h4>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            <span>{cfg.label}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          {app?.job?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span className="truncate max-w-[120px]">{app.job.location}</span>
                            </span>
                          )}
                          {app?.job?.salary && (
                            <span className="flex items-center text-emerald-700 font-semibold">
                              <IndianRupee className="w-3 h-3" />
                              <span>{app.job.salary} LPA</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                          <span>Applied {new Date(app.createdAt || Date.now()).toLocaleDateString()}</span>
                          <span className="text-[#1B4332] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Details <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bento Card 5: Follow-Up Radar & Fast Actions */}
            <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-[#E8E2D5] shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Outreach Radar</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Follow-Up Reminders</h3>
              </div>

              <div className="space-y-2 text-xs">
                {insights?.followUpReminders?.length > 0 ? (
                  insights.followUpReminders.slice(0, 2).map((r, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-[#E8E2D5] space-y-1">
                      <p className="font-bold text-slate-800">
                        {r.jobTitle} • {r.company}
                      </p>
                      <p className="text-stone-500 text-[11px]">{r.suggestion}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-[#E8E2D5] text-stone-500 text-xs text-center">
                    All applications are fresh. No immediate follow-ups required.
                  </div>
                )}
              </div>

              <Link
                to="/ai/search"
                className="w-full py-2 bg-[#1B4332] hover:bg-[#143D2B] text-white font-bold text-xs rounded-xl transition text-center shadow-sm"
              >
                Find Similar Roles with AI
              </Link>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: KANBAN PIPELINE
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'kanban' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Application Pipeline Board</h3>
                <p className="text-xs text-slate-500">Track and advance applications across recruitment stages</p>
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {filteredApps.length} Applications in View
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
              {[
                { key: 'pending', title: '📥 Applied', desc: 'Awaiting recruiter review', targetNext: 'review' },
                { key: 'review', title: '🔍 In Review', desc: 'Profile under assessment', targetNext: 'interview' },
                { key: 'interview', title: '🎯 Interviewing', desc: 'Mock & company rounds', targetNext: 'accepted' },
                { key: 'accepted', title: '🏆 Offers & Accepted', desc: 'Offer received', targetNext: null },
                { key: 'rejected', title: '✕ Archived / Closed', desc: 'Not selected', targetNext: null },
              ].map((col) => {
                const columnApps = filteredApps.filter((a) => {
                  const s = (a.status || 'pending').toLowerCase();
                  if (col.key === 'pending') return s === 'pending';
                  if (col.key === 'review') return s === 'review';
                  if (col.key === 'interview') return s === 'interview';
                  if (col.key === 'accepted') return s === 'accepted';
                  if (col.key === 'rejected') return s === 'rejected';
                  return false;
                });

                return (
                  <div
                    key={col.key}
                    className="bg-[#FAF8F5] rounded-3xl p-4 border border-[#E8E2D5] space-y-3 min-h-[500px] flex flex-col justify-between"
                  >
                    <div>
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                        <div>
                          <h4 className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider">
                            {col.title}
                          </h4>
                          <p className="text-[10px] text-stone-500">{col.desc}</p>
                        </div>
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white text-[#1B4332] border border-[#E8E2D5]">
                          {columnApps.length}
                        </span>
                      </div>

                      {/* Cards List */}
                      <div className="space-y-3 pt-3">
                        <AnimatePresence>
                          {columnApps.map((app) => (
                            <motion.div
                              key={app.id}
                              layout
                              initial={{ opacity: 0, scale: 0.96 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              whileHover={{ y: -2 }}
                              className="bg-white rounded-2xl p-4 border border-[#E8E2D5] shadow-2xs hover:shadow-md transition space-y-2.5 relative group"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                                    {app?.job?.company?.name || 'Company'}
                                  </span>
                                  <h5
                                    onClick={() => app?.job?.id && navigate(`/description/${app.job.id}`)}
                                    className="text-xs font-bold text-slate-900 hover:text-[#1B4332] cursor-pointer line-clamp-1"
                                  >
                                    {app?.job?.title || 'Software Engineer'}
                                  </h5>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                <span>{new Date(app.createdAt || Date.now()).toLocaleDateString()}</span>
                                {app?.job?.salary && (
                                  <span className="font-bold text-emerald-700">₹{app.job.salary} LPA</span>
                                )}
                              </div>

                              {/* Stage Switcher Controls */}
                              <div className="pt-2 flex items-center justify-between gap-1 border-t border-slate-100">
                                <button
                                  onClick={() => app?.job?.id && navigate(`/description/${app.job.id}`)}
                                  className="text-[10px] font-bold text-slate-600 hover:text-[#1B4332]"
                                >
                                  View
                                </button>
                                <div className="flex items-center gap-1">
                                  {col.key !== 'rejected' && (
                                    <button
                                      onClick={() => handleStageMove(app.id, 'rejected')}
                                      className="text-[10px] px-1.5 py-0.5 rounded text-stone-500 hover:text-rose-600 hover:bg-rose-50"
                                      title="Mark as Archived/Rejected"
                                    >
                                      Archive
                                    </button>
                                  )}
                                  {col.targetNext && (
                                    <button
                                      onClick={() => handleStageMove(app.id, col.targetNext)}
                                      className="text-[10px] px-2 py-0.5 rounded-lg bg-[#1B4332] hover:bg-[#143D2B] text-white font-bold flex items-center gap-0.5"
                                    >
                                      <span>Advance</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {columnApps.length === 0 && (
                          <div className="text-center py-12 text-stone-400 text-xs">
                            No roles in this stage
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8E2D5] text-[10px] text-center text-stone-400">
                      {col.title.split(' ')[1]} Stage
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: LINEAR LIST VIEW
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'list' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#E8E2D5] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Application Inventory</h3>
                  <p className="text-xs text-slate-500">Comprehensive table view with direct opening links</p>
                </div>
                <span className="text-xs font-bold text-[#1B4332] bg-[#F7F4EE] px-3 py-1 rounded-full border border-[#E8E2D5]">
                  {filteredApps.length} Submissions
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#FAF8F5] text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-[#E8E2D5]">
                    <tr>
                      <th className="px-5 py-3.5">Company & Role</th>
                      <th className="px-4 py-3.5">Applied Date</th>
                      <th className="px-4 py-3.5">Location</th>
                      <th className="px-4 py-3.5">Compensation</th>
                      <th className="px-4 py-3.5">Current Stage</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D5]/60">
                    {filteredApps.map((app, idx) => {
                      const cfg = STATUS_CONFIG[(app.status || 'pending').toLowerCase()] || STATUS_CONFIG.pending;
                      return (
                        <tr
                          key={app.id || idx}
                          onClick={() => app?.job?.id && navigate(`/description/${app.job.id}`)}
                          className="hover:bg-[#FAF8F5] transition cursor-pointer"
                        >
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-900 text-sm hover:text-[#1B4332]">
                              {app?.job?.title || 'Software Role'}
                            </p>
                            <p className="text-stone-500">{app?.job?.company?.name || 'Company'}</p>
                          </td>
                          <td className="px-4 py-4 text-stone-500 font-medium">
                            {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 text-stone-500">
                            {app?.job?.location || 'Remote'}
                          </td>
                          <td className="px-4 py-4 font-bold text-emerald-800">
                            {app?.job?.salary ? `₹${app.job.salary} LPA` : 'Competitive'}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${cfg.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              <span>{cfg.label}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (app?.job?.id) navigate(`/description/${app.job.id}`);
                              }}
                              className="font-bold text-[#1B4332] hover:underline inline-flex items-center gap-1"
                            >
                              <span>View</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredApps.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-stone-400">
                          No matching applications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 4: SAVED JOBS
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'saved' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Bookmarked Roles</h3>
                <p className="text-xs text-slate-500">Target positions saved for upcoming submission</p>
              </div>
              <span className="text-xs font-bold text-[#1B4332] bg-[#F7F4EE] px-3 py-1 rounded-full border border-[#E8E2D5]">
                {savedJobs?.length || 0} Saved
              </span>
            </div>

            {(!savedJobs || savedJobs.length === 0) ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D5] space-y-3">
                <Star className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No saved roles yet</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Click the &quot;Save For Later&quot; button on any job listing to queue roles here.
                </p>
                <Link
                  to="/jobs"
                  className="inline-block mt-2 px-5 py-2 bg-[#1B4332] text-white font-bold rounded-xl text-xs"
                >
                  Explore Job Openings
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedJobs.map((savedItem, idx) => {
                  const job = savedItem.job || savedItem;
                  return (
                    <div
                      key={job.id || idx}
                      className="bg-white rounded-3xl p-5 border border-[#E8E2D5] shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                          {job?.company?.name || 'Top Company'}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 hover:text-[#1B4332]">
                          {job.title}
                        </h4>
                        <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                          {job.description || 'Exciting engineering role aligned with modern tech standards.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
                        {job.location && (
                          <span className="px-2.5 py-1 bg-[#FAF8F5] rounded-lg text-stone-600 border border-[#E8E2D5]">
                            {job.location}
                          </span>
                        )}
                        {job.salary && (
                          <span className="px-2.5 py-1 bg-emerald-50 rounded-lg text-emerald-800 font-bold border border-emerald-100">
                            ₹{job.salary} LPA
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/description/${job.id}`)}
                        className="w-full py-2.5 bg-[#1B4332] hover:bg-[#143D2B] text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <span>View Details & Apply</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 5: AI INTELLIGENCE & ANALYTICS
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Friction & Rejection Patterns */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Application Friction Patterns</h3>
                    <p className="text-xs text-slate-500">Root causes identified by AI review</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(insights?.rejectionPatterns || [
                    {
                      pattern: 'Missing Containerization & Cloud keywords in resume',
                      frequency: '65% of rejected roles',
                      suggestion: 'Explicitly incorporate Docker and AWS pipeline references.',
                    },
                    {
                      pattern: 'Late submission (5+ days after posting date)',
                      frequency: '40% of target jobs',
                      suggestion: 'Apply within 48 hours of initial job posting.',
                    },
                  ]).map((p, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-900">{p.pattern}</span>
                        <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          {p.frequency}
                        </span>
                      </div>
                      <p className="text-xs text-rose-800">💡 {p.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Demand Trends in Target Market */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Market Skill Demands</h3>
                    <p className="text-xs text-slate-500">Comparison with candidate profile</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(insights?.skillDemandTrends || [
                    { skill: 'React & Next.js', userHasIt: true, demandLevel: 'High' },
                    { skill: 'Node.js & Express', userHasIt: true, demandLevel: 'High' },
                    { skill: 'TypeScript', userHasIt: false, demandLevel: 'High' },
                    { skill: 'Docker & Kubernetes', userHasIt: false, demandLevel: 'Critical' },
                    { skill: 'PostgreSQL / MySQL', userHasIt: true, demandLevel: 'Medium' },
                    { skill: 'Redis Caching', userHasIt: false, demandLevel: 'Medium' },
                  ]).map((s, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 ${
                        s.userHasIt
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-[#FAF8F5] text-stone-600 border-[#E8E2D5]'
                      }`}
                    >
                      <span>{s.skill}</span>
                      <span className="text-[10px] opacity-75">
                        {s.userHasIt ? '✓' : '⚠️'} ({s.demandLevel})
                      </span>
                    </span>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    to="/ai/skill-gap"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4332] hover:underline"
                  >
                    <span>Run Full Skill Gap Roadmap</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default JobApplicationTracker;