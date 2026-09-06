import React from 'react';
import { LocationCandidate } from '../types';
import { X, Award, Check } from 'lucide-react';

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
      desc: 'How closely the visual architecture and appearance match screenplay scene descriptions.',
    },
    {
      title: 'Location Requirements Met',
      score: b.location_requirements,
      max: 20,
      desc: 'Adequacy of interior space, ceiling height, staging area, and physical infrastructure.',
    },
    {
      title: 'Accessibility & Logistics',
      score: b.accessibility,
      max: 15,
      desc: 'Loading docks, heavy vehicle/crew truck clearance, parking, and transit access.',
    },
    {
      title: 'Time of Day / Lighting Feasibility',
      score: b.time_lighting,
      max: 15,
      desc: 'Controlled ambient lighting, night shooting feasibility, and electrical grid access.',
    },
    {
      title: 'Production Practicality & Facilities',
      score: b.production_practicality,
      max: 15,
      desc: 'Green rooms, holding areas, crew facilities, restrooms, and noise isolation.',
    },
    {
      title: 'Safety & Risk Clearance',
      score: b.risk_score,
      max: 10,
      desc: 'Permit clarity, environmental hazards, public restriction safety (higher = lower risk).',
    },
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-pop-in text-left">
      <div className="sketch-card w-full max-w-xl p-7 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch-lg relative transition-colors duration-200">
        {/* FIX 4: Close Button touch target >= 44x44px */}
        <button
          onClick={onClose}
          className="touch-target min-w-[44px] min-h-[44px] absolute top-5 right-5 text-studio-text hover:bg-studio-red hover:text-white p-2 rounded-wobbly border-2 border-studio-border shadow-sketch-xs transition-transform hover:scale-105 cursor-pointer"
          aria-label="Close score breakdown"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-wobbly bg-studio-yellow text-slate-950 border-2 border-studio-border flex items-center justify-center shadow-sketch-xs">
            <Award className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black text-studio-text leading-snug">
              Explainable Scoring Model (100 pts)
            </h2>
            <p className="text-xs font-hand font-bold text-studio-secondary">
              {candidate.name} &bull; Ranked #{candidate.rank}
            </p>
          </div>
        </div>

        {/* Total Score Bar */}
        <div className="mb-6 p-4 rounded-wobbly-md bg-studio-bg border-2 border-studio-border shadow-sketch-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-hand font-bold text-studio-secondary dark:text-slate-200 block">
              Aggregate Match Score
            </span>
            <span className="text-3xl font-black font-display text-studio-text">
              {candidate.match_score.toFixed(1)} <span className="text-sm font-hand font-bold text-studio-secondary dark:text-slate-200">/ 100</span>
            </span>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-wobbly text-xs font-hand font-black bg-emerald-400 text-slate-950 border border-studio-border shadow-sketch-xs">
              Verified with Parallel
            </span>
          </div>
        </div>

        {/* 6 Dimension List */}
        <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
          {dimensions.map((dim, idx) => {
            const pct = Math.round((dim.score / dim.max) * 100);
            return (
              <div key={idx} className="p-3.5 rounded-wobbly bg-studio-bg border border-studio-border text-xs space-y-1.5">
                <div className="flex items-center justify-between font-hand font-bold">
                  <span className="text-studio-text text-sm">{dim.title}</span>
                  <span className="text-studio-text font-mono font-bold">
                    {dim.score} / {dim.max} pts ({pct}%)
                  </span>
                </div>
                <p className="font-hand text-xs text-studio-secondary leading-relaxed">{dim.desc}</p>
                <div className="w-full bg-studio-surface h-2 rounded-full border border-studio-border overflow-hidden">
                  <div
                    className="h-full bg-studio-yellow transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
