import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { INITIAL_COMPANIES, ROLES, DIFFICULTY_LEVELS, ZOHO_SVG_DATA_URI } from '../data/mockData';
import { createInterviewSession } from '../services/api';
import { InterviewerPersona } from '../types';
import { 
  Mic, 
  Sparkles, 
  Building2, 
  Code2, 
  BrainCircuit, 
  Play, 
  Loader2, 
  Zap, 
  Globe,
  X,
  Plus,
  TrendingUp
} from 'lucide-react';

export const InterviewSetup: React.FC = () => {
  const { setActiveSession, setActiveTab, userProfile, decrementSessionQuota, updateUserProfile } = useStore();

  const [companiesList, setCompaniesList] = useState(INITIAL_COMPANIES);
  const [selectedRoleOption, setSelectedRoleOption] = useState('Software Engineer');
  const [customRoleInput, setCustomRoleInput] = useState('');

  const [selectedLevelOption, setSelectedLevelOption] = useState('Mid-Level (2-5 YOE)');
  const [customLevelInput, setCustomLevelInput] = useState('');

  const [selectedCompanyOption, setSelectedCompanyOption] = useState('Google');
  const [newCompanyNameInput, setNewCompanyNameInput] = useState('');
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);

  // Test Goal Mode: Upgrading Skills vs Company Coding Practice
  const [practiceGoalMode, setPracticeGoalMode] = useState<'skills' | 'company'>('company');

  const [selectedType, setSelectedType] = useState('Technical & System Design');
  const [selectedPersona, setSelectedPersona] = useState<InterviewerPersona>('strict');
  const [questionCount, setQuestionCount] = useState(3);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  const isMasterDeployer = userProfile.email === 'admin@aimock.in';
  const isPro = isMasterDeployer || userProfile.planTier === 'PRO UNLIMITED';
  const sessionsLeft = userProfile.sessionsLeft !== undefined ? userProfile.sessionsLeft : 10;

  const finalRole = selectedRoleOption === 'Other' && customRoleInput.trim() 
    ? customRoleInput.trim() 
    : selectedRoleOption;

  const finalLevel = selectedLevelOption === 'Other' && customLevelInput.trim() 
    ? customLevelInput.trim() 
    : selectedLevelOption;

  const finalCompany = selectedCompanyOption;

  // Helper to generate dynamic company logos & initial badges
  const getCompanyInitials = (name: string) => {
    const parts = name.trim().split(/[\s._-]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleAddNewCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyNameInput.trim()) return;

    const rawName = newCompanyNameInput.trim();
    const cleanId = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (companiesList.some(c => c.name.toLowerCase() === rawName.toLowerCase())) {
      setSelectedCompanyOption(rawName);
      setNewCompanyNameInput('');
      setShowAddCompanyForm(false);
      return;
    }

    // Dynamic Logo URL Generator (Clearbit + Google Favicon + Preset SVG Data URIs)
    let logoSvg = `https://logo.clearbit.com/${rawName.toLowerCase().replace(/\s+/g, '')}.com?size=128`;
    
    if (cleanId.includes('zoho')) {
      logoSvg = ZOHO_SVG_DATA_URI;
    } else if (cleanId.includes('stripe')) {
      logoSvg = 'https://upload.wikimedia.org/wikipedia/commons/4/41/Stripe_logo.svg';
    } else if (cleanId.includes('openai')) {
      logoSvg = 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg';
    } else if (cleanId.includes('uber')) {
      logoSvg = 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.svg';
    } else if (cleanId.includes('mrcooper') || cleanId.includes('cooper')) {
      logoSvg = 'https://www.mrcooper.com/favicon.ico';
    }

    const newCompanyCard = {
      id: cleanId,
      name: rawName,
      logoSvg: logoSvg,
      fallbackEmoji: getCompanyInitials(rawName),
      isCustom: true
    };

    setCompaniesList(prev => [...prev, newCompanyCard]);
    setSelectedCompanyOption(rawName);
    setNewCompanyNameInput('');
    setShowAddCompanyForm(false);
  };

  const handleRemoveCompany = (companyId: string, companyName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCompaniesList(prev => prev.filter(c => c.id !== companyId));
    if (selectedCompanyOption === companyName) {
      setSelectedCompanyOption('Google');
    }
  };

  const handleInitiateTest = () => {
    if (!isPro && sessionsLeft <= 0) {
      setShowQuotaModal(true);
      return;
    }
    handleConfirmAndLaunchTest();
  };

  const handleConfirmAndLaunchTest = async () => {
    setShowInstructionModal(false);
    setLoading(true);

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request bypassed', err);
    }

    // Decrement session count for free tier candidate
    if (!isPro) {
      decrementSessionQuota();
    }

    try {
      const sessionData = await createInterviewSession({
        role: finalRole,
        experience_level: finalLevel,
        company: finalCompany,
        interview_type: selectedType,
        question_count: questionCount,
        difficulty: finalLevel
      });

      setActiveSession({
        id: sessionData.interview_id,
        title: `${finalCompany} ${practiceGoalMode === 'company' ? 'Coding Practice' : 'Skill Upgrade'} (${finalRole})`,
        role: finalRole,
        company: finalCompany,
        difficulty: finalLevel,
        interviewType: selectedType,
        persona: selectedPersona,
        questions: sessionData.questions,
        currentQuestionIndex: 0
      });

      setActiveTab('live-session');
    } catch (err) {
      console.error('Failed to create interview session', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>Configure Your AI Practice Test</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Target Your Next Tech Assessment</h1>
        <p className="text-sm text-slate-400">
          Select target company criteria, practice goal mode, and interviewer persona for Gemini AI evaluation.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-8">
        
        {/* Practice Goal Mode Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-200">Select Practice Test Objective</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setPracticeGoalMode('company')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                practiceGoalMode === 'company'
                  ? 'bg-violet-600/20 border-violet-500 text-white shadow-lg shadow-violet-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Company-Specific Coding Practice</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Practice coding & system design tailored to criteria of Google, Amazon, Meta, or Zoho.
                </p>
              </div>
            </div>

            <div
              onClick={() => setPracticeGoalMode('skills')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                practiceGoalMode === 'skills'
                  ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Upgrading Core Skills Mode</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Master core algorithms, data structures, and STAR leadership frameworks with AI guidance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. AI Interviewer Persona Selector */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-200">1. Select AI Interviewer Persona</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                id: 'strict-tech-lead', 
                name: 'Dr. Marcus Thorne', 
                role: '🔴 Strict Tech Lead', 
                desc: 'Probes deeply into code edge-cases, memory complexity & performance tradeoffs.', 
                icon: <BrainCircuit className="w-5 h-5 text-rose-400" />,
                borderClass: 'hover:border-rose-500/50',
                activeClass: 'bg-rose-600/20 border-rose-500 text-white shadow-lg shadow-rose-500/10'
              },
              { 
                id: 'friendly-hr', 
                name: 'Sarah Vance', 
                role: '🟢 Friendly HR Recruiter', 
                desc: 'Warm tone, focuses on culture fit, teamwork, soft skills & STAR method.', 
                icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
                borderClass: 'hover:border-emerald-500/50',
                activeClass: 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
              },
              { 
                id: 'faang-engineer', 
                name: 'Alex Chen', 
                role: '🟡 Fast-Paced FAANG Engineer', 
                desc: 'Demands concise, rapid-fire responses & optimization under tight timer constraints.', 
                icon: <Zap className="w-5 h-5 text-amber-400" />,
                borderClass: 'hover:border-amber-500/50',
                activeClass: 'bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
              },
              { 
                id: 'system-architect', 
                name: 'Elena Rostova', 
                role: '🔵 System Architect', 
                desc: 'Focuses on system scalability, SPOF trade-offs, caching & microservice bottlenecks.', 
                icon: <Globe className="w-5 h-5 text-cyan-400" />,
                borderClass: 'hover:border-cyan-500/50',
                activeClass: 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
              }
            ].map((p) => {
              const isSelected = selectedPersona === p.id || (selectedPersona === 'strict' && p.id === 'strict-tech-lead') || (selectedPersona === 'coach' && p.id === 'friendly-hr') || (selectedPersona === 'bar_raiser' && p.id === 'faang-engineer');
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id as InterviewerPersona)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? p.activeClass
                      : `bg-slate-900/60 border-slate-800 text-slate-400 ${p.borderClass}`
                  }`}
                >
                  <div className="mb-2">{p.icon}</div>
                  <h4 className="font-bold text-slate-100 text-sm">{p.name}</h4>
                  <p className="text-[11px] font-mono text-cyan-300 mt-0.5">{p.role}</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Target Job Role & Seniority */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-200">2. Target Job Role & Seniority</label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-400 mb-1.5 block font-medium">Primary Role Title</span>
              <select
                value={selectedRoleOption}
                onChange={(e) => setSelectedRoleOption(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm font-medium focus:border-violet-500 focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.label}>{r.label}</option>
                ))}
                <option value="Other">Other (Specify your target job role...)</option>
              </select>

              {selectedRoleOption === 'Other' && (
                <div className="mt-2.5 animate-fade-in">
                  <input
                    type="text"
                    required
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    placeholder="Enter your target job role (e.g. LLM Engineer, SRE)..."
                    className="w-full bg-slate-950 border border-violet-500 rounded-xl px-4 py-2.5 text-white text-sm font-semibold focus:outline-none shadow-inner"
                  />
                </div>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-400 mb-1.5 block font-medium">Experience Level / Seniority</span>
              <select
                value={selectedLevelOption}
                onChange={(e) => setSelectedLevelOption(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm font-medium focus:border-violet-500 focus:outline-none"
              >
                {DIFFICULTY_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
                <option value="Other">Other (Specify seniority level...)</option>
              </select>

              {selectedLevelOption === 'Other' && (
                <div className="mt-2.5 animate-fade-in">
                  <input
                    type="text"
                    required
                    value={customLevelInput}
                    onChange={(e) => setCustomLevelInput(e.target.value)}
                    placeholder="Enter your seniority level (e.g. Staff Engineer, Intern)..."
                    className="w-full bg-slate-950 border border-violet-500 rounded-xl px-4 py-2.5 text-white text-sm font-semibold focus:outline-none shadow-inner"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Target Tech Company with Dynamic Brand Logos & Badges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-200">3. Target Tech Company</label>
            <button
              type="button"
              onClick={() => setShowAddCompanyForm(!showAddCompanyForm)}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddCompanyForm ? 'Close Add Form' : '+ Add Interested Company'}</span>
            </button>
          </div>

          {showAddCompanyForm && (
            <form onSubmit={handleAddNewCompany} className="p-4 bg-slate-950 rounded-xl border border-cyan-500/50 space-y-3 animate-fade-in">
              <span className="text-xs font-semibold text-cyan-400 block">Add a New Company (e.g. mr.cooper, Stripe, Uber):</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={newCompanyNameInput}
                  onChange={(e) => setNewCompanyNameInput(e.target.value)}
                  placeholder="Type company name (e.g. mr.cooper)..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-semibold focus:border-cyan-500 focus:outline-none shadow-inner"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Company Logo</span>
                </button>
              </div>
            </form>
          )}

          {/* Grid of Company Cards with Dynamic Brand Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
            {companiesList.map((comp) => {
              const isSelected = selectedCompanyOption === comp.name;
              const initials = getCompanyInitials(comp.name);

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedCompanyOption(comp.name)}
                  className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-violet-600/20 border-violet-500 text-white shadow-xl shadow-violet-500/20 ring-2 ring-violet-500/60 scale-[1.02]'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {/* Clean Wide White Brand Container with Fallback Initial Badge */}
                  <div className="w-16 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-md border border-slate-200/20 shrink-0 overflow-hidden relative">
                    <img 
                      src={comp.logoSvg} 
                      alt={comp.name} 
                      className="max-w-full max-h-full object-contain"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }} 
                    />
                    {/* Fallback Brand Badge when image fails or is missing */}
                    <div className="hidden w-full h-full bg-gradient-to-tr from-violet-600 to-cyan-500 rounded-lg items-center justify-center font-black font-mono text-white text-xs tracking-wider shadow-inner">
                      {initials}
                    </div>
                  </div>

                  <span className="font-bold text-sm tracking-wide ml-3 truncate flex-1">{comp.name}</span>

                  {comp.isCustom && (
                    <button
                      type="button"
                      title="Remove this company"
                      onClick={(e) => handleRemoveCompany(comp.id, comp.name, e)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Interview Format */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-200">4. Interview Format & Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { type: 'Technical & System Design', icon: <BrainCircuit className="w-5 h-5 text-violet-400" />, desc: 'System Architecture & Algorithm Design' },
              { type: 'Technical Coding Sandbox', icon: <Code2 className="w-5 h-5 text-cyan-400" />, desc: 'Live Monaco Code Editor Sandbox' },
              { type: 'Behavioral & STAR Method', icon: <Mic className="w-5 h-5 text-emerald-400" />, desc: 'Situational & HR Questions' },
            ].map((fmt) => {
              const isSelected = selectedType === fmt.type;
              return (
                <div
                  key={fmt.type}
                  onClick={() => setSelectedType(fmt.type)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-violet-600/20 border-violet-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="mb-2">{fmt.icon}</div>
                  <h4 className="font-bold text-slate-100 text-sm">{fmt.type}</h4>
                  <p className="text-xs text-slate-400 mt-1">{fmt.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-violet-400" />
            <span>Target: <strong className="text-white">{finalCompany}</strong> • Goal: <strong className="text-white">{practiceGoalMode === 'company' ? 'Company Practice' : 'Skills Upgrade'}</strong></span>
          </div>
          <span className="text-emerald-400 font-bold">READY FOR TEST</span>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleInitiateTest}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl glow-gradient text-white font-bold text-base shadow-xl shadow-violet-600/30 hover:scale-[1.01] transition-transform disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating AI Session...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              <span>Start Full-Screen Practice Test</span>
            </>
          )}
        </button>
      </div>

      {/* Monthly Quota Exhausted Modal Popup */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/50 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Zap className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Monthly AI Quota Exhausted</h3>
                <span className="text-xs font-mono text-rose-400 font-bold">0 / 10 Free AI Sessions Left This Month</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                You have reached your <strong>10 free AI mock practice interviews limit</strong> for this month on the <strong>Free Starter Plan</strong>.
              </p>
              <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 font-mono">
                💡 <strong>Pro Unlimited Access:</strong> Upgrade your account to unlock unlimited 24/7 AI practice interviews, full system architecture canvas grading, and company OA cheatsheets.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  updateUserProfile({ planTier: 'PRO UNLIMITED', sessionsLeft: 999 });
                  setShowQuotaModal(false);
                  handleInitiateTest();
                }}
                className="w-full py-3.5 rounded-2xl glow-gradient text-white font-bold text-xs shadow-lg shadow-violet-600/30 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
              >
                <span>Upgrade to Pro Unlimited (Unlimited Access)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    updateUserProfile({ sessionsLeft: 10 });
                    setShowQuotaModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-bold text-[11px] border border-slate-700 transition-colors"
                >
                  Reset Quota (10/10) [Demo]
                </button>

                <button
                  onClick={() => setShowQuotaModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 font-bold text-xs border border-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
