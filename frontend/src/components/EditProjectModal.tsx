import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Project, Genre, BudgetTier } from '../types';
import { api } from '../lib/api';

interface EditProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSuccess: (updated: Project) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState<Genre>('thriller');
  const [productionCity, setProductionCity] = useState('');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('mid');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setGenre(project.genre);
      setProductionCity(project.production_city);
      setBudgetTier(project.budget_tier);
      setError(null);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !productionCity.trim()) {
      setError('Project name and production city are required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const updated = await api.updateProject(project.id, {
        name: name.trim(),
        genre,
        production_city: productionCity.trim(),
        budget_tier: budgetTier,
      });
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to update project.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-pop-in text-left">
      <div className="sketch-card w-full max-w-lg rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch-lg overflow-hidden flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="p-5 bg-studio-bg border-b-2 border-studio-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-wobbly bg-studio-yellow text-slate-950 border-2 border-studio-border flex items-center justify-center shadow-sketch-xs text-lg font-display font-bold">
              ✏️
            </div>
            <div>
              <h3 className="text-xl font-display font-extrabold text-studio-text">
                Edit Production Details
              </h3>
              <p className="text-xs font-hand font-bold text-studio-secondary">
                Update metadata for <span className="text-studio-text font-bold">{project.name}</span>
              </p>
            </div>
          </div>

          {/* FIX 4: Close button touch target >= 44x44px */}
          <button
            onClick={onClose}
            className="touch-target min-w-[44px] min-h-[44px] p-2 rounded-wobbly bg-studio-surface text-studio-text border-2 border-studio-border flex items-center justify-center shadow-sketch-xs hover:bg-studio-red hover:text-white transition-all cursor-pointer"
            aria-label="Close edit project modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* FIX 1: WCAG AA compliant error message */}
          {error && (
            <div className="p-3 rounded-wobbly bg-red-100 dark:bg-rose-950/60 border-2 border-studio-border text-xs font-hand font-bold text-accent-red-safe">
              {error}
            </div>
          )}

          <div>
            <label className="label">Project Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input font-display text-base"
              required
            />
          </div>

          <div>
            <label className="label">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value as Genre)}
              className="input"
            >
              <option value="thriller">Thriller / Neo-Noir</option>
              <option value="action">Action / Adventure</option>
              <option value="drama">Drama</option>
              <option value="sci-fi">Sci-Fi / Futuristic</option>
              <option value="horror">Horror / Mystery</option>
              <option value="comedy">Comedy</option>
              <option value="documentary">Documentary</option>
              <option value="romance">Romance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="label">Production City</label>
            <input
              type="text"
              value={productionCity}
              onChange={(e) => setProductionCity(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Budget Scale Tier</label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value as BudgetTier)}
              className="input"
            >
              <option value="micro">Micro-Budget (&lt; $100K)</option>
              <option value="low">Low Budget ($100K - $1M)</option>
              <option value="mid">Mid Tier ($1M - $10M)</option>
              <option value="high">High Budget ($10M - $100M)</option>
              <option value="blockbuster">Studio Blockbuster (&gt; $100M)</option>
            </select>
          </div>

          {/* Action Footer */}
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
              disabled={isSaving}
              className="btn-sketch min-h-[44px] !py-2.5 !px-6 text-sm font-hand font-bold flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-studio-yellow" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
