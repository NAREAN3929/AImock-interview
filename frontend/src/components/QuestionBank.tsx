import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { TestInstructionModal } from './TestInstructionModal';
import { CodeSandbox } from './CodeSandbox';
import { 
  BookOpen, 
  Search, 
  Code2, 
  Play, 
  RotateCw, 
  Calendar,
  Layers,
  Terminal
} from 'lucide-react';

export const QuestionBank: React.FC = () => {
  const { setActiveSession, setActiveTab } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSandboxId, setActiveSandboxId] = useState<number | null>(null);
  
  // 10-Day Question Rotation Timer
  const [daysRemaining] = useState(9);
  const [hoursRemaining] = useState(23);
  const [batchCount, setBatchCount] = useState(1);

  // Modal State
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [targetQuestionForTest, setTargetQuestionForTest] = useState<any>(null);

  const codingQuestionsList = [
    {
      id: 201 + (batchCount * 10),
      title: 'Two Sum & Target Index Pairs',
      platform: 'LeetCode #1',
      company: 'Google / LeetCode',
      category: 'Algorithms',
      difficulty: 'Easy',
      type: 'code',
      question_text: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Must achieve O(N) time complexity.',
      testCases: [
        { id: 1, input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]' },
        { id: 2, input: 'nums = [3,2,4], target = 6', expected: '[1,2]' },
        { id: 3, input: 'nums = [3,3], target = 6', expected: '[0,1]' }
      ],
      code_template: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      expected_keywords: ['Hash Map', 'O(N) Time', 'Array Indexing']
    },
    {
      id: 202 + (batchCount * 10),
      title: 'Valid Parentheses Matching',
      platform: 'LeetCode #20',
      company: 'Zoho / CodeChef',
      category: 'Algorithms',
      difficulty: 'Easy',
      type: 'code',
      question_text: 'Given a string `s` containing `(`, `)`, `{`, `}`, `[` and `]`, determine if the string is valid using a Stack data structure.',
      testCases: [
        { id: 1, input: '"()[]{}"', expected: 'true' },
        { id: 2, input: '"(]"', expected: 'false' },
        { id: 3, input: '"{[]}"', expected: 'true' }
      ],
      code_template: `function isValid(s) {\n  const stack = [];\n  const pairs = { ')': '(', '}': '{', ']': '[' };\n  for (let char of s) {\n    if (pairs[char]) {\n      if (stack.pop() !== pairs[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}`,
      expected_keywords: ['Stack', 'Matching Pairs', 'LIFO']
    },
    {
      id: 203 + (batchCount * 10),
      title: 'Longest Substring Without Repeating Characters',
      platform: 'LeetCode #3',
      company: 'Amazon / GitHub',
      category: 'Algorithms',
      difficulty: 'Medium',
      type: 'code',
      question_text: 'Given a string `s`, find the length of the longest substring without repeating characters using the Sliding Window technique.',
      testCases: [
        { id: 1, input: '"abcabcbb"', expected: '3' },
        { id: 2, input: '"bbbbb"', expected: '1' },
        { id: 3, input: '"pwwkew"', expected: '3' }
      ],
      code_template: `function lengthOfLongestSubstring(s) {\n  let set = new Set();\n  let left = 0, maxLen = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) {\n      set.delete(s[left]);\n      left++;\n    }\n    set.add(s[right]);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}`,
      expected_keywords: ['Sliding Window', 'Set', 'O(N) Time']
    },
    {
      id: 204 + (batchCount * 10),
      title: 'High Availability Distributed Rate Limiter',
      platform: 'System Design',
      company: 'Meta / Netflix',
      category: 'System',
      difficulty: 'Hard',
      type: 'text',
      question_text: 'How would you design a distributed sliding-window rate limiter in Redis to handle 500k requests per second across global data centers?',
      expected_keywords: ['Redis Sorted Sets', 'Sliding Window', 'Atomic Scripts', 'Rate Limiting']
    }
  ];

  const filteredQuestions = codingQuestionsList.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.platform.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || q.category.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleOpenTestModal = (q: any) => {
    setTargetQuestionForTest(q);
    setShowInstructionModal(true);
  };

  const handleConfirmAndLaunchTest = async () => {
    setShowInstructionModal(false);

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request bypassed', err);
    }

    if (!targetQuestionForTest) return;

    setActiveSession({
      id: Date.now(),
      title: `${targetQuestionForTest.company} Test: ${targetQuestionForTest.title}`,
      role: 'Software Engineer',
      company: targetQuestionForTest.company,
      difficulty: targetQuestionForTest.difficulty,
      interviewType: targetQuestionForTest.type === 'code' ? 'Technical Coding Sandbox' : 'System Design',
      currentQuestionIndex: 0,
      questions: [
        {
          id: targetQuestionForTest.id,
          question_order: 1,
          category: targetQuestionForTest.category,
          question_text: targetQuestionForTest.question_text,
          code_template: targetQuestionForTest.code_template,
          expected_keywords: targetQuestionForTest.expected_keywords
        }
      ]
    });

    setActiveTab('live-session');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Header with 10-Day Question Refresh Schedule */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-violet-500/30">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>LeetCode, CodeChef & GitHub Question Bank</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Practice Real Coding & Architecture Problems</h1>
          <p className="text-xs text-slate-400">
            Every question features live compiler execution, automated test cases, and line error detection.
          </p>
        </div>

        {/* 10-Day Auto Refresh Schedule Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-mono text-cyan-400 shadow-inner">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Rotates Every 10 Days (Next: {daysRemaining}d {hoursRemaining}h)</span>
          </div>

          <button
            onClick={() => setBatchCount(b => b + 1)}
            className="p-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RotateCw className="w-4 h-4" />
            <span>Batch #{batchCount + 1}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search LeetCode, CodeChef, Google..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'Algorithms', 'System'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Question Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuestions.map((q) => {
          const isSandboxOpen = activeSandboxId === q.id;

          return (
            <div 
              key={q.id} 
              className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                isSandboxOpen ? 'md:col-span-2 border-violet-500' : 'border-slate-800 hover:border-violet-500/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-xs font-mono font-bold border border-violet-500/30">
                      {q.platform}
                    </span>
                    <span className="text-xs font-mono text-cyan-400">[{q.company}]</span>
                  </div>

                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                    q.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : q.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-tight">{q.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono">
                  "{q.question_text}"
                </p>

                {/* Embedded Code Sandbox Container */}
                {isSandboxOpen && q.code_template && (
                  <div className="pt-2 animate-fade-in">
                    <CodeSandbox
                      initialCode={q.code_template}
                      problemTitle={q.title}
                      testCases={q.testCases}
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {q.expected_keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-[10px] font-mono text-slate-400">
                      #{kw}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {q.type === 'code' && (
                    <button
                      onClick={() => setActiveSandboxId(isSandboxOpen ? null : q.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 border ${
                        isSandboxOpen
                          ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                          : 'bg-slate-900 border-slate-800 text-cyan-400 hover:border-cyan-500'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{isSandboxOpen ? 'Close Compiler' : 'Open LeetCode Compiler'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenTestModal(q)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl glow-gradient text-white text-xs font-bold shadow-md shadow-violet-600/20 hover:scale-105 transition-transform shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Attend Test</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Pattern Pre-Test Instruction Popup */}
      <TestInstructionModal
        isOpen={showInstructionModal}
        onConfirm={handleConfirmAndLaunchTest}
        companyName={targetQuestionForTest?.company || 'Target Tech'}
        testTitle={targetQuestionForTest ? `${targetQuestionForTest.platform}: ${targetQuestionForTest.title}` : 'Full Pattern Assessment Drive'}
      />
    </div>
  );
};

