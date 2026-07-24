import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { CertificateModal } from './CertificateModal';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Flame, 
  Target, 
  Sparkles, 
  Play, 
  Zap, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  BrainCircuit,
  Code2,
  ShieldCheck
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { userProfile, pastInterviews, setActiveTab } = useStore();
  const [showCertModal, setShowCertModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Inspiring Motto & Personal Welcome Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-violet-500/30 glow-box-violet relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
            <span>Career Pulse & Skill Analytics</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Welcome back, {userProfile.fullName || userProfile.username || 'Candidate'}!
          </h1>

          <p className="text-sm font-mono text-cyan-300 font-bold tracking-wide">
            💡 Learn. Practice. Code. Crack.
          </p>

          <p className="text-xs text-slate-300 leading-relaxed">
            Practice to gain mastery • Learn from every attempt • Turn errors into technical breakthroughs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={() => setShowCertModal(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all shadow-lg"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>View Verified Certificate</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl glow-gradient text-white font-bold text-sm shadow-xl shadow-violet-600/30 hover:scale-105 transition-transform"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch AI Mock Session</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>READINESS SCORE</span>
            <Target className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-3xl font-extrabold text-white font-mono">{userProfile.readinessScore}%</span>
          <span className="text-[11px] text-emerald-400 font-medium block">Top 8% Candidate Tier</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>MOCK SESSIONS</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-3xl font-extrabold text-white font-mono">{userProfile.totalInterviews}</span>
          <span className="text-[11px] text-slate-400 font-medium block">Completed Evaluation Runs</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>PRACTICE STREAK</span>
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
          </div>
          <span className="text-3xl font-extrabold text-amber-400 font-mono">{userProfile.streakDays} Days</span>
          <span className="text-[11px] text-amber-300 font-medium block">Active Daily Consistency</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>TOTAL XP EARNED</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-extrabold text-emerald-400 font-mono">{userProfile.xpPoints} XP</span>
          <span className="text-[11px] text-slate-400 font-medium block">+15 XP per Rapid Drill</span>
        </div>
      </div>

      {/* Skill Competency Matrix */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Technical Skill Competency Matrix</h3>
            <p className="text-xs text-slate-400">Evaluated across System Design, Coding Sandboxes, and STAR Behavioral runs.</p>
          </div>
          <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
            AI EVALUATION AUDITED
          </span>
        </div>

        <div className="space-y-4">
          {[
            { skill: 'System Design & Architecture', score: 88, color: 'from-violet-500 to-purple-600' },
            { skill: 'Data Structures & Algorithms', score: 84, color: 'from-cyan-500 to-blue-600' },
            { skill: 'STAR Behavioral Leadership', score: 92, color: 'from-emerald-500 to-teal-600' },
            { skill: 'React & Web Vitals Performance', score: 90, color: 'from-amber-500 to-orange-600' }
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>{item.skill}</span>
                <span className="font-mono text-violet-300">{item.score}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.score}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Launchers & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Launch Cards */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Recommended Practice Modes</h3>
          
          <div className="space-y-3">
            <div 
              onClick={() => setActiveTab('rapid-practice')}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">2-Min Rapid Flashcards</h4>
                  <p className="text-xs text-slate-400">System Design & STAR 3D Flip cards (+15 XP)</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
            </div>

            <div 
              onClick={() => setActiveTab('resume-analyzer')}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Resume AI Skill Scanner</h4>
                  <p className="text-xs text-slate-400">Upload PDF/JPG resume to generate custom questions</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>
        </div>

        {/* Recent Mock Session History */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Mock Sessions</h3>
            <button onClick={() => setActiveTab('history')} className="text-xs text-violet-400 font-bold hover:underline">
              View All History
            </button>
          </div>

          <div className="space-y-3">
            {pastInterviews.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-400 font-mono">{item.company} • {item.difficulty}</p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">{item.overall_score}%</span>
                  <span className="text-[10px] text-slate-400 block font-semibold">{item.hiring_recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        candidateName={userProfile.fullName || userProfile.username || 'Candidate'}
        score={userProfile.readinessScore}
        role={userProfile.targetRole || 'Software Engineer'}
      />
    </div>
  );
};
