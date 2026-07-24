import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Zap, Sparkles, CheckCircle2, RotateCw, Lightbulb, Play, Award, ThumbsUp, ThumbsDown } from 'lucide-react';

export const RapidPractice: React.FC = () => {
  const { userProfile, updateUserProfile, setActiveSession, setActiveTab } = useStore();

  const flashcards = [
    {
      id: 1,
      category: 'System Design',
      company: 'Google',
      question: 'How do you design a high-throughput sliding window rate limiter in Redis?',
      framework: 'STAR / Architecture',
      answer: 'Use a Redis Sorted Set (ZSET) with microsecond timestamps as scores. For each incoming request, execute ZREMRANGEBYSCORE to trim entries outside window, then ZCARD to check count.'
    },
    {
      id: 2,
      category: 'React & Web Performance',
      company: 'Meta',
      question: 'What causes Cumulative Layout Shift (CLS) in React apps, and how do you fix it?',
      framework: 'Performance Metrics',
      answer: 'CLS happens when DOM elements load without reserved dimensions. Fix by setting explicit width/height aspect-ratio on images, preloading custom web fonts, and reserving skeleton dimensions.'
    },
    {
      id: 3,
      category: 'Behavioral STAR',
      company: 'Amazon',
      question: 'Tell me about a time you had to make a high-stakes technical decision with incomplete data.',
      framework: 'Leadership Principle: Bias for Action',
      answer: 'Situation: API gateway peak load spike. Task: Prevent cascading service failure. Action: Deployed fallback circuit breaker with cached responses. Result: Maintained 99.9% uptime.'
    },
    {
      id: 4,
      category: 'Algorithms & DSA',
      company: 'Microsoft',
      question: 'How do you find the Lowest Common Ancestor (LCA) of two nodes in a Binary Tree in O(N) time?',
      framework: 'Recursive DFS',
      answer: 'Recursively traverse left and right subtrees. If current node equals P or Q, return current. If both subtrees return non-null, current node is the LCA.'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const card = flashcards[currentIndex];

  const handleNextCard = (gotItRight: boolean) => {
    setIsFlipped(false);
    if (gotItRight) {
      updateUserProfile({ xpPoints: userProfile.xpPoints + 15 });
    }
    setCompletedCount(c => c + 1);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Zap className="w-4 h-4 fill-amber-400 text-amber-500 animate-bounce" />
          <span>Rapid Flashcard Drills (+15 XP per card)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">2-Minute Interview Flashcards</h1>
        <p className="text-sm text-slate-400">
          Quickly test core concepts from FAANG interviews. Flip to reveal the STAR answer framework!
        </p>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
        <div>
          <span>CARD: </span>
          <strong className="text-violet-400">{currentIndex + 1} / {flashcards.length}</strong>
        </div>
        <div>
          <span>DRILLS COMPLETED: </span>
          <strong className="text-emerald-400">{completedCount}</strong>
        </div>
        <div>
          <span>TOTAL XP: </span>
          <strong className="text-amber-400">{userProfile.xpPoints} XP</strong>
        </div>
      </div>

      {/* 3D Flashcard Container */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="glass-panel p-8 rounded-3xl border-2 border-violet-500/40 cursor-pointer min-h-[320px] flex flex-col justify-between transition-all hover:border-violet-500 glow-box-violet relative overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-violet-500/20 text-violet-300 text-xs font-mono font-bold border border-violet-500/30">
              {card.company}
            </span>
            <span className="text-xs text-slate-400 font-mono">{card.category}</span>
          </div>

          <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
            <RotateCw className="w-3.5 h-3.5" /> Click card to {isFlipped ? 'hide' : 'reveal'} answer
          </span>
        </div>

        {/* Card Content */}
        <div className="my-6">
          {!isFlipped ? (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs font-mono font-bold text-amber-400 block">QUESTION PROMPT</span>
              <h2 className="text-2xl font-extrabold text-white leading-relaxed">
                "{card.question}"
              </h2>
              <p className="text-xs text-slate-400 italic">Thinking time... Click anywhere to flip card and verify your approach.</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                <Lightbulb className="w-4 h-4" />
                <span>MODEL ANSWER & STAR FRAMEWORK ({card.framework})</span>
              </div>
              <p className="text-base font-medium text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                {card.answer}
              </p>
            </div>
          )}
        </div>

        {/* Card Action */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs">
          <span className="text-slate-500">Framework: {card.framework}</span>

          {isFlipped && (
            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleNextCard(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                <span>Needs Review</span>
              </button>

              <button
                onClick={() => handleNextCard(true)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Got It Right (+15 XP)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
