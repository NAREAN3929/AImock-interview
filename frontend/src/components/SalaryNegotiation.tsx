import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  Award, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const SalaryNegotiation: React.FC = () => {
  const { userProfile } = useStore();

  const [initialOffer, setInitialOffer] = useState(130000);
  const [targetSalary, setTargetSalary] = useState(155000);
  const [candidateMessage, setCandidateMessage] = useState('');
  
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'hr',
      text: `Hi ${userProfile.fullName || 'Candidate'}, congratulations on passing the technical interview loops! We are excited to extend an initial offer of $${initialOffer.toLocaleString()} base salary + 10% annual bonus. Let us know your thoughts!`
    }
  ]);

  const [currentOfferVal, setCurrentOfferVal] = useState(initialOffer);

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateMessage.trim()) return;

    const userMsg = candidateMessage.trim();
    const updatedHistory = [...chatHistory, { sender: 'candidate', text: userMsg }];
    setCandidateMessage('');

    // Simulate AI HR Response based on negotiation strategy
    setTimeout(() => {
      const isPoliteAndDataBacked = userMsg.toLowerCase().includes('market') || 
                                    userMsg.toLowerCase().includes('experience') || 
                                    userMsg.toLowerCase().includes('value') ||
                                    userMsg.toLowerCase().includes('competing');
      
      let hrReply = "";
      let newSalary = currentOfferVal;

      if (isPoliteAndDataBacked) {
        newSalary = Math.min(targetSalary, currentOfferVal + 12000);
        hrReply = `Thank you for sharing your market benchmarks and technical value. I spoke with the hiring committee, and we can bump your base salary offer to $${newSalary.toLocaleString()} + an additional $10,000 signing bonus!`;
      } else {
        newSalary = Math.min(targetSalary, currentOfferVal + 5000);
        hrReply = `We appreciate your interest in higher compensation. While our budget is tight, we can adjust the base to $${newSalary.toLocaleString()}.`;
      }

      setCurrentOfferVal(newSalary);
      setChatHistory([...updatedHistory, { sender: 'hr', text: hrReply }]);
    }, 800);
  };

  const handleQuickScript = (script: string) => {
    setCandidateMessage(script);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>AI Salary & Offer Negotiation Simulator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Negotiate Higher Tech Compensation</h1>
        <p className="text-sm text-slate-400">
          Practice live offer counter-proposals against an AI HR Recruiter to unlock +$15k–$40k salary increases.
        </p>
      </div>

      {/* Calculator Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1 text-center">
          <span className="text-[11px] font-mono text-slate-400 block">INITIAL COMPANY OFFER</span>
          <span className="text-2xl font-black text-white font-mono">${initialOffer.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 space-y-1 text-center bg-emerald-500/5">
          <span className="text-[11px] font-mono text-emerald-400 block font-bold">NEGOTIATED CURRENT OFFER</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">${currentOfferVal.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-300 font-bold block">+${(currentOfferVal - initialOffer).toLocaleString()} Increase!</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1 text-center">
          <span className="text-[11px] font-mono text-slate-400 block font-bold">YOUR TARGET GOAL</span>
          <span className="text-2xl font-black text-violet-400 font-mono">${targetSalary.toLocaleString()}</span>
        </div>
      </div>

      {/* Simulator Chat Container */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">AI HR Recruiter Persona: Rachel Vance</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            OFFER EXTENDED
          </span>
        </div>

        {/* Message Log */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.sender === 'candidate' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                msg.sender === 'candidate' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-emerald-400'
              }`}>
                {msg.sender === 'candidate' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-lg ${
                msg.sender === 'candidate'
                  ? 'bg-violet-600 text-white font-medium'
                  : 'bg-slate-950 border border-slate-800 text-slate-200'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Recommended Counter-Offer Scripts */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block font-semibold">1-CLICK HIGH-IMPACT NEGOTIATION SCRIPTS:</span>
          <div className="flex flex-wrap gap-2">
            {[
              "Thank you! Based on my technical system design experience and market data for this senior level, I was hoping we could get closer to $155,000 base.",
              "I am extremely excited about joining! If we can bridge the gap to $150,000 base + signing bonus, I am ready to sign today.",
              "I have a competing offer at $150,000, but your team is my top choice. Can we match that base compensation?"
            ].map((script, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickScript(script)}
                className="text-[11px] text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition-colors text-left"
              >
                💡 Script #{i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendCounter} className="flex items-center gap-2">
          <input
            type="text"
            value={candidateMessage}
            onChange={(e) => setCandidateMessage(e.target.value)}
            placeholder="Type your counter-offer response to the HR recruiter..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <span>Send Counter</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
