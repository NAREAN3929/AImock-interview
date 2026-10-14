import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { VoiceRecognizer } from '../services/speech';
import { AudioVisualizer } from './AudioVisualizer';
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  Sparkles, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  Clock,
  Zap,
  BarChart2
} from 'lucide-react';

export const CommunicationTrainer: React.FC = () => {
  const { recordPracticeActivity } = useStore();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognizerRef = useRef<VoiceRecognizer | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const rec = new VoiceRecognizer(
      (text) => setTranscript(text),
      (listening) => setIsRecording(listening),
      (err) => setErrorMsg(err)
    );
    recognizerRef.current = rec;
    return () => rec.stop();
  }, []);

  const toggleRecording = async () => {
    if (!recognizerRef.current) return;
    setErrorMsg(null);

    if (isRecording) {
      recognizerRef.current.stop();
      if (wordCount >= 5) {
        recordPracticeActivity();
      }
    } else {
      setTranscript('');
      setTimer(0);
      await recognizerRef.current.start();
    }
  };

  const wordCount = transcript.split(' ').filter(Boolean).length;
  const wpm = timer > 0 ? Math.round((wordCount / timer) * 60) : 0;
  const fillers = (transcript.match(/\b(um|uh|like|basically|you know|sort of)\b/gi) || []).length;
  const clarityScore = Math.max(50, 100 - (fillers * 5));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>AI Speech & Communication Lab</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Master Articulation, Pace & Confidence</h1>
        <p className="text-sm text-slate-400">
          Speak naturally into your microphone to get instant WPM pace tracking, filler word detection, and clarity scoring.
        </p>
      </div>

      {/* Main Communication Practice Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 text-xs font-medium">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-rose-200 block mb-0.5">Microphone & Speech Notice</span>
              <p>{errorMsg}</p>
            </div>
            <button 
              onClick={() => setErrorMsg(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-bold underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white">Live Voice Analysis Studio</h3>
            <p className="text-xs text-slate-400">Read a paragraph or answer a situational prompt out loud.</p>
          </div>

          <AudioVisualizer isRecording={isRecording} />
        </div>

        {/* Prompt Card */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-200 space-y-1">
          <span className="font-mono text-cyan-400 font-bold block">PRACTICE PROMPT:</span>
          <p className="italic text-slate-300">
            "Explain how you prioritize tasks when faced with competing deadlines and shifting business requirements."
          </p>
        </div>

        {/* Live Transcript Area */}
        <div className="relative">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Click 'Start Voice Practice' and speak out loud..."
            className="w-full h-40 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:border-cyan-500 focus:outline-none resize-none leading-relaxed"
          />

          <button
            onClick={toggleRecording}
            className={`absolute bottom-4 right-4 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'glow-gradient text-white hover:scale-105'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
            <span>{isRecording ? 'Stop Recording' : 'Start Voice Practice'}</span>
          </button>
        </div>

        {/* Live Speech Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-slate-400 block">SPEECH PACE</span>
            <span className="text-2xl font-black text-violet-400 font-mono mt-1 block">{wpm} WPM</span>
            <span className="text-[10px] text-slate-400 font-medium">Ideal: 130-150 WPM</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-slate-400 block">FILLER WORDS</span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">{fillers} Detected</span>
            <span className="text-[10px] text-slate-400 font-medium">Target: &lt; 2 words</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-slate-400 block">CLARITY SCORE</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">{clarityScore}%</span>
            <span className="text-[10px] text-emerald-400 font-medium">High Clarity</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-slate-400 block">DURATION</span>
            <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">{timer}s</span>
            <span className="text-[10px] text-slate-400 font-medium">Active Speech</span>
          </div>
        </div>

      </div>
    </div>
  );
};
