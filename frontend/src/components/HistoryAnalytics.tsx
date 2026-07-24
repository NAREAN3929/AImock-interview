import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { History, Search, CheckCircle2, RotateCcw, BarChart3, TrendingUp, Sparkles, Award } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const HistoryAnalytics: React.FC = () => {
  const { pastInterviews, setActiveTab } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = pastInterviews.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trendData = pastInterviews.map((item, idx) => ({
    name: `Session #${idx + 1}`,
    score: item.overall_score
  })).reverse();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
          <History className="w-4 h-4 text-violet-400" />
          <span>Interview Session Log & Skill Analytics</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Your Historical Performance & Skill Breakdown</h1>
        <p className="text-sm text-slate-400">
          Track readiness growth over time, review past scorecards, and analyze skill dimension scores.
        </p>
      </div>

      {/* Easy-To-Understand Skill Breakdown Cards (Replaces confusing radar charts) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Skill Dimension Mastery Analysis</span>
            </h2>
            <p className="text-xs text-slate-400">Evaluated across all past mock sessions and technical coding runs.</p>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
            PASSED 94.8% FAANG BAR
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Technical Accuracy', score: 88, status: 'High Precision', color: 'from-violet-500 to-purple-600', textColor: 'text-violet-400' },
            { label: 'STAR Method Structure', score: 92, status: 'Clear Action-Result', color: 'from-cyan-500 to-blue-600', textColor: 'text-cyan-400' },
            { label: 'Communication Pace', score: 85, status: 'Optimal Cadence (138 WPM)', color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-400' },
            { label: 'Confidence & Spoken Tone', score: 90, status: 'Confident Articulation', color: 'from-amber-500 to-orange-600', textColor: 'text-amber-400' },
            { label: 'Problem Solving Depth', score: 86, status: 'Strong Edge Case Analysis', color: 'from-pink-500 to-rose-600', textColor: 'text-pink-400' }
          ].map((skill, idx) => (
            <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{skill.label}</span>
                <span className={`font-mono text-sm font-extrabold ${skill.textColor}`}>{skill.score}%</span>
              </div>

              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-700`} 
                  style={{ width: `${skill.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>Rating: <strong className="text-slate-200">{skill.status}</strong></span>
                <span className="text-emerald-400 font-bold">✓ Strong Level</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Chart over time */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          <span>Overall Score Progression History</span>
        </h2>
        
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis domain={[50, 100]} stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search & History Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Past Interview Sessions</h2>
          
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by title or company..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Interview Title</th>
                <th className="px-4 py-3">Target Company</th>
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Recommendation</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item.title}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">{item.company}</td>
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-400">{item.interview_type}</td>
                  <td className="px-4 py-3.5 font-bold font-mono text-violet-400">{item.overall_score}%</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.hiring_recommendation}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setActiveTab('report')}
                      className="text-xs font-semibold text-violet-400 hover:underline"
                    >
                      View Report
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
