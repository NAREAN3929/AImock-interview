import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Briefcase, 
  MessageSquare, 
  ClipboardList, 
  Building2, 
  ArrowRight, 
  Check, 
  Mic, 
  Sparkles, 
  GraduationCap, 
  Globe2, 
  Code2, 
  Users,
  Award
} from 'lucide-react';
import aiInterviewerImg from '../assets/ai_interviewer_preview.jpg';

type ShowcaseTab = 'jobs' | 'study-abroad' | 'colleges';

export const InteractiveFeatureShowcase: React.FC = () => {
  const { setActiveTab, setAuthModalOpen, setAuthView, isAuthenticated } = useStore();
  const [activeTab, setActiveTabKey] = useState<ShowcaseTab>('jobs');

  const handleCardClick = (destinationTab: string) => {
    if (!isAuthenticated) {
      setAuthView('signup');
      setAuthModalOpen(true);
    } else {
      setActiveTab(destinationTab as any);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Floating Pill Segmented Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex items-center p-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTabKey('jobs')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'jobs'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Jobs & Skills
          </button>

          <button
            type="button"
            onClick={() => setActiveTabKey('study-abroad')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'study-abroad'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Study Abroad
          </button>

          <button
            type="button"
            onClick={() => setActiveTabKey('colleges')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'colleges'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Colleges & Companies
          </button>
        </div>
      </div>

      {/* 2. Four Interactive Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: JOBS & SKILLS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'jobs' && (
          <>
            {/* Card 1: Job Interviews */}
            <div
              onClick={() => handleCardClick('setup')}
              className="group rounded-3xl p-4 bg-slate-900/70 border border-slate-800 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-600/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4"
            >
              {/* Visual Mockup Container */}
              <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 group-hover:border-slate-700 transition-colors">
                <img
                  src={aiInterviewerImg}
                  alt="AI Interviewer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Candidate Inset Mini Tile */}
                <div className="absolute top-2.5 right-2.5 w-14 h-11 rounded-lg border border-white/20 overflow-hidden shadow-lg bg-slate-900/90 backdrop-blur">
                  <div className="w-full h-full bg-gradient-to-br from-violet-900/80 to-slate-900 flex items-center justify-center">
                    <span className="text-[9px] font-mono font-bold text-cyan-300">YOU</span>
                  </div>
                </div>

                {/* Bottom Overlay Bar */}
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AI interview practice
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 font-mono">
                    Preview
                  </span>
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-violet-400" />
                    <span>Job interviews</span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Practice for your role</p>
              </div>
            </div>

            {/* Card 2: Communication */}
            <div
              onClick={() => handleCardClick('communication')}
              className="group rounded-3xl p-4 bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-600/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4"
            >
              {/* Visual Mockup Container */}
              <div className="relative h-44 rounded-2xl p-3.5 bg-gradient-to-br from-cyan-950/20 via-slate-950 to-blue-950/30 border border-slate-800/80 flex flex-col justify-between">
                {/* Chat Bubble */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between shadow-sm">
                  <span className="text-xs text-slate-200 font-medium truncate">Let's practise together</span>
                  <span className="text-slate-500 tracking-wider">•••</span>
                </div>

                {/* Animated Audio Soundwave Waveform */}
                <div className="flex items-center justify-center gap-1.5 py-3">
                  {[24, 40, 16, 56, 32, 48, 64, 28, 44, 20, 52, 36].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-gradient-to-t from-cyan-500 to-blue-400 group-hover:animate-pulse transition-all"
                      style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>

                {/* Speak Naturally Tag */}
                <div className="flex items-center justify-end">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
                    <Mic className="w-3 h-3 text-cyan-400" />
                    <span>Speak naturally</span>
                  </span>
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <span>Communication</span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Speak clearly and confidently</p>
              </div>
            </div>

            {/* Card 3: Skill Assessments */}
            <div
              onClick={() => handleCardClick('aptitude')}
              className="group rounded-3xl p-4 bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-600/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4"
            >
              {/* Visual Mockup Container */}
              <div className="relative h-44 rounded-2xl p-3.5 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-950 border border-slate-800/80 flex flex-col justify-between text-xs">
                {/* Question Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200">What is 20% of 150?</span>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                    Sample question
                  </span>
                </div>

                {/* Question Options */}
                <div className="space-y-1.5 pt-1">
                  <div className="p-1.5 px-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>A &nbsp; 20</span>
                  </div>
                  <div className="p-1.5 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-[11px] text-emerald-300 font-bold flex items-center justify-between shadow-sm">
                    <span>B &nbsp; 30</span>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="p-1.5 px-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>C &nbsp; 40</span>
                  </div>
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-emerald-400" />
                    <span>Skill assessments</span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Check what you know</p>
              </div>
            </div>

            {/* Card 4: Company Rounds */}
            <div
              onClick={() => handleCardClick('company-oa')}
              className="group rounded-3xl p-4 bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-600/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4"
            >
              {/* Visual Mockup Container (2x2 Grid of Top Companies) */}
              <div className="relative h-44 rounded-2xl p-3 bg-gradient-to-br from-amber-950/15 via-slate-950 to-orange-950/20 border border-slate-800/80 grid grid-cols-2 gap-2 items-center">
                {/* Google */}
                <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                  <div className="w-5 h-5 bg-white rounded p-0.5 flex items-center justify-center shrink-0">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">Google</span>
                </div>

                {/* Microsoft */}
                <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                  <div className="w-5 h-5 bg-white rounded p-0.5 flex items-center justify-center shrink-0">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">Microsoft</span>
                </div>

                {/* TCS */}
                <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                  <div className="w-5 h-5 bg-white rounded p-0.5 flex items-center justify-center shrink-0">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg" alt="TCS" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">TCS</span>
                </div>

                {/* Infosys */}
                <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                  <div className="w-5 h-5 bg-white rounded p-0.5 flex items-center justify-center shrink-0">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" alt="Infosys" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">Infosys</span>
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Company rounds</span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Target top companies</p>
              </div>
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: STUDY ABROAD */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'study-abroad' && (
          <>
            {/* Abroad Card 1: IELTS & TOEFL Speaking */}
            <div
              onClick={() => handleCardClick('communication')}
              className="group rounded-3xl p-4 bg-slate-900/70 border border-slate-800 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-600/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="relative h-44 rounded-2xl p-3.5 bg-gradient-to-br from-violet-950/20 via-slate-950 to-slate-950 border border-slate-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold">
                    IELTS BAND 8.5
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Passed</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  <span className="text-[10px] text-slate-500 block">Speaking Cue Card:</span>
                  "Describe a technology that transformed modern learning."
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Fluency: 92%</span>
                  <span>Pronunciation: 88%</span>
                </div>
              </div>

              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-violet-400" />
                    <span>IELTS & TOEFL Mock</span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">British Council standard speech analysis</p>
              </div>
            </div>

            {/* Abroad Card 2: Visa Interview Prep */}
            <div
              onClick={() => handleCardClick('setup')}
              className="group rounded-3xl p-4 bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-600/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="relative h-44 rounded-2xl p-3.5 bg-gradient-to-br from-cyan-950/20 via-slate-950 to-slate-950 border border-slate-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                    US F-1 / UK VISA
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Consular AI</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200">
                  "Why did you choose this university and who is funding your tuition?"
                </div>
                <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                  <span>Confidence Score: 94%</span>
                </div>
              </div>

              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    <span>Visa Interview AI</span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Simulate consular officer questions</p>
              </div>
            </div>

            {/* Abroad Card 3: GRE & GMAT Aptitude */}
            <div
              onClick={() => handleCardClick('aptitude')}
              className="group rounded-3xl p-4 bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-600/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="relative h-44 rounded-2xl p-3.5 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-950 border border-slate-800/80 flex flex-col justify-between text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">If 3x + 7 = 22, what is 6x?</span>
                  <span className="text-[9px] font-mono text-slate-400">GRE Quant</span>
                </div>
                <div className="space-y-1.5">
                  <div className="p-1 px-2.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                    A &nbsp; 25
                  </div>
                  <div className="p-1 px-2.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[11px] text-emerald-300 font-bold flex items-center justify-between">
                    <span>B &nbsp; 30 (x = 5, 6x = 30)</span>
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Timed speed: 18s</span>
              </div>

              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-emerald-400" />
                    <span>GRE & GMAT Aptitude</span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Quantitative & analytical reasoning</p>
              </div>
            </div>

            {/* Abroad Card 4: Top Global Universities */}
            <div
              onClick={() => handleCardClick('setup')}
              className="group rounded-3xl p-4 bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-600/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="relative h-44 rounded-2xl p-3 bg-gradient-to-br from-amber-950/15 via-slate-950 to-slate-950 border border-slate-800/80 grid grid-cols-2 gap-2 items-center">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-xs text-slate-200">
                  🏛️ MIT
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-xs text-slate-200">
                  🎓 Stanford
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-xs text-slate-200">
                  📚 Oxford
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-xs text-slate-200">
                  🏆 Cambridge
                </div>
              </div>

              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                    <span>University Rounds</span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Admissions & scholarship interviews</p>
              </div>
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: COLLEGES & COMPANIES */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'colleges' && (
          <>
            {/* College Card 1: Campus Placement Drives */}
            <div
              onClick={() => handleCardClick('company-oa')}
              className="group rounded-3xl p-4 bg-slate-900/70 border border-slate-800 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-600/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="relative h-44 rounded-2xl p-3.5 bg-gradient-to-br from-violet-950/20 via-slate-950 to-slate-950 border border-slate-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold">
                    DAY 1 RECRUITMENT
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">Super Dream</span>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-white">Full-Stack Campus Drive</p>
                  <p className="text-slate-400 text-[11px]">Round 1: OA &nbsp;|&nbsp; Round 2: Tech &nbsp;|&nbsp; Round 3: HR</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">5-Round Automated Simulation</span>
              </div>

              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors flex items-center gap-2">
                    <Award className="w-4 h-4 text-violet-400" />
                    <span>Campus Placement Drives</span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Tier 1 & Tier 2 campus recruitment</p>
              </div>
            </div>

            {/* College Card 2: Coding OA Simulators */}
            <div
              onClick={() => handleCardClick('question-bank')}
              className="group rounded-3xl p-4 bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-600/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="relative h-44 rounded-2xl p-3 bg-slate-950 border border-slate-800/80 flex flex-col justify-between font-mono text-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                  <span>solution.py</span>
                  <span className="text-emerald-400 font-bold">12/12 Passed</span>
                </div>
                <pre className="text-[10px] text-cyan-300 leading-snug overflow-hidden">
                  {`def maxSubarray(nums):\n  curr = mx = nums[0]\n  for n in nums[1:]:\n    curr = max(n, curr + n)\n    mx = max(mx, curr)\n  return mx`}
                </pre>
                <div className="text-[10px] text-slate-400">Complexity: O(N) Time, O(1) Space</div>
              </div>

              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Coding OA Simulators</span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Timed recruitment coding assessments</p>
              </div>
            </div>

            {/* College Card 3: AI Group Discussion */}
            <div
              onClick={() => handleCardClick('p2p-room')}
              className="group rounded-3xl p-4 bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-600/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="relative h-44 rounded-2xl p-3.5 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-950 border border-slate-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    GD LAB
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">5 Participants</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200">
                  "Topic: Electric Vehicles vs Hydrogen Fuel for Urban Infrastructure"
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Articulation & Leadership Evaluated</span>
              </div>

              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Group Discussion AI</span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Leadership, rebuttal & articulation drills</p>
              </div>
            </div>

            {/* College Card 4: Top Recruiter Tracks */}
            <div
              onClick={() => handleCardClick('company-oa')}
              className="group rounded-3xl p-4 bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-600/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="relative h-44 rounded-2xl p-3 bg-gradient-to-br from-amber-950/15 via-slate-950 to-slate-950 border border-slate-800/80 grid grid-cols-2 gap-2 items-center">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-xs text-slate-200">
                  Zoho SDE
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-xs text-slate-200">
                  Amazon SDE-1
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-xs text-slate-200">
                  Accenture Ninja
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-xs text-slate-200">
                  Wipro Elite
                </div>
              </div>

              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Company Special Tracks</span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Target top recruiting companies</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
