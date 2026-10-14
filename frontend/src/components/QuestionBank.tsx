import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { TestInstructionModal } from './TestInstructionModal';
import { CodeSandbox } from './CodeSandbox';
import { generateCustomQuestionsApi } from '../services/api';
import { CompanyCheatSheets } from './CompanyCheatSheets';
import { 
  BookOpen, 
  Search, 
  Code2, 
  Play, 
  RotateCw, 
  Calendar,
  Sparkles,
  Loader2,
  X,
  PlusCircle,
  Lightbulb,
  Building2
} from 'lucide-react';

interface QuestionBankProps {
  initialTab?: 'coding-bank' | 'company-prep';
}

export const QuestionBank: React.FC<QuestionBankProps> = ({ initialTab = 'coding-bank' }) => {
  const { setActiveSession, setActiveTab } = useStore();
  const [activeMainTab, setActiveMainTab] = useState<'coding-bank' | 'company-prep'>(initialTab);

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

  // AI Generator Modal & State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('React & Next.js Performance');
  const [aiCompany, setAiCompany] = useState('Google');
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const [aiCount, setAiCount] = useState(2);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const initialQuestions = [
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
      code_template: `function twoSum(nums, target) {\n  // TODO: Write your algorithm here to achieve O(N) time complexity\n  \n  return [];\n}`,
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
      code_template: `function isValid(s) {\n  // TODO: Determine if parentheses string is valid using a Stack\n  \n  return false;\n}`,
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
      code_template: `function lengthOfLongestSubstring(s) {\n  // TODO: Find length of longest substring without repeating characters\n  \n  return 0;\n}`,
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

  const [questionsList, setQuestionsList] = useState<any[]>(initialQuestions);

  const handleGenerateWithGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAiGenerating(true);

    try {
      const response = await generateCustomQuestionsApi({
        role: 'Software Engineer',
        company: aiCompany,
        difficulty: aiDifficulty,
        topic: aiTopic,
        count: aiCount
      });

      if (response && response.questions && response.questions.length > 0) {
        const mapped = response.questions.map((q: any, i: number) => ({
          id: Date.now() + i,
          title: q.question_text.slice(0, 48) + (q.question_text.length > 48 ? '...' : ''),
          platform: 'Gemini AI Live',
          company: aiCompany,
          category: q.category || 'Algorithms',
          difficulty: aiDifficulty,
          type: q.code_template ? 'code' : 'text',
          question_text: q.question_text,
          expected_keywords: q.expected_keywords || ['Gemini Generated', aiTopic],
          code_template: q.code_template || `// Solution for ${aiTopic}\nfunction solve() {\n  // Implement logic here\n}`,
          testCases: q.test_cases || [
            { id: 1, input: 'Standard Test Input', expected: 'Optimal Output' }
          ]
        }));

        setQuestionsList(prev => [...mapped, ...prev]);
        setShowAiModal(false);
      }
    } catch (err) {
      console.error('Failed to generate questions with Gemini', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const filteredQuestions = questionsList.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (q.expected_keywords && q.expected_keywords.some((k: string) => k.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory = selectedCategory === 'All' || q.category.toLowerCase().includes(selectedCategory.toLowerCase());
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

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    setActiveTab('live-session');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Top Main Navigation Tabs: Coding Bank vs Company Preparation */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveMainTab('coding-bank')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
            activeMainTab === 'coding-bank'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 border border-violet-500 scale-105'
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Coding Practice Bank</span>
        </button>

        <button
          onClick={() => setActiveMainTab('company-prep')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
            activeMainTab === 'company-prep'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 border border-cyan-500 scale-105'
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Preparation & Cheat Sheets</span>
        </button>
      </div>

      {activeMainTab === 'company-prep' ? (
        <CompanyCheatSheets onSwitchToCoding={() => setActiveMainTab('coding-bank')} />
      ) : (
        <>
          {/* Header with 10-Day Question Refresh Schedule & Gemini Generator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-violet-500/30">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>LeetCode, CodeChef & Gemini AI Question Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Practice Real Coding & Architecture Problems</h1>
          <p className="text-xs text-slate-400">
            Every question features live compiler execution, automated test cases, and line error detection.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={() => setShowAiModal(true)}
            className="px-4 py-2 rounded-xl glow-gradient text-white text-xs font-bold shadow-lg shadow-violet-600/30 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Generate with Gemini AI</span>
          </button>

          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-mono text-cyan-400 shadow-inner">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Rotates (Next: {daysRemaining}d {hoursRemaining}h)</span>
          </div>

          <button
            onClick={() => setBatchCount(b => b + 1)}
            className="p-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Cycle next batch"
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
          {['All', 'Algorithms', 'System', 'Gemini AI'].map((cat) => (
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
                  {q.expected_keywords && q.expected_keywords.map((kw: string, i: number) => (
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
                      <span>{isSandboxOpen ? 'Close Compiler' : 'Open Compiler'}</span>
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

      {/* Gemini AI Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e1322] border border-violet-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Google Gemini API</span>
              </div>
              <h2 className="text-xl font-bold text-white">Generate Custom Questions</h2>
              <p className="text-xs text-slate-400">
                Enter your target tech stack or domain. Gemini will formulate tailored questions with code starters & test cases.
              </p>
            </div>

            <form onSubmit={handleGenerateWithGemini} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Topic / Technology Focus</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. React Hooks, Docker & K8s, PostgreSQL indexing"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Target Company</label>
                  <input
                    type="text"
                    value={aiCompany}
                    onChange={(e) => setAiCompany(e.target.value)}
                    placeholder="e.g. Google, Amazon, Zoho"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Question Count</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 5].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setAiCount(cnt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        aiCount === cnt
                          ? 'bg-violet-600 text-white border-violet-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isAiGenerating || !aiTopic.trim()}
                className="w-full py-3.5 rounded-2xl glow-gradient text-white text-xs font-bold shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] transition-transform"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating via Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate & Add to Question Bank</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )}

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
