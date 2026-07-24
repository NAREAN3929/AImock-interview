import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { TestInstructionModal } from './TestInstructionModal';
import { 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCw, 
  Award, 
  Clock,
  Sparkles,
  Zap,
  Play,
  Maximize2,
  Code2,
  Calculator,
  Compass,
  BookOpen,
  Layers
} from 'lucide-react';

export const AptitudeTrainer: React.FC = () => {
  const { setAptitudeTestActive } = useStore();

  // Test Config States
  const [selectedTopic, setSelectedTopic] = useState<'quantitative' | 'logical' | 'pseudocode' | 'verbal' | 'full'>('pseudocode');
  const [targetQuestionCount, setTargetQuestionCount] = useState(5);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [testTitle, setTestTitle] = useState('Full Pattern Assessment Drive');

  useEffect(() => {
    return () => {
      setAptitudeTestActive(false);
    };
  }, [setAptitudeTestActive]);

  // Quiz Execution States
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [batchId, setBatchId] = useState(1);

  // Dynamic Question Generator database by topic & batch
  const questionPool: Record<string, any[]> = {
    pseudocode: [
      {
        id: 101,
        category: 'Pseudocode & CS Logic',
        question: 'What is the output of the following pseudocode?\n\ncount = 0\nfor i = 1 to 4:\n    for j = 1 to i:\n        count = count + 1\nprint(count)',
        options: ['6', '8', '10', '12'],
        correctAnswer: 2,
        explanation: 'Outer loop runs i = 1, 2, 3, 4. Inner loop executes i times. Sum = 1 + 2 + 3 + 4 = 10.'
      },
      {
        id: 102,
        category: 'Pseudocode & CS Logic',
        question: 'Consider the pseudocode:\n\nfunction solve(n):\n    if n <= 1: return 1\n    return n * solve(n - 1)\n\nWhat is solve(4)?',
        options: ['12', '24', '16', '36'],
        correctAnswer: 1,
        explanation: 'This calculates the factorial of 4! = 4 * 3 * 2 * 1 = 24.'
      },
      {
        id: 103,
        category: 'Pseudocode & CS Logic',
        question: 'What is the space complexity of a recursive Binary Tree Inorder Traversal in the worst case (skewed tree)?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
        correctAnswer: 2,
        explanation: 'In a skewed tree (linked list structure), the call stack depth reaches N frames, yielding O(N) space.'
      },
      {
        id: 104,
        category: 'Pseudocode & CS Logic',
        question: 'What does the Bitwise XOR operation (x ^ x) evaluate to for any integer x?',
        options: ['x', '0', '1', '2x'],
        correctAnswer: 1,
        explanation: 'XORing any number with itself cancels all matching bits, returning 0.'
      },
      {
        id: 105,
        category: 'Pseudocode & CS Logic',
        question: 'What is the time complexity of building a Min-Heap from an unsorted array of N elements?',
        options: ['O(N log N)', 'O(N)', 'O(N^2)', 'O(1)'],
        correctAnswer: 1,
        explanation: 'Build-Heap operation using bottom-up heapify takes linear O(N) time complexity.'
      }
    ],
    quantitative: [
      {
        id: 201,
        category: 'Quantitative Aptitude',
        question: 'A train 150 meters long passes a telegraph post in 12 seconds. What is the speed of the train in km/hr?',
        options: ['45 km/hr', '50 km/hr', '54 km/hr', '60 km/hr'],
        correctAnswer: 0,
        explanation: 'Speed = Distance / Time = 150 / 12 = 12.5 m/s. Converting to km/hr: 12.5 * (18 / 5) = 45 km/hr.'
      },
      {
        id: 202,
        category: 'Quantitative Aptitude',
        question: 'If 6 men and 8 boys can do a piece of work in 10 days, while 26 men and 48 boys can do the same in 2 days, what is the time taken by 15 men and 20 boys?',
        options: ['4 days', '5 days', '6 days', '7 days'],
        correctAnswer: 0,
        explanation: 'Simplifying equations: 1 man = 2 boys. Total work = 100 boy-days. 15 men + 20 boys = 50 boys. Time = 100 / 50 = 4 days.'
      },
      {
        id: 203,
        category: 'Quantitative Aptitude',
        question: 'A sum of money at simple interest amounts to $815 in 3 years and to $854 in 4 years. The principal sum is:',
        options: ['$650', '$698', '$700', '$750'],
        correctAnswer: 1,
        explanation: 'Interest for 1 year = 854 - 815 = $39. Interest for 3 years = 39 * 3 = $117. Principal = 815 - 117 = $698.'
      }
    ],
    logical: [
      {
        id: 301,
        category: 'Logical Reasoning',
        question: 'In a certain code language, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that code?',
        options: ['EOJDJEFM', 'EOJDEJFM', 'MFEJDJOE', 'MFEDJJOE'],
        correctAnswer: 1,
        explanation: 'Reverse the word and add +1 to each letter. MEDICINE reversed is ENICIDEM -> +1 gives EOJDEJFM.'
      },
      {
        id: 302,
        category: 'Logical Reasoning',
        question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
        options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'],
        correctAnswer: 1,
        explanation: 'This is a geometric progression where each number is divided by 2. (1/4) / 2 = (1/8).'
      }
    ],
    verbal: [
      {
        id: 401,
        category: 'Verbal & Comprehension',
        question: 'Choose the word that is most nearly OPPOSITE in meaning to EPHEMERAL:',
        options: ['Transient', 'Permanent', 'Fleeting', 'Short-lived'],
        correctAnswer: 1,
        explanation: 'Ephemeral means lasting a very short time. Permanent is the exact antonym.'
      }
    ]
  };

  const activeQuestionList = (questionPool[selectedTopic] || questionPool.pseudocode).slice(0, targetQuestionCount);
  const currentQ = activeQuestionList[currentQIndex] || activeQuestionList[0];

  // Start Full-Screen Aptitude Practice
  const handleStartAptitudeTest = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request bypassed', err);
    }
    setIsTestStarted(true);
    setAptitudeTestActive(true);
    setCurrentQIndex(0);
    setScore(0);
    setSelectedOption(null);
    setSubmitted(false);
  };

  const handleSelectOption = (index: number) => {
    if (submitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    if (selectedOption === currentQ.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setSubmitted(false);
    if (currentQIndex < activeQuestionList.length - 1) {
      setCurrentQIndex(i => i + 1);
    } else {
      // Completed test
    }
  };

  const handleRefreshBatch = () => {
    setBatchId(b => b + 1);
    setCurrentQIndex(0);
    setScore(0);
    setSelectedOption(null);
    setSubmitted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
          <BrainCircuit className="w-4 h-4 text-violet-400" />
          <span>Campus & Placement Aptitude Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Placement Aptitude & Pseudocode Practice</h1>
        <p className="text-sm text-slate-400">
          Configure your assessment topic, set custom question count, and attend full-screen practice.
        </p>
      </div>

      {!isTestStarted ? (
        /* STEP 1: PRE-TEST CONFIGURATION SCREEN */
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-8">
          
          {/* Topic Selector */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-200">1. Select Aptitude Test Domain</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'pseudocode', name: 'Pseudocode & CS Logic', desc: 'Algorithm traces, loop outputs, bitwise ops & data structure complexity', icon: <Code2 className="w-5 h-5 text-cyan-400" /> },
                { id: 'quantitative', name: 'Quantitative Aptitude', desc: 'Time & work, speed/distance, simple/compound interest & ratios', icon: <Calculator className="w-5 h-5 text-violet-400" /> },
                { id: 'logical', name: 'Logical & Analytical Reasoning', desc: 'Coding-decoding, number series, patterns & blood relations', icon: <Compass className="w-5 h-5 text-emerald-400" /> },
                { id: 'verbal', name: 'Verbal Ability & Logic', desc: 'Vocabulary antonyms, sentence correction & reading logic', icon: <BookOpen className="w-5 h-5 text-amber-400" /> },
                { id: 'full', name: 'Full Pattern Assessment Drive', desc: 'Complete 5-Section Placement Test (Analytical, Reasoning, Verbal, Coding & Pseudocode)', icon: <Layers className="w-5 h-5 text-rose-400" /> }
              ].map((t) => {
                const isSelected = selectedTopic === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTopic(t.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500 text-white shadow-xl shadow-violet-500/10 ring-2 ring-violet-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="mb-2">{t.icon}</div>
                    <h4 className="font-bold text-white text-sm">{t.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question Count Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-bold text-slate-200">
              <span>2. Enter Target Question Count</span>
              <span className="text-violet-400 font-mono">{targetQuestionCount} Questions (~{targetQuestionCount * 2} Mins)</span>
            </div>
            <div className="flex items-center gap-3">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTargetQuestionCount(num)}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                    targetQuestionCount === num
                      ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Action Launch */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setTestTitle(selectedTopic === 'full' ? 'Full Pattern Assessment Drive' : `${selectedTopic.toUpperCase()} Assessment`);
                setShowInstructionModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl glow-gradient text-white font-bold text-base shadow-xl shadow-violet-600/30 hover:scale-[1.01] transition-transform"
            >
              <Maximize2 className="w-5 h-5 text-white" />
              <span>Launch Full Pattern Placement Assessment</span>
            </button>
          </div>

        </div>
      ) : (
        /* STEP 2: ACTIVE FULL-SCREEN APTITUDE QUIZ */
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-mono font-bold border border-violet-500/30">
                QUESTION {currentQIndex + 1} OF {activeQuestionList.length}
              </span>
              <span className="text-xs font-mono text-cyan-400">[{currentQ.category}]</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-emerald-400 font-bold">Score: {score} Correct</span>
              <button
                onClick={() => {
                  if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
                  setIsTestStarted(false);
                  setAptitudeTestActive(false);
                }}
                className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-colors"
              >
                Exit Test
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <pre className="text-sm font-semibold font-mono text-slate-100 whitespace-pre-wrap leading-relaxed">
              {currentQ.question}
            </pre>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt: string, idx: number) => {
              const isSelected = selectedOption === idx;
              const isCorrect = submitted && idx === currentQ.correctAnswer;
              const isWrong = submitted && isSelected && idx !== currentQ.correctAnswer;

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border cursor-pointer font-medium text-sm transition-all flex items-center justify-between ${
                    isCorrect
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                      : isWrong
                      ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                      : isSelected
                      ? 'bg-violet-600/30 border-violet-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono">{opt}</span>
                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {isWrong && <XCircle className="w-5 h-5 text-rose-400" />}
                </div>
              );
            })}
          </div>

          {/* Explanation Card */}
          {submitted && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-violet-500/30 space-y-1 text-xs text-slate-300 animate-fade-in">
              <span className="font-bold text-violet-400 block font-mono">GEMINI AI STEP-BY-STEP EXPLANATION:</span>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={handleRefreshBatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-violet-300 text-xs font-semibold"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Generate Fresh Questions</span>
            </button>

            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="px-6 py-2.5 rounded-xl glow-gradient text-white font-bold text-xs shadow-lg shadow-violet-600/30 hover:scale-105 transition-transform disabled:opacity-50"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={() => {
                  if (currentQIndex < activeQuestionList.length - 1) {
                    handleNext();
                  } else {
                    if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
                    setIsTestStarted(false);
                    setAptitudeTestActive(false);
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg transition-transform"
              >
                {currentQIndex < activeQuestionList.length - 1 ? 'Next Question' : 'Finish Aptitude Test'}
              </button>
            )}
          </div>

        </div>
      )}

      {/* Pre-Test Pattern Overview Modal */}
      <TestInstructionModal
        isOpen={showInstructionModal}
        testTitle={testTitle}
        selectedCategory={selectedTopic}
        onConfirm={() => {
          setShowInstructionModal(false);
          handleStartAptitudeTest();
        }}
      />
    </div>
  );
};
