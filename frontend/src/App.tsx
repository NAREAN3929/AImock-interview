import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { InterviewSetup } from './components/InterviewSetup';
import { LiveInterview } from './components/LiveInterview';
import { RapidPractice } from './components/RapidPractice';
import { FinalReport } from './components/FinalReport';
import { ResumeAnalyzer } from './components/ResumeAnalyzer';
import { QuestionBank } from './components/QuestionBank';
import { CommunicationTrainer } from './components/CommunicationTrainer';
import { AptitudeTrainer } from './components/AptitudeTrainer';
import { SalaryNegotiation } from './components/SalaryNegotiation';
import { CompanyCheatSheets } from './components/CompanyCheatSheets';
import { HistoryAnalytics } from './components/HistoryAnalytics';
import { UserProfileView } from './components/UserProfile';
import { CompanyOASimulator } from './components/CompanyOASimulator';
import { SystemDesignCanvas } from './components/SystemDesignCanvas';
import { PlacementTPODashboard } from './components/PlacementTPODashboard';
import { P2PMockRoom } from './components/P2PMockRoom';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { UpgradeModal } from './components/UpgradeModal';

export const App: React.FC = () => {
  const { activeTab, isAuthenticated, checkAndVerifySession, isAptitudeTestActive } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Check and verify 5-day session limit on mount
  useEffect(() => {
    checkAndVerifySession();
  }, []);

  // Hide sidebar during live test session and active aptitude test for 100% full-width test interface
  const isTestingMode = activeTab === 'live-session' || (activeTab === 'aptitude' && isAptitudeTestActive) || (activeTab === 'company-oa' && isAptitudeTestActive);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
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
          isAuthenticated && !isTestingMode ? 'lg:ml-72 p-4 sm:p-6' : 'p-0 sm:p-4'
        }`}>
          {!isAuthenticated ? (
            /* Visitor View: Always render Public Front Landing Page */
            <LandingPage />
          ) : (
            /* Logged-In Candidate View: Render selected feature */
            <>
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'setup' && <InterviewSetup />}
              {activeTab === 'live-session' && <LiveInterview />}
              {activeTab === 'rapid-practice' && <RapidPractice />}
              {activeTab === 'report' && <FinalReport />}
              {activeTab === 'resume-analyzer' && <ResumeAnalyzer />}
              {activeTab === 'question-bank' && <QuestionBank />}
              {activeTab === 'communication' && <CommunicationTrainer />}
              {activeTab === 'aptitude' && <AptitudeTrainer />}
              {activeTab === 'p2p-room' && <P2PMockRoom />}
              {activeTab === 'company-oa' && <CompanyOASimulator />}
              {activeTab === 'system-canvas' && <SystemDesignCanvas />}
              {activeTab === 'tpo-portal' && <PlacementTPODashboard />}
              {activeTab === 'salary-negotiation' && <SalaryNegotiation />}
              {activeTab === 'company-cheatsheets' && <CompanyCheatSheets />}
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
    </div>
  );
};

export default App;
