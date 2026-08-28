import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, RefreshCw, Layers, Zap } from 'lucide-react';
import { Scene } from '../types';

interface ReplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { constraint: string; constraint_type?: string; affects_location?: string }) => void;
  scenes?: Scene[];
  isSubmitting?: boolean;
}

export const ReplanModal: React.FC<ReplanModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  scenes = [],
  isSubmitting = false,
}) => {
  const [constraint, setConstraint] = useState('');
  const [constraintType, setConstraintType] = useState('availability');
  const [affectsLocation, setAffectsLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!constraint.trim()) return;
    onSubmit({
      constraint: constraint.trim(),
      constraint_type: constraintType,
      affects_location: affectsLocation.trim() || undefined,
    });
  };

  const sampleConstraints = [
    { text: 'The industrial warehouse is unavailable on Saturday due to maintenance.', type: 'availability' },
    { text: 'Forecast heavy rain prevents outdoor rooftop chase shooting on Day 1.', type: 'weather' },
    { text: 'Hospital location permit delayed by 48 hours for administrative review.', type: 'permit' },
    { text: 'Night shoot curfew restricts exterior filming after 22:00.', type: 'access' },
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-pop-in">
      <div className="bg-studio-surface w-full max-w-lg p-7 rounded-2xl border-2 border-studio-border shadow-pop-2xl relative text-left transition-colors duration-250">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-studio-text hover:bg-studio-hover p-1.5 rounded-full border-2 border-studio-border shadow-pop-xs transition-transform hover:scale-105"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] dark:bg-amber-950/40 border-2 border-studio-border flex items-center justify-center text-[#D97706] dark:text-[#FBBF24] shadow-pop-xs">
            <RefreshCw className="w-6 h-6 text-[#D97706] dark:text-[#FBBF24]" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-studio-text leading-snug">
              Autonomous Production Re-planning
            </h2>
            <p className="text-xs font-display font-bold text-studio-muted">
              Simulate production shifts, venue blackouts, or budget pivots
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Quick Disruptive Scenarios</label>
            <div className="space-y-1.5">
              {sampleConstraints.map((sc, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setConstraint(sc.text);
                    setConstraintType(sc.type);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-studio-bg hover:bg-studio-hover border-2 border-studio-border text-xs font-medium text-studio-text transition-all flex items-start gap-2 shadow-pop-xs"
                >
                  <span className="text-[#8B5CF6] dark:text-[#A78BFA] font-bold">&bull;</span>
                  <span>{sc.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom constraint text */}
          <div>
            <label className="label">Constraint Description</label>
            <textarea
              value={constraint}
              onChange={(e) => setConstraint(e.target.value)}
              placeholder="e.g. Warehouse location A is unavailable on Saturday; need alternative venue or day shift..."
              className="input h-24 resize-none text-xs font-medium"
              required
            />
          </div>

          {/* Constraint Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Constraint Type</label>
              <select
                value={constraintType}
                onChange={(e) => setConstraintType(e.target.value)}
                className="input text-xs"
              >
                <option value="availability">Venue Availability</option>
                <option value="weather">Weather Conflict</option>
                <option value="permit">Permit / Legal</option>
                <option value="budget">Budget Constraint</option>
                <option value="access">Access / Curfew</option>
              </select>
            </div>

            <div>
              <label className="label">Target Location (Optional)</label>
              <input
                type="text"
                value={affectsLocation}
                onChange={(e) => setAffectsLocation(e.target.value)}
                placeholder="e.g. Warehouse"
                className="input text-xs font-medium"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-studio-border/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary !py-2.5 !px-5 text-xs"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-candy-yellow !py-2.5 !px-6 text-xs font-display font-bold flex items-center gap-2"
              disabled={isSubmitting || !constraint.trim()}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#1E293B]" />
                  <span>Agent Re-planning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#1E293B]" />
                  <span>Trigger Autonomous Re-plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
