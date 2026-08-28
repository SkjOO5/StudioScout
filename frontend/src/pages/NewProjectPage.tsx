import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Film, 
  Upload, 
  FileText, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  X,
  Compass,
  Zap,
  Star
} from 'lucide-react';
import { 
  DEMO_PROJECT_NAME, 
  DEMO_PROJECT_CITY, 
  DEMO_PROJECT_GENRE, 
  DEMO_PROJECT_BUDGET, 
  DEMO_SCREENPLAY_TEXT 
} from '../lib/demoData';
import { api } from '../lib/api';
import { FileUpload } from '../components/ui/file-upload';

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [genre, setGenre] = useState('thriller');
  const [productionCity, setProductionCity] = useState('');
  const [budgetTier, setBudgetTier] = useState('mid');
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload');
  const [sceneDescription, setSceneDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFillDemoData = () => {
    setName(DEMO_PROJECT_NAME);
    setGenre(DEMO_PROJECT_GENRE);
    setProductionCity(DEMO_PROJECT_CITY);
    setBudgetTier(DEMO_PROJECT_BUDGET);
    setInputMode('text');
    setSceneDescription(DEMO_SCREENPLAY_TEXT);
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a project title');
      return;
    }
    if (!productionCity.trim()) {
      setError('Please specify a target production city');
      return;
    }
    if (inputMode === 'upload' && !file) {
      setError('Please upload a screenplay PDF or switch to paste mode');
      return;
    }
    if (inputMode === 'text' && !sceneDescription.trim()) {
      setError('Please enter scene text or describe the scenes');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('genre', genre);
      formData.append('production_city', productionCity.trim());
      formData.append('budget_tier', budgetTier);

      if (inputMode === 'upload' && file) {
        formData.append('screenplay', file);
      } else if (inputMode === 'text') {
        formData.append('scene_description', sceneDescription.trim());
      }

      const project = await api.createProject(formData);
      navigate(`/workspace/${project.id}?autostart=true`);
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setError(err.response?.data?.detail || 'Failed to create project. Please check your backend connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b-2 border-studio-border transition-colors duration-250">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 border-2 border-studio-border text-xs font-display font-bold text-[#8B5CF6] dark:text-[#A78BFA] mb-2 shadow-pop-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEW INGESTION TERMINAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-studio-text tracking-tight font-display">
            Create Production Project
          </h1>
          <p className="text-sm text-studio-muted mt-1 font-medium">
            Configure project details and provide screenplay material for autonomous analysis.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFillDemoData}
          className="btn-candy-yellow !py-2.5 !px-5 text-xs self-start sm:self-auto group"
        >
          <PlayCircle className="w-4 h-4 text-[#1E293B] group-hover:scale-110 transition-transform" />
          <span>Load "Cipher Zero" Preset</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FFE4E6] dark:bg-rose-950/40 border-2 border-studio-border text-[#9F1239] dark:text-rose-200 text-xs font-bold flex items-start gap-2.5 shadow-pop">
          <AlertCircle className="w-5 h-5 text-[#E11D48] shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Metadata Card */}
        <div className="bg-studio-surface p-7 rounded-2xl border-2 border-studio-border shadow-pop space-y-6 transition-colors duration-250">
          <div className="flex items-center justify-between pb-4 border-b-2 border-studio-border/20">
            <h3 className="text-xs font-display font-black uppercase tracking-wider text-studio-text flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs">
                1
              </span>
              Production Details
            </h3>
            <span className="text-[11px] font-display font-bold text-studio-muted">METADATA</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Project Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cipher Zero"
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
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
                <option value="other">Other / Multi-genre</option>
              </select>
            </div>

            <div>
              <label className="label">Production City (Search Target)</label>
              <div className="relative">
                <input
                  type="text"
                  value={productionCity}
                  onChange={(e) => setProductionCity(e.target.value)}
                  placeholder="e.g. Mumbai, Vancouver, London, Atlanta"
                  className="input pl-9"
                  required
                />
                <MapPin className="w-4 h-4 text-[#8B5CF6] absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="label">Budget Scale Tier</label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value)}
                className="input"
              >
                <option value="micro">Micro-Budget (&lt; $100K)</option>
                <option value="low">Low Budget ($100K - $1M)</option>
                <option value="mid">Mid Tier Production ($1M - $10M)</option>
                <option value="high">High Budget ($10M - $100M)</option>
                <option value="blockbuster">Studio Blockbuster (&gt; $100M)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Screenplay Input Card */}
        <div className="bg-studio-surface p-7 rounded-2xl border-2 border-studio-border shadow-pop space-y-6 transition-colors duration-250">
          <div className="flex items-center justify-between pb-4 border-b-2 border-studio-border/20">
            <h3 className="text-xs font-display font-black uppercase tracking-wider text-studio-text flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F472B6] text-white flex items-center justify-center text-xs">
                2
              </span>
              Screenplay or Scene Material
            </h3>

            {/* Input Mode Toggle */}
            <div className="flex p-1 rounded-full bg-studio-muted border-2 border-studio-border text-xs shadow-pop-xs">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`px-4 py-1 rounded-full transition-all font-display font-bold ${
                  inputMode === 'upload'
                    ? 'bg-[#8B5CF6] text-white shadow-pop-xs'
                    : 'text-studio-muted hover:text-studio-text'
                }`}
              >
                PDF Screenplay
              </button>
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`px-4 py-1 rounded-full transition-all font-display font-bold ${
                  inputMode === 'text'
                    ? 'bg-[#8B5CF6] text-white shadow-pop-xs'
                    : 'text-studio-muted hover:text-studio-text'
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {inputMode === 'upload' ? (
            <FileUpload
              value={file}
              onChange={(files) => setFile(files[0])}
              onClear={() => setFile(null)}
              maxSize={20 * 1024 * 1024}
            />
          ) : (
            <div>
              <textarea
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                placeholder="Paste formatted scene text or describe the scenes you need to scout..."
                className="input font-mono text-xs h-64 resize-y leading-relaxed"
                required={inputMode === 'text'}
              />
              <p className="text-xs text-studio-muted mt-2 font-medium">
                Tip: Standard headings like <code className="px-1.5 py-0.5 rounded bg-studio-muted border border-studio-border/40 font-bold text-[#8B5CF6]">INT. WAREHOUSE - NIGHT</code> allow Gemini to accurately extract characters, vehicles, and environmental constraints.
              </p>
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-xs font-display font-bold text-studio-muted text-center sm:text-left">
            The orchestrator agent will immediately parse scenes and launch live Parallel Search research.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-candy !py-4 !px-9 text-sm"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>LAUNCHING AGENT...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>START PRODUCTION SCOUT</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
