import React, { useState, useEffect } from 'react';
import { Lock, FileText, ArrowRight } from 'lucide-react';

export interface SectionItem {
  section: string;
  questions: number;
  duration: string;
  marks: number;
}

interface ModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  companyName?: string;
  testMode?: string;
  testTitle?: string;
  selectedCategory?: string;
  customSections?: SectionItem[];
}

export const TestInstructionModal: React.FC<ModalProps> = ({
  isOpen,
  onConfirm,
  companyName = 'Placement Assessment',
  testTitle = '2027_Full Pattren Test 4',
  selectedCategory,
  customSections
}) => {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(15);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onConfirm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onConfirm]);

  if (!isOpen) return null;

  const titleLower = (testTitle || '').toLowerCase();
  const categoryLower = (selectedCategory || '').toLowerCase();

  let sectionsData: SectionItem[] = [];

  if (customSections && customSections.length > 0) {
    sectionsData = customSections;
  } else if (categoryLower === 'pseudocode' || titleLower.includes('pseudo')) {
    sectionsData = [{ section: 'Pseudo code', questions: 20, duration: '20 m', marks: 20 }];
  } else if (categoryLower === 'quantitative' || titleLower.includes('analytical') || categoryLower.includes('analytical')) {
    sectionsData = [{ section: 'Analytical', questions: 20, duration: '20 m', marks: 20 }];
  } else if (categoryLower === 'logical' || titleLower.includes('reasoning') || categoryLower.includes('reasoning')) {
    sectionsData = [{ section: 'Reasoning', questions: 20, duration: '20 m', marks: 20 }];
  } else if (categoryLower === 'verbal' || titleLower.includes('verbal')) {
    sectionsData = [{ section: 'Verbal', questions: 20, duration: '20 m', marks: 20 }];
  } else if (categoryLower === 'coding' || titleLower.includes('coding')) {
    sectionsData = [{ section: 'Coding', questions: 2, duration: '40 m', marks: 20 }];
  } else {
    // Default full pattern test (matches exact 5-section breakdown)
    sectionsData = [
      { section: 'Analytical', questions: 20, duration: '20 m', marks: 20 },
      { section: 'Reasoning', questions: 20, duration: '20 m', marks: 20 },
      { section: 'Verbal', questions: 20, duration: '20 m', marks: 20 },
      { section: 'Coding', questions: 2, duration: '40 m', marks: 20 },
      { section: 'Pseudo code', questions: 20, duration: '20 m', marks: 20 },
    ];
  }

  const totalQuestions = sectionsData.reduce((acc, curr) => acc + curr.questions, 0);
  const totalMarks = sectionsData.reduce((acc, curr) => acc + curr.marks, 0);
  const totalDurationMin = sectionsData.reduce((acc, curr) => {
    const minMatch = curr.duration.match(/(\d+)/);
    return acc + (minMatch ? parseInt(minMatch[1], 10) : 20);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-[28px] p-7 sm:p-9 shadow-2xl space-y-6 animate-scale-in border border-slate-100">
        
        {/* Top Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {testTitle || `${companyName} Assessment`}
          </h2>
        </div>

        {/* Sub-header Badges & Countdown */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Badges */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4effe] text-[#7c3aed] text-xs font-semibold border border-[#e9dffc]">
              <Lock className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Section Locked</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fdecf2] text-[#e11d48] text-xs font-semibold border border-[#fbcfe8]">
              <FileText className="w-3.5 h-3.5 text-[#e11d48]" />
              <span>Attempt : 1</span>
            </span>
          </div>

          {/* Countdown & Progress Bar */}
          <div className="flex flex-col items-end">
            <div className="text-xs text-slate-500 font-medium">
              Test starts in <span className="font-extrabold text-slate-900 text-sm ml-1">{countdown}S</span>
            </div>
            <div className="w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
              <div 
                className="h-full bg-[#2563eb] rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sections Breakdown Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#eff1fe] text-[#333a78] font-bold border-b border-indigo-100">
                <th className="py-3.5 px-5 sm:px-6">Sections</th>
                <th className="py-3.5 px-5 sm:px-6 text-center">Questions</th>
                <th className="py-3.5 px-5 sm:px-6 text-center">Duration (Min)</th>
                <th className="py-3.5 px-5 sm:px-6 text-center">Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {sectionsData.map((sec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 sm:px-6 font-semibold text-slate-800">{sec.section}</td>
                  <td className="py-3.5 px-5 sm:px-6 text-center text-slate-600">{sec.questions}</td>
                  <td className="py-3.5 px-5 sm:px-6 text-center text-slate-600">{sec.duration}</td>
                  <td className="py-3.5 px-5 sm:px-6 text-center text-slate-600">{sec.marks}</td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-[#f0f4ff] font-bold text-slate-900 border-t border-indigo-100">
                <td className="py-3.5 px-5 sm:px-6 text-[#2563eb] font-extrabold">total</td>
                <td className="py-3.5 px-5 sm:px-6 text-center font-bold text-slate-900">{totalQuestions}</td>
                <td className="py-3.5 px-5 sm:px-6 text-center font-bold text-slate-900">{totalDurationMin} m</td>
                <td className="py-3.5 px-5 sm:px-6 text-center font-bold text-slate-900">{totalMarks}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <span>Start Test Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
