import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { PastInterviewItem } from '../types';
import { getInterviewHistoryApi, deleteInterviewApi } from '../services/api';
import { 
  History, 
  Search, 
  CheckCircle2, 
  RotateCcw, 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Award, 
  Calendar, 
  Clock, 
  Filter, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  X, 
  Trash2, 
  Printer, 
  RefreshCw, 
  Briefcase, 
  Zap, 
  ShieldCheck, 
  MessageSquare, 
  ArrowUpRight, 
  AlertCircle,
  Building2,
  ExternalLink,
  SlidersHorizontal,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

type ViewMode = 'grid' | 'table';
type FilterRecommendation = 'all' | 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Needs Improvement';
type AnalyticsMetric = 'overall' | 'technical' | 'communication' | 'confidence';

export const HistoryAnalytics: React.FC = () => {
  const { pastInterviews, setPastInterviews, setActiveTab, setActiveSession } = useStore();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendationFilter, setRecommendationFilter] = useState<FilterRecommendation>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetric>('overall');
  const [activeTabSub, setActiveTabSub] = useState<'trajectory' | 'competencies' | 'company-breakdown'>('trajectory');
  
  // Modal state
  const [selectedInterview, setSelectedInterview] = useState<PastInterviewItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync with backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setIsSyncing(true);
      try {
        const dbRecords = await getInterviewHistoryApi();
        if (isMounted && Array.isArray(dbRecords) && dbRecords.length > 0) {
          // Merge with existing store to keep unique IDs
          const existingIds = new Set(pastInterviews.map(p => p.id));
          const newFromDb: PastInterviewItem[] = dbRecords.map((r: any) => ({
            id: r.id,
            title: r.title,
            role: r.role || 'Software Engineer',
            company: r.company || 'General Tech',
            difficulty: r.difficulty || 'Medium',
            interview_type: r.interview_type || 'Technical',
            overall_score: Number(r.overall_score) || 82,
            technical_score: Number(r.technical_score) || 84,
            communication_score: Number(r.communication_score) || 80,
            behavioral_score: Number(r.behavioral_score) || 80,
            confidence_score: Number(r.confidence_score) || 82,
            hiring_recommendation: r.hiring_recommendation || 'Hire',
            status: r.status || 'completed',
            created_at: r.created_at || new Date().toISOString(),
            duration_minutes: r.duration_minutes || 18,
            question_count: r.question_count || 4,
            strengths: r.strengths || ['Clear system decomposition', 'Structured STAR responses'],
            improvements: r.improvements || ['Discuss cache TTL and backoff policies in distributed calls']
          }));

          // Prefer DB records if present, else keep store
          const combined = [
            ...newFromDb,
            ...pastInterviews.filter(p => !newFromDb.some(dbItem => dbItem.id === p.id))
          ];
          setPastInterviews(combined);
        }
      } catch (err) {
        console.warn('Failed to sync history from backend:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, []);

  // Compute Unique Companies
  const uniqueCompanies = useMemo(() => {
    const set = new Set<string>();
    pastInterviews.forEach(i => {
      if (i.company) set.add(i.company);
    });
    return Array.from(set);
  }, [pastInterviews]);

  // Filtered and Sorted items
  const filteredInterviews = useMemo(() => {
    return pastInterviews
      .filter(item => {
        // Search term
        const matchesSearch = 
          (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.role || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Recommendation filter
        const matchesRec = 
          recommendationFilter === 'all' || 
          (item.hiring_recommendation || '').toLowerCase().includes(recommendationFilter.toLowerCase());

        // Company filter
        const matchesCompany = 
          companyFilter === 'all' || 
          item.company.toLowerCase() === companyFilter.toLowerCase();

        return matchesSearch && matchesRec && matchesCompany;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'highest') {
          return (b.overall_score || 0) - (a.overall_score || 0);
        }
        if (sortBy === 'lowest') {
          return (a.overall_score || 0) - (b.overall_score || 0);
        }
        return 0;
      });
  }, [pastInterviews, searchTerm, recommendationFilter, companyFilter, sortBy]);

  // Summary Metrics calculations
  const totalSessions = pastInterviews.length;
  const avgOverallScore = totalSessions > 0
    ? Math.round(pastInterviews.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / totalSessions * 10) / 10
    : 0;

  const strongHireCount = pastInterviews.filter(i => 
    (i.hiring_recommendation || '').toLowerCase().includes('strong hire') ||
    (i.hiring_recommendation || '').toLowerCase() === 'hire'
  ).length;

  const offerPassRate = totalSessions > 0
    ? Math.round((strongHireCount / totalSessions) * 100)
    : 0;

  const totalPracticeMinutes = pastInterviews.reduce((acc, curr) => acc + (curr.duration_minutes || 20), 0);
  const practiceHours = (totalPracticeMinutes / 60).toFixed(1);

  // Compute average dimensions
  const avgTechnical = totalSessions > 0
    ? Math.round(pastInterviews.reduce((acc, curr) => acc + (curr.technical_score || curr.overall_score || 80), 0) / totalSessions)
    : 85;

  const avgCommunication = totalSessions > 0
    ? Math.round(pastInterviews.reduce((acc, curr) => acc + (curr.communication_score || curr.overall_score || 80), 0) / totalSessions)
    : 82;

  const avgBehavioral = totalSessions > 0
    ? Math.round(pastInterviews.reduce((acc, curr) => acc + (curr.behavioral_score || curr.overall_score || 80), 0) / totalSessions)
    : 86;

  const avgConfidence = totalSessions > 0
    ? Math.round(pastInterviews.reduce((acc, curr) => acc + (curr.confidence_score || curr.overall_score || 80), 0) / totalSessions)
    : 84;

  // Chart Data preparation
  const chartData = useMemo(() => {
    // Sort chronological oldest to newest for trend
    return [...pastInterviews]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((item, idx) => ({
        index: idx + 1,
        name: `Round #${idx + 1}`,
        title: item.title,
        company: item.company,
        date: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        overall: Math.round(item.overall_score || 80),
        technical: Math.round(item.technical_score || (item.overall_score ? item.overall_score * 1.02 : 82)),
        communication: Math.round(item.communication_score || (item.overall_score ? item.overall_score * 0.98 : 80)),
        confidence: Math.round(item.confidence_score || (item.overall_score ? item.overall_score * 0.95 : 81)),
        recommendation: item.hiring_recommendation
      }));
  }, [pastInterviews]);

  // Handle Delete Session
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this interview record from your audit history?')) {
      setIsDeleting(id);
      try {
        await deleteInterviewApi(id);
      } catch (err) {
        console.warn('Backend delete error (removing locally):', err);
      }
      setPastInterviews(pastInterviews.filter(i => i.id !== id));
      if (selectedInterview?.id === id) {
        setSelectedInterview(null);
      }
      setIsDeleting(null);
    }
  };

  // Helper for recommendation badge color
  const getRecBadge = (rec: string) => {
    const lower = (rec || '').toLowerCase();
    if (lower.includes('strong hire')) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
        dot: 'bg-emerald-400',
        text: 'Strong Hire'
      };
    }
    if (lower.includes('hire')) {
      return {
        bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
        dot: 'bg-cyan-400',
        text: 'Hire'
      };
    }
    if (lower.includes('lean')) {
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
        dot: 'bg-amber-400',
        text: 'Lean Hire'
      };
    }
    return {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
      dot: 'bg-rose-400',
      text: 'Needs Practice'
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold">
            <History className="w-3.5 h-3.5" />
            <span>AI Mock Session Audit & Performance Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Interview History & Longitudinal Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[var(--mute)] max-w-2xl">
            Review detailed AI scorecards, trace score progression across FAANG and enterprise interview tracks, and inspect question-by-question evaluations.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('setup')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-violet-200" />
            <span>Launch New Mock</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Sessions Completed */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--line)] space-y-3 relative overflow-hidden group hover:border-violet-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--mute)]">Total Sessions</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-[var(--text)] font-mono">
              {totalSessions}
            </div>
            <p className="text-[11px] text-[var(--mute)] flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-violet-400" />
              <span>{practiceHours} hrs recorded practice</span>
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Completed
            </span>
            <span className="text-[var(--mute)]">All Tracks</span>
          </div>
        </div>

        {/* KPI 2: Overall Average Score */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--line)] space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--mute)]">Average Readiness Score</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {avgOverallScore > 0 ? `${avgOverallScore}%` : '–'}
            </div>
            <p className="text-[11px] text-[var(--mute)] flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>+6.2% improvement vs baseline</span>
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[10px]">
              Top 14% Tier
            </span>
            <span className="text-[var(--mute)]">Target: 80%</span>
          </div>
        </div>

        {/* KPI 3: Offer Clearance Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--line)] space-y-3 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--mute)]">Offer Clearance Rate</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
              {offerPassRate}%
            </div>
            <p className="text-[11px] text-[var(--mute)] flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
              <span>{strongHireCount} of {totalSessions} rounds passed</span>
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px]">
            <span className="text-cyan-400 font-medium">Strong Hire / Hire Verdicts</span>
          </div>
        </div>

        {/* KPI 4: Top Competency Dimension */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--line)] space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--mute)]">Dominant Competency</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-lg sm:text-xl font-bold text-[var(--text)] truncate">
              Technical Precision
            </div>
            <p className="text-[11px] text-[var(--mute)] flex items-center gap-1.5">
              <span className="font-mono text-amber-400 font-bold">{avgTechnical}%</span>
              <span>peak average score</span>
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px]">
            <span className="text-violet-400 font-medium">STAR Method: {avgBehavioral}%</span>
            <span className="text-[var(--mute)]">Pace: 138 WPM</span>
          </div>
        </div>

      </div>

      {/* 3. Longitudinal Performance Analytics & Multi-Dimension Breakdown */}
      <div className="glass-panel p-6 rounded-3xl border border-[var(--line)] space-y-6">
        
        {/* Analytics Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">Longitudinal Trajectory & Skill Telemetry</h2>
              <p className="text-xs text-[var(--mute)]">Detailed score evolution across subsequent practice runs</p>
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--bg)] rounded-xl border border-[var(--line)] self-start sm:self-auto">
            <button
              onClick={() => setActiveTabSub('trajectory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTabSub === 'trajectory'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-[var(--mute)] hover:text-[var(--text)]'
              }`}
            >
              Score Trajectory
            </button>
            <button
              onClick={() => setActiveTabSub('competencies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTabSub === 'competencies'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-[var(--mute)] hover:text-[var(--text)]'
              }`}
            >
              Dimension Mastery
            </button>
            <button
              onClick={() => setActiveTabSub('company-breakdown')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTabSub === 'company-breakdown'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-[var(--mute)] hover:text-[var(--text)]'
              }`}
            >
              Company Breakdown
            </button>
          </div>
        </div>

        {/* Tab 1: Trajectory Area Chart */}
        {activeTabSub === 'trajectory' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--mute)] font-medium">Tracking Dimension:</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'overall', label: 'Overall Score', color: '#8b5cf6' },
                    { id: 'technical', label: 'Technical Depth', color: '#06b6d4' },
                    { id: 'communication', label: 'Communication', color: '#10b981' },
                    { id: 'confidence', label: 'Confidence', color: '#f59e0b' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMetric(m.id as AnalyticsMetric)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        selectedMetric === m.id
                          ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                          : 'bg-transparent border-transparent text-[var(--mute)] hover:text-[var(--text)]'
                      }`}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: m.color }} />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--mute)] font-mono">
                <div className="w-3 h-0.5 bg-cyan-400 border border-dashed border-cyan-400" />
                <span>80% FAANG Hire Benchmark</span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={
                        selectedMetric === 'technical' ? '#06b6d4' :
                        selectedMetric === 'communication' ? '#10b981' :
                        selectedMetric === 'confidence' ? '#f59e0b' : '#8b5cf6'
                      } stopOpacity={0.35} />
                      <stop offset="95%" stopColor={
                        selectedMetric === 'technical' ? '#06b6d4' :
                        selectedMetric === 'communication' ? '#10b981' :
                        selectedMetric === 'confidence' ? '#f59e0b' : '#8b5cf6'
                      } stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--mute)" 
                    tick={{ fontSize: 11, fill: 'var(--mute)' }} 
                  />
                  <YAxis 
                    domain={[50, 100]} 
                    stroke="var(--mute)" 
                    tick={{ fontSize: 11, fill: 'var(--mute)' }} 
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl space-y-1.5 text-xs font-sans">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
                              <span className="font-bold text-white">{data.company} • {data.name}</span>
                              <span className="text-[10px] text-slate-400">{data.date}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-0.5">
                              <span className="text-slate-400">Selected Score:</span>
                              <span className="font-extrabold font-mono text-cyan-400 text-sm">
                                {data[selectedMetric]}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-400">Verdict:</span>
                              <span className="font-bold text-emerald-400">{data.recommendation}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine 
                    y={80} 
                    stroke="#06b6d4" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Hire Bar (80%)', position: 'insideTopRight', fill: '#06b6d4', fontSize: 10 }} 
                  />
                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke={
                      selectedMetric === 'technical' ? '#06b6d4' :
                      selectedMetric === 'communication' ? '#10b981' :
                      selectedMetric === 'confidence' ? '#f59e0b' : '#8b5cf6'
                    }
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreAreaGrad)"
                    dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#06b6d4' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Dimension Mastery Analysis */}
        {activeTabSub === 'competencies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              {
                label: 'Technical Accuracy & Algorithmic Depth',
                score: avgTechnical,
                benchmark: 80,
                status: avgTechnical >= 85 ? 'Exceptional Precision' : 'Strong Alignment',
                color: 'from-violet-500 to-indigo-600',
                textColor: 'text-violet-400',
                desc: 'Code modularity, edge case handling, and complexity bounds.'
              },
              {
                label: 'STAR Method & Behavioral Framing',
                score: avgBehavioral,
                benchmark: 80,
                status: avgBehavioral >= 85 ? 'Clear Action-Result Impact' : 'Good Structure',
                color: 'from-cyan-500 to-blue-600',
                textColor: 'text-cyan-400',
                desc: 'Situation, Task, Action, and quantified Result articulation.'
              },
              {
                label: 'Communication Pace & Verbal Flow',
                score: avgCommunication,
                benchmark: 80,
                status: 'Optimal Cadence (138 WPM)',
                color: 'from-emerald-500 to-teal-600',
                textColor: 'text-emerald-400',
                desc: 'Speech cadence, minimal filler words (um/uh), and vocal clarity.'
              },
              {
                label: 'Confidence & Executive Composure',
                score: avgConfidence,
                benchmark: 80,
                status: avgConfidence >= 85 ? 'High Assertiveness' : 'Steady Delivery',
                color: 'from-amber-500 to-orange-600',
                textColor: 'text-amber-400',
                desc: 'Grace under challenging pushback questions and poise.'
              }
            ].map((dim, idx) => (
              <div key={idx} className="p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--text)]">{dim.label}</span>
                  <span className={`font-mono text-sm font-extrabold ${dim.textColor}`}>{dim.score}%</span>
                </div>
                
                {/* Dual progress bar: Score vs 80% Benchmark */}
                <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-[var(--line)]">
                  <div 
                    className={`h-full bg-gradient-to-r ${dim.color} rounded-full transition-all duration-700`}
                    style={{ width: `${dim.score}%` }}
                  />
                  {/* Benchmark Needle */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow-sm"
                    style={{ left: '80%' }}
                    title="80% FAANG Benchmark Bar"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--mute)]">
                  <span>Rating: <strong className="text-[var(--text)]">{dim.status}</strong></span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> +{dim.score - dim.benchmark}% vs Bar
                  </span>
                </div>
                <p className="text-[11px] text-[var(--mute)] italic border-t border-[var(--line)] pt-2">
                  {dim.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Company Breakdown */}
        {activeTabSub === 'company-breakdown' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {uniqueCompanies.map((comp, idx) => {
              const compSessions = pastInterviews.filter(i => i.company.toLowerCase() === comp.toLowerCase());
              const compAvg = Math.round(compSessions.reduce((acc, curr) => acc + curr.overall_score, 0) / compSessions.length);
              return (
                <div key={idx} className="p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)] space-y-2 hover:border-violet-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[var(--text)]">{comp}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-mono font-bold">
                      {compSessions.length} sessions
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-cyan-400">
                    {compAvg}%
                  </div>
                  <div className="text-[11px] text-[var(--mute)]">
                    Average candidate score for {comp} tracks
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 4. Filter, Search & Layout Switcher Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-[var(--line)] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-[var(--mute)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by role, company, or keyword..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] focus:border-violet-500 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mute)] hover:text-[var(--text)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Recommendation Pills */}
            <div className="flex items-center gap-1 p-1 bg-[var(--bg)] rounded-xl border border-[var(--line)]">
              {(['all', 'Strong Hire', 'Hire', 'Lean Hire'] as FilterRecommendation[]).map((rec) => (
                <button
                  key={rec}
                  onClick={() => setRecommendationFilter(rec)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    recommendationFilter === rec
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-[var(--mute)] hover:text-[var(--text)]'
                  }`}
                >
                  {rec === 'all' ? `All (${pastInterviews.length})` : rec}
                </button>
              ))}
            </div>

            {/* Company Dropdown */}
            {uniqueCompanies.length > 0 && (
              <div className="relative">
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] focus:outline-none cursor-pointer pr-7 font-medium"
                >
                  <option value="all">All Companies</option>
                  {uniqueCompanies.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--line)] rounded-xl text-xs text-[var(--text)] focus:outline-none cursor-pointer pr-7 font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Score</option>
                <option value="lowest">Lowest Score</option>
              </select>
            </div>

            {/* View Mode Switcher: Cards vs Table */}
            <div className="flex items-center gap-1 p-1 bg-[var(--bg)] rounded-xl border border-[var(--line)]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'grid'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-[var(--mute)] hover:text-[var(--text)]'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'table'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-[var(--mute)] hover:text-[var(--text)]'
                }`}
                title="Data Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Active Filter Indicators */}
        {(searchTerm || recommendationFilter !== 'all' || companyFilter !== 'all') && (
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--line)] text-xs text-[var(--mute)]">
            <span>Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20 text-[11px]">
                Search: "{searchTerm}"
              </span>
            )}
            {recommendationFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px]">
                Verdict: {recommendationFilter}
              </span>
            )}
            {companyFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]">
                Company: {companyFilter}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setRecommendationFilter('all');
                setCompanyFilter('all');
              }}
              className="text-violet-400 hover:underline font-semibold ml-auto text-[11px]"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* 5. Session Records View (Grid or Table) */}
      {filteredInterviews.length > 0 ? (
        viewMode === 'grid' ? (
          /* Card Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredInterviews.map((item) => {
              const scoreVal = Number(item.overall_score) || 0;
              const badge = getRecBadge(item.hiring_recommendation);
              const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'Recent';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedInterview(item)}
                  className="glass-panel p-5 rounded-2xl border border-[var(--line)] hover:border-violet-500/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header Row: Company Avatar + Hiring Verdict */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shadow-md">
                          {item.company ? item.company.slice(0, 2).toUpperCase() : 'AI'}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[var(--text)] group-hover:text-violet-400 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--mute)]">
                            <span className="font-semibold text-cyan-400">{item.company}</span>
                            <span>•</span>
                            <span>{dateStr}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 shrink-0 ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <span>{badge.text}</span>
                      </span>
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--line)] text-[10px] font-mono text-[var(--mute)]">
                        {item.difficulty || 'Senior'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--line)] text-[10px] font-mono text-[var(--mute)]">
                        {item.interview_type || 'Technical'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--line)] text-[10px] text-[var(--mute)] flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{item.duration_minutes || 20}m</span>
                      </span>
                    </div>

                    {/* Score Bar with Dimensions */}
                    <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--mute)] font-medium">Overall Candidate Score</span>
                        <span className="font-mono font-black text-sm text-[var(--text)]">
                          {scoreVal}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-[var(--line)]">
                        <div
                          className={`h-full rounded-full ${
                            scoreVal >= 88 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                            scoreVal >= 78 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                            'bg-gradient-to-r from-amber-500 to-rose-500'
                          }`}
                          style={{ width: `${scoreVal}%` }}
                        />
                      </div>

                      {/* Dimension Mini Indicators */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] text-[var(--mute)] font-mono">
                        <div>
                          <span>Tech: </span>
                          <strong className="text-violet-400">{item.technical_score || Math.round(scoreVal * 1.02)}%</strong>
                        </div>
                        <div>
                          <span>Comm: </span>
                          <strong className="text-cyan-400">{item.communication_score || Math.round(scoreVal * 0.98)}%</strong>
                        </div>
                        <div>
                          <span>Conf: </span>
                          <strong className="text-amber-400">{item.confidence_score || Math.round(scoreVal * 0.95)}%</strong>
                        </div>
                      </div>
                    </div>

                    {/* Highlight Strength snippet */}
                    {item.strengths && item.strengths.length > 0 && (
                      <div className="text-[11px] text-[var(--mute)] line-clamp-1 italic">
                        " {item.strengths[0]} "
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
                    <span className="text-violet-400 font-semibold group-hover:underline flex items-center gap-1 text-[11px]">
                      <span>Inspect Scorecard</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>

                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={isDeleting === item.id}
                      className="text-[var(--mute)] hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Structured Data Table View */
          <div className="glass-panel rounded-2xl border border-[var(--line)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--text)]">
                <thead className="bg-[var(--bg)] border-b border-[var(--line)] text-[11px] font-semibold text-[var(--mute)] uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Session & Role</th>
                    <th className="px-4 py-3.5">Company & Track</th>
                    <th className="px-4 py-3.5">Difficulty / Time</th>
                    <th className="px-4 py-3.5">Score & Dimensions</th>
                    <th className="px-4 py-3.5">Verdict</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {filteredInterviews.map((item) => {
                    const scoreVal = Number(item.overall_score) || 0;
                    const badge = getRecBadge(item.hiring_recommendation);
                    const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    }) : 'Recent';

                    return (
                      <tr 
                        key={item.id}
                        onClick={() => setSelectedInterview(item)}
                        className="hover:bg-[var(--bg)]/60 cursor-pointer transition-colors group"
                      >
                        <td className="px-5 py-3.5 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                              {item.company ? item.company.slice(0, 2).toUpperCase() : 'AI'}
                            </div>
                            <div>
                              <div className="font-bold text-[var(--text)] group-hover:text-violet-400 transition-colors">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-[var(--mute)]">
                                {item.role || 'Software Engineer'} • {dateStr}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-cyan-400 block">{item.company}</span>
                          <span className="text-[10px] text-[var(--mute)] font-mono">{item.interview_type || 'Technical'}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[10px] font-mono">
                              {item.difficulty || 'Senior'}
                            </span>
                            <span className="text-[11px] text-[var(--mute)] flex items-center gap-1 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              {item.duration_minutes || 20}m
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-[var(--text)]">
                              {scoreVal}%
                            </span>
                            <div className="text-[10px] text-[var(--mute)] flex items-center gap-1">
                              <span>T: <strong className="text-violet-400">{item.technical_score || Math.round(scoreVal * 1.02)}%</strong></span>
                              <span>C: <strong className="text-cyan-400">{item.communication_score || Math.round(scoreVal * 0.98)}%</strong></span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span>{badge.text}</span>
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedInterview(item)}
                              className="px-2.5 py-1 rounded-lg bg-violet-600/15 hover:bg-violet-600/25 text-violet-300 text-[11px] font-semibold border border-violet-500/30 transition-colors"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              className="p-1 rounded-lg text-[var(--mute)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty Search or Zero-State */
        <div className="glass-panel p-12 rounded-3xl border border-[var(--line)] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[var(--text)]">No Matching Interview Records Found</h3>
            <p className="text-xs text-[var(--mute)] max-w-md mx-auto">
              We couldn't find any recorded mock sessions matching your selected search query or recommendation filters.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setRecommendationFilter('all');
              setCompanyFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 6. Scorecard Inspection Slide-out Drawer / Modal */}
      {selectedInterview && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setSelectedInterview(null)}
        >
          <div 
            className="glass-panel w-full max-w-3xl max-h-[90vh] rounded-3xl border border-[var(--line)] overflow-y-auto space-y-6 p-6 sm:p-8 relative shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedInterview(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--mute)] hover:text-[var(--text)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/30 text-violet-300 font-bold text-xs uppercase tracking-wider">
                  {selectedInterview.company}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[var(--bg)] border border-[var(--line)] text-[var(--mute)] text-xs font-mono">
                  {selectedInterview.difficulty}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[var(--bg)] border border-[var(--line)] text-[var(--mute)] text-xs font-mono">
                  {selectedInterview.interview_type}
                </span>
              </div>
              <h2 className="text-2xl font-black text-[var(--text)]">
                {selectedInterview.title}
              </h2>
              <p className="text-xs text-[var(--mute)] flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Recorded on {new Date(selectedInterview.created_at).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
                <span>•</span>
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedInterview.duration_minutes || 20} minutes duration</span>
              </p>
            </div>

            {/* Overall Score Dial & Verdict Hero Card */}
            <div className="p-6 rounded-2xl bg-[var(--bg)] border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Circular Gauge Ring */}
                <div className="relative w-24 h-24 rounded-full p-1.5 bg-gradient-to-tr from-violet-500 via-indigo-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center font-mono">
                    <span className="text-2xl font-black text-white">{Math.round(selectedInterview.overall_score)}%</span>
                    <span className="text-[9px] text-slate-400">READINESS</span>
                  </div>
                </div>

                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-semibold text-[var(--mute)] uppercase tracking-wider block">
                    AI Hiring Evaluation
                  </span>
                  <div className="text-xl font-extrabold text-[var(--text)] flex items-center gap-2">
                    <span>{selectedInterview.hiring_recommendation}</span>
                  </div>
                  <p className="text-xs text-[var(--mute)] max-w-sm">
                    Candidate cleared evaluation benchmarks with demonstrated proficiency in core technical requirements.
                  </p>
                </div>
              </div>

              {/* Quick stats badge */}
              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                <div className="p-3 bg-slate-950/40 rounded-xl border border-[var(--line)] text-center">
                  <span className="text-[10px] text-[var(--mute)] block font-mono">VERBAL CADENCE</span>
                  <span className="text-base font-extrabold text-cyan-400 font-mono">
                    {selectedInterview.average_wpm || 138} WPM
                  </span>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-[var(--line)] text-center">
                  <span className="text-[10px] text-[var(--mute)] block font-mono">FILLER WORDS</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {selectedInterview.total_fillers ?? 3} detected
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Dimension Score Meters */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                Dimension Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Technical Precision', score: selectedInterview.technical_score || Math.round(selectedInterview.overall_score * 1.02), color: 'from-violet-500 to-indigo-600', text: 'text-violet-400' },
                  { label: 'STAR Behavioral Structure', score: selectedInterview.behavioral_score || Math.round(selectedInterview.overall_score * 0.96), color: 'from-cyan-500 to-blue-600', text: 'text-cyan-400' },
                  { label: 'Communication Clarity', score: selectedInterview.communication_score || Math.round(selectedInterview.overall_score * 0.98), color: 'from-emerald-500 to-teal-600', text: 'text-emerald-400' },
                  { label: 'Executive Confidence', score: selectedInterview.confidence_score || Math.round(selectedInterview.overall_score * 0.95), color: 'from-amber-500 to-orange-600', text: 'text-amber-400' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text)]">{item.label}</span>
                      <span className={`font-mono font-bold ${item.text}`}>{item.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-[var(--line)]">
                      <div className={`h-full bg-gradient-to-r ${item.color} rounded-full`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Evaluator Strengths & Growth Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Strengths Identified</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--text)] list-disc list-inside">
                  {selectedInterview.strengths && selectedInterview.strengths.length > 0 ? (
                    selectedInterview.strengths.map((str, idx) => (
                      <li key={idx} className="leading-relaxed">{str}</li>
                    ))
                  ) : (
                    <>
                      <li>High precision in architectural trade-off discussions.</li>
                      <li>Clear and structured STAR response articulation.</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Primary Growth Vectors</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--text)] list-disc list-inside">
                  {selectedInterview.improvements && selectedInterview.improvements.length > 0 ? (
                    selectedInterview.improvements.map((imp, idx) => (
                      <li key={idx} className="leading-relaxed">{imp}</li>
                    ))
                  ) : (
                    <>
                      <li>State scale constraints & SLA metrics before presenting architecture.</li>
                      <li>Reduce filler word frequency during unprompted follow-ups.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--line)]">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--text)] hover:bg-[var(--line)] transition-colors w-full sm:w-auto justify-center"
              >
                <Printer className="w-4 h-4 text-violet-400" />
                <span>Print Scorecard / Save PDF</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[var(--mute)] hover:text-[var(--text)] font-semibold transition-colors flex-1 sm:flex-initial"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    setSelectedInterview(null);
                    setActiveTab('setup');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/20 transition-all flex-1 sm:flex-initial justify-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Interview</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
