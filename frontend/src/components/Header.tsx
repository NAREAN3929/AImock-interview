import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Sparkles, 
  Menu, 
  LogIn, 
  UserPlus, 
  User, 
  LogOut,
  ChevronDown,
  Shield,
  Activity,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  isTestingMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen, isTestingMode }) => {
  const { 
    setActiveTab, 
    isAuthenticated, 
    setIsAuthenticated, 
    setAuthModalOpen, 
    setAuthView,
    userProfile,
    theme,
    toggleTheme
  } = useStore();

  const handleLogOut = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('interviewai-prime-session');
    } catch (e) {
      console.warn('localStorage clear bypassed', e);
    }
    setActiveTab('landing');
  };

  const isPro = userProfile.planTier === 'PRO UNLIMITED';

  return (
    <header className="sticky top-0 z-50 bg-[var(--panel)]/95 backdrop-blur-xl border-b border-[var(--line)] h-16 flex items-center px-4 sm:px-6 justify-between transition-colors">
      
      {/* Left: Hamburger Toggle & Platform Branding */}
      <div className="flex items-center gap-3 sm:gap-4">
        {isAuthenticated && !isTestingMode && (
          <button
            onClick={onToggleSidebar}
            title={isSidebarOpen ? "Close Navigation Sidebar" : "Open Navigation Sidebar"}
            aria-label={isSidebarOpen ? "Close Navigation Sidebar" : "Open Navigation Sidebar"}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center justify-center"
          >
            <Menu className="w-5 h-5 text-violet-400" />
          </button>
        )}

        <div 
          onClick={() => setActiveTab(isAuthenticated ? 'dashboard' : 'landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl glow-gradient flex items-center justify-center shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-white tracking-tight text-base sm:text-lg">InterviewAI</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                PRIME
              </span>
            </div>
            <p className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase mt-1 hidden sm:block">
              CAREER ASSESSMENT
            </p>
          </div>
        </div>
      </div>


      {/* Right: Authenticated User Profile & Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* User Profile Pill */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-violet-500/40 transition-all text-left group"
              title="View Profile Settings"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-inner">
                {(userProfile.fullName || userProfile.username || 'U').charAt(0).toUpperCase()}
              </div>

              <div className="hidden sm:block leading-tight">
                <span className="text-xs font-bold text-white block group-hover:text-violet-300 transition-colors truncate max-w-[120px]">
                  {userProfile.fullName || userProfile.username || 'Candidate'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[120px]">
                  {userProfile.targetRole || 'Software Engineer'}
                </span>
              </div>
            </button>

            {/* Logout Action */}
            <button
              onClick={handleLogOut}
              title="Sign Out of Session"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-all active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAuthView('login'); setAuthModalOpen(true); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-violet-400" />
              <span>Log In</span>
            </button>

            <button
              onClick={() => { setAuthView('signup'); setAuthModalOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl glow-gradient text-white text-xs font-bold shadow-md shadow-violet-600/30 hover:scale-105 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        )}



        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--line)] bg-[var(--panel-elevated)] hover:bg-[var(--accent-light)] text-[var(--mute)] hover:text-[var(--accent)] transition-all focus-visible:outline-2 focus-visible:outline-[var(--accent)] active:scale-95"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-violet-700" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
