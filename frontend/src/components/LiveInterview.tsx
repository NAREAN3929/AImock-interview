import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { InterviewerAvatar } from './InterviewerAvatar';
import { AudioVisualizer } from './AudioVisualizer';
import { CodeSandbox } from './CodeSandbox';
import { BodyLanguageDetector } from './BodyLanguageDetector';
import { evaluateAnswerApi } from '../services/api';
import { speakText, stopSpeaking, VoiceRecognizer } from '../services/speech';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Send, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Code2, 
  FileText, 
  ArrowRight, 
  Loader2,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  ShieldAlert,
  Minimize2,
  Maximize2
} from 'lucide-react';

export const LiveInterview: React.FC = () => {
  const { activeSession, setActiveSession, addEvaluation, evaluations, setActiveTab, addPastInterview } = useStore();

  if (!activeSession || !activeSession.questions || activeSession.questions.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel rounded-2xl text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Active Session Found</h2>
        <p className="text-sm text-slate-400">Please setup your interview parameters first.</p>
        <button
          onClick={() => setActiveTab('setup')}
          className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm"
        >
          Go to Interview Setup
        </button>
      </div>
    );
  }

  const currentQIndex = activeSession.currentQuestionIndex || 0;
  const currentQuestion = activeSession.questions[currentQIndex];

  const [responseMode, setResponseMode] = useState<'text' | 'code'>('text');
  const [userText, setUserText] = useState('');
  const [codeContent, setCodeContent] = useState(currentQuestion?.code_template || '');
  const [isRecording, setIsRecording] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<'idle' | 'speaking' | 'listening' | 'evaluating'>('idle');
  const [evaluating, setEvaluating] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync state with native browser ESC key or fullscreenchange event
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullscreen(isFS);
      if (isFS) {
        setShowHint(false); // Automatically hide AI hint guide during full screen mode
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setShowHint(false);
      }).catch(err => console.warn('Fullscreen request bypassed', err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => console.warn(err));
      }
    }
  };

  // Tab Switch Restriction Warning State
  const [tabSwitchWarning, setTabSwitchWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const recognizerRef = useRef<VoiceRecognizer | null>(null);

  // Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(c => c + 1);
        setTabSwitchWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Question Timer Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setQuestionTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQIndex]);

  // Read out question when current question changes
  useEffect(() => {
    if (currentQuestion) {
      setQuestionTimer(0);
      setShowHint(false);
      setAvatarStatus('speaking');
      speakText(currentQuestion.question_text, () => {
        setAvatarStatus('idle');
      });
    }
    return () => stopSpeaking();
  }, [currentQIndex]);

  // Voice Recognizer Setup
  useEffect(() => {
    const rec = new VoiceRecognizer(
      (transcriptText) => {
        setUserText(transcriptText);
      },
      (listening) => {
        setIsRecording(listening);
        setAvatarStatus(listening ? 'listening' : 'idle');
      },
      (errText) => {
        console.warn('Voice recognition error:', errText);
      }
    );
    recognizerRef.current = rec;

    return () => {
      rec.stop();
    };
  }, []);

  const toggleMic = async () => {
    if (!recognizerRef.current) return;
    if (isRecording) {
      recognizerRef.current.stop();
    } else {
      stopSpeaking();
      setUserText('');
      await recognizerRef.current.start();
    }
  };

  const handleSpeechQuestionAgain = () => {
    if (currentQuestion) {
      setAvatarStatus('speaking');
      speakText(currentQuestion.question_text, () => setAvatarStatus('idle'));
    }
  };

  const currentEval = evaluations[currentQuestion?.id];

  const handleSubmitAnswer = async () => {
    if (!userText && !codeContent) return;

    setEvaluating(true);
    setAvatarStatus('evaluating');
    if (isRecording && recognizerRef.current) {
      recognizerRef.current.stop();
    }

    try {
      const evalResult = await evaluateAnswerApi({
        interview_id: activeSession.id,
        question_id: currentQuestion.id,
        user_response: userText || "Submitted technical solution via code sandbox.",
        code_submission: responseMode === 'code' ? codeContent : undefined,
        audio_duration_sec: questionTimer
      });

      addEvaluation(currentQuestion.id, evalResult);
    } catch (err) {
      console.error('Answer evaluation failed', err);
    } finally {
      setEvaluating(false);
      setAvatarStatus('idle');
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < activeSession.questions.length - 1) {
      setActiveSession({
        ...activeSession,
        currentQuestionIndex: currentQIndex + 1
      });
      setUserText('');
      setShowHint(false);
    } else {
      // Exit fullscreen if active
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }

      const allScores = Object.values(evaluations).map(e => e.score);
      const overallAvg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 86;

      addPastInterview({
        id: activeSession.id,
        title: activeSession.title,
        role: activeSession.role,
        company: activeSession.company,
        difficulty: activeSession.difficulty,
        interview_type: activeSession.interviewType,
        overall_score: overallAvg,
        hiring_recommendation: overallAvg >= 85 ? 'Strong Hire' : 'Hire',
        status: 'completed',
        created_at: new Date().toISOString()
      });

      setActiveTab('report');
    }
  };

  const fillerCount = (userText.match(/\b(um|uh|like|basically|you know)\b/gi) || []).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Tab Switch Warning Banner */}
      {tabSwitchWarning && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>⚠️ WARNING: Tab switching is restricted during the practice test ({tabSwitchCount} violation recorded).</span>
          </div>
          <button
            onClick={() => setTabSwitchWarning(false)}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-500"
          >
            Acknowledge & Resume Test
          </button>
        </div>
      )}

      {/* Top HUD Session Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              QUESTION {currentQIndex + 1} OF {activeSession.questions.length}
            </span>
            <span className="text-xs font-semibold text-slate-400">• {activeSession.company} ({activeSession.role})</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">{activeSession.title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              isFullscreen
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>

          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>{showHint ? 'Hide Hint' : 'Get AI Hint'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{Math.floor(questionTimer / 60)}:{(questionTimer % 60).toString().padStart(2, '0')}</span>
          </div>

          <button
            onClick={() => {
              if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
              setActiveTab('report');
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white font-extrabold text-sm shadow-xl shadow-rose-600/40 border border-rose-400/50 hover:scale-105 transition-all cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" /> End Session & View Report
          </button>
        </div>
      </div>

      {/* AI Hint Drawer Overlay */}
      {showHint && !isFullscreen && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-medium space-y-1 animate-fade-in">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>Interviewer AI Hint Guide</span>
          </div>
          <p className="leading-relaxed">
            Hint: Break your response into the STAR format. State the core problem context, identify 2 technical constraints (e.g. latency/throughput), present your data-backed action, and conclude with measured metrics!
          </p>
        </div>
      )}

      {/* Main Grid: Interviewer Left vs Response Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Interviewer Avatar & Question prompt */}
        <div className="space-y-6 relative">
          <BodyLanguageDetector fillerWordCount={fillerCount} />
          <InterviewerAvatar 
            status={avatarStatus} 
            persona={activeSession.persona || 'strict'} 
          />

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">
                {currentQuestion?.category || 'Technical Prompt'}
              </span>
              <button
                onClick={handleSpeechQuestionAgain}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-400 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" /> Re-play Voice
              </button>
            </div>

            <p className="text-base font-semibold text-slate-100 leading-relaxed">
              "{currentQuestion?.question_text}"
            </p>

            {currentQuestion?.expected_keywords && !isFullscreen && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-500 block mb-1.5">KEY EXPECTED CONCEPTS</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentQuestion.expected_keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Candidate Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setResponseMode('text')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    responseMode === 'text'
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Voice / Text Answer</span>
                </button>

                <button
                  onClick={() => setResponseMode('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    responseMode === 'code'
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Monaco Code Sandbox</span>
                </button>
              </div>

              <AudioVisualizer isRecording={isRecording} />
            </div>

            {responseMode === 'text' ? (
              <div className="space-y-3">
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="Speak into your microphone or type your response here in detail using the STAR method (Situation, Task, Action, Result)..."
                  className="w-full h-48 p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-violet-500 focus:outline-none resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleMic}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        isRecording
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{isRecording ? 'Stop Recording' : 'Start Voice Input'}</span>
                    </button>

                    <span>Words: {userText.split(' ').filter(Boolean).length}</span>
                  </div>

                  {fillerCount > 0 && (
                    <span className="text-amber-400 font-bold">
                      ⚠️ {fillerCount} Filler word{fillerCount > 1 ? 's' : ''} detected
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <CodeSandbox
                initialCode={currentQuestion?.code_template || codeContent}
                onCodeChange={(c) => setCodeContent(c)}
              />
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                Click Submit to analyze technical depth & STAR structure via Gemini AI.
              </span>

              <button
                onClick={handleSubmitAnswer}
                disabled={evaluating || (!userText && !codeContent)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl glow-gradient text-white font-bold text-sm shadow-lg shadow-violet-600/30 hover:scale-105 transition-transform disabled:opacity-50"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating via Gemini...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit & Evaluate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {currentEval && (
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Gemini AI Evaluation Complete</span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-slate-400">Score:</span>
                  <span className="text-xl font-extrabold text-emerald-400">{currentEval.score}/100</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block">TECHNICAL ACCURACY</span>
                  <span className="text-sm font-bold text-violet-400 font-mono">{currentEval.technical_accuracy}%</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block">STAR STRUCTURE</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">{currentEval.star_method_score}%</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block">COMMUNICATION PACE</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{currentEval.wpm} WPM</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                  <span className="font-bold text-emerald-400 block mb-1">🌟 Where You Are Strong</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {currentEval.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <span className="font-bold text-amber-400 block mb-1">🎯 Where You Want to Improve</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {currentEval.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                  <Lightbulb className="w-4 h-4" />
                  <span>Pro Candidate Model Answer</span>
                </div>
                <p className="text-slate-300 italic leading-relaxed">{currentEval.model_answer}</p>
              </div>

              <div className="text-right pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 transition-all"
                >
                  <span>{currentQIndex < activeSession.questions.length - 1 ? 'Next Question' : 'Finish & View Scorecard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
