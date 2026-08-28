import React from 'react';
import { LocationCandidate } from '../types';
import { X, ShieldCheck, Check, AlertCircle, Award, Sparkles } from 'lucide-react';

interface ScoreBreakdownModalProps {
  candidate: LocationCandidate | null;
  onClose: () => void;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({ candidate, onClose }) => {
  if (!candidate) return null;

  const b = candidate.score_breakdown;

  const dimensions = [
    {
      title: 'Visual Aesthetic Match',
      score: b.visual_match,
      max: 25,
      color: '#8B5CF6',
      desc: 'How closely the visual architecture and appearance match screenplay scene descriptions.',
    },
    {
      title: 'Location Requirements Met',
      score: b.location_requirements,
      max: 20,
      color: '#F472B6',
      desc: 'Adequacy of interior space, ceiling height, staging area, and physical infrastructure.',
    },
    {
      title: 'Accessibility & Logistics',
      score: b.accessibility,
      max: 15,
      color: '#34D399',
      desc: 'Loading docks, heavy vehicle/crew truck clearance, parking, and transit access.',
    },
    {
      title: 'Time of Day / Lighting Feasibility',
      score: b.time_lighting,
      max: 15,
      color: '#FBBF24',
      desc: 'Controlled ambient lighting, night shooting feasibility, and electrical grid access.',
    },
    {
      title: 'Production Practicality & Facilities',
      score: b.production_practicality,
      max: 15,
      color: '#38BDF8',
      desc: 'Green rooms, holding areas, crew facilities, restrooms, and noise isolation.',
    },
    {
      title: 'Safety & Risk Clearance',
      score: b.risk_score,
      max: 10,
      color: '#A78BFA',
      desc: 'Permit clarity, environmental hazards, public restriction safety (higher = lower risk).',
    },
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-pop-in">
      <div className="bg-studio-surface w-full max-w-xl p-7 rounded-2xl border-2 border-studio-border shadow-pop-2xl relative text-left transition-colors duration-250">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-studio-text hover:bg-studio-hover p-1.5 rounded-full border-2 border-studio-border shadow-pop-xs transition-transform hover:scale-105"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 border-2 border-studio-border flex items-center justify-center text-[#8B5CF6] dark:text-[#A78BFA] shadow-pop-xs">
            <Award className="w-6 h-6 text-[#8B5CF6] dark:text-[#A78BFA]" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-studio-text leading-snug">
              Explainable Scoring Model (100 pts)
            </h2>
            <p className="text-xs font-display font-bold text-studio-muted">
              {candidate.name} &bull; Ranked #{candidate.rank}
            </p>
          </div>
        </div>

        {/* Total Score Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-studio-bg border-2 border-studio-border shadow-pop-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-display font-black text-studio-muted block">
              Aggregate Match Score
            </span>
            <span className="text-3xl font-black font-display text-studio-text">
              {candidate.match_score.toFixed(1)} <span className="text-sm font-bold text-studio-muted">/ 100</span>
            </span>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-full text-xs font-display font-black bg-[#34D399] text-[#1E293B] border border-studio-border shadow-pop-xs">
              Verified with Parallel
            </span>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
          {dimensions.map((dim, idx) => {
            const percentage = Math.round((dim.score / dim.max) * 100);
            return (
              <div key={idx} className="p-3.5 rounded-xl bg-studio-surface border-2 border-studio-border shadow-pop-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-display font-bold text-studio-text">{dim.title}</span>
                  <span className="text-xs font-display font-black text-[#8B5CF6] dark:text-[#A78BFA]">
                    {dim.score} / {dim.max} pts ({percentage}%)
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-3 rounded-full bg-studio-muted border border-studio-border/40 overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: dim.color }}
                  ></div>
                </div>
                <p className="text-[11px] text-studio-muted leading-relaxed font-medium">{dim.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t-2 border-studio-border/20 flex justify-end">
          <button onClick={onClose} className="btn-secondary !py-2 !px-5 text-xs">
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
