import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  CareerRoadmap, 
  RoadmapPhase, 
  RoadmapTopic, 
  RoadmapRecommendation,
  NavTab
} from '../types';
import { 
  getUserRoadmapApi, 
  generateRoadmapApi, 
  updateTopicStatusApi, 
  resetRoadmapProgressApi, 
  deleteRoadmapApi,
  getRoadmapRecommendationApi 
} from '../services/api';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  ExternalLink, 
  ArrowRight, 
  RotateCcw, 
  AlertTriangle, 
  Layers, 
  Calendar, 
  Award, 
  Target, 
  Play, 
  ChevronDown, 
  ChevronRight, 
  X, 
  HelpCircle, 
  Check, 
  Loader2, 
  Zap, 
  Code2,
  RefreshCw,
  Info,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface CareerRoadmapViewProps {
  onNavigateTab?: (tab: NavTab) => void;
}

const DOMAIN_OPTIONS = [
  'Full-Stack Development',
  'Frontend Development',
  'Backend Development',
  'Java Development',
  'Data Engineering',
  'Data Science',
  'AI/ML',
  'DevOps/Cloud',
  'Cybersecurity',
  'Other'
];

const SKILL_LEVELS = [
  { value: 'Complete Beginner', label: 'Complete Beginner', desc: 'No prior programming experience' },
  { value: 'Beginner', label: 'Beginner', desc: 'Basic knowledge, ready for structured study' },
  { value: 'Intermediate', label: 'Intermediate', desc: 'Hands-on project experience, targeting role mastery' },
  { value: 'Advanced', label: 'Advanced', desc: 'Seasoned engineer targeting senior/lead interviews' }
];

const STUDY_PACING = [
  { value: '30 mins/day', label: '30 Mins / Day', desc: 'Light pace for busy working professionals' },
  { value: '1 hour/day', label: '1 Hour / Day', desc: 'Consistent daily steady progress' },
  { value: '2 hours/day', label: '2 Hours / Day', desc: 'Accelerated placement sprint' },
  { value: '3+ hours/day', label: '3+ Hours / Day', desc: 'Full-time intensive bootcamp pacing' }
];

