import React, { useState } from 'react';
import { 
  FileText, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  Code2, 
  BrainCircuit, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const CompanyCheatSheets: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState('Zoho');

  const cheatSheetsData: Record<string, any> = {
    Zoho: {
      name: 'Zoho Corporation',
      focus: 'Data Structures, Recursion, String Manipulation & System Logic',
      topPatterns: [
        'Matrix Traversal & Spiral Printing',
        'Custom String Parser & Pattern Matching',
        'Stack Evaluation & Expression Trees',
        'OOP Architecture (Class Design for Taxi Booking)'
      ],
      proTips: 'Zoho rounds focus heavily on pure logic and raw problem solving without relying on built-in library shortcuts. Focus on clear variable naming and manual memory efficiency!'
    },
    Google: {
      name: 'Google LLC',
      focus: 'Graphs, Dynamic Programming, System Design & Concurrency',
      topPatterns: [
        'Dijkstra & Topological Sort for Dependency Graphs',
        'Segment Trees & Sliding Window Maximum',
        'Google Drive Chunked Upload Protocol Design',
        'Distributed LRU Cache Eviction'
      ],
      proTips: 'Google interviewers value upfront time/space complexity analysis (O(N log K)). Always explain your edge cases and state constraints before writing code!'
    },
    Amazon: {
      name: 'Amazon Web Services',
      focus: 'STAR Leadership Principles, Binary Trees & System Scalability',
      topPatterns: [
        'Customer Obsession & Ownership STAR Stories',
        'Trie Data Structure for Autocomplete',
        'DynamoDB Eventual Consistency Tradeoffs',
        'Heap / Priority Queue for K Frequent Elements'
      ],
      proTips: 'Amazon interviewers evaluate 50% technical depth and 50% Leadership Principles. Format every behavioral response using Situation, Task, Action, Result!'
    }
  };

  const currentSheet = cheatSheetsData[selectedCompany] || cheatSheetsData['Zoho'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Placement & Tech Company Revision Cheat Sheets</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Last-Minute Company Interview Revision</h1>
        <p className="text-sm text-slate-400">
          5-minute revision guides featuring top patterns, architectural frameworks, and recruiter tips.
        </p>
      </div>

      {/* Company Selector Tabs */}
      <div className="flex items-center justify-center gap-3">
        {['Zoho', 'Google', 'Amazon'].map((comp) => (
          <button
            key={comp}
            onClick={() => setSelectedCompany(comp)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              selectedCompany === comp
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-105'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {comp} Cheat Sheet
          </button>
        ))}
      </div>

      {/* Main Content Sheet */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white">{currentSheet.name} Placement Master Guide</h2>
            <p className="text-xs font-mono text-cyan-400">Focus Areas: {currentSheet.focus}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
            VERIFIED PATTERNS
          </span>
        </div>

        {/* Top 4 Asked Patterns */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Top 4 Most Frequently Asked Patterns</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentSheet.topPatterns.map((pat: string, idx: number) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-200 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold">{pat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recruiter Pro Tips */}
        <div className="p-5 bg-violet-600/10 rounded-2xl border border-violet-500/30 space-y-1 text-xs">
          <span className="font-bold text-violet-300 block text-sm">💡 Recruiter Bar Raiser Tip:</span>
          <p className="text-slate-300 leading-relaxed italic">{currentSheet.proTips}</p>
        </div>

      </div>
    </div>
  );
};
