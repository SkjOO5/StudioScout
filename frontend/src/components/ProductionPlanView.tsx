import React from 'react';
import { ProductionPlan, ShootingDay, ShootingBlock } from '../types';
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Film, 
  Layers,
  ArrowRight,
  RefreshCw,
  Zap,
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
    <div className="space-y-6 text-left transition-colors duration-250">
      {/* Plan Header Card */}
      <div className="bg-studio-surface p-7 rounded-2xl border-2 border-studio-border shadow-pop relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#8B5CF6] text-white border border-studio-border text-xs font-display font-black shadow-pop-xs">
                PLAN VERSION {plan.version}
              </span>
              {plan.replan_reason && (
                <span className="px-3 py-1 rounded-full bg-[#FBBF24] text-[#1E293B] border border-studio-border text-xs font-display font-black shadow-pop-xs">
                  Updated from Constraint
                </span>
              )}
            </div>
            <h2 className="text-2xl font-display font-extrabold text-studio-text mb-2">
              Autonomous Shooting &amp; Scouting Schedule
            </h2>
            <p className="text-xs sm:text-sm text-studio-muted leading-relaxed max-w-2xl font-medium">
              {plan.summary || 'Optimized multi-day shooting schedule grouped by location proximity and lighting feasibility.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 shrink-0">
            <div className="p-3.5 rounded-2xl bg-studio-bg border-2 border-studio-border shadow-pop-xs text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-display font-bold text-studio-muted block">Total Days</span>
              <span className="text-2xl font-display font-black text-studio-text">{plan.total_days || plan.shooting_days.length}</span>
            </div>

            {onOpenExportModal && (
              <button
                onClick={() => onOpenExportModal()}
                className="btn-candy-purple !py-3.5 !px-5 text-xs font-display font-bold flex items-center gap-2 shadow-pop hover:shadow-pop-hover"
              >
                <Download className="w-4 h-4" />
                <span>Export Hub (PDF / ICS)</span>
              </button>
            )}

            <button
              onClick={onOpenReplanModal}
              className="btn-candy-yellow !py-3.5 !px-5 text-xs font-display font-bold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-[#1E293B]" />
              <span>Modify Constraints</span>
            </button>
          </div>
        </div>

        {plan.replan_reason && (
          <div className="mt-5 p-3.5 rounded-xl bg-[#FEF3C7] dark:bg-amber-950/40 border-2 border-studio-border text-xs text-[#92400E] dark:text-amber-200 font-medium flex items-start gap-2 shadow-pop-xs">
            <AlertTriangle className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24] shrink-0 mt-0.5" />
            <div>
              <strong className="text-studio-text">Re-plan Trigger:</strong> {plan.replan_reason}
            </div>
          </div>
        )}
      </div>

      {/* Daily Call Sheets / Day Blocks */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#8B5CF6]"></span>
            <h3 className="text-xs font-display font-black uppercase tracking-wider text-studio-text">
              Day-by-Day Production Schedule
            </h3>
          </div>

          {onOpenExportModal && (
            <button
              onClick={() => onOpenExportModal()}
              className="text-xs font-display font-bold text-[#8B5CF6] hover:underline flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Production Bible PDF</span>
            </button>
          )}
        </div>

        {plan.shooting_days.map((day, idx) => (
          <div key={idx} className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-0.5 transition-all">
            {/* Day Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b-2 border-studio-border/20 gap-3">
              <div className="flex items-center gap-3.5">
                <span className="px-3.5 py-1 rounded-full bg-[#8B5CF6] border-2 border-studio-border text-white font-display font-black text-sm shadow-pop-xs">
                  {day.date_label || `DAY ${day.day_number}`}
                </span>
                <div>
                  <h4 className="text-base font-display font-bold text-studio-text">{day.location}</h4>
                  <p className="text-xs text-studio-muted font-medium">
                    Call: <strong className="text-studio-text font-mono">{day.call_time}</strong> &bull; Wrap: <strong className="text-studio-text font-mono">{day.wrap_time}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-display font-bold bg-studio-muted border border-studio-border/30 text-studio-text">
                  <Users className="w-3.5 h-3.5 text-[#8B5CF6]" /> ~{day.crew_size || 25} Crew
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-display font-bold border ${
                  day.complexity === 'high' 
                    ? 'bg-[#FFE4E6] dark:bg-rose-950/40 text-[#E11D48] dark:text-rose-300 border-[#FDA4AF] dark:border-rose-800' 
                    : day.complexity === 'low' 
                    ? 'bg-[#D1FAE5] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-300 border-[#6EE7B7] dark:border-emerald-800' 
                    : 'bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] dark:text-amber-300 border-[#FDE68A] dark:border-amber-800'
                }`}>
                  {day.complexity} complexity
                </span>

                {onOpenExportModal && (
                  <button
                    onClick={() => onOpenExportModal(day.day_number)}
                    className="p-1.5 px-3 rounded-xl bg-studio-bg border border-studio-border hover:border-[#F472B6] text-studio-muted hover:text-[#F472B6] text-xs font-display font-bold flex items-center gap-1.5 transition-colors shadow-pop-xs"
                    title={`Export Day ${day.day_number} Call Sheet PDF`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Call Sheet PDF</span>
                  </button>
                )}
              </div>
            </div>

            {/* Hourly Schedule Blocks */}
            <div className="space-y-2.5 mb-4">
              {day.blocks.map((block, bIdx) => (
                <div 
                  key={bIdx}
                  className="p-3 rounded-xl bg-studio-bg border-2 border-studio-border flex items-start justify-between gap-3 text-xs shadow-pop-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-[#8B5CF6] dark:text-[#A78BFA] shrink-0 w-28">
                      {block.start_time} - {block.end_time}
                    </span>
                    <div>
                      <span className="font-display font-bold text-studio-text block">{block.activity}</span>
                      {block.notes && (
                        <span className="text-[11px] text-studio-muted block mt-0.5 font-medium">{block.notes}</span>
                      )}
                    </div>
                  </div>

                  {block.scene_number && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 border border-studio-border text-[10px] font-display font-black text-[#8B5CF6] dark:text-[#A78BFA] shrink-0 shadow-pop-xs">
                      Scene {block.scene_number}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Day Notes */}
            {day.notes.length > 0 && (
              <div className="pt-2 border-t border-studio-border/20 flex flex-wrap gap-2 text-xs text-studio-muted font-medium">
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
        <div className="p-6 rounded-2xl bg-studio-surface border-2 border-studio-border shadow-pop">
          <h4 className="text-xs font-display font-black uppercase tracking-wider text-studio-text mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]"></span>
            Active Constraints Handled by Agent
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.constraints.map((c, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-studio-bg border border-studio-border/60 text-xs font-medium">
                <span className="px-2 py-0.5 rounded-md bg-studio-muted text-studio-text font-mono text-[10px] uppercase font-bold mr-2">
                  {c.type}
                </span>
                <span className="text-studio-text">{c.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
