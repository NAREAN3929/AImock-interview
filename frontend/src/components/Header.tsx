import React from 'react';
import { useStore } from '../store/useStore';
import { 
  Sparkles, 
  Menu, 
  LogIn, 
  UserPlus, 
  User, 
  LogOut 
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isTestingMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isTestingMode }) => {
  const { 
    setActiveTab, 
    isAuthenticated, 
    setIsAuthenticated, 
    setAuthModalOpen, 
    setAuthView,
    userProfile 
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

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/80 h-16 flex items-center px-4 sm:px-6 justify-between">
      
      {/* Left: Hamburger Toggle Button & Logo */}
      <div className="flex items-center gap-4">
        {isAuthenticated && !isTestingMode && (
          <button
            onClick={onToggleSidebar}
            title="Toggle Navigation Menu"
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5 text-violet-400" />
          </button>
        )}

        <div 
          onClick={() => setActiveTab(isAuthenticated ? 'dashboard' : 'landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl glow-gradient flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-tight text-lg">InterviewAI</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                PRIME
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 -mt-1 hidden sm:block">SMART MOCK PLATFORM</p>
          </div>
        </div>
      </div>

      {/* Right: Auth Buttons */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold hover:border-violet-500/40"
            >
              <User className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">{userProfile.username || 'Candidate'}</span>
            </button>

            <button
              onClick={handleLogOut}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => { setAuthView('login'); setAuthModalOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-violet-400" />
              <span>Log In</span>
            </button>

            <button
              onClick={() => { setAuthView('signup'); setAuthModalOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl glow-gradient text-white text-xs font-bold shadow-lg shadow-violet-600/30 hover:scale-105 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
