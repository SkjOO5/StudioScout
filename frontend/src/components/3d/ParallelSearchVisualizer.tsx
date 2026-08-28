import React, { useState, useEffect } from 'react';
import { Search, Globe, ExternalLink, ShieldCheck, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { ResearchSource } from '../../types';

interface ParallelSearchVisualizerProps {
  sources: ResearchSource[];
  isSearching?: boolean;
  activeQuery?: string;
}

export const ParallelSearchVisualizer: React.FC<ParallelSearchVisualizerProps> = ({
  sources,
  isSearching = false,
  activeQuery,
}) => {
  const [displayedSources, setDisplayedSources] = useState<ResearchSource[]>([]);

  useEffect(() => {
    if (sources.length > 0) {
      // Stagger presentation of sources for cinematic telemetry feel
      setDisplayedSources(sources.slice(0, 8));
    }
  }, [sources]);

  return (
    <div className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop relative overflow-hidden text-left transition-colors duration-250">
      {/* Background Radial Radar Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8B5CF6]/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b-2 border-studio-border/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] dark:bg-amber-500/20 border-2 border-studio-border flex items-center justify-center text-[#D97706] dark:text-amber-400 shadow-pop-xs">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-display font-black text-studio-text uppercase tracking-wider">
                Parallel Search Live Intelligence
              </h3>
              <span className="status-pill-amber">Partner Runtime</span>
            </div>
            <p className="text-xs text-studio-muted font-medium">
              Live multi-query web research dispatched via official Parallel SDK
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSearching ? (
            <span className="status-pill-amber animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> Querying Live Web
            </span>
          ) : (
            <span className="status-pill-emerald">
              <CheckCircle2 className="w-3 h-3" /> {sources.length} Sources Grounded
            </span>
          )}
        </div>
      </div>

      {/* Radar Network Graph Visualizer */}
      <div className="relative py-6 px-2 mb-6 bg-studio-bg rounded-xl border-2 border-studio-border min-h-[220px] flex items-center justify-center shadow-inner">
        {/* Animated Central Node (PARALLEL) */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-0.5 shadow-pop-yellow flex items-center justify-center animate-float">
              <div className="w-full h-full bg-studio-surface rounded-[14px] flex flex-col items-center justify-center border border-studio-border/40">
                <span className="text-[11px] font-black text-[#D97706] dark:text-amber-400 font-mono tracking-tighter">
                  PARALLEL
                </span>
                <span className="text-[8px] text-studio-dim uppercase font-bold">Search API</span>
              </div>
            </div>
            {/* Pulsing radar rings */}
            <div className="absolute -inset-3 rounded-2xl border border-amber-500/30 animate-ping pointer-events-none"></div>
            <div className="absolute -inset-6 rounded-3xl border border-amber-500/20 animate-pulse pointer-events-none"></div>
          </div>
          {activeQuery && (
            <span className="mt-2.5 text-[10px] font-mono font-bold text-studio-text bg-studio-surface px-2.5 py-1 rounded-full border border-studio-border max-w-[220px] truncate shadow-pop-xs">
              {activeQuery}
            </span>
          )}
        </div>

        {/* Orbiting Discovered Source Nodes */}
        {displayedSources.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {displayedSources.map((src, i) => {
              const total = displayedSources.length;
              const angle = (i / total) * Math.PI * 2;
              const radiusX = 140;
              const radiusY = 75;
              const x = Math.cos(angle) * radiusX;
              const y = Math.sin(angle) * radiusY;

              return (
                <div
                  key={src.id || i}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className="absolute pointer-events-auto group/node"
                >
                  <div className="px-2.5 py-1 rounded-lg bg-studio-surface border-2 border-studio-border hover:border-[#8B5CF6] text-[10px] font-mono text-studio-muted hover:text-studio-text shadow-pop-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <Globe className="w-3 h-3 text-[#8B5CF6] dark:text-cyan-400 shrink-0" />
                    <span className="max-w-[100px] truncate font-bold">{src.domain || 'Source'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Citations Ledger */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-display font-black uppercase tracking-wider text-studio-dim block">
          Verified Evidence Ledger ({sources.length} Documents)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
          {sources.slice(0, 6).map((src, idx) => (
            <div key={src.id || idx} className="p-3 rounded-xl bg-studio-bg border-2 border-studio-border text-xs shadow-pop-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-display font-bold text-studio-text text-[11px] truncate">
                  {src.title}
                </span>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B5CF6] dark:text-cyan-400 hover:underline flex items-center gap-1 text-[10px] shrink-0 font-bold"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              {src.excerpt && (
                <p className="text-studio-muted text-[11px] italic line-clamp-2 leading-relaxed font-medium">
                  "{src.excerpt}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

