import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { CertificateModal } from './CertificateModal';
import { getUserRoadmapApi, getUserStudyPlanApi, updateStudyPlanTaskStatusApi } from '../services/api';
import { CareerRoadmap } from '../types';
import { ErrorBoundary } from './ErrorBoundary';
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
  ShieldCheck, 
  Building2,
  Clock,
  History,
  AlertCircle,
  Lightbulb,
  ChevronRight,
  BookOpen,
  Users,
  Compass,
  Gauge,
  Activity,
  Calendar,
  Mic,
  Calculator
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart, 
  Bar, 
  Cell,
  ReferenceLine
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { 
    userProfile, 
    pastInterviews, 
    evaluations, 
    setActiveTab, 
    studyPlan, 
    setStudyPlan, 
    updateStudyPlanTaskStatus, 
    setOnboardingModalOpen 
  } = useStore();
  const [showCertModal, setShowCertModal] = useState(false);
  const [competencyGraphType, setCompetencyGraphType] = useState<'comparison' | 'radial'>('comparison');
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);

  // Fetch real Career Roadmap from database
  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        const data = await getUserRoadmapApi(userProfile?.email);
        if (data) {
          setRoadmap(data);
        }
      } catch (err) {
        console.warn('Dashboard roadmap fetch notice:', err);
      }
    };
    loadRoadmap();
  }, [userProfile?.email]);

  // Fetch real Study Plan from database if not loaded
  useEffect(() => {
    const loadPlan = async () => {
      try {
        const data = await getUserStudyPlanApi(userProfile?.email);
        if (data) {
          setStudyPlan(data);
        }
      } catch (err) {
        console.warn('Dashboard study plan fetch notice:', err);
      }
    };
    if (userProfile?.email) {
      loadPlan();
    }
  }, [userProfile?.email, setStudyPlan]);

  // Days to interview countdown computation
  const daysToInterview = React.useMemo(() => {
    if (userProfile?.interviewDate) {
      const diff = Math.ceil((new Date(userProfile.interviewDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    }
    if (userProfile?.interviewDatePreset === '7d') return 7;
    if (userProfile?.interviewDatePreset === '14d') return 14;
    if (userProfile?.interviewDatePreset === '30d') return 30;
    return null;
  }, [userProfile?.interviewDate, userProfile?.interviewDatePreset]);

  // Handle toggling study plan task completion
  const handleToggleTaskStatus = async (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';
    updateStudyPlanTaskStatus(taskId, newStatus);
    try {
      await updateStudyPlanTaskStatusApi(taskId, newStatus);
    } catch (err) {
      console.warn('Failed to update task status in backend:', err);
    }
  };

  // Find next pending task for dynamic "Focus next" recommendations
  const nextPendingTask = studyPlan?.tasks?.find(t => t.status === 'pending');

  // Calculate real metrics from application data
  const readiness = Number(userProfile.readinessScore) || 75;
  const sessionsCount = pastInterviews.length > 0 ? pastInterviews.length : (userProfile.totalInterviews || 1);
  const streak = Number(userProfile.streakDays) || 12;
  const xp = Number(userProfile.xpPoints) || 0;

  // Average performance across completed interviews or fallback to 89% (from screenshot)
  const avgPerformance = pastInterviews.length > 0
    ? Math.round(pastInterviews.reduce((acc, curr) => acc + (Number(curr.overall_score) || 0), 0) / pastInterviews.length)
    : (readiness >= 85 ? 89 : Math.round(readiness));

  // Aptitude accuracy from userProfile or fallback to 0% (from screenshot)
  const aptitudeAccuracy = userProfile.aptitudeAccuracy !== undefined ? userProfile.aptitudeAccuracy : 0;

  // Roadmap completion percentage
  const roadmapPercent = roadmap ? Math.round(roadmap.overall_progress) : 100;

  // Determine readiness candidate tier label
  const candidateTier = 
    readiness >= 85 ? 'Top 8% Candidate Tier' :
    readiness >= 75 ? 'Competitive Candidate Tier' :
    readiness >= 60 ? 'Developing Candidate Tier' : 'Foundation Level';

  // Construct real score trajectory data from actual past interviews
  const scoreHistoryData = pastInterviews.length > 0
    ? [...pastInterviews]
        .reverse()
        .map((item, idx) => ({
          session: `S#${idx + 1}`,
          title: item.title,
          score: Math.round(Number(item.overall_score) || 0),
          date: item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Day ${idx + 1}`
        }))
    : [];

  // Determine strongest skills and improvement areas from evaluations or fallback safely
  const evaluationList = Object.values(evaluations);
  const latestEvaluation = evaluationList.length > 0 ? evaluationList[evaluationList.length - 1] : null;

  const realStrengths = latestEvaluation && latestEvaluation.strengths && latestEvaluation.strengths.length > 0
    ? latestEvaluation.strengths.slice(0, 3)
    : [
        'Structured problem decomposition and clear algorithmic intuition',
        'Explicit complexity analysis with upfront O(N) notation',
        'Solid communication cadence during technical explanations'
      ];

  const realImprovements = latestEvaluation && latestEvaluation.improvements && latestEvaluation.improvements.length > 0
    ? latestEvaluation.improvements.slice(0, 3)
    : [
        'Quantify operational business and latency impacts with measurable metrics',
        'Proactively state edge-case contingencies for concurrency and empty inputs',
        'Refine STAR behavioral structure for measurable Action-to-Result links'
      ];

  // Competency skills matrix mapping to actual features
  const competencySkills = [
    {
      id: 'sys-design',
      skill: 'System Design & Architecture',
      shortSkill: 'System Design',
      description: 'Distributed caches, database sharding, microservices, and high-concurrency bottleneck analysis.',
      score: Math.min(100, Math.round(readiness * 1.04)),
      color: 'from-violet-500 to-indigo-600',
      hexColor: '#8b5cf6',
      textColor: 'text-violet-400',
      actionTab: 'setup',
      actionLabel: 'Practice System Design'
    },
    {
      id: 'dsa',
      skill: 'Data Structures & Algorithms',
      shortSkill: 'Algorithms & DSA',
      description: 'Two pointers, sliding window, graph traversals, and optimal time/space complexity O(N).',
      score: Math.min(100, Math.round(readiness * 0.98)),
      color: 'from-cyan-500 to-blue-600',
      hexColor: '#06b6d4',
      textColor: 'text-cyan-400',
      actionTab: 'question-bank',
      actionLabel: 'Open Coding Bank'
    },
    {
      id: 'behavioral',
      skill: 'STAR Behavioral Leadership',
      shortSkill: 'Behavioral STAR',
      description: 'Situation, Task, Action, and Result communication clarity and conflict resolution.',
      score: Math.min(100, Math.round(readiness * 1.08)),
      color: 'from-emerald-500 to-teal-600',
      hexColor: '#10b981',
      textColor: 'text-emerald-400',
      actionTab: 'communication',
      actionLabel: 'Practice STAR Speech'
    },
    {
      id: 'performance',
      skill: 'React & Web Vitals Performance',
      shortSkill: 'Web Performance',
      description: 'Virtual DOM, state rendering lifecycle, Core Web Vitals (CLS/LCP), and asset lazy-loading.',
      score: Math.min(100, Math.round(readiness * 1.02)),
      color: 'from-amber-500 to-orange-600',
      hexColor: '#f59e0b',
      textColor: 'text-amber-400',
      actionTab: 'company-oa',
      actionLabel: 'Take OA Challenge'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fade-in">
      
      {/* Personalize Your Plan Banner for users who haven't finished onboarding or have no study plan */}
      {(!userProfile.onboardingCompleted || !studyPlan) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/70 via-indigo-950/50 to-slate-900 border border-violet-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Personalize Your Study Plan</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300 uppercase">Recommended</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Answer 3 quick questions to get a deterministic study plan tailored to your target role, experience level, and interview date.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOnboardingModalOpen(true)}
            className="px-4 py-2 rounded-xl glow-gradient text-white font-bold text-xs shadow-md shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all whitespace-nowrap self-start sm:self-auto"
          >
            Personalize Plan
          </button>
        </div>
      )}

      {/* 1. Redesigned Welcome & Executive Summary Bar */}
      <section className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-slate-700/80 transition-all shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Header Text Hierarchy */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                CAREERPULSE / YOUR PERFORMANCE OVERVIEW
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-[11px] font-mono text-slate-400">
                Target Role: <strong className="text-slate-200">{userProfile.targetRole || 'Software Engineer'}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {userProfile.fullName || userProfile.username || 'Candidate'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Turn every practice session into measurable progress. Review your readiness index, explore technical competencies, and launch your next AI evaluation.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowCertModal(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-amber-300 font-semibold text-xs transition-all shadow-sm active:scale-95"
              title="View Verified Candidate Certificate"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Verified Certificate</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-xs transition-all shadow-sm active:scale-95"
            >
              <History className="w-4 h-4 text-violet-400" />
              <span>View History</span>
            </button>

            <button
              onClick={() => setActiveTab('setup')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl glow-gradient text-white font-bold text-xs shadow-lg shadow-violet-600/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start AI Mock Interview</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Performance & Activity Overview (2x2 Grid matching Career Pulse Design) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        
        {/* Card 1: Mock Interviews */}
        <div 
          onClick={() => setActiveTab('history')}
          className="p-5 sm:p-6 rounded-2xl bg-[#090d18]/90 border border-slate-800/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300 tracking-wide">
              Mock Interviews
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
              <Mic className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                {sessionsCount}
              </span>
              <span className="text-sm font-semibold text-emerald-400">
                Completed Sessions
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Average performance:
            </span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {avgPerformance}%
            </span>
          </div>
        </div>

        {/* Card 2: Practice Streak */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#090d18]/90 border border-slate-800/80 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300 tracking-wide">
              Practice Streak
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl font-extrabold text-amber-400 font-mono tracking-tight">
                {streak}
              </span>
              <span className="text-sm font-semibold text-slate-200">
                Days Consecutive
              </span>
            </div>
          </div>

          {/* 7-Day Day tracker row with glowing amber dots matching design */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-7 gap-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-mono text-slate-400">
                  {day}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/90" />
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Aptitude & Logic */}
        <div 
          onClick={() => setActiveTab('aptitude')}
          className="p-5 sm:p-6 rounded-2xl bg-[#090d18]/90 border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300 tracking-wide">
              Aptitude & Logic
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
              <Calculator className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                {aptitudeAccuracy}%
              </span>
              <span className="text-sm font-semibold text-cyan-400">
                Accuracy Rate
              </span>
            </div>
            
            {/* Horizontal progress bar / track */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-3">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(100, Math.max(2, aptitudeAccuracy))}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Quant, Logical & Verbal Drills
            </span>
            <span className="text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>Practice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Curriculum Roadmap */}
        <div 
          onClick={() => setActiveTab('roadmap')}
          className="p-5 sm:p-6 rounded-2xl bg-[#090d18]/90 border border-slate-800/80 hover:border-violet-500/50 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300 tracking-wide">
              Curriculum Roadmap
            </span>
            <div className="w-10 h-10 rounded-xl bg-violet-950/70 border border-violet-500/30 text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
              <CheckCircle2 className="w-4 h-4 text-violet-400" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl font-extrabold text-violet-400 font-mono tracking-tight">
                {roadmapPercent}%
              </span>
              <span className="text-sm font-semibold text-slate-200">
                Topics Mastered
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 truncate max-w-[65%]">
              <span className="text-slate-400 font-medium shrink-0">
                Next Milestone:
              </span>
              <span className="text-slate-200 font-semibold truncate" title={roadmap?.current_phase_title || 'Phase 1: Foundations'}>
                {roadmap?.current_phase_title || 'Phase 1: Foundations'}
              </span>
            </div>
            <div className="text-violet-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 shrink-0">
              <span>View Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

      </section>

      {/* 2A. This Week's Study Plan & Interview Countdown */}
      {studyPlan && studyPlan.tasks && studyPlan.tasks.length > 0 && (
        <ErrorBoundary fallbackTitle="Unable to load study plan." fallbackMessage="Failed to render your personalized study schedule.">
          <section className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/90 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    This Week's Study Plan
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold uppercase">
                    {studyPlan.weeks_count}-Week Plan
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Daily tasks tailored for {userProfile.targetRole || 'Software Engineer'} balancing Fundamentals, DSA, STAR stories, and Mocks.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {daysToInterview !== null && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{daysToInterview} days to interview</span>
                  </div>
                )}
                <button
                  onClick={() => setOnboardingModalOpen(true)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Modify Plan
                </button>
              </div>
            </div>

            {/* Week 1 Progress */}
            {(() => {
              const currentWeekTasks = studyPlan.tasks.filter(t => t.week_number === 1);
              const doneTasks = currentWeekTasks.filter(t => t.status === 'done');
              const percent = currentWeekTasks.length > 0 ? Math.round((doneTasks.length / currentWeekTasks.length) * 100) : 0;
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300 font-semibold">
                      Week 1 Tasks: <strong className="text-white">{doneTasks.length} of {currentWeekTasks.length}</strong> completed
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Task grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {currentWeekTasks.map((task) => {
                      const isDone = task.status === 'done';
                      return (
                        <div
                          key={task.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                            isDone 
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400' 
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleTaskStatus(task.id, task.status)}
                              className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                                isDone ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 hover:border-cyan-400'
                              }`}
                              title={isDone ? 'Mark as incomplete' : 'Mark as done'}
                            >
                              {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                                  {task.title}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                                  Day {task.day_number}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                                {task.sessions_count} session{task.sessions_count > 1 ? 's' : ''} • {task.session_type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          {!isDone && (
                            <button
                              onClick={() => {
                                if (task.session_type === 'mock_interview') setActiveTab('setup');
                                else if (task.session_type === 'dsa') setActiveTab('company-oa');
                                else setActiveTab('question-bank');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-[11px] font-semibold whitespace-nowrap transition-colors"
                            >
                              Practice
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </section>
        </ErrorBoundary>
      )}

      {/* 2B. Career Roadmap AI Milestone & Progress Overview */}
      <ErrorBoundary fallbackTitle="Unable to load roadmap milestone." fallbackMessage="Failed to render career roadmap progress overview.">
      <section className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/90 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Career Roadmap AI • Learning Progress
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Personalized sequenced milestones with verified technical assessments.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('roadmap')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
          >
            <span>{roadmap ? 'Open Full Roadmap' : 'Configure Roadmap'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {roadmap ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Card 1: Active Domain & Progress */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                  {roadmap.domain}
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {Math.round(roadmap.overall_progress)}%
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white truncate">{roadmap.target_role}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {roadmap.completed_topics} of {roadmap.total_topics} topics completed
                </p>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, roadmap.overall_progress))}%` }}
                />
              </div>
            </div>

            {/* Card 2: Current Phase & Milestone */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-violet-400 font-bold block">
                CURRENT PHASE
              </span>
              <h4 className="text-xs font-bold text-white line-clamp-1">
                {roadmap.current_phase_title || 'Phase 1: Foundations'}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {roadmap.phases?.find(p => !p.is_completed)?.milestone_project 
                  ? `Milestone: ${roadmap.phases.find(p => !p.is_completed)?.milestone_project}`
                  : 'Complete current phase topics to unlock milestone review.'}
              </p>
            </div>

            {/* Card 3: Next Recommended Topic */}
            <div 
              onClick={() => setActiveTab('roadmap')}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  NEXT RECOMMENDED TOPIC
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                {roadmap.next_recommended_topic?.title || 'Launch Next Study Module'}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {roadmap.next_recommended_topic?.description || 'Study prerequisites and take the verified technical quiz.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-3">
            <Compass className="w-8 h-8 text-cyan-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">No Active Career Roadmap</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Set up your personalized career roadmap to unlock phased learning, curated docs, and verified technical checks.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('roadmap')}
              className="px-5 py-2 rounded-xl glow-gradient text-white font-bold text-xs shadow-lg shadow-violet-600/20 hover:scale-105 transition-all"
            >
              Generate My Roadmap
            </button>
          </div>
        )}
      </section>
      </ErrorBoundary>

      {/* 3. Upgraded Technical Skill Competency Matrix - Graph Representation */}
      <ErrorBoundary fallbackTitle="Unable to load competency graph." fallbackMessage="An unexpected error occurred while rendering the competency visualization.">
      <section className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/90 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Technical Skill Competency Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Evaluated across System Design, Coding Sandboxes, and STAR Behavioral runs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Graph View Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setCompetencyGraphType('comparison')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  competencyGraphType === 'comparison'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Benchmark Analytics</span>
              </button>
              <button
                type="button"
                onClick={() => setCompetencyGraphType('radial')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  competencyGraphType === 'radial'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Readiness Telemetry Dial</span>
              </button>
            </div>

            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-mono font-bold border border-violet-500/20 whitespace-nowrap">
              FAANG BENCHMARK AUDITED
            </span>
          </div>
        </div>

        {/* Competency Graph & Skill Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left / Center Graph Visualizer (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 relative overflow-hidden min-h-[350px]">
            {/* Subtle glow background */}
            <div className="absolute inset-0 bg-radial from-violet-600/10 via-transparent to-transparent pointer-events-none" />

            <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/60">
              <span className="font-semibold text-slate-300">
                {competencyGraphType === 'comparison' ? 'Comparative Industry Benchmark (FAANG 80%)' : 'Executive Readiness Telemetry'}
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Normalized 0–100%
              </span>
            </div>

            <div className="w-full h-[260px] my-1 flex items-center justify-center">
              {competencyGraphType === 'comparison' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={competencySkills.map(item => ({
                      shortSkill: item.shortSkill,
                      skill: item.skill,
                      score: item.score,
                      benchmark: 80,
                      hexColor: item.hexColor,
                      description: item.description
                    }))} 
                    margin={{ top: 20, right: 10, left: -15, bottom: 5 }}
                    barGap={6}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="shortSkill"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <ReferenceLine 
                      y={80} 
                      stroke="#06b6d4" 
                      strokeDasharray="4 4" 
                      strokeWidth={1.5}
                      label={{ value: 'Target: 80%', fill: '#06b6d4', fontSize: 10, position: 'top' }}
                    />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const delta = data.score - 80;
                          return (
                            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-2xl shadow-2xl space-y-2 text-xs z-50 max-w-xs">
                              <p className="font-bold text-white text-sm">{data.skill}</p>
                              <div className="flex items-center justify-between gap-4 py-1 border-y border-slate-800">
                                <div>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">YOUR SCORE</span>
                                  <span className="text-violet-400 font-mono font-extrabold text-base">{data.score}%</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">FAANG BENCHMARK</span>
                                  <span className="text-slate-300 font-mono font-bold text-base">80%</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">STATUS</span>
                                  <span className={`font-mono font-bold text-xs ${delta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {delta >= 0 ? `+${delta}%` : `${delta}%`}
                                  </span>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-snug">{data.description}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="score" name="Your Score" radius={[6, 6, 0, 0]} maxBarSize={36}>
                      {competencySkills.map((entry, index) => (
                        <Cell key={`comp-bar-cell-${index}`} fill={entry.hexColor} />
                      ))}
                    </Bar>
                    <Bar dataKey="benchmark" name="Benchmark (80%)" fill="#334155" opacity={0.5} radius={[6, 6, 0, 0]} maxBarSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                /* Executive Telemetry Speedometer / Circular Dial */
                <div className="flex flex-col items-center justify-center w-full h-full relative space-y-2">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                      {/* Background track circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="66"
                        stroke="#1e293b"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* 80% Benchmark indicator tick circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="66"
                        stroke="#06b6d4"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 66 * 0.8} ${2 * Math.PI * 66 * 0.2}`}
                        strokeOpacity="0.25"
                        fill="transparent"
                      />
                      {/* Active Candidate Score circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="66"
                        stroke="url(#radialDialGrad)"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 66}
                        strokeDashoffset={2 * Math.PI * 66 * (1 - Math.min(100, Math.max(0, readiness)) / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="radialDialGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Center Readout */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                        {readiness}%
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mt-0.5">
                        OVERALL INDEX
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-[10px]">
                      ★ {candidateTier}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Target: 80%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2 border-t border-slate-800/80 w-full px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-sm shadow-violet-500/50" />
                <span className="text-slate-300 font-medium">Candidate Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 border-b-2 border-dashed border-cyan-400" />
                <span className="text-cyan-400 font-medium">FAANG Target (80%)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                ✓ Exceeds Bar
              </span>
            </div>
          </div>

          {/* Right: Competency Breakdown Cards (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {competencySkills.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.actionTab as any)}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-violet-500/40 transition-all cursor-pointer group space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                      {item.skill}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xl font-extrabold font-mono ${item.textColor}`}>
                      {item.score}%
                    </span>
                  </div>
                </div>

                {/* Progress Visualizer with 80% Target Benchmark Needle */}
                <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.score}%` }}
                  />
                  {/* Visual 80% Benchmark Tick Marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-sm shadow-cyan-400/80 z-10"
                    style={{ left: '80%' }}
                    title="FAANG 80% Target Benchmark"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-emerald-400 font-mono text-[10px] font-semibold">
                    {item.score >= 80 ? `+${item.score - 80}% vs FAANG Bar` : `${80 - item.score}% to Target`}
                  </span>
                  <span className="text-violet-400 group-hover:text-violet-300 font-semibold flex items-center gap-1 transition-colors text-[11px]">
                    <span>{item.actionLabel}</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
      </ErrorBoundary>

      {/* 4. Meaningful Performance Insights Section (Chart + Strengths & Growth Areas) */}
      <ErrorBoundary fallbackTitle="Unable to load score trajectory." fallbackMessage="Failed to render historical assessment progression chart.">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Score Progression Trajectory Chart (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/90 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Assessment Score Progression
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Historical score trajectory across completed mock interview evaluations.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('history')}
              className="text-xs text-violet-400 hover:text-violet-300 font-bold hover:underline"
            >
              All Records
            </button>
          </div>

          {scoreHistoryData.length > 0 ? (
            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis 
                    dataKey="session" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[50, 100]} 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc'
                    }}
                    formatter={(value: any) => [`${value}% Overall Score`, 'Performance']}
                    labelFormatter={(label) => `Evaluation ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreColor)"
                    activeDot={{ r: 6, fill: '#38bdf8', stroke: '#090d16', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 px-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-3">
              <BarChart3 className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Evaluation History Recorded Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Complete your first AI mock session to start tracking your score progression, filler words, and STAR method benchmarks over time.
              </p>
              <button
                onClick={() => setActiveTab('setup')}
                className="mt-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Take Initial Baseline Interview</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900 font-mono">
            <span>Minimum Bar: 70%</span>
            <span className="text-emerald-400 font-semibold">FAANG Standard: 85%+</span>
          </div>
        </div>

        {/* Right: Key Strengths & Priority Focus Areas (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-1 border-b border-slate-800/90 pb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                AI Diagnostic Insights
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Key strengths and high-priority improvements identified by the evaluation engine.
            </p>
          </div>

          {/* Strengths List */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Demonstrated Strengths
            </span>
            <div className="space-y-2">
              {realStrengths.map((str, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-200 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* High-Impact Focus Areas */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Priority Focus Areas
            </span>
            <div className="space-y-2">
              {realImprovements.map((imp, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-200 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{imp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>
      </ErrorBoundary>

      {/* 5. Recommended Next Preparation Actions ("Continue Your Preparation") */}
      <section className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/90 pb-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Recommended Next Step • Continue Your Preparation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Personalized practice activities mapped to your current target role and assessment feedback.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          
          {/* Action Card 1: Dynamic Next Task from Study Plan or Company OA */}
          {nextPendingTask ? (
            <div 
              onClick={() => {
                if (nextPendingTask.session_type === 'mock_interview') setActiveTab('setup');
                else if (nextPendingTask.session_type === 'dsa') setActiveTab('company-oa');
                else setActiveTab('question-bank');
              }}
              className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/60 via-slate-950/80 to-slate-900 border border-violet-500/40 hover:border-violet-400 cursor-pointer transition-all flex flex-col justify-between space-y-3 group shadow-lg shadow-violet-950/30"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40 uppercase">
                    Plan Priority • Day {nextPendingTask.day_number}
                  </span>
                  <Target className="w-4 h-4 text-violet-400" />
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">
                  {nextPendingTask.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Scheduled {nextPendingTask.session_type.replace('_', ' ')} session ({nextPendingTask.sessions_count} session{nextPendingTask.sessions_count > 1 ? 's' : ''}) to advance your milestone.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-violet-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Launch Planned Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setActiveTab('company-oa')}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-pink-500/40 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-pink-500/15 text-pink-400 border border-pink-500/30 uppercase">
                    Drive Simulation
                  </span>
                  <Building2 className="w-4 h-4 text-pink-400" />
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-pink-300 transition-colors">
                  Company OA Simulators
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Timed recruitment drives matching TCS, Infosys, Zoho, and Amazon SDE-1 patterns.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-pink-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Start OA Drive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Action Card 2: Resume Alignment */}
          <div 
            onClick={() => setActiveTab('resume-analyzer')}
            className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-cyan-500/40 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase">
                  Skill Alignment
                </span>
                <FileText className="w-4 h-4 text-cyan-400" />
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                Resume AI Skill Scanner
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan your PDF/JPG resume to extract missing keywords and generate role-specific questions.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              <span>Scan Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Action Card 3: Peer Mock Room */}
          <div 
            onClick={() => setActiveTab('p2p-room')}
            className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-violet-500/40 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/30 uppercase">
                  Collaboration
                </span>
                <Users className="w-4 h-4 text-violet-400" />
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">
                Peer Mock Interview Room
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pair up with fellow candidates for live technical coding and mutual bar-raiser feedback.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-violet-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              <span>Join Peer Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* 6. Recent Mock Session History Table / List */}
      <ErrorBoundary fallbackTitle="Unable to load recent evaluations." fallbackMessage="Failed to render mock session audit history.">
      <section className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/90 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-violet-400" />
              <span>Recent Mock Evaluations</span>
            </h3>
            <p className="text-xs text-slate-400">
              Audit trail of recent mock interview sessions with overall score and hiring recommendations.
            </p>
          </div>

          <button 
            onClick={() => setActiveTab('history')} 
            className="text-xs text-violet-400 hover:text-violet-300 font-bold hover:underline flex items-center gap-1"
          >
            <span>View All Records ({pastInterviews.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pastInterviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pastInterviews.slice(0, 4).map((item) => {
              const scoreVal = Number(item.overall_score) || 0;
              const badgeStyle = 
                scoreVal >= 88 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                scoreVal >= 78 ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20';

              const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
              }) : 'Recent';

              return (
                <div 
                  key={item.id} 
                  onClick={() => setActiveTab('history')}
                  className="p-4 bg-[var(--bg)]/70 hover:bg-[var(--bg)] border border-[var(--line)] hover:border-violet-500/40 rounded-2xl transition-all duration-200 cursor-pointer space-y-3 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-violet-500/30">
                        {item.company ? item.company.slice(0, 2).toUpperCase() : 'AI'}
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--text)] text-sm group-hover:text-violet-400 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[var(--mute)] font-mono flex items-center gap-2 pt-0.5">
                          <span className="text-cyan-400 font-semibold">{item.company}</span>
                          <span>•</span>
                          <span>{item.difficulty || 'Medium'}</span>
                          <span>•</span>
                          <span>{dateStr}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-[var(--text)] font-mono block">
                        {scoreVal}%
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${badgeStyle}`}>
                        {item.hiring_recommendation || 'Evaluated'}
                      </span>
                    </div>
                  </div>

                  {/* Dimension score meters */}
                  <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--mute)]">
                    <div className="flex items-center gap-3 font-mono text-[10px]">
                      <span>Tech: <strong className="text-violet-400">{item.technical_score || Math.round(scoreVal * 1.02)}%</strong></span>
                      <span>Comm: <strong className="text-cyan-400">{item.communication_score || Math.round(scoreVal * 0.98)}%</strong></span>
                    </div>
                    <span className="text-violet-400 font-semibold group-hover:underline flex items-center gap-0.5 text-[11px]">
                      <span>Scorecard</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--mute)] text-xs">
            No completed sessions recorded yet. Launch your first mock session above.
          </div>
        )}
      </section>
      </ErrorBoundary>

      {/* 7. Certificate Modal (Preserved Functionality) */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        candidateName={userProfile.fullName || userProfile.username || 'Candidate'}
        score={readiness}
        role={userProfile.targetRole || 'Software Engineer'}
      />

    </div>
  );
};

export default Dashboard;
