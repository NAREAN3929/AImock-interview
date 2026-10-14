import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { StudyPlan } from '../types';
import { 
  completeOnboardingApi, 
  skipOnboardingApi, 
  saveOnboardingStepApi,
  getOnboardingStatusApi 
} from '../services/api';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Calendar, 
  Briefcase, 
  Clock, 
  Building2, 
  Upload, 
  RotateCcw, 
  AlertCircle,
  FileCheck,
  Zap,
  Target,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSettingsEditMode?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
  isOpen, 
  onClose,
  isSettingsEditMode = false 
}) => {
  const { 
    userProfile, 
    updateUserProfile, 
    studyPlan, 
    setStudyPlan, 
    onboardingStep, 
    setOnboardingStep,
    setActiveTab
  } = useStore();

  // Local state for answers (initialized from stored profile or sensible defaults)
  const [step, setStep] = useState<number>(isSettingsEditMode ? 1 : (onboardingStep || 1));
  const [targetRole, setTargetRole] = useState<string>(userProfile.targetRole || 'Frontend developer');
  const [isOtherRole, setIsOtherRole] = useState<boolean>(false);
  const [otherRoleText, setOtherRoleText] = useState<string>('');
  
  const [experienceLevel, setExperienceLevel] = useState<string>(userProfile.experienceLevel || 'Fresher');
  
  const [datePreset, setDatePreset] = useState<string>(userProfile.interviewDatePreset || 'within_14_days');
  const [customDate, setCustomDate] = useState<string>(userProfile.interviewDate ? userProfile.interviewDate.split('T')[0] : '');

  // Step 4 optional items
  const [targetCompany, setTargetCompany] = useState<string>(userProfile.targetCompany || '');
  const [companySearch, setCompanySearch] = useState<string>('');
  const [resumeFileName, setResumeFileName] = useState<string>('');

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(studyPlan);
  const [showPlanView, setShowPlanView] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common companies for searchable list
  const popularCompanies = [
    'Google', 'Amazon', 'Meta', 'Microsoft', 'Netflix', 'Apple', 
    'TCS', 'Infosys', 'Wipro', 'Zoho', 'Stripe', 'Uber', 'Atlassian'
  ];

  // Sync step from server or store on mount
  useEffect(() => {
    if (isOpen && !isSettingsEditMode) {
      // Track analytics event: onboarding_started
      console.log('[Analytics Event] onboarding_started', { email: userProfile.email });
      getOnboardingStatusApi(userProfile.email).then((status) => {
        if (status && status.onboarding_step && status.onboarding_step <= 4) {
          setStep(status.onboarding_step);
        }
      });
    }
  }, [isOpen, isSettingsEditMode]);

  if (!isOpen) return null;

  // Track analytics helper
  const trackEvent = (eventName: string, data?: any) => {
    console.log(`[Analytics Event] ${eventName}`, { email: userProfile.email, ...data });
  };

  // Keyboard navigation helper for chip groups
  const handleChipKeyDown = (e: React.KeyboardEvent, onSelect: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  // Step 1: Target Role options
  const roleOptions = [
    'Frontend developer',
    'Backend developer',
    'Data analyst',
    'Full stack'
  ];

  // Step 2: Experience options
  const experienceOptions = [
    'Fresher',
    '1 to 3 years',
    '3+ years'
  ];

  // Step 3: Interview Date options
  const dateOptions = [
    { id: 'within_7_days', label: 'Within 7 days', sub: 'Compressed daily sprint' },
    { id: 'within_14_days', label: 'Within 14 days', sub: 'Balanced 2-week plan' },
    { id: 'within_30_days', label: 'Within 30 days', sub: 'Comprehensive 4-week mastery' },
    { id: 'not_scheduled', label: 'Not scheduled yet', sub: 'Standard readiness pace' },
    { id: 'custom', label: 'Specific date', sub: 'Pick from calendar' }
  ];

  const handleNext = async () => {
    setErrorMessage(null);
    const selectedFinalRole = isOtherRole ? otherRoleText.trim() : targetRole;
    if (step === 1 && isOtherRole && !otherRoleText.trim()) {
      setErrorMessage('Please specify your custom target role.');
      return;
    }

    // Save progress to server so user can resume if closed
    const nextStep = step + 1;
    saveOnboardingStepApi({
      step: nextStep,
      target_role: selectedFinalRole,
      experience_level: experienceLevel,
      interview_date_preset: datePreset,
      interview_date: datePreset === 'custom' && customDate ? new Date(customDate).toISOString() : undefined,
      target_company: targetCompany
    }, userProfile.email);

    trackEvent('step_completed', { step, role: selectedFinalRole });

    if (step < 4) {
      setStep(nextStep);
      setOnboardingStep(nextStep);
    } else {
      // Finished all questions -> generate plan!
      await handleGeneratePlan(selectedFinalRole);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setOnboardingStep(step - 1);
      setErrorMessage(null);
    }
  };

  const handleGeneratePlan = async (roleName: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const payload: any = {
        target_role: roleName,
        experience_level: experienceLevel,
        interview_date_preset: datePreset,
        target_company: targetCompany || undefined,
        resume_url: resumeFileName || undefined
      };

      if (datePreset === 'custom' && customDate) {
        payload.interview_date = new Date(customDate).toISOString();
      }

      const plan = await completeOnboardingApi(payload, userProfile.email);
      if (plan) {
        setGeneratedPlan(plan);
        setStudyPlan(plan);
        updateUserProfile({
          targetRole: roleName,
          experienceLevel: experienceLevel,
          onboardingCompleted: true,
          interviewDate: payload.interview_date,
          interviewDatePreset: datePreset,
          targetCompany: targetCompany || undefined
        });
        setShowPlanView(true);
        trackEvent('completed', { role: roleName, totalSessions: plan.total_sessions });
      } else {
        throw new Error('Failed to generate study plan.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to build study plan. Please verify answers and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      trackEvent('skipped');
      const plan = await skipOnboardingApi(userProfile.email);
      if (plan) {
        setGeneratedPlan(plan);
        setStudyPlan(plan);
        updateUserProfile({
          onboardingCompleted: true,
          targetRole: 'Frontend developer',
          experienceLevel: 'Fresher'
        });
        setShowPlanView(true);
      }
    } catch (err: any) {
      setErrorMessage('Could not skip onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartFirstSession = () => {
    trackEvent('first_session_started');
    onClose();
    setActiveTab('setup');
  };

  // Filter companies based on search
  const filteredCompanies = popularCompanies.filter(c => 
    c.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Personalized Interview Onboarding"
    >
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] bg-[var(--bg)] text-[var(--text)]">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-[var(--line)] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[11px] font-bold border border-violet-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSettingsEditMode ? 'Settings • Personalized Plan' : 'First-Login Setup'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text)]">
              {showPlanView 
                ? 'Your Personalized Interview Plan' 
                : 'Tailor Your InterviewAI Practice Plan'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!showPlanView && (
              <button
                onClick={handleSkip}
                className="text-xs text-[var(--mute)] hover:text-violet-400 font-semibold underline underline-offset-4 px-2 py-1 transition-colors"
                title="Set default plan and finish later from Settings"
              >
                Skip for now
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--mute)] hover:text-[var(--text)] hover:bg-[var(--line)] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">

          {/* Loading State */}
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--text)]">Building Your Structured Study Plan...</h3>
                <p className="text-xs text-[var(--mute)]">Balancing role fundamentals, DSA algorithms, and STAR behavioral drills.</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-bold transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* ================= PLAN VIEW (STEP 5 / RESULT) ================= */}
          {!isLoading && showPlanView && generatedPlan && (
            <div className="space-y-6 animate-fade-in">
              {/* Header card with summary */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-cyan-500/10 border border-violet-500/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-violet-600 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-sm">
                    {generatedPlan.weeks_count}-Week Custom Plan
                  </span>
                  {generatedPlan.days_until_interview !== undefined && (
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                      🎯 {generatedPlan.days_until_interview} days to interview
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-[var(--text)]">
                    Target Role: {generatedPlan.role}
                  </h3>
                  <p className="text-xs text-[var(--mute)] flex items-center gap-2">
                    <span>Experience: <strong className="text-[var(--text)]">{generatedPlan.experience_level}</strong></span>
                    <span>•</span>
                    <span>Total Tasks: <strong className="text-violet-400 font-mono">{generatedPlan.total_sessions} Sessions</strong></span>
                  </p>
                </div>

                {generatedPlan.quota_capped && generatedPlan.quota_warning && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                    <Zap className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>{generatedPlan.quota_warning}</span>
                  </div>
                )}
              </div>

              {/* Task List Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--mute)] px-1">
                  <span className="font-bold uppercase tracking-wider text-[var(--text)]">Curated Weekly Tasks</span>
                  <span>{generatedPlan.tasks.length} items scheduled</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {generatedPlan.tasks.map((task, idx) => (
                    <div 
                      key={task.id || idx}
                      className="p-3.5 rounded-xl bg-[var(--line)]/30 border border-[var(--line)] hover:border-violet-500/40 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-[var(--text)]">
                            {task.title}
                          </h4>
                          <span className="text-[10px] text-[var(--mute)] font-mono capitalize">
                            Week {task.week_number} • {task.session_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-md bg-[var(--bg)] border border-[var(--line)] text-[11px] font-mono font-bold text-cyan-400 shrink-0">
                        {task.sessions_count} Session
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setShowPlanView(false)}
                  className="text-xs text-[var(--mute)] hover:text-[var(--text)] font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Edit Preferences</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-[var(--line)] hover:bg-[var(--line)] text-xs text-[var(--text)] font-semibold transition-colors flex-1 sm:flex-initial"
                  >
                    View on Dashboard
                  </button>
                  <button
                    onClick={handleStartFirstSession}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all hover:scale-105 active:scale-95 flex-1 sm:flex-initial"
                  >
                    <span>Start First Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP-BY-STEP QUESTIONS ================= */}
          {!isLoading && !showPlanView && (
            <div className="space-y-6">
              
              {/* Progress Tracker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-violet-400">
                    Step {step} of 4 {step === 4 && '(Optional)'}
                  </span>
                  <span className="text-[var(--mute)]">
                    {step === 1 && 'Role Selection'}
                    {step === 2 && 'Experience Level'}
                    {step === 3 && 'Interview Timeline'}
                    {step === 4 && 'Company & Resume (Optional)'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${(step / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* STEP 1: Target Role */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text)] flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-violet-400" />
                      <span>What role are you actively preparing for?</span>
                    </h3>
                    <p className="text-xs text-[var(--mute)]">
                      Your practice questions and system design depth will adapt to this target track.
                    </p>
                  </div>

                  {/* Tappable Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Target Role">
                    {roleOptions.map((role) => {
                      const isSelected = !isOtherRole && targetRole === role;
                      return (
                        <div
                          key={role}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => {
                            setTargetRole(role);
                            setIsOtherRole(false);
                          }}
                          onKeyDown={(e) => handleChipKeyDown(e, () => {
                            setTargetRole(role);
                            setIsOtherRole(false);
                          })}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                            isSelected
                              ? 'bg-violet-600/15 border-violet-500 text-violet-300 font-bold shadow-md'
                              : 'bg-slate-800/40 border-slate-700/60 hover:border-violet-500/40 text-[var(--text)]'
                          }`}
                        >
                          <span className="text-sm">{role}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                        </div>
                      );
                    })}

                    {/* Other option */}
                    <div
                      role="radio"
                      aria-checked={isOtherRole}
                      tabIndex={0}
                      onClick={() => setIsOtherRole(true)}
                      onKeyDown={(e) => handleChipKeyDown(e, () => setIsOtherRole(true))}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:col-span-2 ${
                        isOtherRole
                          ? 'bg-violet-600/15 border-violet-500 text-violet-300 font-bold shadow-md'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-violet-500/40 text-[var(--text)]'
                      }`}
                    >
                      <span className="text-sm">Other Specialized Role</span>
                      {isOtherRole && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                    </div>
                  </div>

                  {isOtherRole && (
                    <div className="pt-2">
                      <input
                        type="text"
                        value={otherRoleText}
                        onChange={(e) => setOtherRoleText(e.target.value)}
                        placeholder="E.g., DevOps Engineer, Machine Learning Engineer, iOS Developer..."
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all shadow-inner"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Experience Level */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text)] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span>What is your experience level?</span>
                    </h3>
                    <p className="text-xs text-[var(--mute)]">
                      Freshers receive more coding fundamentals; 3+ years focuses on scale & leadership.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Experience Level">
                    {experienceOptions.map((exp) => {
                      const isSelected = experienceLevel === exp;
                      return (
                        <div
                          key={exp}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => setExperienceLevel(exp)}
                          onKeyDown={(e) => handleChipKeyDown(e, () => setExperienceLevel(exp))}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold shadow-md'
                              : 'bg-slate-800/40 border-slate-700/60 hover:border-cyan-500/40 text-[var(--text)]'
                          }`}
                        >
                          <div>
                            <span className="text-sm block">{exp}</span>
                            <span className="text-[11px] text-[var(--mute)] font-normal">
                              {exp === 'Fresher' && 'Core algorithms, language syntax, academic projects'}
                              {exp === '1 to 3 years' && 'System modularity, real-world bug mitigation, ownership'}
                              {exp === '3+ years' && 'High concurrency, distributed design, leadership STAR'}
                            </span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Interview Date */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text)] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span>When is your upcoming interview?</span>
                    </h3>
                    <p className="text-xs text-[var(--mute)]">
                      Sets plan urgency. Shorter timelines generate intensive daily sprints.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Interview Timeline">
                    {dateOptions.map((opt) => {
                      const isSelected = datePreset === opt.id;
                      return (
                        <div
                          key={opt.id}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => setDatePreset(opt.id)}
                          onKeyDown={(e) => handleChipKeyDown(e, () => setDatePreset(opt.id))}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 font-bold shadow-md'
                              : 'bg-slate-800/40 border-slate-700/60 hover:border-emerald-500/40 text-[var(--text)]'
                          }`}
                        >
                          <div>
                            <span className="text-sm block">{opt.label}</span>
                            <span className="text-[10px] text-[var(--mute)] font-normal">{opt.sub}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {datePreset === 'custom' && (
                    <div className="pt-2 space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text)] block">
                        Select interview date:
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Target Company & Resume (Optional) */}
              {step === 4 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text)] flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>Target Company & Resume (Optional)</span>
                    </h3>
                    <p className="text-xs text-[var(--mute)]">
                      Tailor questions to specific company interview loops and align with your resume highlights.
                    </p>
                  </div>

                  {/* Company search & chips */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text)] block">
                      Target Company:
                    </label>
                    <input
                      type="text"
                      value={companySearch}
                      onChange={(e) => {
                        setCompanySearch(e.target.value);
                        setTargetCompany(e.target.value);
                      }}
                      placeholder="Type company name (e.g., Google, Amazon, Zoho)..."
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all shadow-inner"
                    />

                    {/* Quick popular chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {filteredCompanies.slice(0, 8).map((comp) => (
                        <button
                          key={comp}
                          type="button"
                          onClick={() => {
                            setTargetCompany(comp);
                            setCompanySearch(comp);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                            targetCompany === comp
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                              : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
                          }`}
                        >
                          {comp}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resume upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text)] block">
                      Upload Resume (PDF / DOCX):
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResumeFileName(e.target.files[0].name);
                        }
                      }}
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 rounded-2xl border border-dashed border-slate-700 hover:border-violet-500/50 bg-slate-900/40 text-center cursor-pointer space-y-1.5 transition-all"
                    >
                      <Upload className="w-5 h-5 text-violet-400 mx-auto" />
                      <div className="text-xs font-semibold text-[var(--text)]">
                        {resumeFileName ? (
                          <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                            <FileCheck className="w-4 h-4" />
                            <span>{resumeFileName}</span>
                          </span>
                        ) : (
                          'Click to select resume file from device'
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--mute)]">
                        PDF or DOCX up to 10MB
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--line)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--text)] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all hover:scale-105 active:scale-95 ml-auto"
                >
                  <span>{step === 4 ? 'Generate My Plan' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
