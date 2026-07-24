import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NavTab, UserProfile, InterviewSession, EvaluationResult, PastInterviewItem } from '../types';

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
}

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000; // 432,000,000 ms

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
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
          title: 'Senior Software Engineer Mock (Google)',
          role: 'Software Engineer',
          company: 'Google',
          difficulty: 'Senior',
          interview_type: 'Technical & System Design',
          overall_score: 88.5,
          hiring_recommendation: 'Strong Hire',
          status: 'completed',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ],
      setPastInterviews: (interviews) => set({ pastInterviews: interviews }),
      addPastInterview: (item) =>
        set((state) => ({ pastInterviews: [item, ...state.pastInterviews] })),

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
