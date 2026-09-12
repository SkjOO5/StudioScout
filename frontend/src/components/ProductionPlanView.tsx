import React from 'react';
import { ProductionPlan, ShootingDay, ShootingBlock } from '../types';
import { 
  Users, 
  AlertTriangle, 
  RefreshCw,
  Download,
  FileText
} from 'lucide-react';

interface ProductionPlanViewProps {
  plan: ProductionPlan;
  onOpenReplanModal: () => void;
  onOpenExportModal?: (dayNumber?: number) => void;
}

export const ProductionPlanView: React.FC<ProductionPlanViewProps> = ({
  plan,
  onOpenReplanModal,
  onOpenExportModal,
}) => {
  return (
    <div className="space-y-6 text-left transition-colors duration-200">
      {/* Plan Header Card styled as physical clipboard */}
      <div className="sketch-card sketch-tape p-7 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border text-xs font-hand font-bold shadow-sketch-xs">
                PLAN VERSION {plan.version}
              </span>
              {plan.replan_reason && (
                <span className="px-3 py-1 rounded-wobbly bg-studio-muted text-studio-text border border-studio-border text-xs font-hand font-bold shadow-sketch-xs">
                  Updated from Constraint
                </span>
              )}
            </div>
            <h2 className="text-3xl font-display font-extrabold text-studio-text mb-2">
              Autonomous Shooting &amp; Scouting Schedule
            </h2>
            {/* FIX 2: Clear, comfortable body text */}
            <p className="font-sans text-sm sm:text-base text-studio-secondary leading-relaxed max-w-2xl">
              {plan.summary || 'Optimized multi-day shooting schedule grouped by location proximity and lighting feasibility.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 shrink-0">
            <div className="p-3.5 rounded-wobbly-md bg-studio-bg border-2 border-studio-border shadow-sketch-xs text-center min-w-[100px]">
              <span className="text-xs uppercase font-hand font-bold text-studio-secondary dark:text-slate-200 block">Total Days</span>
              <span className="text-3xl font-display font-black text-studio-text">{plan.total_days || plan.shooting_days.length}</span>
            </div>

            {onOpenExportModal && (
              <button
                onClick={() => onOpenExportModal()}
                className="btn-sketch min-h-[44px] !py-3 !px-5 text-sm font-hand font-bold flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-studio-yellow" />
                <span>Export Hub (PDF / ICS)</span>
              </button>
            )}

            <button
              onClick={onOpenReplanModal}
              className="btn-sketch-yellow min-h-[44px] !py-3 !px-5 text-sm font-hand font-bold flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-slate-900" />
              <span>Modify Constraints</span>
            </button>
          </div>
        </div>

        {plan.replan_reason && (
          <div className="mt-5 p-3.5 rounded-wobbly-md bg-amber-50 dark:bg-amber-950/40 border-2 border-studio-border text-sm text-slate-800 dark:text-amber-200 font-hand font-bold flex items-start gap-2 shadow-sketch-xs">
            <AlertTriangle className="w-5 h-5 text-studio-yellow shrink-0 mt-0.5" />
            <div>
              <strong className="text-studio-text font-display">Re-plan Trigger:</strong> {plan.replan_reason}
            </div>
          </div>
        )}
      </div>

      {/* Daily Call Sheets / Day Blocks */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-studio-red"></span>
            <h3 className="text-sm font-display font-black uppercase tracking-wider text-studio-text">
              Day-by-Day Production Schedule
            </h3>
          </div>

          {onOpenExportModal && (
            <button
              onClick={() => onOpenExportModal()}
              className="text-sm font-hand font-bold text-studio-redText hover:underline flex items-center gap-1.5 cursor-pointer min-h-[44px] px-2"
            >
              <FileText className="w-4 h-4" />
              <span>Download Production Bible PDF</span>
            </button>
          )}
        </div>

        {plan.shooting_days.map((day, idx) => (
          <div key={idx} className="sketch-card p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch hover:-translate-y-0.5 transition-all">
            {/* Day Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b-2 border-dashed border-studio-border/30 gap-3">
              <div className="flex items-center gap-3.5">
                <span className="px-3.5 py-1.5 rounded-wobbly bg-studio-yellow border-2 border-studio-border text-slate-950 font-display font-black text-base shadow-sketch-xs">
                  {day.date_label || `DAY ${day.day_number}`}
                </span>
                <div>
                  <h4 className="text-xl font-display font-bold text-studio-text">{day.location}</h4>
                  <p className="text-sm font-hand font-bold text-studio-secondary">
                    Call: <strong className="text-studio-text font-mono">{day.call_time}</strong> &bull; Wrap: <strong className="text-studio-text font-mono">{day.wrap_time}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-wobbly text-xs font-hand font-bold bg-studio-muted border border-studio-border/40 text-studio-text">
                  <Users className="w-3.5 h-3.5 text-studio-red" /> ~{day.crew_size || 25} Crew
                </span>

                {/* FIX 1: High-contrast badges for complexity */}
                <span className={`inline-flex items-center px-3 py-1 rounded-wobbly text-xs font-hand font-bold border ${
                  day.complexity === 'high' 
                    ? 'bg-red-100 dark:bg-rose-950/60 text-accent-red-safe border-studio-border' 
                    : day.complexity === 'low' 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-studio-border' 
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-studio-border'
                }`}>
                  {day.complexity} complexity
                </span>

                {onOpenExportModal && (
                  /* FIX 4: min-h-[44px] touch target */
                  <button
                    onClick={() => onOpenExportModal(day.day_number)}
                    className="min-h-[44px] px-3.5 py-1.5 rounded-wobbly bg-studio-bg border-2 border-studio-border text-studio-text hover:bg-studio-yellow hover:text-slate-950 text-xs font-hand font-bold flex items-center gap-1.5 transition-colors shadow-sketch-xs cursor-pointer"
                    title={`Export Day ${day.day_number} Call Sheet PDF`}
                  >
                    <Download className="w-3.5 h-3.5 text-studio-red" />
                    <span>Call Sheet PDF</span>
                  </button>
                )}
              </div>
            </div>

            {/* Hourly Schedule Blocks — Responsive across mobile & desktop */}
            <div className="space-y-2.5 mb-4">
              {day.blocks.map((block, bIdx) => (
                <div
                  key={bIdx}
                  className="p-3 sm:p-3.5 rounded-wobbly-md bg-studio-bg border-2 border-studio-border flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3 text-xs shadow-sketch-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3 flex-1 min-w-0">
                    <span className="font-mono text-xs font-bold text-studio-text shrink-0 sm:w-28 pt-0.5">
                      {block.start_time} - {block.end_time}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-sans font-semibold text-sm text-studio-text block">{block.activity}</span>
                      {block.notes && (
                        <span className="font-sans text-xs text-studio-secondary block mt-0.5 leading-relaxed">{block.notes}</span>
                      )}
                    </div>
                  </div>

                  {block.scene_number && (
                    <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border text-xs font-hand font-black shrink-0 shadow-sketch-xs">
                      Scene {block.scene_number}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Day Notes */}
            {day.notes.length > 0 && (
              <div className="pt-2 border-t border-dashed border-studio-border/30 flex flex-wrap gap-2 text-xs font-sans text-studio-secondary">
                {day.notes.map((n, nIdx) => (
                  <span key={nIdx} className="inline-flex items-center gap-1">
                    &bull; {n}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Constraints & Watchout List */}
      {plan.constraints.length > 0 && (
        <div className="p-6 rounded-wobbly-md bg-studio-surface border-[2.5px] border-studio-border shadow-sketch">
          <h4 className="text-sm font-display font-black uppercase tracking-wider text-studio-text mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-studio-yellow"></span>
            Active Constraints Handled by Agent
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.constraints.map((c, idx) => (
              <div key={idx} className="p-3.5 rounded-wobbly-md bg-studio-bg border border-studio-border text-xs font-medium">
                <span className="px-2 py-0.5 rounded-wobbly bg-studio-muted text-studio-text font-mono text-xs uppercase font-bold mr-2 border border-studio-border/30">
                  {c.type}
                </span>
                <span className="font-sans text-sm text-studio-text">{c.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
