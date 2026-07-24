import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { GraduationCap, Users, Award, TrendingUp, Send, FileSpreadsheet, CheckCircle2, Search, Filter, Mail, Calendar, X } from 'lucide-react';

export const PlacementTPODashboard: React.FC = () => {
  const { setActiveTab } = useStore();
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  const studentRankings = [
    { rank: 1, name: 'Aravind Kumar', dept: 'CSE', score: 98, aptitude: 96, coding: 100, status: 'TCS & Amazon Ready', joinedPeriod: 'Jul 2026', sessions: 9 },
    { rank: 2, name: 'Priya Sharma', dept: 'IT', score: 95, aptitude: 94, coding: 96, status: 'Infosys & Zoho Ready', joinedPeriod: 'Jul 2026', sessions: 7 },
    { rank: 3, name: 'Rahul Verma', dept: 'ECE', score: 92, aptitude: 90, coding: 94, status: 'TCS Digital Ready', joinedPeriod: 'Jun 2026', sessions: 5 },
    { rank: 4, name: 'Sneha Patel', dept: 'CSE', score: 89, aptitude: 88, coding: 90, status: 'Placement Prepared', joinedPeriod: 'May 2026', sessions: 4 },
    { rank: 5, name: 'Karthik Raja', dept: 'IT', score: 86, aptitude: 85, coding: 87, status: 'Needs Practice', joinedPeriod: 'Jul 2026', sessions: 2 }
  ];

  const filteredStudents = studentRankings.filter(s => {
    const matchesDept = selectedDept === 'All' || s.dept === selectedDept;
    const [sMonth, sYear] = s.joinedPeriod.split(' ');
    const matchesYear = selectedYear === 'All' || sYear === selectedYear;
    const matchesMonth = selectedMonth === 'All' || sMonth === selectedMonth;
    return matchesDept && matchesYear && matchesMonth;
  });

  const totalFilteredSessions = filteredStudents.reduce((acc, curr) => acc + curr.sessions, 0);

  const handleBulkDispatch = () => {
    setAssignedSuccess(true);
    setTimeout(() => setAssignedSuccess(false), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-violet-500/30">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-violet-400" />
            <span>University & College Placement Officer (TPO) Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Institutional Placement Analytics & Test Dispatcher</h1>
          <p className="text-xs text-slate-400">
            Monitor college-wide batch readiness, track student scores, and assign bulk placement mock tests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkDispatch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glow-gradient text-white text-xs font-bold shadow-lg hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch Bulk 120m Test to {selectedYear} Batch</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/60 transition-all flex items-center justify-center hover:scale-110 shadow-md ml-1"
            title="Exit to Dashboard"
          >
            <X className="w-5 h-5 text-rose-500" />
          </button>
        </div>
      </div>

      {assignedSuccess && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span><strong>Success!</strong> Full Pattern Assessment test link dispatched to registered batch candidates via email.</span>
        </div>
      )}

      {/* Overview Analytics Cards with Dynamic Period Calculations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">ACTIVE CANDIDATES</span>
            <Users className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-white font-mono">{filteredStudents.length * 90} Students</h3>
          <span className="text-[10px] text-slate-400 font-mono block">In {selectedMonth} {selectedYear}</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">AVG BATCH SCORE</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-400 font-mono">
            {filteredStudents.length > 0 ? (filteredStudents.reduce((a, c) => a + c.score, 0) / filteredStudents.length).toFixed(1) : '88.4'}%
          </h3>
          <span className="text-[10px] text-slate-500 font-mono block">Top 5% University Rank</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">PLACEMENT QUALIFIED</span>
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-cyan-400 font-mono">{filteredStudents.length * 62} Candidates</h3>
          <span className="text-[10px] text-slate-500 font-mono block">69.3% Qualified Rate</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">PERIOD SESSIONS TAKEN</span>
            <GraduationCap className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-amber-400 font-mono">{totalFilteredSessions * 180} Tests</h3>
          <span className="text-[10px] text-slate-500 font-mono block">Selected Window Usage</span>
        </div>
      </div>

      {/* Student Leaderboard & Batch Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Student Batch Performance Rankings</h2>
            <p className="text-xs text-slate-400">Live placement score & session usage breakdown by Year & Month</p>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-mono font-bold mt-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Usage Period ({selectedMonth} {selectedYear}): {filteredStudents.length} Top Candidates Ranked</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Year Dropdown */}
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

            {/* Month Dropdown */}
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

            {/* Department Buttons */}
            {['All', 'CSE', 'IT', 'ECE'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold font-mono transition-all ${
                  selectedDept === dept
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase font-bold text-[11px]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Dept</th>
                <th className="py-3 px-4 text-center">Sessions Used</th>
                <th className="py-3 px-4 text-center">Overall Score</th>
                <th className="py-3 px-4 text-center">Aptitude Score</th>
                <th className="py-3 px-4 text-center">Coding Score</th>
                <th className="py-3 px-4 text-right">Placement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredStudents.map((s) => (
                <tr key={s.rank} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-violet-400">#{s.rank}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{s.name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{s.dept}</td>
                  <td className="py-3.5 px-4 text-center text-cyan-300 font-bold">{s.sessions} Sessions</td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{s.score}%</td>
                  <td className="py-3.5 px-4 text-center text-slate-300">{s.aptitude}%</td>
                  <td className="py-3.5 px-4 text-center text-amber-300">{s.coding}%</td>
                  <td className="py-3.5 px-4 text-right font-semibold">
                    <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 text-[10px] border border-violet-500/30">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recruiter & TPO Anti-Cheating Proctoring & Assessment Link Generator */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-mono font-bold mb-1">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>RECRUITER ASYNCHRONOUS CANDIDATE SCREENING</span>
            </div>
            <h2 className="text-xl font-bold text-white">Generate Candidate Assessment Links & Review Proctor Logs</h2>
          </div>
          <button
            onClick={() => {
              const token = `SCR-${Math.floor(100000 + Math.random() * 900000)}`;
              const link = `https://interviewai.app/screening/${token}?company=Google&role=SoftwareEngineer`;
              navigator.clipboard.writeText(link);
              setAssignedSuccess(true);
              setTimeout(() => setAssignedSuccess(false), 4000);
            }}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all hover:scale-105"
          >
            <Send className="w-4 h-4" />
            <span>Generate & Copy Unique Assessment Link</span>
          </button>
        </div>

        {/* Proctoring Log Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Recent Candidate Proctoring & Violation Audit Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3 text-center">Tab Switches</th>
                  <th className="py-2.5 px-3 text-center">Window Blur Sec</th>
                  <th className="py-2.5 px-3 text-center">Copy/Paste Events</th>
                  <th className="py-2.5 px-3 text-center">Eye Contact %</th>
                  <th className="py-2.5 px-3 text-right">Cheating Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 font-semibold text-white">Aravind Kumar (CSE)</td>
                  <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">0 Switches</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">0s</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">0</td>
                  <td className="py-2.5 px-3 text-center text-cyan-300 font-bold">96%</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] border border-emerald-500/30">LOW RISK (PASSED)</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 font-semibold text-white">Priya Sharma (IT)</td>
                  <td className="py-2.5 px-3 text-center text-amber-400 font-bold">1 Switch</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">4s</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">0</td>
                  <td className="py-2.5 px-3 text-center text-cyan-300 font-bold">91%</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] border border-emerald-500/30">LOW RISK (PASSED)</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 font-semibold text-white">Karthik Raja (IT)</td>
                  <td className="py-2.5 px-3 text-center text-rose-400 font-bold">5 Switches</td>
                  <td className="py-2.5 px-3 text-center text-rose-300 font-bold">38s</td>
                  <td className="py-2.5 px-3 text-center text-rose-400 font-bold">3 Clipboard Pastes</td>
                  <td className="py-2.5 px-3 text-center text-amber-400 font-bold">64%</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] border border-rose-500/30 font-bold">HIGH RISK (FLAGGED)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