const LEARNING_PREFERENCES = [
  { value: 'balanced', label: 'Balanced (Theory & Practice)', desc: '50% conceptual foundations + 50% coding tasks' },
  { value: 'practice-first', label: 'Practice-First', desc: 'Jump straight into hands-on exercises and coding' },
  { value: 'theory-first', label: 'Theory-First', desc: 'Deep dive into architecture and internal workings first' }
];

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({ onNavigateTab }) => {
  const { userProfile, setActiveTab } = useStore();
  const userEmail = userProfile?.email || 'candidate@interview.ai';

  // Roadmap state
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [recommendation, setRecommendation] = useState<RoadmapRecommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Setup Form State
  const [domain, setDomain] = useState<string>('Full-Stack Development');
  const [customDomain, setCustomDomain] = useState<string>('');
  const [skillLevel, setSkillLevel] = useState<string>('Intermediate');
  const [targetRole, setTargetRole] = useState<string>(userProfile?.targetRole || 'Full-Stack Developer');
  const [studyTime, setStudyTime] = useState<string>('1 hour/day');
  const [preference, setPreference] = useState<string>('balanced');
  const [targetDate, setTargetDate] = useState<string>('');

  // Modals & Panels
  const [selectedTopic, setSelectedTopic] = useState<RoadmapTopic | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({});
  const [showRegenerateModal, setShowRegenerateModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Topic Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Load user roadmap on mount
  useEffect(() => {
    fetchUserRoadmap();
  }, [userEmail]);

  const fetchUserRoadmap = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await getUserRoadmapApi(userEmail);
      if (data) {
        setRoadmap(data);
        // Expand first phase by default
        if (data.phases && data.phases.length > 0) {
          const initialExpanded: Record<number, boolean> = {};
          data.phases.forEach((p: RoadmapPhase, idx: number) => {
            initialExpanded[p.id] = idx === 0 || p.progress_percentage < 100;
          });
          setExpandedPhases(initialExpanded);
        }
        // Fetch AI recommendation
        loadRecommendation(data.id);
      } else {
        setRoadmap(null);
      }
    } catch (err: any) {
      console.warn('Roadmap initial load failed:', err);
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendation = async (roadmapId: number) => {
    try {
      const rec = await getRoadmapRecommendationApi(roadmapId, userEmail);
      if (rec) {
        setRecommendation(rec);
      }
    } catch (e) {
      console.warn('Recommendation fetch failed:', e);
    }
  };

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDomain = domain === 'Other' ? customDomain.trim() : domain;
    if (!finalDomain) {
      setErrorMessage('Please specify your career domain.');
      return;
    }
    if (!targetRole.trim()) {
      setErrorMessage('Please enter your target role.');
      return;
    }

    setGenerating(true);
    setErrorMessage('');
    try {
      const res = await generateRoadmapApi({
        domain: finalDomain,
        skill_level: skillLevel,
        target_role: targetRole.trim(),
        study_time_daily: studyTime,
        learning_preference: preference,
        target_date: targetDate || undefined,
        user_email: userEmail
      });

      if (res && res.id) {
        setRoadmap(res);
        setShowRegenerateModal(false);
        // Expand first phase
        if (res.phases && res.phases.length > 0) {
          const initialExpanded: Record<number, boolean> = {};
          res.phases.forEach((p: RoadmapPhase, idx: number) => {
            initialExpanded[p.id] = idx === 0;
          });
          setExpandedPhases(initialExpanded);
        }
        loadRecommendation(res.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const togglePhaseExpand = (phaseId: number) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const handleOpenTopic = (topic: RoadmapTopic) => {
    setSelectedTopic(topic);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(topic.quiz_score !== undefined ? topic.quiz_score : null);
  };

  const handleCloseTopic = () => {
    setSelectedTopic(null);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const handleTopicStatusChange = async (topicId: number, newStatus: 'not_started' | 'in_progress' | 'completed') => {
    setActionLoading(true);
    try {
      const updated = await updateTopicStatusApi(topicId, {
        status: newStatus,
        quiz_score: quizScore !== null ? quizScore : undefined,
        is_verified: quizScore !== null && quizScore >= 70,
        user_email: userEmail
      });

      // Update local state
      if (roadmap) {
        const updatedPhases = roadmap.phases.map(phase => {
          let phaseCompletedCount = 0;
          const updatedTopics = phase.topics.map(t => {
            if (t.id === topicId) {
              const u = { 
                ...t, 
                status: newStatus,
                quiz_score: updated.quiz_score ?? t.quiz_score,
                is_verified: updated.is_verified ?? t.is_verified,
                completed_at: newStatus === 'completed' ? new Date().toISOString() : null
              };
              if (u.status === 'completed') phaseCompletedCount++;
              return u;
            }
            if (t.status === 'completed') phaseCompletedCount++;
            return t;
          });

          const total = updatedTopics.length;
          const pct = total > 0 ? Math.round((phaseCompletedCount / total) * 100) : 0;
          return {
            ...phase,
            topics: updatedTopics,
            completed_topics_count: phaseCompletedCount,
            progress_percentage: pct,
            is_completed: phaseCompletedCount === total && total > 0
          };
        });

        const totalTopics = updatedPhases.reduce((acc, p) => acc + p.total_topics_count, 0);
        const completedTopics = updatedPhases.reduce((acc, p) => acc + p.completed_topics_count, 0);
        const overall = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        setRoadmap({
          ...roadmap,
          phases: updatedPhases,
          completed_topics: completedTopics,
          overall_progress: overall
        });

        if (selectedTopic && selectedTopic.id === topicId) {
          setSelectedTopic({
            ...selectedTopic,
            status: newStatus,
            quiz_score: updated.quiz_score ?? selectedTopic.quiz_score,
            is_verified: updated.is_verified ?? selectedTopic.is_verified
          });
        }

        // Recalculate recommendation
        loadRecommendation(roadmap.id);
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectQuizAnswer = (qIndex: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedTopic || !selectedTopic.assessment_quiz) return;
    const questions = selectedTopic.assessment_quiz;
    if (questions.length === 0) return;

    let correctCount = 0;
    questions.forEach((q: any, idx: number) => {
      if (selectedAnswers[idx] === q.answer_index) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setQuizScore(calculatedScore);
    setQuizSubmitted(true);

    const isVerified = calculatedScore >= 70;
    const newStatus = isVerified ? 'completed' : selectedTopic.status;

    // Update in backend
    try {
      await updateTopicStatusApi(selectedTopic.id, {
        status: newStatus,
        quiz_score: calculatedScore,
        is_verified: isVerified,
        user_email: userEmail
      });

      // Update local topic
      setSelectedTopic(prev => prev ? ({
        ...prev,
        quiz_score: calculatedScore,
        is_verified: isVerified,
        status: newStatus
      }) : null);

      // Refresh roadmap data
      fetchUserRoadmap();
    } catch (e) {
      console.warn('Failed to submit quiz score:', e);
    }
  };

  const handleResetProgress = async () => {
    if (!roadmap) return;
    setActionLoading(true);
    try {
      await resetRoadmapProgressApi(roadmap.id, userEmail);
      setShowResetModal(false);
      await fetchUserRoadmap();
    } catch (err: any) {
      console.error('Reset progress failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNavigateToModule = (moduleTab: string) => {
    if (onNavigateTab) {
      onNavigateTab(moduleTab as NavTab);
    } else {
      setActiveTab(moduleTab as NavTab);
    }
  };

  // Continue Learning: open next recommended topic or first uncompleted topic
  const handleContinueLearning = () => {
    if (recommendation?.recommended_topic) {
      handleOpenTopic(recommendation.recommended_topic);
      return;
    }
    if (roadmap?.next_recommended_topic) {
      handleOpenTopic(roadmap.next_recommended_topic);
      return;
    }
    // Search first incomplete topic
    if (roadmap?.phases) {
      for (const phase of roadmap.phases) {
        const next = phase.topics.find(t => t.status !== 'completed');
        if (next) {
          handleOpenTopic(next);
          return;
        }
      }
      // If all completed, open first topic
      if (roadmap.phases[0]?.topics[0]) {
        handleOpenTopic(roadmap.phases[0].topics[0]);
      }
    }
  };

  // --------------------------------------------------------------------------
  // Render Loading State
  // --------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-spin">
          <Compass className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-300">Loading Career Roadmap AI...</p>
          <p className="text-xs text-slate-500">Syncing learning trajectory and verified assessments</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render Setup View (If user has no active roadmap)
  // --------------------------------------------------------------------------
  if (!roadmap) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl p-8 border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-POWERED CAREER ARCHITECT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Personalized Career Roadmap
              </h1>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                Transform your target role into an adaptive milestone path. Our AI designs structured phases, curated technical topics, verified quizzes, and connected practice labs tailored to your schedule.
              </p>
            </div>
            <div className="w-20 h-20 rounded-2xl glow-gradient flex items-center justify-center shrink-0 shadow-xl shadow-violet-600/20">
              <Compass className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleGenerateRoadmap} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Configure Your Learning Goals
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Provide your role targets to generate a sequenced curriculum with realistic timelines.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Career Domain */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Career Domain <span className="text-cyan-400">*</span>
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {domain === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify domain (e.g. Embedded Firmware, Blockchain)"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              )}
            </div>

            {/* Target Role */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Target Role <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer, Java Backend Lead"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            {/* Current Skill Level */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Current Skill Level <span className="text-cyan-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {SKILL_LEVELS.map((lvl) => {
                  const isSelected = skillLevel === lvl.value;
                  return (
                    <div
                      key={lvl.value}
                      onClick={() => setSkillLevel(lvl.value)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-violet-600/20 border-violet-500 text-white shadow-lg shadow-violet-600/10'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white flex items-center justify-between">
                        <span>{lvl.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{lvl.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Study Time */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Available Study Time <span className="text-cyan-400">*</span>
              </label>
              <select
                value={studyTime}
                onChange={(e) => setStudyTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {STUDY_PACING.map((p) => (
                  <option key={p.value} value={p.value}>{p.label} - {p.desc}</option>
                ))}
              </select>
            </div>

            {/* Learning Preference */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Learning Preference <span className="text-cyan-400">*</span>
              </label>
              <select
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {LEARNING_PREFERENCES.map((pref) => (
                  <option key={pref.value} value={pref.value}>{pref.label}</option>
                ))}
              </select>
            </div>

            {/* Target Date (Optional) */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block flex items-center justify-between">
                <span>Target Completion Date</span>
                <span className="text-[10px] text-slate-500 font-normal">Optional</span>
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white glow-gradient shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Adaptive Roadmap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Generate My Roadmap</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Main Roadmap Interactive Dashboard
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
                {roadmap.domain}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-medium">
                {roadmap.skill_level}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                ⏱ {roadmap.study_time_daily}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{roadmap.target_role} Roadmap</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Targeted curriculum structured into {roadmap.total_phases} milestone phases and {roadmap.total_topics} technical modules. Complete topics and pass knowledge checks to build verified readiness.
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRegenerateModal(true)}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
                title="Regenerate with different target or level"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Regenerate</span>
              </button>
              <button
                onClick={() => setShowResetModal(true)}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
                title="Reset all topic progress to not started"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset</span>
              </button>
            </div>

            <button
              onClick={handleContinueLearning}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white glow-gradient shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current text-white" />
              <span>Continue Learning</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Quick Stats */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Overall Completion</span>
              <span className="font-mono font-bold text-cyan-400">{Math.round(roadmap.overall_progress)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, roadmap.overall_progress))}%` }}
              />
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">TOPICS COMPLETED</span>
              <span className="text-base font-bold text-white">
                {roadmap.completed_topics} / {roadmap.total_topics}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">CURRENT PHASE</span>
              <span className="text-xs font-bold text-white truncate max-w-[160px] block">
                {roadmap.current_phase_title || 'Phase 1: Foundations'}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI Personalized Recommendation Banner */}
      {recommendation && (
        <div className="p-4 sm:p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-violet-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">AI NEXT BEST STEP</span>
                {recommendation.phase_title && (
                  <span className="text-[10px] text-slate-400">({recommendation.phase_title})</span>
                )}
              </div>
              <p className="text-xs text-slate-200 font-medium">
                {recommendation.reason}
              </p>
              {recommendation.missing_prerequisites && recommendation.missing_prerequisites.length > 0 && (
                <p className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
                  <AlertTriangle className="w-3 h-3" />
                  Prerequisite recommendation: Complete {recommendation.missing_prerequisites.join(', ')} first.
                </p>
              )}
            </div>
          </div>

          {recommendation.recommended_topic && (
            <button
              onClick={() => handleOpenTopic(recommendation.recommended_topic!)}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 self-end md:self-center"
            >
              <span>Launch: {recommendation.recommended_topic.title}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 3. Sequenced Roadmap Phases */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            <span>Phased Learning Pathway</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {roadmap.phases.length} Phases Total
          </span>
        </div>

        {roadmap.phases.map((phase, pIdx) => {
          const isExpanded = expandedPhases[phase.id] ?? false;
          const isCompleted = phase.is_completed || (phase.completed_topics_count === phase.total_topics_count && phase.total_topics_count > 0);

          return (
            <div 
              key={phase.id}
              className={`rounded-2xl border transition-all ${
                isCompleted 
                  ? 'border-emerald-500/30 bg-slate-900/60' 
                  : isExpanded 
                    ? 'border-slate-700 bg-slate-900/80 shadow-lg' 
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              {/* Phase Header Accordion */}
              <div
                onClick={() => togglePhaseExpand(phase.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                    isCompleted
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : `0${phase.phase_order}`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white truncate">
                        {phase.title}
                      </h3>
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          PHASE MASTERED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-xl">
                      {phase.purpose}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex flex-col items-end text-xs">
                    <span className="text-slate-400 font-mono">
                      {phase.completed_topics_count} / {phase.total_topics_count} Topics
                    </span>
                    <span className="text-[10px] text-cyan-400 font-bold">
                      {phase.progress_percentage}%
                    </span>
                  </div>

                  <div className="text-slate-400 hover:text-white p-1">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Phase Content (Expanded Topics) */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-1 border-t border-slate-800/80 space-y-3">
                  {/* Phase Milestone Callout */}
                  {phase.milestone_project && (
                    <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-300 flex items-start gap-2.5">
                      <Award className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">Capstone Milestone: </span>
                        <span>{phase.milestone_project}</span>
                      </div>
                    </div>
                  )}

                  {/* Topic Items Grid / List */}
                  <div className="space-y-2 pt-1">
                    {phase.topics.map((topic, tIdx) => {
                      const isTopicDone = topic.status === 'completed';
                      const isTopicInProgress = topic.status === 'in_progress';
                      const isVerified = topic.is_verified || (topic.quiz_score !== null && topic.quiz_score !== undefined && topic.quiz_score >= 70);

                      return (
                        <div
                          key={topic.id}
                          onClick={() => handleOpenTopic(topic)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isTopicDone
                              ? 'bg-slate-900/60 border-emerald-500/20 hover:border-emerald-500/40'
                              : isTopicInProgress
                                ? 'bg-violet-950/20 border-violet-500/30 hover:border-violet-500/50'
                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            {/* Status Icon */}
                            <div className="shrink-0 mt-0.5 sm:mt-0">
                              {isTopicDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : isTopicInProgress ? (
                                <div className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-500" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-white">
                                  {topic.topic_order}. {topic.title}
                                </span>
                                {isVerified && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-0.5">
                                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate max-w-md">
                                {topic.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            {/* Prerequisites Pill */}
                            {topic.prerequisites && topic.prerequisites.length > 0 && (
                              <span className="hidden md:inline-block px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                                Req: {topic.prerequisites[0]}
                              </span>
                            )}

                            {/* Practical lab indicator */}
                            {topic.practical_link_tab && (
                              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
                                Lab Available
                              </span>
                            )}

                            {/* Status Pill */}
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase ${
                              isTopicDone
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                : isTopicInProgress
                                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {topic.status.replace('_', ' ')}
                            </span>

                            <button className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-semibold">
                              <span>Learn</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* 4. Topic Learning Experience Modal / Drawer */}
      {/* -------------------------------------------------------------------------- */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90 sticky top-0 z-10 backdrop-blur">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-semibold">
                    TOPIC {selectedTopic.topic_order}
                  </span>
                  {selectedTopic.is_verified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED MASTERY
                    </span>
                  )}
                  {selectedTopic.quiz_score !== null && selectedTopic.quiz_score !== undefined && (
                    <span className="text-[10px] font-mono text-slate-400">
                      Score: {selectedTopic.quiz_score}%
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white truncate">
                  {selectedTopic.title}
                </h3>
              </div>

              <button
                onClick={handleCloseTopic}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
              {/* Overview / Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Overview & Technical Purpose</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                  {selectedTopic.description}
                </p>
              </div>

              {/* Learning Objectives */}
              {selectedTopic.learning_objectives && selectedTopic.learning_objectives.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-violet-400" />
                    <span>Learning Objectives</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedTopic.learning_objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {selectedTopic.prerequisites && selectedTopic.prerequisites.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recommended Prerequisites</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopic.prerequisites.map((req, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Concepts & Code Snippets */}
              {selectedTopic.key_concepts && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Key Concepts & Implementation Guide</span>
                  </h4>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 font-mono text-xs overflow-x-auto text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedTopic.key_concepts}
                  </div>
                </div>
              )}

              {/* Practical Exercises */}
              {selectedTopic.exercises && selectedTopic.exercises.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hands-On Practical Exercises</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedTopic.exercises.map((ex, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-slate-300 leading-relaxed">{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Documentation Resources */}
              {selectedTopic.resources && selectedTopic.resources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Curated Documentation & Spec References</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTopic.resources.map((res: any, i) => {
                      const title = typeof res === 'string' ? res : res.title;
                      const url = typeof res === 'string' ? '#' : res.url;
                      return (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-950 text-xs text-slate-300 flex items-center justify-between group transition-colors"
                        >
                          <span className="font-medium text-slate-200 truncate">{title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Connected InterviewAI Practice Module Link */}
              {selectedTopic.practical_link_tab && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/30 to-cyan-950/30 border border-violet-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Connected Practice Lab Available</span>
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Practice this topic directly in InterviewAI’s specialized simulators.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleCloseTopic();
                      handleNavigateToModule(selectedTopic.practical_link_tab!);
                    }}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-lg shadow-violet-600/20 shrink-0 flex items-center gap-1.5"
                  >
                    <span>{selectedTopic.practical_action_label || 'Launch Interactive Practice'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* ---------------------------------------------------------------------- */}
              {/* Knowledge Check / Assessment Quiz */}
              {/* ---------------------------------------------------------------------- */}
              {selectedTopic.assessment_quiz && selectedTopic.assessment_quiz.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        <span>Knowledge Check Quiz</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Score 70% or higher to earn verified technical mastery for this topic.
                      </p>
                    </div>
                    {quizScore !== null && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                        quizScore >= 70
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}>
                        Score: {quizScore}% {quizScore >= 70 ? '• PASSED' : '• RETRY'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedTopic.assessment_quiz.map((q: any, qIdx: number) => {
                      const isAnswered = selectedAnswers[qIdx] !== undefined;
                      const isCorrect = selectedAnswers[qIdx] === q.answer_index;

                      return (
                        <div key={qIdx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                          <p className="text-xs sm:text-sm font-semibold text-slate-200">
                            {qIdx + 1}. {q.question}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isSelected = selectedAnswers[qIdx] === optIdx;
                              const isRightOption = optIdx === q.answer_index;

                              let optClass = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';
                              if (quizSubmitted) {
                                if (isRightOption) {
                                  optClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold';
                                } else if (isSelected && !isRightOption) {
                                  optClass = 'bg-rose-500/20 border-rose-500 text-rose-200 line-through';
                                }
                              } else if (isSelected) {
                                optClass = 'bg-violet-600/20 border-violet-500 text-white shadow-sm';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleSelectQuizAnswer(qIdx, optIdx)}
                                  disabled={quizSubmitted}
                                  className={`p-2.5 rounded-xl border text-xs text-left transition-all flex items-start gap-2 ${optClass}`}
                                >
                                  <span className="font-mono text-[10px] text-slate-400 mt-0.5">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span className="leading-snug">{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && q.explanation && (
                            <p className="text-[11px] text-slate-400 pt-1 font-mono leading-relaxed">
                              💡 Explanation: {q.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(selectedAnswers).length < selectedTopic.assessment_quiz.length}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white glow-gradient shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Submit & Verify Answers
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setSelectedAnswers({});
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Modal Sticky Footer Status Switcher */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Current Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] uppercase ${
                  selectedTopic.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : selectedTopic.status === 'in_progress'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-400'
                }`}>
                  {selectedTopic.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedTopic.status !== 'in_progress' && (
                  <button
                    onClick={() => handleTopicStatusChange(selectedTopic.id, 'in_progress')}
                    disabled={actionLoading}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Mark In Progress
                  </button>
                )}

                {selectedTopic.status !== 'completed' ? (
                  <button
                    onClick={() => handleTopicStatusChange(selectedTopic.id, 'completed')}
                    disabled={actionLoading}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Completed</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleTopicStatusChange(selectedTopic.id, 'not_started')}
                    disabled={actionLoading}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold transition-colors"
                  >
                    Reset Status
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* 5. Confirmation Modals */}
      {/* -------------------------------------------------------------------------- */}
      {/* Regenerate Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Regenerate Roadmap</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will allow you to reconfigure your target domain, level, and schedule. A new personalized roadmap will be generated.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRegenerateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setRoadmap(null);
                  setShowRegenerateModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors"
              >
                Proceed to Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Progress Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Reset All Progress</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to reset all topic progress and assessment scores back to 0%? The roadmap curriculum structure will be preserved.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleResetProgress}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                {actionLoading ? 'Resetting...' : 'Yes, Reset Progress'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
