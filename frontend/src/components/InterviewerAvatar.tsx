import React from 'react';
import { BrainCircuit, Volume2, Mic, CheckCircle2, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { InterviewerPersona } from '../types';

interface AvatarProps {
  status: 'idle' | 'speaking' | 'listening' | 'evaluating';
  persona?: InterviewerPersona;
}

export const InterviewerAvatar: React.FC<AvatarProps> = ({
  status,
  persona = 'strict'
}) => {
  const personaDetails = {
    coach: {
      name: 'Sarah Vance',
      title: 'Encouraging Tech Coach',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
    },
    strict: {
      name: 'Dr. Marcus Thorne',
      title: 'Strict Principal Architect',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      icon: <BrainCircuit className="w-3.5 h-3.5 text-violet-400" />
    },
    bar_raiser: {
      name: 'Elena Rostova',
      title: 'FAANG Executive Bar Raiser',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />
    }
  };

  const currentPersona = personaDetails[persona] || personaDetails.strict;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/80 rounded-2xl border border-slate-800 relative overflow-hidden">
      {/* Persona Tag */}
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${currentPersona.badgeColor}`}>
        {currentPersona.icon}
        <span>{currentPersona.title}</span>
      </div>

      {/* Outer Pulse Rings based on state */}
      <div className={`relative w-28 h-28 rounded-full p-1 transition-all ${
        status === 'speaking' ? 'glow-gradient animate-pulse-ring' :
        status === 'listening' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 animate-pulse' :
        status === 'evaluating' ? 'bg-gradient-to-r from-amber-500 to-violet-500 animate-spin' :
        'bg-slate-800'
      }`}>
        <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center relative z-10">
          <BrainCircuit className={`w-12 h-12 transition-colors ${
            status === 'speaking' ? 'text-violet-400' :
            status === 'listening' ? 'text-emerald-400' :
            status === 'evaluating' ? 'text-amber-400' :
            'text-slate-500'
          }`} />
        </div>
      </div>

      <div className="mt-4 text-center">
        <h3 className="font-extrabold text-white text-base">{currentPersona.name}</h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">{currentPersona.title}</p>
      </div>

      {/* Live Status Badge */}
      <div className="mt-3">
        {status === 'speaking' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
            <Volume2 className="w-3.5 h-3.5 animate-bounce" />
            <span>Speaking Question...</span>
          </span>
        )}
        {status === 'listening' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Listening to Response</span>
          </span>
        )}
        {status === 'evaluating' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 animate-spin" />
            <span>Analyzing Technical Depth...</span>
          </span>
        )}
        {status === 'idle' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <span>Ready for Response</span>
          </span>
        )}
      </div>
    </div>
  );
};
