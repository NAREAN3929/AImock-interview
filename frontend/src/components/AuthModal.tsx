import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { signupApi, verifyOtpApi, resendOtpApi, loginApi, forgotPasswordApi, resetPasswordApi, getOnboardingStatusApi } from '../services/api';
import { X, Sparkles, Lock, Mail, User, Clock, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    authView, 
    setAuthView,
    pendingEmailForOtp,
    setPendingEmailForOtp,
    resetTokenFromUrl,
    setIsAuthenticated,
    updateUserProfile,
    setOnboardingModalOpen
  } = useStore();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(300);

  // Automatically reset all input fields and alerts whenever the modal opens or view changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setEmail('');
      setUsername('');
      setPassword('');
      setFullName('');
      setOtpDigits(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isAuthModalOpen, authView]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setAuthView('reset');
      setAuthModalOpen(true);
    }
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (authView === 'otp' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authView, timerSeconds]);

  if (!isAuthModalOpen) return null;

  const handleCloseModal = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setFullName('');
    setOtpDigits(['', '', '', '', '', '']);
    setErrorMessage('');
    setSuccessMessage('');
    setAuthModalOpen(false);
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      const updated = [...otpDigits];
      pasted.forEach((ch, idx) => {
        if (idx < 6) updated[idx] = ch;
      });
      setOtpDigits(updated);
      return;
    }

    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const fullOtpCode = otpDigits.join('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await signupApi({ email, username, password, full_name: fullName });
      setPendingEmailForOtp(email);
      setTimerSeconds(300);
      setSuccessMessage(res.message || `6-digit OTP code sent to ${email} (valid for 5 mins).`);
      setAuthView('otp');
    } catch (err: any) {
      setErrorMessage(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const targetEmail = pendingEmailForOtp || email;
      await verifyOtpApi(targetEmail, fullOtpCode);
      setSuccessMessage('Email verified successfully! Please sign in with your credentials.');
      setTimeout(() => {
        setSuccessMessage('Account created & verified! Enter your password to log in.');
        setAuthView('login');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const targetEmail = pendingEmailForOtp || email;
      const res = await resendOtpApi(targetEmail);
      setTimerSeconds(300);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMessage(res.message || 'New 6-digit OTP code sent to your email.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Temporary Candidate Account Check (c1@gmail.com / 112233)
    if ((email === 'c1@gmail.com' || username === 'c1') && password === '112233') {
      setIsAuthenticated(true);
      updateUserProfile({ 
        email: 'c1@gmail.com', 
        username: 'c1', 
        fullName: 'Test Candidate',
        planTier: 'FREE STARTER',
        sessionsLeft: 10,
        monthlyQuota: 10
      });
      setSuccessMessage('Logged in successfully as Candidate!');
      getOnboardingStatusApi('c1@gmail.com').then((st) => {
        if (st && !st.onboarding_completed) {
          setOnboardingModalOpen(true);
        }
      });
      setTimeout(() => {
        handleCloseModal();
      }, 600);
      setLoading(false);
      return;
    }

    // Master Deployer credentials check (admin@aimock.in / Admin@1)
    if ((email === 'admin@aimock.in' || username === 'admin') && password === 'Admin@1') {
      setIsAuthenticated(true);
      updateUserProfile({ 
        email: 'admin@aimock.in', 
        username: 'admin', 
        fullName: 'Master System Deployer' 
      });
      setSuccessMessage('Master Admin Access Granted!');
      setTimeout(() => {
        handleCloseModal();
      }, 600);
      setLoading(false);
      return;
    }

    try {
      const res = await loginApi(email || username, password);
      const userEmail = email || 'candidate@interview.ai';
      setIsAuthenticated(true);
      updateUserProfile({ 
        email: userEmail, 
        username: res.username || username || 'candidate', 
        fullName: fullName || res.username || 'Candidate User' 
      });
      setSuccessMessage('Logged in successfully!');
      getOnboardingStatusApi(userEmail).then((st) => {
        if (st && !st.onboarding_completed) {
          setOnboardingModalOpen(true);
        }
      });
      setTimeout(() => {
        handleCloseModal();
      }, 600);
    } catch (err: any) {
      if (err.message?.includes('not verified')) {
        setPendingEmailForOtp(email);
        setTimerSeconds(300);
        setAuthView('otp');
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err.message || 'Incorrect credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await forgotPasswordApi(email);
      setSuccessMessage(res.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const params = new URLSearchParams(window.location.search);
      const token = resetTokenFromUrl || params.get('reset_token') || '';
      const res = await resetPasswordApi(token, newPassword);
      setSuccessMessage(res.message);
      setTimeout(() => setAuthView('login'), 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel p-6 sm:p-8 rounded-2xl border border-violet-500/30 shadow-2xl space-y-6 animate-fade-in glow-box-violet">
        
        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl glow-gradient mx-auto flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {authView === 'login' && 'Candidate Sign In'}
            {authView === 'signup' && 'Create Candidate Account'}
            {authView === 'otp' && 'Verify 6-Digit Email OTP'}
            {authView === 'forgot' && 'Reset Password'}
            {authView === 'reset' && 'Set New Password'}
          </h2>
          <p className="text-xs text-slate-400">
            {authView === 'login' && 'Sign in to access AI mock sessions & scorecards'}
            {authView === 'signup' && 'Enter your email to receive a 5-min OTP code'}
            {authView === 'otp' && `Enter 6-digit OTP code sent to ${pendingEmailForOtp || email}`}
            {authView === 'forgot' && 'Enter your registered email to receive a reset link'}
            {authView === 'reset' && 'Create your new password to restore account access'}
          </p>
        </div>

        {/* Alert Notifications */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. SIGNUP VIEW */}
        {authView === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl glow-gradient text-white font-bold shadow-lg shadow-violet-600/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send 5-Min OTP Code</span>}
            </button>
          </form>
        )}

        {/* 2. OTP VERIFICATION VIEW */}
        {authView === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 text-sm">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-3">
                <span>Enter 6-Digit Code</span>
                <span className="font-mono text-cyan-400 flex items-center gap-1 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-digit-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 text-center text-xl font-extrabold font-mono text-cyan-300 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 focus:outline-none transition-all shadow-inner"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || fullOtpCode.length < 6}
              className="w-full py-3 rounded-xl glow-gradient text-white font-bold shadow-lg shadow-violet-600/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify OTP & Activate Account</span>}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-xs text-violet-400 font-semibold hover:underline"
              >
                Didn't receive code? Resend 5-Min OTP
              </button>
            </div>
          </form>
        )}

        {/* 3. LOGIN VIEW */}
        {authView === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email or Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>Password</span>
                <button
                  type="button"
                  onClick={() => setAuthView('forgot')}
                  className="text-violet-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl glow-gradient text-white font-bold shadow-lg shadow-violet-600/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Platform</span>}
            </button>
          </form>
        )}

        {/* 4. FORGOT PASSWORD VIEW */}
        {authView === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl glow-gradient text-white font-bold shadow-lg shadow-violet-600/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Link to Email</span>}
            </button>

            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="flex items-center justify-center gap-1.5 w-full text-xs text-slate-400 hover:text-white pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </button>
          </form>
        )}

        {/* 5. RESET PASSWORD VIEW */}
        {authView === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl glow-gradient text-white font-bold shadow-lg shadow-violet-600/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Password & Log In</span>}
            </button>
          </form>
        )}

        {/* Toggle Login/Signup Footer */}
        <div className="text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          {authView === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setAuthView('signup')} className="text-violet-400 font-bold hover:underline">
                Sign Up
              </button>
            </>
          ) : authView === 'signup' ? (
            <>
              Already have an account?{' '}
              <button onClick={() => setAuthView('login')} className="text-violet-400 font-bold hover:underline">
                Log In
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
