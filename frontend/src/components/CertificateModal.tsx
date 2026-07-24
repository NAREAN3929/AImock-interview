import React from 'react';
import { Award, CheckCircle2, ShieldCheck, Share2, Download, X, Sparkles } from 'lucide-react';

interface CertificateProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  score: number;
  role: string;
}

export const CertificateModal: React.FC<CertificateProps> = ({
  isOpen,
  onClose,
  candidateName,
  score,
  role
}) => {
  if (!isOpen) return null;

  const certId = `CERT-AIMOCK-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel p-8 sm:p-10 rounded-3xl border-2 border-amber-500/40 shadow-2xl space-y-6 text-center glow-box-violet">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Border Frame */}
        <div className="border-4 border-double border-amber-500/40 p-6 rounded-2xl bg-slate-950/90 space-y-4 relative">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">INTERVIEWAI PRIME OFFICIAL CERTIFICATE</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">ID: {certId}</span>
          </div>

          <div className="space-y-2 py-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">CERTIFICATE OF TECHNICAL READINESS</span>
            <h2 className="text-3xl font-black text-white">{candidateName}</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Has successfully passed the Technical Evaluation for <strong className="text-white">{role}</strong> with an overall score of <strong className="text-emerald-400 font-mono">{score}% (Strong Hire)</strong>.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
            <div className="text-left font-mono">
              <span className="text-[10px] block">ISSUING AUTHORITY</span>
              <span className="text-white font-bold">InterviewAI Assessment Board</span>
            </div>

            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] block">VALIDATION STATUS</span>
              <span className="text-emerald-400 font-bold">VERIFIED 100%</span>
            </div>
          </div>
        </div>

        {/* Certificate Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => alert(`Certificate ${certId} copied to clipboard!`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl glow-gradient text-white font-bold text-xs shadow-lg shadow-violet-600/30 hover:scale-105 transition-transform"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Verified Certificate on LinkedIn</span>
          </button>

          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Certificate</span>
          </button>
        </div>

      </div>
    </div>
  );
};
