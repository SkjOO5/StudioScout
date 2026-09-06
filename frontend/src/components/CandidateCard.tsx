import React, { useState } from 'react';
import { LocationCandidate } from '../types';
import { 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ChevronRight, 
  Sparkles,
  Search,
  Award,
  Trash2
} from 'lucide-react';

interface CandidateCardProps {
  candidate: LocationCandidate;
  onViewScoreBreakdown: (candidate: LocationCandidate) => void;
  onDeleteCandidate?: (candidate: LocationCandidate) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onViewScoreBreakdown,
  onDeleteCandidate,
}) => {
  const [showEvidence, setShowEvidence] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-400 text-slate-950';
    if (score >= 70) return 'bg-studio-yellow text-slate-950';
    return 'bg-studio-red text-white'; // High contrast white on red
  };

  return (
    <div className="sketch-card p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch hover:-translate-y-0.5 transition-all text-left relative group">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-hand">
            <span className="px-3 py-0.5 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border text-xs font-black shadow-sketch-xs">
              RANK #{candidate.rank}
            </span>
            <span className="text-xs text-studio-secondary font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-studio-red" />
              {candidate.city} &bull; <span className="capitalize">{candidate.location_type}</span>
            </span>
          </div>
          <h3 className="text-2xl font-display font-extrabold text-studio-text">
            {candidate.name}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* FIX 4: Delete button touch target >= 44x44px */}
          {onDeleteCandidate && (
            <button
              onClick={() => onDeleteCandidate(candidate)}
              className="touch-target min-w-[44px] min-h-[44px] p-2.5 rounded-wobbly bg-studio-surface border-2 border-studio-border shadow-sketch-xs hover:bg-studio-red hover:text-white text-accent-red-safe transition-all cursor-pointer"
              title="Reject / Remove Candidate"
              aria-label={`Reject ${candidate.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* FIX 4: Score Dial Button with min-w-[56px] min-h-[44px] */}
          <button
            onClick={() => onViewScoreBreakdown(candidate)}
            className={`touch-target min-w-[56px] min-h-[48px] flex flex-col items-center justify-center px-4 py-2 rounded-wobbly border-2 border-studio-border font-display transition-transform hover:scale-105 cursor-pointer shadow-sketch-xs ${getScoreColor(
              candidate.match_score
            )}`}
            title="Click to view full 6-dimension scoring breakdown"
            aria-label={`View score breakdown for ${candidate.name}: ${candidate.match_score.toFixed(0)}%`}
          >
            <span className="text-2xl font-black leading-tight">
              {candidate.match_score.toFixed(0)}%
            </span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-90">
              Score
            </span>
          </button>
        </div>
      </div>

      {/* Description Snippet */}
      <p className="text-sm sm:text-base text-studio-secondary mb-4 leading-relaxed font-hand">
        {candidate.description}
      </p>

      {/* 6-Dimension Score Mini Breakdown */}
      <div
        onClick={() => onViewScoreBreakdown(candidate)}
        className="mb-4 p-3.5 rounded-wobbly-md bg-studio-bg border-2 border-studio-border cursor-pointer hover:bg-studio-hover transition-all shadow-sketch-xs"
      >
        <div className="flex items-center justify-between text-xs font-hand font-bold text-studio-text mb-2.5">
          <span className="flex items-center gap-1.5 text-studio-text">
            <Award className="w-4 h-4 text-studio-yellow" />
            Transparent Scoring Breakdown (100 pts)
          </span>
          <span className="text-studio-redText flex items-center text-xs uppercase tracking-wider font-bold">
            Inspect Rubric <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs font-hand font-bold text-center">
          <div className="bg-studio-surface p-2 rounded-wobbly border border-studio-border">
            <span className="text-studio-secondary dark:text-slate-300 block text-[11px] uppercase font-bold">Visual</span>
            <span className="font-display font-extrabold text-sm text-studio-text">{candidate.score_breakdown.visual_match}/25</span>
          </div>
          <div className="bg-studio-surface p-2 rounded-wobbly border border-studio-border">
            <span className="text-studio-secondary dark:text-slate-300 block text-[11px] uppercase font-bold">Reqs</span>
            <span className="font-display font-extrabold text-sm text-studio-text">{candidate.score_breakdown.location_requirements}/20</span>
          </div>
          <div className="bg-studio-surface p-2 rounded-wobbly border border-studio-border">
            <span className="text-studio-secondary dark:text-slate-300 block text-[11px] uppercase font-bold">Access</span>
            <span className="font-display font-extrabold text-sm text-studio-text">{candidate.score_breakdown.accessibility}/15</span>
          </div>
        </div>
      </div>

      {/* Strengths & Risks Matrix */}
      <div className="space-y-3 mb-4 text-xs">
        {candidate.strengths.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-display font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Verified Production Strengths
            </span>
            {candidate.strengths.map((str, idx) => (
              <div key={idx} className="flex items-start gap-2 text-studio-text font-hand text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-tight">{str}</span>
              </div>
            ))}
          </div>
        )}

        {candidate.risks.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-display font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
              Production Risks &amp; Mitigations
            </span>
            {candidate.risks.map((risk, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-wobbly-md bg-amber-50 dark:bg-amber-950/40 border-2 border-studio-border text-amber-900 dark:text-amber-200 shadow-sketch-xs">
                <AlertTriangle className="w-4 h-4 text-studio-yellow shrink-0 mt-0.5" />
                <div className="text-xs font-hand">
                  <span className="font-bold text-studio-text block text-sm">{risk.description}</span>
                  <span className="text-studio-secondary block mt-1">
                    <strong>Mitigation:</strong> {risk.mitigation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parallel Search Citations Drawer */}
      {candidate.evidence.length > 0 && (
        <div className="pt-3.5 border-t-2 border-dashed border-studio-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-display font-black uppercase tracking-wider text-studio-text flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-studio-yellow" />
              Parallel Search Citations ({candidate.evidence.length})
            </span>
            {/* FIX 4: >=44px touch target on view citations button */}
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="touch-target min-h-[44px] px-2 text-xs font-hand font-bold text-studio-redText hover:underline cursor-pointer"
            >
              {showEvidence ? 'Hide Citations' : 'View Citations'}
            </button>
          </div>

          {showEvidence && (
            <div className="space-y-2.5 pt-1">
              {candidate.evidence.map((ev, idx) => (
                <div key={idx} className="p-3.5 rounded-wobbly-md bg-studio-bg border-2 border-studio-border text-xs shadow-sketch-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-display font-bold text-studio-text truncate">
                      {ev.source_title || 'Web Source'}
                    </span>
                    {ev.source_url && (
                      <a
                        href={ev.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="touch-target min-h-[44px] px-2 text-studio-blue hover:underline flex items-center gap-1 text-xs shrink-0 font-hand font-bold"
                      >
                        <span>Visit URL</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-studio-secondary italic text-xs leading-relaxed font-sans">
                    "{ev.excerpt}"
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs font-hand text-studio-muted">
                    <span>Supports: {ev.requirement}</span>
                    <span className="px-2 py-0.5 rounded-wobbly bg-studio-surface border border-studio-border uppercase font-bold">
                      {ev.confidence} confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommended Next Step */}
      {candidate.recommended_action && (
        <div className="mt-3.5 pt-3 border-t-2 border-dashed border-studio-border/30 text-sm text-studio-secondary flex items-center gap-2 font-hand">
          <Sparkles className="w-4 h-4 text-studio-yellow shrink-0" />
          <span><strong className="text-studio-text font-display">Next Step:</strong> {candidate.recommended_action}</span>
        </div>
      )}
    </div>
  );
};
