import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NavTab, UserProfile, InterviewSession, EvaluationResult, PastInterviewItem, StudyPlan, StudyPlanTask } from '../types';

interface AppState {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isAptitudeTestActive: boolean;
  setAptitudeTestActive: (active: boolean) => void;
  
  // Auth state with persistent 5-day expiration
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  lastLoginTimestamp: number | null;
  checkAndVerifySession: () => boolean;

  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  decrementSessionQuota: () => void;
  resetPlanToFreeStarter: () => void;
  
  // Active Interview Session
  activeSession: InterviewSession | null;
  setActiveSession: (session: InterviewSession | null) => void;
  
  // Interview Evaluations
  evaluations: Record<number, EvaluationResult>;
  addEvaluation: (questionId: number, evalResult: EvaluationResult) => void;

  // Past History
  pastInterviews: PastInterviewItem[];
  setPastInterviews: (interviews: PastInterviewItem[]) => void;
  addPastInterview: (item: PastInterviewItem) => void;

  // Study Plan State
  studyPlan: StudyPlan | null;
  setStudyPlan: (plan: StudyPlan | null) => void;
  updateStudyPlanTaskStatus: (taskId: number, status: 'pending' | 'done') => void;

  // Onboarding Modal State
  isOnboardingModalOpen: boolean;
  setOnboardingModalOpen: (open: boolean) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;

  // Modals & Auth Views
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  authView: 'login' | 'signup' | 'otp' | 'forgot' | 'reset';
  setAuthView: (view: 'login' | 'signup' | 'otp' | 'forgot' | 'reset') => void;
  pendingEmailForOtp: string;
  setPendingEmailForOtp: (email: string) => void;
  resetTokenFromUrl: string;
  setResetTokenFromUrl: (token: string) => void;

  // Multi-Theme System
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000; // 432,000,000 ms

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme default: dark theme as default, persisted
      theme: 'dark',
      setTheme: (newTheme) => {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('interviewai-theme', newTheme);
        set({ theme: newTheme });
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('interviewai-theme', next);
        set({ theme: next });
      },

      activeTab: 'landing',
      setActiveTab: (tab) => set({ activeTab: tab, isAptitudeTestActive: tab === 'aptitude' ? get().isAptitudeTestActive : false }),

      isAptitudeTestActive: false,
      setAptitudeTestActive: (active) => set({ isAptitudeTestActive: active }),

      isAuthenticated: false,
      lastLoginTimestamp: null,
      
      setIsAuthenticated: (auth) => set({ 
        isAuthenticated: auth,
        lastLoginTimestamp: auth ? Date.now() : null,
        activeTab: auth ? 'dashboard' : 'landing'
      }),

      // Verify if 5-day session limit has expired
      checkAndVerifySession: () => {
        const state = get();

        // Enforce default FREE STARTER for test candidate c1 if stored as PRO from prior session
        if (state.userProfile?.email === 'c1@gmail.com' || state.userProfile?.username === 'c1') {
          if (state.userProfile.planTier === 'PRO UNLIMITED') {
            set((prev) => ({
              userProfile: {
                ...prev.userProfile,
                planTier: 'FREE STARTER',
                sessionsLeft: prev.userProfile.sessionsLeft && prev.userProfile.sessionsLeft < 10 ? prev.userProfile.sessionsLeft : 10,
                monthlyQuota: 10
              }
            }));
          }
        }

        if (!state.isAuthenticated || !state.lastLoginTimestamp) {
          return false;
        }
        const now = Date.now();
        const diff = now - state.lastLoginTimestamp;
        if (diff > FIVE_DAYS_MS) {
          // Session expired after 5 days of inactivity
          set({ isAuthenticated: false, lastLoginTimestamp: null, activeTab: 'landing' });
          return false;
        }
        // Update timestamp to extend session for active candidate
        set({ lastLoginTimestamp: now });
        return true;
      },

      userProfile: {
        id: 1,
        email: 'c1@gmail.com',
        username: 'c1',
        fullName: 'Test Candidate',
        targetRole: 'Software Engineer',
        experienceLevel: 'Mid-Level',
        readinessScore: 84.5,
        totalInterviews: 6,
        streakDays: 4,
        xpPoints: 480,
        planTier: 'FREE STARTER',
        sessionsLeft: 10,
        monthlyQuota: 10
      },
      updateUserProfile: (updates) =>
        set((state) => ({ userProfile: { ...state.userProfile, ...updates } })),

      decrementSessionQuota: () =>
        set((state) => {
          const currentLeft = state.userProfile.sessionsLeft !== undefined ? state.userProfile.sessionsLeft : 10;
          return {
            userProfile: {
              ...state.userProfile,
              sessionsLeft: Math.max(0, currentLeft - 1)
            }
          };
        }),

