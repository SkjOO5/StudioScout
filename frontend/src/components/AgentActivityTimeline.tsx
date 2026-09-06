import React from 'react';
import { AgentRun, StepStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Loader2, 
  Search, 
  Sparkles, 
  Activity,
  Zap
} from 'lucide-react';

interface AgentActivityTimelineProps {
  run: AgentRun | null;
  isLoading?: boolean;
}

export const AgentActivityTimeline: React.FC<AgentActivityTimelineProps> = ({ run, isLoading }) => {
  if (!run && !isLoading) {
    return (
      <div className="sketch-card p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch text-center text-studio-muted transition-colors duration-200">
        <div className="w-12 h-12 rounded-wobbly bg-studio-yellow text-slate-950 border-2 border-studio-border flex items-center justify-center mx-auto mb-3 shadow-sketch-xs">
          <Zap className="w-6 h-6 text-slate-950" />
        </div>
        <p className="text-sm font-display font-black uppercase tracking-wider text-studio-text">Autonomous Agent Idle</p>
        <p className="text-sm text-studio-secondary mt-1 font-hand font-normal">Ready to receive screenplay material</p>
      </div>
    );
  }

  const getToolBadge = (tool?: string) => {
    if (tool === 'parallel_search') {
      return (
        <span className="px-2 py-0.5 rounded-wobbly text-[10px] font-hand font-bold bg-studio-yellow text-slate-950 border border-studio-border shadow-sketch-xs flex items-center gap-1">
          <Search className="w-2.5 h-2.5" /> Parallel Search
        </span>
      );
    }
    if (tool === 'gemini') {
      return (
        <span className="px-2 py-0.5 rounded-wobbly text-[10px] font-hand font-bold bg-studio-red text-white border border-studio-border shadow-sketch-xs flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Gemini
        </span>
      );
    }
    return null;
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-studio-red animate-spin shrink-0" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-accent-red-safe shrink-0" />;
      default:
        return <Clock className="w-4 h-4 text-studio-muted shrink-0" />;
    }
  };

  return (
    <div className="sketch-card p-5 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch relative overflow-hidden text-left transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b-2 border-dashed border-studio-border/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-wobbly bg-studio-yellow text-slate-950 flex items-center justify-center border-2 border-studio-border shadow-sketch-xs">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-display font-black uppercase tracking-wider text-studio-text">
            Agent Telemetry Stream
          </h3>
        </div>
        {run && (
          <span className={`px-2.5 py-0.5 rounded-wobbly text-xs font-hand font-bold uppercase tracking-wide border border-studio-border shadow-sketch-xs ${
            run.state === 'completed'
              ? 'bg-emerald-400 text-slate-950'
              : run.state === 'failed'
              ? 'bg-studio-red text-white' // FIX 1: safe contrast white on red
              : 'bg-studio-yellow text-slate-950 animate-pulse'
          }`}>
            {run.state}
          </span>
        )}
      </div>

      {/* Telemetry Counters */}
      {run && (
        <div className="grid grid-cols-3 gap-2 mb-4 p-2.5 rounded-wobbly-md bg-studio-bg border-2 border-studio-border text-center font-hand shadow-sketch-xs">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-studio-muted">Scenes</span>
            <span className="text-base font-black text-studio-text font-display">{run.scenes_processed}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-studio-text">Parallel Hits</span>
            <span className="text-base font-black text-studio-text font-display">{run.searches_performed}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-studio-muted">Scored</span>
            <span className="text-base font-black text-studio-text font-display">{run.candidates_found}</span>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {run?.steps.map((step, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-wobbly border-2 text-xs transition-all ${
              step.status === 'running'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-studio-yellow shadow-sketch-xs'
                : step.status === 'completed'
                ? 'bg-studio-bg border-studio-border'
                : 'bg-studio-bg border-dashed border-studio-border/50 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {getStatusIcon(step.status)}
                <span className="font-display font-bold text-studio-text">
                  {step.title}
                </span>
              </div>
              {getToolBadge(step.tool)}
            </div>

            {step.description && (
              <p className="text-xs text-studio-secondary font-hand pl-6 leading-relaxed">
                {step.description}
              </p>
            )}

            {step.error && (
              <p className="text-xs text-accent-red-safe font-hand pl-6 mt-1 font-bold">
                {step.error}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
