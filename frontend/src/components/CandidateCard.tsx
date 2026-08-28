import React, { useState } from 'react';
import { LocationCandidate } from '../types';
import { 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  Search,
  Award,
  Zap
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
    if (score >= 85) return 'bg-[#34D399] text-[#1E293B]';
    if (score >= 70) return 'bg-[#FBBF24] text-[#1E293B]';
    return 'bg-[#F472B6] text-white';
  };

  return (
    <div className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1 transition-all duration-200 relative group text-left">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-display">
            <span className="px-2.5 py-0.5 rounded-full bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 text-[#8B5CF6] dark:text-[#A78BFA] border border-studio-border text-[10px] font-black shadow-pop-xs">
              RANK #{candidate.rank}
            </span>
            <span className="text-xs text-studio-muted font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#8B5CF6]" />
              {candidate.city} &bull; <span className="capitalize">{candidate.location_type}</span>
            </span>
          </div>
          <h3 className="text-lg font-display font-extrabold text-studio-text">
            {candidate.name}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onDeleteCandidate && (
            <button
              onClick={() => onDeleteCandidate(candidate)}
              className="p-2 rounded-xl bg-studio-surface border-2 border-studio-border shadow-pop-xs hover:bg-[#FEE2E2] dark:hover:bg-red-950/40 text-[#EF4444] transition-all"
              title="Reject / Remove Candidate"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}

          {/* Score Dial Button */}
          <button
            onClick={() => onViewScoreBreakdown(candidate)}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl border-2 border-studio-border font-display transition-transform hover:scale-105 cursor-pointer shadow-pop ${getScoreColor(
              candidate.match_score
            )}`}
            title="Click to view full 6-dimension scoring breakdown"
          >
            <span className="text-xl font-black leading-tight">
              {candidate.match_score.toFixed(0)}%
            </span>
            <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-90">
              Score
            </span>
          </button>
        </div>
      </div>

      {/* Description Snippet */}
      <p className="text-xs text-studio-muted mb-4 leading-relaxed font-sans font-medium">
        {candidate.description}
      </p>

      {/* 6-Dimension Score Mini Breakdown */}
      <div
        onClick={() => onViewScoreBreakdown(candidate)}
        className="mb-4 p-3.5 rounded-xl bg-studio-bg border-2 border-studio-border cursor-pointer hover:bg-studio-hover transition-all shadow-pop-xs"
      >
        <div className="flex items-center justify-between text-xs font-display font-bold text-studio-text mb-2.5">
          <span className="flex items-center gap-1.5 text-[#8B5CF6] dark:text-[#A78BFA]">
            <Award className="w-4 h-4" />
            Transparent Scoring Breakdown (100 pts)
          </span>
          <span className="text-[#8B5CF6] dark:text-[#A78BFA] flex items-center text-[10px] uppercase tracking-wider font-bold">
            Inspect Rubric <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs font-display font-bold text-center">
          <div className="bg-studio-surface p-2 rounded-lg border border-studio-border/40">
            <span className="text-studio-muted block text-[9px] uppercase font-semibold">Visual</span>
            <span className="font-extrabold text-[#8B5CF6] dark:text-[#A78BFA]">{candidate.score_breakdown.visual_match}/25</span>
          </div>
          <div className="bg-studio-surface p-2 rounded-lg border border-studio-border/40">
            <span className="text-studio-muted block text-[9px] uppercase font-semibold">Reqs</span>
            <span className="font-extrabold text-[#F472B6]">{candidate.score_breakdown.location_requirements}/20</span>
          </div>
          <div className="bg-studio-surface p-2 rounded-lg border border-studio-border/40">
            <span className="text-studio-muted block text-[9px] uppercase font-semibold">Access</span>
            <span className="font-extrabold text-[#34D399]">{candidate.score_breakdown.accessibility}/15</span>
          </div>
        </div>
      </div>

      {/* Strengths & Risks Matrix */}
      <div className="space-y-3 mb-4 text-xs">
        {candidate.strengths.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-display font-black uppercase tracking-wider text-[#059669] dark:text-[#34D399] block">
              Verified Production Strengths
            </span>
            {candidate.strengths.map((str, idx) => (
              <div key={idx} className="flex items-start gap-2 text-studio-text font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                <span className="text-xs leading-tight">{str}</span>
              </div>
            ))}
          </div>
        )}

        {candidate.risks.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-display font-black uppercase tracking-wider text-[#D97706] dark:text-[#FBBF24] block">
              Production Risks & Mitigations
            </span>
            {candidate.risks.map((risk, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FEF3C7] dark:bg-amber-950/40 border-2 border-studio-border text-[#92400E] dark:text-amber-200 shadow-pop-xs">
                <AlertTriangle className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24] shrink-0 mt-0.5" />
                <div className="text-xs leading-tight font-medium">
                  <span className="font-bold text-studio-text block">{risk.description}</span>
                  <span className="text-[#78350F] dark:text-amber-300/80 text-[11px] block mt-1">
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
        <div className="pt-3.5 border-t-2 border-studio-border/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-display font-black uppercase tracking-wider text-[#D97706] dark:text-[#FBBF24] flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#FBBF24]" />
              Parallel Search Citations ({candidate.evidence.length})
            </span>
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-[10px] font-display font-bold text-[#8B5CF6] dark:text-[#A78BFA] hover:underline"
            >
              {showEvidence ? 'Hide Citations' : 'View Citations'}
            </button>
          </div>

          {showEvidence && (
            <div className="space-y-2.5 pt-1">
              {candidate.evidence.map((ev, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs shadow-pop-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-display font-bold text-studio-text truncate">
                      {ev.source_title || 'Web Source'}
                    </span>
                    {ev.source_url && (
                      <a
                        href={ev.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8B5CF6] dark:text-[#A78BFA] hover:underline flex items-center gap-1 text-[10px] shrink-0 font-bold"
                      >
                        <span>Visit URL</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-studio-muted italic text-[11px] leading-relaxed">
                    "{ev.excerpt}"
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-display font-bold text-studio-muted">
                    <span>Supports: {ev.requirement}</span>
                    <span className="px-2 py-0.5 rounded-full bg-studio-surface border border-studio-border/40 uppercase">
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
        <div className="mt-3.5 pt-3 border-t-2 border-studio-border/20 text-xs text-studio-muted flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-[#FBBF24] shrink-0" />
          <span><strong className="text-studio-text">Next Step:</strong> {candidate.recommended_action}</span>
        </div>
      )}
    </div>
  );
};
