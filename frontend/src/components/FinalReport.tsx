import React from 'react';
import { useStore } from '../store/useStore';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Printer, 
  RotateCw, 
  Share2, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  BrainCircuit, 
  Clock, 
  MessageSquare,
  FileCheck
} from 'lucide-react';

export const FinalReport: React.FC = () => {
  const { activeSession, evaluations, setActiveTab } = useStore();

  const evalList = Object.values(evaluations);
  const totalQuestions = activeSession?.questions?.length || 3;

  const avgScore = evalList.length > 0 
    ? Math.round(evalList.reduce((acc, curr) => acc + curr.score, 0) / evalList.length) 
    : 88;

  const avgTechAccuracy = evalList.length > 0 
    ? Math.round(evalList.reduce((acc, curr) => acc + curr.technical_accuracy, 0) / evalList.length) 
    : 92;

  const avgStarScore = evalList.length > 0 
    ? Math.round(evalList.reduce((acc, curr) => acc + curr.star_method_score, 0) / evalList.length) 
    : 86;

  const avgWpm = evalList.length > 0 
    ? Math.round(evalList.reduce((acc, curr) => acc + curr.wpm, 0) / evalList.length) 
    : 138;

  const totalFillers = evalList.reduce((acc, curr) => acc + (curr.filler_words_detected || 0), 0);

  const hiringRecommendation = avgScore >= 85 ? 'STRONG HIRE' : avgScore >= 75 ? 'HIRE' : 'NEEDS REVISION';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Gemini AI Comprehensive Evaluation Report</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Interview Performance Scorecard</h1>
        <p className="text-sm text-slate-400">
          Target Role: <strong className="text-white">{activeSession?.role || 'Software Engineer'}</strong> ({activeSession?.company || 'Target Tech'})
        </p>
      </div>

      {/* Main Score & Hiring Recommendation Gauge Card */}
      <div className="glass-panel p-8 rounded-3xl border-2 border-violet-500/40 glow-box-violet space-y-6 text-center relative overflow-hidden">
        <div className="inline-block px-4 py-1.5 rounded-full bg-violet-600/30 text-violet-300 border border-violet-500/40 font-mono text-xs font-bold">
          OVERALL HIRING RECOMMENDATION
        </div>

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="relative w-36 h-36 rounded-full p-2 bg-gradient-to-r from-violet-500 via-pink-500 to-emerald-400 flex items-center justify-center shadow-2xl shadow-violet-500/30">
            <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center font-mono">
              <span className="text-4xl font-black text-white">{avgScore}</span>
              <span className="text-[10px] text-slate-400">/ 100 PTS</span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-emerald-400 tracking-wider pt-2">
            {hiringRecommendation}
          </h2>
          <p className="text-xs text-slate-300 max-w-lg">
            Candidate demonstrated strong technical depth, clear system design structure, and effective STAR responses.
          </p>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block">TECHNICAL ACCURACY</span>
            <span className="text-2xl font-black text-violet-400 font-mono">{avgTechAccuracy}%</span>
            <span className="text-[10px] text-emerald-400 font-semibold block">High Precision</span>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block">STAR METHOD STRUCTURE</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">{avgStarScore}%</span>
            <span className="text-[10px] text-cyan-300 font-semibold block">Clear Action-Result</span>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block">COMMUNICATION CADENCE</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{avgWpm} WPM</span>
            <span className="text-[10px] text-slate-400 font-semibold block">{totalFillers} Filler words</span>
          </div>
        </div>
      </div>

      {/* Strengths & Actionable Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Key Strengths */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-5 h-5" />
            <span>Key Candidate Strengths</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-200">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Articulated clear system design architecture and scalability tradeoffs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Effective use of quantifiable metrics during the STAR result phase.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Low filler-word density and clear, confident articulation.</span>
            </li>
          </ul>
        </div>

        {/* Action Plan Improvements */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base border-b border-slate-800 pb-3">
            <AlertCircle className="w-5 h-5" />
            <span>Target Improvement Action Plan</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-200">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Explicitly state mathematical O(N) time and space complexity upfront.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Discuss edge case handling (e.g. rate limit overflows & network partitions).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Review Company Cheat Sheets and coding bank to boost recall speed.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Pro Model Answer Showcase */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Lightbulb className="w-4 h-4" />
          <span>FAANG Model Answer Reference</span>
        </div>
        <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
          "When designing for high availability at scale, start by separating read vs write workloads. Implement a Redis cache layer with LRU eviction for 99% cache hit ratio, and partition MySQL database tables using consistent hashing to prevent hot spots."
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={() => setActiveTab('setup')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition-colors"
        >
          <RotateCw className="w-4 h-4" />
          <span>Retake Mock Session</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-transform"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF Scorecard</span>
          </button>
        </div>
      </div>

    </div>
  );
};
