import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  ShieldAlert, 
  Users, 
  BarChart3, 
  Activity, 
  CheckCircle2, 
  Lock, 
  RotateCw, 
  Search, 
  Database, 
  Zap, 
  Server,
  Crown,
  Calendar,
  TrendingUp,
  Award,
  Filter,
  UserCheck,
  X
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AdminPanel: React.FC = () => {
  const { userProfile, setActiveTab } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [usageFilter, setUsageFilter] = useState<'All' | '1' | '2-4' | '5plus'>('All');

  // Candidate user list with exact monthly session counts
  const [candidates, setCandidates] = useState([
    { id: 1, name: 'Alex Dev', email: 'alex@dev.com', role: 'Software Engineer', interviews: 8, avgScore: 89, status: 'Active', plan: 'Free Starter', joinedMonth: 'Jan 2026', monthlySessions: 8 },
    { id: 2, name: 'Sarah Tech', email: 'sarah@tech.org', role: 'Frontend Developer', interviews: 5, avgScore: 92, status: 'Active', plan: 'Pro Unlimited', joinedMonth: 'Mar 2026', monthlySessions: 5 },
    { id: 3, name: 'c1 Candidate', email: 'c1@gmail.com', role: 'Mid-Level SWE', interviews: 6, avgScore: 84.5, status: 'Active', plan: 'Free Starter', joinedMonth: 'Jul 2026', monthlySessions: 6 },
    { id: 4, name: 'Elena Architect', email: 'elena@arch.com', role: 'System Architect', interviews: 12, avgScore: 95, status: 'Active', plan: 'Pro Unlimited', joinedMonth: 'May 2026', monthlySessions: 12 },
    { id: 5, name: 'Marcus Data', email: 'marcus@data.io', role: 'Data Engineer', interviews: 3, avgScore: 82, status: 'Active', plan: 'Free Starter', joinedMonth: 'Jun 2026', monthlySessions: 3 },
    { id: 6, name: 'Jessica Product', email: 'jessica@pm.org', role: 'Product Manager', interviews: 1, avgScore: 91, status: 'Active', plan: 'Free Starter', joinedMonth: 'Jul 2026', monthlySessions: 1 },
    { id: 7, name: 'Rohan Sharma', email: 'rohan@sharma.dev', role: 'Full Stack Dev', interviews: 1, avgScore: 79, status: 'Active', plan: 'Free Starter', joinedMonth: 'Jul 2026', monthlySessions: 1 }
  ]);

  // Calculated Monthly Registration Totals for Chart
  const monthlyUserData = [
    { month: 'Jan 2026', totalUsers: 42, activeUsers: 38, sessions: 180 },
    { month: 'Feb 2026', totalUsers: 68, activeUsers: 62, sessions: 290 },
    { month: 'Mar 2026', totalUsers: 105, activeUsers: 94, sessions: 480 },
    { month: 'Apr 2026', totalUsers: 148, activeUsers: 135, sessions: 670 },
    { month: 'May 2026', totalUsers: 195, activeUsers: 180, sessions: 890 },
    { month: 'Jun 2026', totalUsers: 240, activeUsers: 220, sessions: 1120 },
    { month: 'Jul 2026', totalUsers: 285, activeUsers: 265, sessions: 1450 }
  ];

  const currentMonthStats = monthlyUserData[monthlyUserData.length - 1];

  // Calculated session usage metrics
  const oneSessionUsers = candidates.filter(c => c.monthlySessions === 1);
  const midUsageUsers = candidates.filter(c => c.monthlySessions >= 2 && c.monthlySessions <= 4);
  const heavyUsageUsers = candidates.filter(c => c.monthlySessions >= 5);

  const toggleUserStatus = (id: number) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return c;
    }));
  };

  const togglePlanTier = (id: number) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, plan: c.plan === 'Free Starter' ? 'Pro Unlimited' : 'Free Starter' };
      }
      return c;
    }));
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.role.toLowerCase().includes(searchQuery.toLowerCase());

    const [cMonth, cYear] = c.joinedMonth.split(' ');
    const matchesYear = selectedYear === 'All' || cYear === selectedYear;
    const matchesMonth = selectedMonth === 'All' || cMonth === selectedMonth;
    
    let matchesUsage = true;
    if (usageFilter === '1') matchesUsage = c.monthlySessions === 1;
    else if (usageFilter === '2-4') matchesUsage = c.monthlySessions >= 2 && c.monthlySessions <= 4;
    else if (usageFilter === '5plus') matchesUsage = c.monthlySessions >= 5;

    return matchesSearch && matchesYear && matchesMonth && matchesUsage;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-rose-500/30 glow-box-violet">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Master Deployer Administration Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Candidate Usage Analytics & Session Counter</h1>
          <p className="text-xs text-slate-400 font-mono">Deployer Account: admin@aimock.in • Unlimited Pro Access</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400 font-bold hidden sm:inline">UNLIMITED PRO SYSTEM ACTIVE</span>
          </div>

          <button
            onClick={() => setActiveTab('tpo-portal')}
            className="px-3.5 py-2 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            title="Open Placement TPO Hub"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Placement TPO Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/60 transition-all flex items-center justify-center hover:scale-110 shadow-md ml-2"
            title="Exit to Dashboard"
          >
            <X className="w-5 h-5 text-rose-500" />
          </button>
        </div>
      </div>

      {/* Candidate Usage Breakdown KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>TOTAL CANDIDATES</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-3xl font-extrabold text-white font-mono">{candidates.length} Users</span>
          <span className="text-[11px] text-slate-400 font-medium block">Registered Directory</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-cyan-500/30 space-y-1 bg-cyan-500/5">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-bold">
            <span>1 SESSION USERS</span>
            <UserCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-3xl font-extrabold text-cyan-400 font-mono">{oneSessionUsers.length} Users</span>
          <span className="text-[11px] text-cyan-300 font-medium block">First Time Test Attendees</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-amber-500/30 space-y-1 bg-amber-500/5">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span>2–4 SESSIONS USERS</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-extrabold text-amber-400 font-mono">{midUsageUsers.length} Users</span>
          <span className="text-[11px] text-amber-300 font-medium block">Regular Practice Candidates</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-emerald-500/30 space-y-1 bg-emerald-500/5">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span>5+ SESSIONS USERS</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-extrabold text-emerald-400 font-mono">{heavyUsageUsers.length} Users</span>
          <span className="text-[11px] text-emerald-300 font-medium block">Power Practice Candidates</span>
        </div>
      </div>

      {/* Monthly User Count Calculation Chart */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-400" />
              <span>Monthly User Growth & Active Sessions Chart</span>
            </h2>
            <p className="text-xs text-slate-400">Calculated candidate registration growth per month (2026).</p>
          </div>

          <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-mono font-bold border border-violet-500/30">
            AUTO CALCULATED
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyUserData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="totalUsers" name="Total Candidates" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="activeUsers" name="Active Candidates" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Candidate Usage Directory with Filter Buttons */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Candidate Usage Directory</h3>
            <p className="text-xs text-slate-400">Filter candidate usage & session frequency by Year & Month.</p>
            
            {/* Live Period Filter Counter Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-mono font-bold mt-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Selected Period ({selectedMonth} {selectedYear}): {filteredCandidates.length} Active Candidates</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="All">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>

            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-violet-300 font-mono text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-violet-500/50"
            >
              <option value="All">All Months</option>
              <option value="Jan">January</option>
              <option value="Feb">February</option>
              <option value="Mar">March</option>
              <option value="Apr">April</option>
              <option value="May">May</option>
              <option value="Jun">June</option>
              <option value="Jul">July</option>
              <option value="Aug">August</option>
              <option value="Sep">September</option>
              <option value="Oct">October</option>
              <option value="Nov">November</option>
              <option value="Dec">December</option>
            </select>

            {/* Usage Count Filters */}
            {[
              { id: 'All', label: 'All Users' },
              { id: '1', label: '1 Session Only' },
              { id: '2-4', label: '2–4 Sessions' },
              { id: '5plus', label: '5+ Sessions' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setUsageFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  usageFilter === f.id
                    ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}

            <div className="relative w-full sm:w-44">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                <th className="pb-3">Candidate Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Target Role</th>
                <th className="pb-3">Usage Count (This Month)</th>
                <th className="pb-3">Avg Score</th>
                <th className="pb-3">Plan Tier</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {filteredCandidates.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40">
                  <td className="py-3 font-bold text-white">{c.name}</td>
                  <td className="py-3 font-mono text-slate-400">{c.email}</td>
                  <td className="py-3">{c.role}</td>
                  <td className="py-3 font-mono font-bold">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] border ${
                      c.monthlySessions >= 5
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : c.monthlySessions >= 2
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {c.monthlySessions} Session{c.monthlySessions > 1 ? 's' : ''} Used
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-emerald-400">{c.avgScore}%</td>
                  <td className="py-3 font-mono">
                    <button
                      onClick={() => togglePlanTier(c.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        c.plan === 'Pro Unlimited'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {c.plan}
                    </button>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      c.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => toggleUserStatus(c.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        c.status === 'Active'
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                    >
                      {c.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
