import React from 'react';

interface VisualizerProps {
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<VisualizerProps> = ({ isRecording }) => {
  return (
    <div className="flex items-center justify-center gap-1.5 h-10 px-4 bg-slate-900/60 rounded-xl border border-slate-800">
      {[40, 75, 50, 90, 30, 80, 60, 100, 45, 70, 85, 35].map((heightPct, idx) => (
        <span
          key={idx}
          className={`w-1 rounded-full transition-all duration-300 ${
            isRecording ? 'bg-gradient-to-t from-violet-500 to-emerald-400 wave-anim' : 'bg-slate-700 h-2'
          }`}
          style={{
            height: isRecording ? `${heightPct}%` : '8px',
            animationDelay: `${(idx % 5) * 0.15}s`
          }}
        />
      ))}
    </div>
  );
};
