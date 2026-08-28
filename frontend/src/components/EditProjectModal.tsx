import React, { useState, useEffect } from 'react';
import { X, Sparkles, Film, MapPin, Building, Save } from 'lucide-react';
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-studio-surface w-full max-w-lg rounded-2xl border-2 border-studio-border shadow-pop-lg overflow-hidden flex flex-col transition-colors duration-250">
        {/* Header */}
        <div className="p-5 bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 border-b-2 border-studio-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-studio-surface border-2 border-studio-border flex items-center justify-center shadow-pop-xs text-xl">
              ✏️
            </div>
            <div>
              <h3 className="text-lg font-display font-extrabold text-studio-text">
                Edit Production Details
              </h3>
              <p className="text-xs font-bold text-studio-muted">
                Update metadata for <span className="text-[#7C3AED] dark:text-[#A78BFA]">{project.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-studio-surface text-studio-text border-2 border-studio-border flex items-center justify-center shadow-pop-xs hover:bg-[#FEE2E2] dark:hover:bg-red-950/40 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#FEE2E2] dark:bg-red-950/40 border-2 border-[#EF4444] text-xs font-bold text-[#B91C1C] dark:text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-display font-black text-studio-text block mb-1">
              Project Name / Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface focus:shadow-pop-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-display font-black text-studio-text block mb-1">
                Target City
              </label>
              <input
                type="text"
                required
                value={productionCity}
                onChange={(e) => setProductionCity(e.target.value)}
                placeholder="e.g. Mumbai, Atlanta, London"
                className="w-full px-3.5 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface focus:shadow-pop-xs"
              />
            </div>

            <div>
              <label className="text-xs font-display font-black text-studio-text block mb-1">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as Genre)}
                className="w-full px-3 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface"
              >
                <option value="thriller">Thriller</option>
                <option value="action">Action</option>
                <option value="drama">Drama</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="horror">Horror</option>
                <option value="comedy">Comedy</option>
                <option value="romance">Romance</option>
                <option value="documentary">Documentary</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-display font-black text-studio-text block mb-1">
              Budget Tier
            </label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value as BudgetTier)}
              className="w-full px-3 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface"
            >
              <option value="micro">Micro (&lt; $100K)</option>
              <option value="low">Low ($100K - $1M)</option>
              <option value="mid">Mid Tier ($1M - $10M)</option>
              <option value="high">High Budget ($10M - $100M)</option>
              <option value="blockbuster">Studio Blockbuster (&gt; $100M)</option>
            </select>
          </div>

          <div className="pt-3 border-t-2 border-studio-border/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary !py-2.5 !px-5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-candy !py-2.5 !px-6 text-xs font-display font-black flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'SAVING...' : 'SAVE CHANGES'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