      resetPlanToFreeStarter: () =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            planTier: 'FREE STARTER',
            sessionsLeft: 10,
            monthlyQuota: 10
          }
        })),

      activeSession: null,
      setActiveSession: (session) => set({ activeSession: session }),

      evaluations: {},
      addEvaluation: (qId, evalResult) =>
        set((state) => ({ evaluations: { ...state.evaluations, [qId]: evalResult } })),

      pastInterviews: [
        {
          id: 901,
          title: 'Staff Full-Stack & Distributed Systems Mock',
          role: 'Full-Stack Engineer',
          company: 'Google',
          difficulty: 'Senior',
          interview_type: 'Technical & System Design',
          overall_score: 92.5,
          technical_score: 95.0,
          communication_score: 90.0,
          behavioral_score: 88.0,
          confidence_score: 92.0,
          hiring_recommendation: 'Strong Hire',
          status: 'completed',
          duration_minutes: 24,
          question_count: 4,
          average_wpm: 142,
          total_fillers: 2,
          strengths: [
            'Exceptional cache invalidation & horizontal scaling architecture',
            'Flawless Big-O complexity explanation and time bounds',
            'Crisp, executive-level communication pace'
          ],
          improvements: [
            'Explore data partitioning trade-offs before locking in sharding key'
          ],
          created_at: new Date(Date.now() - 86400000 * 1).toISOString()
        },
        {
          id: 902,
          title: 'SDE-2 Distributed Cloud & LP Leadership Round',
          role: 'Software Development Engineer II',
          company: 'Amazon',
          difficulty: 'Medium',
          interview_type: 'Technical & STAR Behavioral',
          overall_score: 86.0,
          technical_score: 88.0,
          communication_score: 84.0,
          behavioral_score: 89.0,
          confidence_score: 85.0,
          hiring_recommendation: 'Hire',
          status: 'completed',
          duration_minutes: 18,
          question_count: 3,
          average_wpm: 136,
          total_fillers: 5,
          strengths: [
            'Deep adherence to Amazon Leadership Principles (Customer Obsession, Ownership)',
            'Strong asynchronous event pipeline structure'
          ],
          improvements: [
            'Articulate measurable business impact metrics earlier in the STAR action'
          ],
          created_at: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          id: 903,
          title: 'Frontend Architecture & React Performance Lab',
          role: 'Frontend Engineer',
          company: 'Meta',
          difficulty: 'Hard',
          interview_type: 'Technical & Live Coding',
          overall_score: 89.5,
          technical_score: 93.0,
          communication_score: 87.0,
          behavioral_score: 85.0,
          confidence_score: 90.0,
          hiring_recommendation: 'Strong Hire',
          status: 'completed',
          duration_minutes: 22,
          question_count: 4,
          average_wpm: 139,
          total_fillers: 3,
          strengths: [
            'Rapid identification of React render lifecycles & DOM reconciliation',
            'Strong accessibility (WCAG AA) & responsive design intuition'
          ],
          improvements: [
            'Discuss web vitals (INP/LCP) impact on heavy re-render cycles'
          ],
          created_at: new Date(Date.now() - 86400000 * 6).toISOString()
        },
        {
          id: 904,
          title: 'Microservices Resiliency & Fault Tolerance Deep-Dive',
          role: 'Backend Platform Engineer',
          company: 'Netflix',
          difficulty: 'Senior',
          interview_type: 'System Design & High Concurrency',
          overall_score: 79.0,
          technical_score: 82.0,
          communication_score: 76.0,
          behavioral_score: 80.0,
          confidence_score: 78.0,
          hiring_recommendation: 'Lean Hire',
          status: 'completed',
          duration_minutes: 20,
          question_count: 3,
          average_wpm: 128,
          total_fillers: 8,
          strengths: [
            'Solid comprehension of circuit breakers and retry storm mitigation'
          ],
          improvements: [
            'Maintain steadier speaking pace during complex algorithmic explanations',
            'Reduce conversational pause fillers when formulating thoughts'
          ],
          created_at: new Date(Date.now() - 86400000 * 10).toISOString()
        }
      ],
      setPastInterviews: (interviews) => set({ pastInterviews: interviews }),
      addPastInterview: (item) =>
        set((state) => ({ pastInterviews: [item, ...state.pastInterviews] })),

      // Study Plan state
      studyPlan: null,
      setStudyPlan: (plan) => set({ studyPlan: plan }),
      updateStudyPlanTaskStatus: (taskId, status) =>
        set((state) => {
          if (!state.studyPlan) return state;
          const updatedTasks = state.studyPlan.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status, completed_at: status === 'done' ? new Date().toISOString() : undefined }
              : t
          );
          return {
            studyPlan: {
              ...state.studyPlan,
              tasks: updatedTasks
            }
          };
        }),

      // Onboarding Modal state
      isOnboardingModalOpen: false,
      setOnboardingModalOpen: (open) => set({ isOnboardingModalOpen: open }),
      onboardingStep: 1,
      setOnboardingStep: (step) => set({ onboardingStep: step }),

      isAuthModalOpen: false,
      setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
      isUpgradeModalOpen: false,
      setUpgradeModalOpen: (open) => set({ isUpgradeModalOpen: open }),
      authView: 'login',
      setAuthView: (view) => set({ authView: view }),
      pendingEmailForOtp: '',
      setPendingEmailForOtp: (email) => set({ pendingEmailForOtp: email }),
      resetTokenFromUrl: '',
      setResetTokenFromUrl: (token) => set({ resetTokenFromUrl: token })
    }),
    {
      name: 'interviewai-prime-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        lastLoginTimestamp: state.lastLoginTimestamp,
        userProfile: state.userProfile,
        pastInterviews: state.pastInterviews
      })
    }
  )
);
