import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { COMPANIES } from '../data/mockData';
import { 
  Sparkles, 
  Mic, 
  BrainCircuit, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight, 
  DollarSign, 
  Target, 
  Award, 
  Briefcase, 
  Play, 
  ChevronDown, 
  ShieldCheck, 
  Clock, 
  UserCheck 
} from 'lucide-react';
import { InteractiveFeatureShowcase } from './InteractiveFeatureShowcase';

export const LandingPage: React.FC = () => {
  const { setActiveTab, setAuthModalOpen, setAuthView, isAuthenticated } = useStore();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [currentSalary, setCurrentSalary] = useState(85000);

  const handleStartFree = () => {
    if (!isAuthenticated) {
      setAuthView('signup');
      setAuthModalOpen(true);
    } else {
      setActiveTab('setup');
    }
  };

  const handleScanResume = () => {
    if (!isAuthenticated) {
      setAuthView('signup');
      setAuthModalOpen(true);
    } else {
      setActiveTab('resume-analyzer');
    }
  };

  const estimatedNewSalary = Math.round(currentSalary * 1.45);
  const salaryIncrease = estimatedNewSalary - currentSalary;

  const faqs = [
    {
      q: 'How does the AI Mock Interviewer simulate real company coding & interview tests?',
      a: 'InterviewAI Prime leverages Advanced AI Processing to generate role-specific questions for Google, Meta, Amazon, and Zoho. It analyzes your spoken audio and written code line-by-line using real company criteria.'
    },
    {
      q: 'How does tab switch restriction work during practice tests?',
      a: 'When you start an assessment test, the browser enters full-screen mode and tab switching is monitored to give you an authentic exam simulation.'
    },
    {
      q: 'What is included in the Free Starter Plan?',
      a: 'The Free Starter Plan includes 10 AI Mock Sessions every month for free forever, with full access to speech pace metrics, filler word detection, and model answers.'
    },
    {
      q: 'Can I add my own target companies like Zoho, Stripe, or OpenAI?',
      a: 'Yes! You can select from preset top tech brands or add any custom company of your interest with custom logo rendering.'
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* HERO SECTION: Professional & Inspiring Content */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        
        {/* Quality Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-cyan-500/10 border border-violet-500/30 text-xs font-semibold text-violet-300 shadow-inner">
          <TrendingUp className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>Real-Time AI Evaluation & Company Coding Criteria</span>
        </div>

        {/* High-Converting Professional Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Master Company Coding Tests & AI Interviews with{' '}
            <span className="text-gradient font-black">Real-Time Skill Feedback</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Practice real-world coding sandboxes and STAR interview scenarios tailored to top tech companies like Google, Amazon, and Zoho. Elevate your problem-solving skills with instant AI evaluation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={handleStartFree}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl glow-gradient text-white font-bold text-base shadow-xl shadow-violet-600/30 hover:scale-105 transition-transform"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Free 10 AI Sessions / Mo</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleScanResume}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm transition-all"
          >
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span>Scan Resume for Target Role</span>
          </button>
        </div>

        {/* Interactive Feature Showcase with Jobs & Skills, Study Abroad, Colleges & Companies */}
        <InteractiveFeatureShowcase />

        {/* Key Metrics */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 text-center">
            <span className="text-2xl font-black text-emerald-400 font-mono">+42%</span>
            <span className="text-xs text-slate-400 block mt-0.5 font-medium">Average Skill Growth</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-slate-800 text-center">
            <span className="text-2xl font-black text-violet-400 font-mono">94.8%</span>
            <span className="text-xs text-slate-400 block mt-0.5 font-medium">Test Pass Rate</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-slate-800 text-center">
            <span className="text-2xl font-black text-cyan-400 font-mono">10 Free</span>
            <span className="text-xs text-slate-400 block mt-0.5 font-medium">AI Sessions / Month</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-slate-800 text-center">
            <span className="text-2xl font-black text-amber-400 font-mono">&lt; 3 Sec</span>
            <span className="text-xs text-slate-400 block mt-0.5 font-medium">Instant AI Feedback</span>
          </div>
        </div>

        {/* Company Logos */}
        <div className="pt-10 space-y-4">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
            PRACTICE INTERVIEWS TAILORED FOR TOP TECH BRANDS & YOUR INTEREST
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-5xl mx-auto">
            {COMPANIES.map((c) => (
              <div
                key={c.id}
                onClick={handleStartFree}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm font-bold text-slate-200 hover:border-violet-500/50 hover:text-white transition-all cursor-pointer shadow-sm group"
              >
                <div className="w-5 h-5 bg-white/90 rounded p-0.5 flex items-center justify-center shrink-0">
                  <img src={c.logoSvg} alt={c.name} className="max-w-full max-h-full object-contain" />
                </div>
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SALARY ROI CALCULATOR */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="glass-panel p-8 rounded-3xl border border-violet-500/30 space-y-6 glow-box-violet">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Career Growth & Compensation Calculator</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Calculate Your Target Compensation Upgrade</h2>
            <p className="text-xs text-slate-400">See how structured interview practice accelerates your compensation growth.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-bold text-slate-200">
              <span>Your Current Compensation:</span>
              <span className="text-violet-400 font-mono text-lg">${currentSalary.toLocaleString()} / year</span>
            </div>
            <input
              type="range"
              min="40000"
              max="250000"
              step="5000"
              value={currentSalary}
              onChange={(e) => setCurrentSalary(Number(e.target.value))}
              className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs font-mono text-slate-400 block">ESTIMATED NEW OFFER</span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono mt-1 block">
                ${estimatedNewSalary.toLocaleString()} / yr
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs font-mono text-slate-400 block">ANNUAL COMPENSATION INCREASE</span>
              <span className="text-3xl font-extrabold text-cyan-400 font-mono mt-1 block">
                +${salaryIncrease.toLocaleString()} / yr
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Built for Maximum Assessment Performance</h2>
          <p className="text-sm text-slate-400">Master every dimension of technical coding and behavioral tests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Lead Interviewer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Practice directly with Dr. Marcus Thorne (Strict Tech Lead & Bar Raiser) for authentic FAANG-level scrutiny and real-time evaluation.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Voice & STAR Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic speech pace tracking, filler word detection ("um", "like"), and STAR behavioral structure scoring powered by Advanced AI Evaluation.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Company OA Simulators</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-length timed assessments matching real recruitment drives for TCS, Infosys, Zoho, and Amazon SDE-1 roles.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Transparent Career Pricing</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Start Free with 10 AI Sessions / Month</h2>
          <p className="text-sm text-slate-400">No credit card required to begin your assessment practice.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* FREE STARTER PLAN */}
          <div className="p-8 rounded-3xl glass-panel border-2 border-violet-500/60 space-y-6 text-left relative glow-box-violet">
            <div className="inline-block px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-mono font-bold border border-violet-500/30">
              POPULAR FOR CANDIDATES
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">Free Starter Plan</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-slate-400 font-mono">/ Free Forever</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Ideal for candidates preparing for upcoming company tests.</p>
            </div>

            <ul className="space-y-3 text-xs text-slate-200 border-t border-slate-800 pt-4">
              {[
                '10 Free AI Mock Sessions every Month',
                'FAANG & Custom Company Criteria Questions',
                'STAR Behavioral & Voice Speech Analytics',
                'AI Line-by-Line Model Answers',
                'Monaco Code Editor Sandbox Access',
                'Company Test Pattern Cheat Sheets'
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleStartFree}
              className="w-full py-3.5 rounded-xl glow-gradient text-white font-bold text-sm shadow-lg shadow-violet-600/30 hover:scale-[1.02] transition-transform"
            >
              Start Free 10 Sessions
            </button>
          </div>

          {/* PRO CAREER PLAN */}
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6 text-left">
            <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
              UNLIMITED PRO
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">Pro Career Accelerator</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-extrabold text-white">$19</span>
                <span className="text-xs text-slate-400 font-mono">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">For active job seekers targeting high-tier offers.</p>
            </div>

            <ul className="space-y-3 text-xs text-slate-200 border-t border-slate-800 pt-4">
              {[
                'Unlimited AI Mock Interview Sessions',
                'Priority Ultra-Fast AI Processing',
                'Unlimited Resume AI Scans & Target Questions',
                'Peer-to-Peer Mock Interview Rooms',
                'Export Detailed Candidate Scorecards (PDF)'
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => { setAuthView('signup'); setAuthModalOpen(true); }}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm transition-all"
            >
              Upgrade to Pro Career
            </button>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-3xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about preparing with InterviewAI Prime.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                className="p-5 rounded-2xl glass-panel border border-slate-800 cursor-pointer transition-all hover:border-slate-700"
              >
                <div className="flex items-center justify-between font-bold text-slate-100 text-sm">
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {isOpen && (
                  <p className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
