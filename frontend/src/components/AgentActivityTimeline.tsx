import React from 'react';
import { AgentRun, StepStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Loader2, 
  Search, 
  Sparkles, 
  Layers, 
  Calendar,
  Activity,
  Radar,
  Zap
} from 'lucide-react';

interface AgentActivityTimelineProps {
  run: AgentRun | null;
  isLoading?: boolean;
}

export const AgentActivityTimeline: React.FC<AgentActivityTimelineProps> = ({ run, isLoading }) => {
  if (!run && !isLoading) {
    return (
      <div className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop text-center text-studio-muted transition-colors duration-250">
        <div className="w-12 h-12 rounded-full bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 border-2 border-studio-border flex items-center justify-center mx-auto mb-3 shadow-pop-xs">
          <Zap className="w-6 h-6 text-[#8B5CF6] dark:text-[#A78BFA]" />
        </div>
        <p className="text-xs font-display font-black uppercase tracking-wider text-studio-text">Autonomous Agent Idle</p>
        <p className="text-[11px] text-studio-muted mt-1 font-medium">Ready to receive screenplay material</p>
      </div>
    );
  }

  const getToolBadge = (tool?: string) => {
    if (tool === 'parallel_search') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-display font-black bg-[#FBBF24] text-[#1E293B] border border-studio-border shadow-pop-xs flex items-center gap-1">
          <Search className="w-2.5 h-2.5" /> Parallel Search
        </span>
      );
    }
    if (tool === 'gemini') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-display font-black bg-[#8B5CF6] text-white border border-studio-border shadow-pop-xs flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Gemini
        </span>
      );
    }
    return null;
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-[#8B5CF6] dark:text-[#A78BFA] animate-spin shrink-0" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-[#E11D48] shrink-0" />;
      default:
        return <Clock className="w-4 h-4 text-studio-dim shrink-0" />;
    }
  };

  return (
    <div className="bg-studio-surface p-5 rounded-2xl border-2 border-studio-border shadow-pop relative overflow-hidden text-left transition-colors duration-250">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b-2 border-studio-border/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#8B5CF6] text-white flex items-center justify-center border border-studio-border shadow-pop-xs">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-display font-black uppercase tracking-wider text-studio-text">
            Agent Telemetry Stream
          </h3>
        </div>
        {run && (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-display font-black uppercase tracking-wide border border-studio-border shadow-pop-xs ${
            run.state === 'completed'
              ? 'bg-[#34D399] text-[#1E293B]'
              : run.state === 'failed'
              ? 'bg-[#F472B6] text-white'
              : 'bg-[#FBBF24] text-[#1E293B] animate-pulse'
          }`}>
            {run.state}
          </span>
        )}
      </div>

      {/* Telemetry Counters */}
      {run && (
        <div className="grid grid-cols-3 gap-2 mb-4 p-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-center font-display shadow-pop-xs">
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-wider text-studio-muted">Scenes</span>
            <span className="text-sm font-black text-studio-text">{run.scenes_processed}</span>
          </div>
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-wider text-[#D97706] dark:text-[#FBBF24]">Parallel Hits</span>
            <span className="text-sm font-black text-[#D97706] dark:text-[#FBBF24]">{run.searches_performed}</span>
          </div>
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-wider text-[#8B5CF6] dark:text-[#A78BFA]">Candidates</span>
            <span className="text-sm font-black text-[#8B5CF6] dark:text-[#A78BFA]">{run.candidates_found}</span>
          </div>
        </div>
      )}

      {/* Steps Sequence */}
      <div className="space-y-2.5 relative before:absolute before:top-2 before:bottom-2 before:left-[13px] before:w-[2px] before:bg-studio-border/30">
        {run?.steps.map((step, idx) => (
          <div
            key={step.id || idx}
            className={`relative pl-7 transition-all duration-200 ${
              step.status === 'running'
                ? 'scale-[1.01] opacity-100'
                : step.status === 'pending'
                ? 'opacity-40'
                : 'opacity-100'
            }`}
          >
            {/* Status node */}
            <div className="absolute left-1 top-1 -translate-x-1/2 bg-studio-surface rounded-full p-0.5 z-10 border-2 border-studio-border shadow-pop-xs">
              {getStatusIcon(step.status)}
            </div>

            {/* Step card */}
            <div className={`p-3 rounded-xl border-2 text-xs transition-all ${
              step.status === 'running'
                ? 'bg-[#DDD6FE]/30 dark:bg-[#8B5CF6]/20 border-[#8B5CF6] text-studio-text shadow-pop-xs'
                : step.status === 'failed'
                ? 'bg-[#FFE4E6] dark:bg-rose-950/40 border-[#E11D48] text-[#9F1239] dark:text-rose-200'
                : 'bg-studio-surface border-studio-border text-studio-text shadow-pop-xs'
            }`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-display font-bold text-studio-text truncate text-xs">
                  {step.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {getToolBadge(step.tool_used)}
                  {step.duration_ms && (
                    <span className="text-[10px] text-studio-muted font-mono font-bold">
                      {(step.duration_ms / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>

              {step.detail && (
                <p className="text-[11px] text-studio-muted leading-relaxed font-sans font-medium mt-0.5">
                  {step.detail}
                </p>
              )}

              {step.error && (
                <p className="text-[11px] text-[#E11D48] dark:text-rose-300 font-mono font-bold bg-studio-bg p-2 rounded-lg border border-[#FDA4AF] dark:border-rose-800 mt-1">
                  {step.error}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
