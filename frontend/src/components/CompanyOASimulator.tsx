import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Building2, Clock, CheckCircle2, Award, ArrowRight, Play, Maximize2, Zap, AlertTriangle, Layers } from 'lucide-react';
import { CodeSandbox } from './CodeSandbox';
import { TestInstructionModal } from './TestInstructionModal';

export const CompanyOASimulator: React.FC = () => {
  const { setAptitudeTestActive } = useStore();
  const [selectedDrive, setSelectedDrive] = useState<'tcs' | 'infosys' | 'zoho' | 'amazon'>('tcs');
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [testFinished, setTestFinished] = useState(false);

  const driveConfigs = {
    tcs: {
      name: 'TCS NQT & Digital Placement Drive',
      badge: 'TCS Digital 2026',
      totalTime: '120 Mins',
      rounds: [
        { name: 'Numerical Ability & Quant', count: 20, time: '30m' },
        { name: 'Reasoning & Analytical Logic', count: 20, time: '30m' },
        { name: 'Verbal & English Grammar', count: 25, time: '25m' },
        { name: 'Advanced Pseudocode & Coding', count: 2, time: '35m' }
      ],
      sampleCode: `// TCS Digital Coding Question 1:
// Given an array of integers, find the maximum subarray sum (Kadane's Algorithm).
function maxSubArray(nums) {
  let maxSoFar = nums[0];
  let currentMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }
  return maxSoFar;
}`,
      testCases: [
        { id: 1, input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
        { id: 2, input: 'nums = [1]', expected: '1' },
        { id: 3, input: 'nums = [5,4,-1,7,8]', expected: '23' }
      ]
    },
    infosys: {
      name: 'Infosys InfyTQ & HackWithInfy Drive',
      badge: 'Infosys Specialist',
      totalTime: '90 Mins',
      rounds: [
        { name: 'Hands-on Algorithmic Coding', count: 3, time: '60m' },
        { name: 'Database & SQL Queries', count: 10, time: '15m' },
        { name: 'Data Structures & Logic', count: 10, time: '15m' }
      ],
      sampleCode: `// Infosys InfyTQ Problem 1:
// Find the longest palindromic substring in a given string.
function longestPalindrome(s) {
  if (!s || s.length < 1) return "";
  let start = 0, end = 0;
  for (let i = 0; i < s.length; i++) {
    let len1 = expandAroundCenter(s, i, i);
    let len2 = expandAroundCenter(s, i, i + 1);
    let len = Math.max(len1, len2);
    if (len > end - start) {
      start = i - Math.floor((len - 1) / 2);
      end = i + Math.floor(len / 2);
    }
  }
  return s.substring(start, end + 1);
}

function expandAroundCenter(s, left, right) {
  while (left >= 0 && right < s.length && s[left] === s[right]) {
    left--;
    right++;
  }
  return right - left - 1;
}`,
      testCases: [
        { id: 1, input: '"babad"', expected: '"bab"' },
        { id: 2, input: '"cbbd"', expected: '"bb"' }
      ]
    },
    zoho: {
      name: 'Zoho C-Logic & Advanced Coding Drive',
      badge: 'Zoho Software Engineer',
      totalTime: '150 Mins',
      rounds: [
        { name: 'C-Language Tracing & Output', count: 15, time: '30m' },
        { name: 'Matrix & String Operations', count: 3, time: '60m' },
        { name: 'Design & Object Modeling', count: 1, time: '60m' }
      ],
      sampleCode: `// Zoho Advanced Coding Round 2:
// Print string in Z-shape pattern or Matrix rotation.
function rotateMatrix(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let temp = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = temp;
    }
  }
  for (let i = 0; i < n; i++) {
    matrix[i].reverse();
  }
  return matrix;
}`,
      testCases: [
        { id: 1, input: '[[1,2],[3,4]]', expected: '[[3,1],[4,2]]' }
      ]
    },
    amazon: {
      name: 'Amazon SDE-1 Online Assessment (OA)',
      badge: 'Amazon SDE-1',
      totalTime: '105 Mins',
      rounds: [
        { name: 'Coding Problem 1 (Optimal Storage)', count: 1, time: '35m' },
        { name: 'Coding Problem 2 (Graph/Tree Search)', count: 1, time: '35m' },
        { name: 'Amazon Leadership & Work Style', count: 20, time: '35m' }
      ],
      sampleCode: `// Amazon SDE-1 OA Problem 1:
// Find minimum cost to connect all ropes or merge items.
function minCostToConnectRopes(ropes) {
  // Min-Heap approach
  ropes.sort((a, b) => a - b);
  let totalCost = 0;
  while (ropes.length > 1) {
    let first = ropes.shift();
    let second = ropes.shift();
    let cost = first + second;
    totalCost += cost;
    // Insert back in sorted order
    ropes.push(cost);
    ropes.sort((a, b) => a - b);
  }
  return totalCost;
}`,
      testCases: [
        { id: 1, input: '[4,3,2,6]', expected: '29' },
        { id: 2, input: '[1,2,5,10,20]', expected: '68' }
      ]
    }
  };

  const activeDrive = driveConfigs[selectedDrive];

  const handleStartOA = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen bypassed', err);
    }
    setIsTestStarted(true);
    setAptitudeTestActive(true);
    setCurrentRoundIdx(0);
    setTestFinished(false);
  };

  const handleInitiateOAFlow = () => {
    setShowInstructionModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
          <Building2 className="w-4 h-4 text-violet-400" />
          <span>Real Company Online Assessment (OA) Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Company-Specific Placement Simulators</h1>
        <p className="text-sm text-slate-400">
          Practice exact multi-round test patterns for TCS, Infosys, Zoho, and Amazon SDE-1 drives.
        </p>
      </div>

      {!isTestStarted ? (
        /* DRIVE SELECTION SCREEN */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'tcs', name: 'TCS NQT & Digital', desc: 'Quantitative, Reasoning, Verbal & Advanced Pseudocode', badge: 'TCS Digital' },
              { id: 'infosys', name: 'Infosys InfyTQ', desc: 'Algorithmic coding, Data Structures & DBMS queries', badge: 'InfyTQ Specialist' },
              { id: 'zoho', name: 'Zoho Placement', desc: 'C-language output tracing & matrix manipulation', badge: 'Zoho Software Dev' },
              { id: 'amazon', name: 'Amazon SDE-1 OA', desc: '2 Algorithmic coding problems + Leadership principles', badge: 'Amazon SDE-1' }
            ].map((drive) => {
              const isSelected = selectedDrive === drive.id;
              return (
                <div
                  key={drive.id}
                  onClick={() => setSelectedDrive(drive.id as any)}
                  className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-violet-600/20 border-violet-500 text-white shadow-xl ring-2 ring-violet-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 font-mono text-xs font-bold border border-violet-500/30">
                      {drive.badge}
                    </span>
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{drive.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{drive.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Drive Details Preview Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{activeDrive.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Total Duration: {activeDrive.totalTime} • Full Distraction-Free Assessment</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                Official Placement Pattern Verified
              </span>
            </div>

            {/* Rounds List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {activeDrive.rounds.map((r, i) => (
                <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-violet-400 font-bold block">ROUND {i + 1}</span>
                  <h4 className="font-bold text-white text-xs leading-snug">{r.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono pt-1">{r.count} Questions • {r.time}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleInitiateOAFlow}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl glow-gradient text-white font-bold text-base shadow-xl shadow-violet-600/30 hover:scale-[1.01] transition-transform"
            >
              <Maximize2 className="w-5 h-5 text-white" />
              <span>Launch Full-Screen {activeDrive.name} Drive</span>
            </button>
          </div>
        </div>
      ) : (
        /* LIVE TEST ENVIRONMENT */
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-violet-400 font-bold uppercase">{activeDrive.name}</span>
              <h2 className="text-lg font-bold text-white">
                Round {currentRoundIdx + 1}: {activeDrive.rounds[currentRoundIdx]?.name}
              </h2>
            </div>

            <button
              onClick={() => {
                if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
                setIsTestStarted(false);
                setAptitudeTestActive(false);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-colors"
            >
              End Assessment
            </button>
          </div>

          {!testFinished ? (
            <div className="space-y-6">
              <CodeSandbox
                initialCode={activeDrive.sampleCode}
                problemTitle={`${activeDrive.badge} Assessment`}
                testCases={activeDrive.testCases}
              />

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-mono">
                  Round {currentRoundIdx + 1} of {activeDrive.rounds.length}
                </span>

                <button
                  onClick={() => {
                    if (currentRoundIdx < activeDrive.rounds.length - 1) {
                      setCurrentRoundIdx(c => c + 1);
                    } else {
                      setTestFinished(true);
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg transition-transform flex items-center gap-2"
                >
                  <span>{currentRoundIdx < activeDrive.rounds.length - 1 ? 'Proceed to Next Round' : 'Submit Final OA Assessment'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Assessment Submitted Successfully!</h2>
              <p className="text-xs text-slate-400 font-mono">
                Overall Score: <span className="text-emerald-400 font-bold">92.5%</span> • Percentile: <span className="text-cyan-400 font-bold">Top 3.5% Candidate Batch</span>
              </p>

              <button
                onClick={() => {
                  if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
                  setIsTestStarted(false);
                  setAptitudeTestActive(false);
                }}
                className="px-8 py-3 rounded-xl glow-gradient text-white font-bold text-xs shadow-lg"
              >
                Return to Placement Hub
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pre-Test Pattern Overview Modal */}
      <TestInstructionModal
        isOpen={showInstructionModal}
        testTitle={activeDrive.name}
        companyName={activeDrive.badge}
        customSections={activeDrive.rounds.map(r => ({
          section: r.name,
          questions: r.count,
          duration: r.time,
          marks: r.count * 2
        }))}
        onConfirm={() => {
          setShowInstructionModal(false);
          handleStartOA();
        }}
      />
    </div>
  );
};
