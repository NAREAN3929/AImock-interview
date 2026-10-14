import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { InterviewSetup } from './components/InterviewSetup';
import { LiveInterview } from './components/LiveInterview';
import { FinalReport } from './components/FinalReport';
import { ResumeAnalyzer } from './components/ResumeAnalyzer';
import { QuestionBank } from './components/QuestionBank';
import { CommunicationTrainer } from './components/CommunicationTrainer';
import { AptitudeTrainer } from './components/AptitudeTrainer';
import { HistoryAnalytics } from './components/HistoryAnalytics';
import { UserProfileView } from './components/UserProfile';
import { CompanyOASimulator } from './components/CompanyOASimulator';
import { PlacementTPODashboard } from './components/PlacementTPODashboard';
import { P2PMockRoom } from './components/P2PMockRoom';
import { AdminPanel } from './components/AdminPanel';
import { CareerRoadmapView } from './components/CareerRoadmapView';
import { AuthModal } from './components/AuthModal';
import { UpgradeModal } from './components/UpgradeModal';
import { OnboardingModal } from './components/OnboardingModal';
import { getUserStudyPlanApi } from './services/api';
import { NavTab } from './types';

const TAB_TO_HASH: Record<string, string> = {
  'dashboard': 'career-pulse',
  'setup': 'start-interview',
  'live-session': 'live-interview',
  'company-oa': 'company-oa',
  'question-bank': 'coding-bank',
  'aptitude': 'aptitude-trainer',
  'communication': 'communication-lab',
  'roadmap': 'career-roadmap',
  'resume-analyzer': 'resume-ai',
  'history': 'interview-history',
  'profile': 'profile-settings',
  'p2p-room': 'peer-mock'
};

const HASH_TO_TAB: Record<string, NavTab> = {
  'career-pulse': 'dashboard',
  'start-interview': 'setup',
  'live-interview': 'live-session',
  'company-oa': 'company-oa',
  'coding-bank': 'question-bank',
  'aptitude-trainer': 'aptitude',
  'communication-lab': 'communication',
  'career-roadmap': 'roadmap',
  'resume-ai': 'resume-analyzer',
  'interview-history': 'history',
  'profile-settings': 'profile',
  'peer-mock': 'p2p-room',
  'p2p-room': 'p2p-room'
};

export const App: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    isAuthenticated, 
    checkAndVerifySession, 
    isAptitudeTestActive, 
    theme, 
    setTheme,
    isOnboardingModalOpen,
    setOnboardingModalOpen,
    userProfile,
    studyPlan,
    setStudyPlan
  } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Synchronize hash routing bidirectionally
  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (hash && HASH_TO_TAB[hash]) {
        setActiveTab(HASH_TO_TAB[hash]);
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, [setActiveTab]);

  // Update hash and reset scroll position when activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    if (TAB_TO_HASH[activeTab]) {
      const targetHash = `#/${TAB_TO_HASH[activeTab]}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
    }
  }, [activeTab]);

  // Sync active study plan when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getUserStudyPlanApi(userProfile.email).then((plan) => {
        if (plan && plan.tasks) {
          setStudyPlan(plan);
        }
      });
    }
  }, [isAuthenticated, userProfile.email]);

  // Initialize theme on mount: check saved choice, otherwise default to dark theme
  useEffect(() => {
    const saved = localStorage.getItem('interviewai-theme') as 'light' | 'dark' | null;
    let initialTheme: 'light' | 'dark' = saved || 'dark';
    if (!saved && window.matchMedia) {
      initialTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', initialTheme);
    if (theme !== initialTheme) {
      setTheme(initialTheme);
    }
  }, []);

  // Check and verify 5-day session limit on mount
  useEffect(() => {
    checkAndVerifySession();
  }, []);

  // Hide sidebar during live test session and active aptitude test for 100% full-width test interface
  const isTestingMode = activeTab === 'live-session' || (activeTab === 'aptitude' && isAptitudeTestActive) || (activeTab === 'company-oa' && isAptitudeTestActive);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Bar */}
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen}
        isTestingMode={isTestingMode}
      />

      <div className="flex flex-1 relative">
        {/* Render Sidebar ONLY when Candidate is Logged In and NOT in Live Test Mode */}
        {isAuthenticated && !isTestingMode && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 pb-16 transition-all duration-300 ${
          isAuthenticated && !isTestingMode 
            ? (isSidebarOpen ? 'lg:ml-72 p-4 sm:p-6' : 'p-4 sm:p-6') 
            : 'p-0 sm:p-4'
        }`}>
          {!isAuthenticated ? (
            /* Visitor View: Always render Public Front Landing Page */
            <LandingPage />
          ) : (
            /* Logged-In Candidate View: Render selected feature */
            <>
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'roadmap' && <CareerRoadmapView onNavigateTab={(tab) => useStore.getState().setActiveTab(tab)} />}
              {activeTab === 'setup' && <InterviewSetup />}
              {activeTab === 'live-session' && <LiveInterview />}
              {activeTab === 'report' && <FinalReport />}
              {activeTab === 'resume-analyzer' && <ResumeAnalyzer />}
              {activeTab === 'question-bank' && <QuestionBank />}
              {activeTab === 'communication' && <CommunicationTrainer />}
              {activeTab === 'aptitude' && <AptitudeTrainer />}
              {activeTab === 'p2p-room' && <P2PMockRoom />}
              {activeTab === 'company-oa' && <CompanyOASimulator />}
              {activeTab === 'tpo-portal' && <PlacementTPODashboard />}
              {activeTab === 'company-cheatsheets' && <QuestionBank initialTab="company-prep" />}
              {activeTab === 'history' && <HistoryAnalytics />}
              {activeTab === 'profile' && <UserProfileView />}
              {activeTab === 'admin' && <AdminPanel />}
              {activeTab === 'landing' && <Dashboard />}
            </>
          )}
        </main>
      </div>

      <AuthModal />
      <UpgradeModal />
      <OnboardingModal 
        isOpen={isOnboardingModalOpen} 
        onClose={() => setOnboardingModalOpen(false)} 
      />
    </div>
  );
};

export default App;
