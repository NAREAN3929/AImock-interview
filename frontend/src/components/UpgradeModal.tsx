import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Crown, CheckCircle2, Zap, ShieldCheck, X, Sparkles, CreditCard, Lock, Loader2, ArrowRight } from 'lucide-react';

export const UpgradeModal: React.FC = () => {
  const { isUpgradeModalOpen, setUpgradeModalOpen, userProfile, updateUserProfile } = useStore();
  
  const [checkoutStep, setCheckoutStep] = useState<'plans' | 'payment'>('plans');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState(userProfile.fullName || 'Test Candidate');

  const [processing, setProcessing] = useState(false);
  const [upgradedSuccess, setUpgradedSuccess] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const isPro = userProfile.planTier === 'PRO UNLIMITED' || userProfile.email === 'admin@aimock.in';

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      updateUserProfile({
        planTier: 'PRO UNLIMITED',
        sessionsLeft: 999,
        monthlyQuota: 999
      });

      setUpgradedSuccess(true);

      setTimeout(() => {
        setUpgradedSuccess(false);
        setCheckoutStep('plans');
        setUpgradeModalOpen(false);
      }, 2000);
    }, 1500);
  };

  const handleClose = () => {
    setCheckoutStep('plans');
    setUpgradedSuccess(false);
    setUpgradeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-violet-500/50 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-in glow-box-violet">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
        >
          <X className="w-5 h-5 text-rose-500" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-violet-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-lg">
            <Crown className="w-7 h-7 animate-bounce text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-white">
                {checkoutStep === 'plans' ? 'Upgrade Subscription Plan' : 'Secured Checkout Gateway'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO UNLIMITED ($19/MO)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {checkoutStep === 'plans' 
                ? 'Unlock 24/7 unlimited AI practice interviews, company OA cheatsheets, and verified candidate scorecards.'
                : 'Enter your payment details to complete subscription order.'
              }
            </p>
          </div>
        </div>

        {upgradedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>🎉 Payment Verified! Subscription Upgraded to Pro Unlimited!</span>
          </div>
        )}

        {/* STEP 1: PLAN COMPARISON */}
        {checkoutStep === 'plans' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Free Plan Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Current Tier</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">$0 / Free</span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white">Free Starter Plan</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">10 AI sessions / month limit</p>
                </div>

                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>10 AI Practice Sessions / Month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Standard Practice Sandboxes</span>
                  </li>
                  <li className="flex items-center gap-2 text-rose-400">
                    <X className="w-3.5 h-3.5 shrink-0" />
                    <span>Monthly Quota Lock when 0 Left</span>
                  </li>
                </ul>
              </div>

              {/* Pro Plan Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-violet-900/40 to-slate-950 border-2 border-violet-500/60 space-y-4 relative glow-box-violet">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> RECOMMENDED
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold">$19 / Month</span>
                </div>

                <div>
                  <h4 className="text-lg font-extrabold text-white">Pro Unlimited</h4>
                  <p className="text-[11px] text-violet-300 mt-0.5">24/7 Unlimited AI Practice</p>
                </div>

                <ul className="space-y-2 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <strong className="text-white">Unlimited 24/7 AI Sessions</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Priority Ultra-Fast AI Processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Full Technical & Behavioral AI Feedback</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Download Verified Scorecard Certificate</span>
                  </li>
                </ul>
              </div>

            </div>

            <div className="pt-2">
              {isPro ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center text-amber-300 text-xs font-bold font-mono">
                  👑 You are currently active on the PRO UNLIMITED Plan!
                </div>
              ) : (
                <button
                  onClick={() => setCheckoutStep('payment')}
                  className="w-full py-4 rounded-2xl glow-gradient text-white font-extrabold text-sm shadow-xl shadow-violet-600/30 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Payment Checkout ($19/mo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}

        {/* STEP 2: SECURED PAYMENT GATEWAY CHECKOUT */}
        {checkoutStep === 'payment' && (
          <form onSubmit={handleProcessPayment} className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Order Summary: <strong className="text-white">Pro Accelerator Plan</strong></span>
              <span className="text-emerald-400 font-extrabold text-sm">$19.00 / month</span>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                💳 Credit / Debit Card
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                📱 UPI / Netbanking
              </button>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Card Number</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Expires (MM/YY)</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-xs font-mono focus:border-violet-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">CVC Code</label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="888"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-xs font-mono focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                <label className="block text-[11px] font-semibold text-slate-400">Virtual Payment Address (VPA / UPI ID)</label>
                <input
                  type="text"
                  required
                  placeholder="candidate@upi"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs font-mono focus:border-violet-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 block">Accepts Google Pay, PhonePe, Paytm, BHIM & Netbanking</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCheckoutStep('plans')}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-bold border border-slate-800 transition-colors"
              >
                Back to Plan Details
              </button>

              <button
                type="submit"
                disabled={processing}
                className="px-6 py-3 rounded-2xl glow-gradient text-white font-extrabold text-xs shadow-lg shadow-violet-600/30 hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Payment ($19.00)...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Pay $19.00 & Complete Upgrade</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
