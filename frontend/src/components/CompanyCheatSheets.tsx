import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  FileText, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  Code2, 
  BrainCircuit, 
  BookOpen,
  ArrowRight,
  Search,
  CheckSquare,
  Square,
  Clock,
  Layers,
  Award,
  Users,
  Lightbulb,
  Play
} from 'lucide-react';

interface RoundInfo {
  roundName: string;
  category: 'aptitude' | 'technical' | 'coding' | 'hr';
  duration: string;
  description: string;
  keyTopics: string[];
  sampleQuestion?: string;
}

interface CompanyData {
  id: string;
  name: string;
  badge: string;
  focus: string;
  topPatterns: string[];
  proTips: string[];
  rounds: RoundInfo[];
  resources: { title: string; linkText: string; type: string }[];
}

interface CompanyCheatSheetsProps {
  onSwitchToCoding?: () => void;
}

export const CompanyCheatSheets: React.FC<CompanyCheatSheetsProps> = ({ onSwitchToCoding }) => {
  const { setActiveTab } = useStore();
  const [selectedCompany, setSelectedCompany] = useState<string>('Zoho');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [masteredTopics, setMasteredTopics] = useState<Record<string, boolean>>({});

  const toggleMastered = (topicKey: string) => {
    setMasteredTopics(prev => ({
      ...prev,
      [topicKey]: !prev[topicKey]
    }));
  };

  const companiesData: Record<string, CompanyData> = {
    Zoho: {
      id: 'zoho',
      name: 'Zoho Corporation',
      badge: 'Product Engineering',
      focus: 'Data Structures, Recursion, String Manipulation & System Logic',
      topPatterns: [
        'Matrix Traversal & Spiral Printing',
        'Custom String Parser & Pattern Matching',
        'Stack Evaluation & Expression Trees',
        'OOP Architecture (Class Design for Taxi Booking)'
      ],
      proTips: [
        'Zoho rounds focus heavily on pure logic and raw problem solving without relying on built-in library shortcuts. Focus on clear variable naming and manual memory efficiency!',
        'Round 3 (Advanced Programming) requires writing fully working OOP console applications like Railway Reservation or Taxi Booking from scratch.',
        'Interviewers often prohibit built-in functions like sort() or split() to evaluate your fundamental algorithmic implementation.'
      ],
      rounds: [
        {
          roundName: 'Round 1: Basic Logic & Aptitude',
          category: 'aptitude',
          duration: '60 Mins',
          description: 'Basic numerical ability, pattern finding, and C/Java code snippet dry-running.',
          keyTopics: ['Number Series & Modulo Math', 'Bitwise Operators & Pointers', 'Recursive Function Call Stack Tracing', 'Time Complexity Estimation'],
          sampleQuestion: 'Find the output of a nested recursive pointer function without running on compiler.'
        },
        {
          roundName: 'Round 2: Basic Programming',
          category: 'coding',
          duration: '90 Mins',
          description: 'Hands-on problem solving focusing on arrays, strings, and pattern printing without library helpers.',
          keyTopics: ['Spiral Matrix Printing', 'String Expansion (e.g. a1b10 -> abbbbbbbbbb)', 'Palindrome Substring Extraction', 'Array Rotations & Duplicates'],
          sampleQuestion: 'Given a string containing numbers and letters, expand the characters based on following integer counts.'
        },
        {
          roundName: 'Round 3: Advanced Programming (Design)',
          category: 'technical',
          duration: '120 Mins',
          description: 'Comprehensive Low-Level Design (LLD) console application implementation.',
          keyTopics: ['Taxi Booking System Design', 'Railway Reservation with Waiting List', 'Snakes & Ladders Game Engine', 'Dungeon Game Matrix BFS'],
          sampleQuestion: 'Design and implement a complete console-based Taxi Booking system with customer requests, nearest driver allocation, and billing calculations.'
        },
        {
          roundName: 'Round 4: Technical & HR Discussion',
          category: 'hr',
          duration: '30-45 Mins',
          description: 'Evaluation of foundational computer science concepts, project architecture, and company culture.',
          keyTopics: ['OOP Pillars & Clean Code', 'Database Normalization', 'Why Zoho & Long-Term Learning Mindset', 'Handling Constructive Feedback'],
          sampleQuestion: 'Explain how you structured your college project and how you would refactor it to handle 10x traffic.'
        }
      ],
      resources: [
        { title: 'Zoho Taxi Booking LLD Guide', linkText: 'View Architecture', type: 'Design' },
        { title: 'Pattern Printing Algorithms', linkText: 'Explore Code', type: 'DSA' },
        { title: 'Recursion Call Stack Cheat Sheet', linkText: 'Read Notes', type: 'Logic' }
      ]
    },
    Google: {
      id: 'google',
      name: 'Google LLC',
      badge: 'FAANG Tier 1',
      focus: 'Graphs, Dynamic Programming, System Design & Concurrency',
      topPatterns: [
        'Dijkstra & Topological Sort for Dependency Graphs',
        'Segment Trees & Sliding Window Maximum',
        'Google Drive Chunked Upload Protocol Design',
        'Distributed LRU Cache Eviction'
      ],
      proTips: [
        'Google interviewers value upfront time/space complexity analysis (O(N log K)). Always explain your edge cases and state constraints before writing code!',
        'Ask clarifying questions before touching the code sandbox. Discuss trade-offs (e.g. memory vs latency) explicitly.',
        'For Googliness behavioral rounds, emphasize collaborative blameless post-mortems and proactive problem ownership.'
      ],
      rounds: [
        {
          roundName: 'Round 1: Online Technical Assessment (OA)',
          category: 'aptitude',
          duration: '90 Mins',
          description: 'Two challenging algorithmic problems on data structures and dynamic programming.',
          keyTopics: ['Prefix Sums & Sliding Windows', 'Tree DFS/BFS with Memoization', 'Graph Bi-partitioning', 'Mathematical Combinatorics'],
          sampleQuestion: 'Find the minimum operations to convert array into target sequence under sliding window constraints.'
        },
        {
          roundName: 'Round 2: Core Data Structures & Algorithms',
          category: 'coding',
          duration: '45 Mins',
          description: 'Live coding on Google Docs or virtual sandbox with senior Google engineers.',
          keyTopics: ['Topological Sort (Kahn Algorithm)', 'Union-Find / Disjoint Set Union', 'Dijkstra Shortest Path', 'Binary Search on Answer Space'],
          sampleQuestion: 'Given a dependency graph of services, detect cycles and compute execution order with parallel worker limits.'
        },
        {
          roundName: 'Round 3: Advanced DSA & Scalability',
          category: 'technical',
          duration: '45 Mins',
          description: 'Deep dive into complex edge cases, concurrent access patterns, and memory optimization.',
          keyTopics: ['Segment Trees / Fenwick Trees', 'LRU / LFU Eviction under Thread Contention', 'Memory Bound Stream Processing', 'Consistent Hashing'],
          sampleQuestion: 'Design a distributed rate limiter and analytics counter that handles 1M requests/sec without database bottlenecks.'
        },
        {
          roundName: 'Round 4: Googliness & Leadership',
          category: 'hr',
          duration: '45 Mins',
          description: 'Behavioral assessment evaluated against Google culture, teamwork, and ethics.',
          keyTopics: ['Navigating Ambiguity', 'Constructive Disagreement Resolution', 'Diversity, Equity & Inclusion', 'Blameless Post-Mortem Culture'],
          sampleQuestion: 'Tell me about a time you pushed back against a technical decision using data and benchmarks.'
        }
      ],
      resources: [
        { title: 'Google System Design Reference', linkText: 'Read Whitepaper', type: 'Architecture' },
        { title: 'Graph Traversal Master Guide', linkText: 'View Cheat Sheet', type: 'DSA' },
        { title: 'Googliness STAR Question Bank', linkText: 'Practice Questions', type: 'Behavioral' }
      ]
    },
    Amazon: {
      id: 'amazon',
      name: 'Amazon Web Services',
      badge: 'Cloud & E-Commerce',
      focus: 'STAR Leadership Principles, Binary Trees & System Scalability',
      topPatterns: [
        'Customer Obsession & Ownership STAR Stories',
        'Trie Data Structure for Autocomplete',
        'DynamoDB Eventual Consistency Tradeoffs',
        'Heap / Priority Queue for K Frequent Elements'
      ],
      proTips: [
        'Amazon interviewers evaluate 50% technical depth and 50% Leadership Principles. Format every behavioral response using Situation, Task, Action, Result!',
        'Demonstrate Customer Obsession and Bias for Action with quantifiable metrics (e.g. "reduced latency by 45%").',
        'Know when to choose DynamoDB vs relational databases and explain quorum reads (R + W > N).'
      ],
      rounds: [
        {
          roundName: 'Round 1: Online Assessment (OA 1 & 2)',
          category: 'aptitude',
          duration: '90 Mins',
          description: 'Debugging questions, 2 LeetCode Medium/Hard algorithmic challenges, and Work Simulation.',
          keyTopics: ['Array / String Sliding Window', 'Priority Queue / Min-Heap', 'Code Bug Fixing in C++/Java', 'Work Style Assessment Simulation'],
          sampleQuestion: 'Find the minimum flight cost connecting warehouses with at most K stops.'
        },
        {
          roundName: 'Round 2: Data Structures & Problem Solving',
          category: 'coding',
          duration: '60 Mins',
          description: 'One technical question combined with 2 Leadership Principle STAR questions.',
          keyTopics: ['Binary Tree LCA & Diameter', 'Trie for Autocomplete Search', 'BFS Shortest Path in Grid', 'Customer Obsession STAR Example'],
          sampleQuestion: 'Implement an autocomplete prefix tree that returns top 3 highest-rated products.'
        },
        {
          roundName: 'Round 3: System Design & Object-Oriented Design',
          category: 'technical',
          duration: '60 Mins',
          description: 'Scalable cloud architecture design for AWS services or Amazon retail.',
          keyTopics: ['Shopping Cart Checkout Pipeline', 'DynamoDB Partition Keys & Indexes', 'SQS Message Deduplication', 'Frugality & Scalability'],
          sampleQuestion: 'Design the Amazon Locker delivery system with notification dispatching and concurrent locker reservations.'
        },
        {
          roundName: 'Round 4: Bar Raiser & Leadership Deep Dive',
          category: 'hr',
          duration: '60 Mins',
          description: 'Independent cross-team Bar Raiser assessing highest cultural and technical hiring bar.',
          keyTopics: ['Have Backbone; Disagree & Commit', 'Deliver Results under Tight Constraints', 'Earn Trust & Self-Critique', 'Invent & Simplify'],
          sampleQuestion: 'Describe a high-stakes project where you failed to meet a deadline. What did you learn and how did you prevent recurrence?'
        }
      ],
      resources: [
        { title: 'Amazon 16 Leadership Principles Guide', linkText: 'Review STAR Bank', type: 'HR' },
        { title: 'DynamoDB vs Aurora Architecture', linkText: 'Explore Cloud', type: 'Design' },
        { title: 'Heap & Priority Queue Cheat Sheet', linkText: 'Review DSA', type: 'Coding' }
      ]
    },
    TCS: {
      id: 'tcs',
      name: 'Tata Consultancy Services',
      badge: 'TCS Digital & Prime',
      focus: 'Quantitative Aptitude, Kadane Algorithm, SQL & Clean Logic',
      topPatterns: [
        'Kadane Max Subarray Sum',
        'Matrix Multiplication & Inversion',
        'SQL Joins & Group By Query Optimization',
        'Object-Oriented Inheritance & Polymorphism'
      ],
      proTips: [
        'TCS Digital prioritizes candidates who pass all test cases without syntax errors in the online compiler.',
        'Master basic Quantitative Aptitude (Time & Distance, Permutations) as section cut-offs are strictly enforced.',
        'In the technical interview, be ready to write working SQL queries on pen and paper.'
      ],
      rounds: [
        {
          roundName: 'Round 1: TCS NQT Cognitive Assessment',
          category: 'aptitude',
          duration: '80 Mins',
          description: 'Numerical ability, logical reasoning, and verbal comprehension with zero negative marking.',
          keyTopics: ['Percentages & Profit-Loss', 'Seating Arrangements & Syllogisms', 'Error Spotting & Grammar', 'Data Interpretation Charts'],
          sampleQuestion: 'Calculate rate of interest when principal doubles in 5 years with compound interest.'
        },
        {
          roundName: 'Round 2: TCS Digital Advanced Coding',
          category: 'coding',
          duration: '60 Mins',
          description: 'Two coding questions ranging from basic array manipulation to dynamic programming.',
          keyTopics: ['Kadane Algorithm (Max Subarray)', 'Sieve of Eratosthenes (Prime Generation)', 'String Permutations', 'Matrix Diagonals'],
          sampleQuestion: 'Given an array of integers, find the contiguous subarray with the maximum sum.'
        },
        {
          roundName: 'Round 3: Technical & Project Evaluation',
          category: 'technical',
          duration: '30 Mins',
          description: 'Deep dive into your resume projects, database schemas, and OOP concepts.',
          keyTopics: ['DBMS Normalization & ACID Properties', 'Java Virtual Machine (JVM) Architecture', 'REST API Construction', 'Git Version Control'],
          sampleQuestion: 'Write a SQL query to find the second highest salary without using LIMIT.'
        },
        {
          roundName: 'Round 4: Managerial & HR Round',
          category: 'hr',
          duration: '20 Mins',
          description: 'Evaluation of communication clarity, relocation willingness, and company knowledge.',
          keyTopics: ['Willingness to Relocate & Work in Shifts', 'Conflict Management in College Teams', 'Awareness of TCS Innovation Labs'],
          sampleQuestion: 'Why should TCS hire you over other candidates with similar academic marks?'
        }
      ],
      resources: [
        { title: 'TCS NQT Quant Formulas', linkText: 'View Formula Sheet', type: 'Aptitude' },
        { title: 'SQL Joins & Group By Cheatsheet', linkText: 'View SQL Notes', type: 'Database' },
        { title: 'Kadane & DP Code Snippets', linkText: 'Practice Snippets', type: 'Coding' }
      ]
    },
    Infosys: {
      id: 'infosys',
      name: 'Infosys Limited',
      badge: 'InfyTQ Specialist',
      focus: 'Data Structures, Python/Java, SQL Queries & Palindromic Logic',
      topPatterns: [
        'Longest Palindromic Substring',
        'Binary Tree Traversal (Inorder/Preorder)',
        'Database Triggers & Stored Procedures',
        'Exception Handling & Modularity'
      ],
      proTips: [
        'InfyTQ certification gives direct interview access for Systems Engineer Specialist ($9 LPA) roles.',
        'Emphasize object-oriented design and clean exception handling in your code submissions.',
        'Interviewers often ask to optimize O(N^2) brute force solutions to O(N log N).'
      ],
      rounds: [
        {
          roundName: 'Round 1: InfyTQ Certification OA',
          category: 'aptitude',
          duration: '90 Mins',
          description: 'Programming MCQ, Database SQL queries, and 2 hands-on coding challenges.',
          keyTopics: ['Java/Python OOP MCQs', 'Complex SQL Joins', 'Stack & Queue Implementations', 'Greedy Algorithms'],
          sampleQuestion: 'Find the longest palindromic substring in an alphanumeric string.'
        },
        {
          roundName: 'Round 2: Hands-On Algorithmic Coding',
          category: 'coding',
          duration: '60 Mins',
          description: 'Problem solving on arrays, hashing, and tree structures with live compiler.',
          keyTopics: ['Two Pointers & Hashing', 'Subarray Sum Equals K', 'Matrix Rotation 90 Degrees', 'Graph BFS'],
          sampleQuestion: 'Determine if an array can be partitioned into two subsets with equal sum.'
        },
        {
          roundName: 'Round 3: Technical Architecture & Core CS',
          category: 'technical',
          duration: '35 Mins',
          description: 'In-depth review of Data Structures, Operating Systems, and Web Technologies.',
          keyTopics: ['Process vs Thread & Deadlocks', 'B-Trees & Indexing in SQL', 'Inheritance vs Composition', 'Web Security (CORS & XSS)'],
          sampleQuestion: 'Explain the internal working of Java HashMap and how collisions are resolved in Java 8+.'
        },
        {
          roundName: 'Round 4: Behavioral & HR Evaluation',
          category: 'hr',
          duration: '20 Mins',
          description: 'Professional attitude, team collaboration, and communication assessment.',
          keyTopics: ['Adaptability to New Technologies', 'Client Interaction Readiness', 'Continuous Learning Goals'],
          sampleQuestion: 'Tell me about a time you quickly learned an unfamiliar framework to complete a project.'
        }
      ],
      resources: [
        { title: 'InfyTQ Python/Java Patterns', linkText: 'View Guide', type: 'Coding' },
        { title: 'OS & DBMS Core Concept Notes', linkText: 'Review Notes', type: 'Core CS' },
        { title: 'Palindromic & Substring DSA Kit', linkText: 'Open Problems', type: 'DSA' }
      ]
    }
  };

  const currentSheet = companiesData[selectedCompany] || companiesData['Zoho'];

  const filteredRounds = currentSheet.rounds.filter(r => {
    const matchesCategory = selectedRoundFilter === 'all' || r.category === selectedRoundFilter;
    const matchesSearch = searchQuery === '' || 
      r.roundName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.keyTopics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.sampleQuestion && r.sampleQuestion.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 glow-box-cyan">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Company Preparation & Interview Revision Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {currentSheet.name} Placement Master Guide
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Fast-track revision organized by interview round (Aptitude, Technical, Coding, and HR). Master company-specific patterns, test patterns, and bar raiser criteria.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('company-oa')}
            className="px-4 py-2.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-300 text-xs font-bold transition-all flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-pink-400" />
            <span>Launch OA Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className="px-4 py-2.5 rounded-xl glow-gradient text-white text-xs font-bold shadow-lg shadow-violet-600/30 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 text-white fill-white" />
            <span>Start Mock Session</span>
          </button>
        </div>
      </div>

      {/* Company Selector Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {Object.keys(companiesData).map((compKey) => {
          const comp = companiesData[compKey];
          const isSelected = selectedCompany === compKey;
          return (
            <button
              key={compKey}
              onClick={() => setSelectedCompany(compKey)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 border border-violet-500 scale-105'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Building2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <span>{comp.name.split(' ')[0]}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                isSelected ? 'bg-violet-800 text-violet-200' : 'bg-slate-800 text-slate-400'
              }`}>
                {comp.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Overview Cards: Focus & Recruiter Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Focus Area */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Core Evaluation Focus</span>
          </div>
          <p className="text-sm font-semibold text-white leading-relaxed">
            {currentSheet.focus}
          </p>
        </div>

        {/* Top Asked Patterns */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>High-Frequency Patterns</span>
          </div>
          <div className="space-y-1.5">
            {currentSheet.topPatterns.slice(0, 3).map((pat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="truncate">{pat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recruiter Pro Tip */}
        <div className="p-6 rounded-2xl glass-panel border border-amber-500/30 bg-amber-500/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Recruiter Bar Raiser Tip</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{currentSheet.proTips[0]}"
          </p>
        </div>

      </div>

      {/* Round Breakdown Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        {/* Section Header & Search/Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-400" />
              <span>Round-by-Round Preparation Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400">
              Targeted preparation modules organized across interview stages. Check off topics as you master them.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, questions..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-violet-500 focus:outline-none"
              />
            </div>

            {/* Round Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Rounds' },
                { id: 'aptitude', label: 'Aptitude/OA' },
                { id: 'coding', label: 'Coding' },
                { id: 'technical', label: 'Technical/Design' },
                { id: 'hr', label: 'HR/STAR' }
              ].map(rf => (
                <button
                  key={rf.id}
                  onClick={() => setSelectedRoundFilter(rf.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedRoundFilter === rf.id
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Round Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRounds.map((round, rIdx) => {
            const badgeColor = 
              round.category === 'aptitude' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
              round.category === 'coding' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              round.category === 'technical' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
              'bg-amber-500/10 text-amber-400 border-amber-500/20';

            return (
              <div 
                key={rIdx} 
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-4 hover:border-violet-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border ${badgeColor}`}>
                      {round.roundName}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {round.duration}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {round.description}
                  </p>

                  {/* Key Topics with Checklist Progress */}
                  <div className="space-y-2 pt-1 border-t border-slate-900">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                      Key Topics & Concepts:
                    </span>
                    <div className="space-y-1.5">
                      {round.keyTopics.map((topic, tIdx) => {
                        const topicKey = `${currentSheet.id}-${round.category}-${tIdx}`;
                        const isMastered = Boolean(masteredTopics[topicKey]);

                        return (
                          <div 
                            key={tIdx} 
                            onClick={() => toggleMastered(topicKey)}
                            className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                              isMastered 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                                : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className={isMastered ? 'line-through text-slate-400' : ''}>{topic}</span>
                            {isMastered ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 shrink-0 hover:text-slate-300" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sample Question Box */}
                  {round.sampleQuestion && (
                    <div className="p-3 bg-violet-950/20 border border-violet-800/30 rounded-xl space-y-1 text-xs">
                      <span className="text-[10px] font-mono text-violet-400 font-bold uppercase block">Sample Problem / Prompt:</span>
                      <p className="text-slate-300 italic">"{round.sampleQuestion}"</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-500">
                    Click any topic to mark as prepared
                  </span>
                  {onSwitchToCoding && (
                    <button
                      onClick={onSwitchToCoding}
                      className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Code this pattern</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredRounds.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No round materials found matching "{searchQuery}".
          </div>
        )}

      </div>

      {/* Additional Preparation Notes & Tips */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>General Recruiter & Engineering Guidelines for {currentSheet.name}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          {currentSheet.proTips.map((tip, idx) => (
            <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center font-mono font-bold shrink-0 text-xs">
                #{idx + 1}
              </span>
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
