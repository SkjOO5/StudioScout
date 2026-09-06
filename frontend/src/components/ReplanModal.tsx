import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-pop-in text-left">
      <div className="sketch-card w-full max-w-lg p-7 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch-lg relative transition-colors duration-200">
        {/* FIX 4: Close button touch target >= 44x44px */}
        <button
          onClick={onClose}
          className="touch-target min-w-[44px] min-h-[44px] absolute top-5 right-5 text-studio-text hover:bg-studio-red hover:text-white p-2 rounded-wobbly border-2 border-studio-border shadow-sketch-xs transition-transform hover:scale-105 cursor-pointer"
          aria-label="Close replan modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-wobbly bg-studio-yellow text-slate-950 border-2 border-studio-border flex items-center justify-center shadow-sketch-xs">
            <RefreshCw className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black text-studio-text leading-snug">
              Autonomous Production Re-planning
            </h2>
            <p className="text-xs font-hand font-bold text-studio-secondary">
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
                  className="w-full text-left p-2.5 rounded-wobbly bg-studio-bg hover:bg-studio-hover border-2 border-studio-border text-xs font-hand font-bold text-studio-text transition-all flex items-start gap-2 shadow-sketch-xs cursor-pointer min-h-[44px]"
                >
                  <span className="text-studio-redText font-bold">&bull;</span>
                  <span>{sc.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Constraint Description</label>
            <textarea
              value={constraint}
              onChange={(e) => setConstraint(e.target.value)}
              placeholder="e.g. Warehouse location A is unavailable on Saturday; need alternative venue or day shift..."
              className="input h-24 resize-none text-sm font-hand"
              required
            />
          </div>

          <div>
            <label className="label">Constraint Category</label>
            <select
              value={constraintType}
              onChange={(e) => setConstraintType(e.target.value)}
              className="input"
            >
              <option value="availability">Venue Availability Blackout</option>
              <option value="weather">Inclement Weather Shift</option>
              <option value="permit">Municipal Permit Delay</option>
              <option value="access">Access / Curfew Constraint</option>
              <option value="budget">Budget / Resource Limitation</option>
            </select>
          </div>

          <div className="pt-4 border-t-2 border-dashed border-studio-border/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary min-h-[44px] !py-2.5 !px-5 text-sm font-hand font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !constraint.trim()}
              className="btn-sketch min-h-[44px] !py-2.5 !px-6 text-sm font-hand font-bold flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-studio-yellow ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Triggering Re-plan...' : 'Re-calculate Production Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
