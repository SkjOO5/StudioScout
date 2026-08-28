import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clapperboard, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Calendar, 
  RefreshCw, 
  ArrowRight, 
  PlayCircle,
  Zap,
  Activity,
  Layers,
  Camera,
  Music,
  FileSpreadsheet,
  Globe,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);

  const handleLoadDemo = async () => {
    try {
      setIsCreatingDemo(true);
      const res = await api.seedDemo();
      if (res && res.project_id) {
        navigate(`/workspace/${res.project_id}`);
        return;
      }
      navigate('/workspace/demo-cipher-zero');
    } catch (err) {
      console.error('Failed to seed demo project', err);
      navigate('/dashboard');
    } finally {
      setIsCreatingDemo(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex flex-col justify-between overflow-hidden bg-studio-bg transition-colors duration-250">
      {/* Cinematic Ambient Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-60 dark:opacity-40">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/20 via-purple-600/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-gradient-to-bl from-pink-500/20 via-sky-600/15 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Main Hero Section */}
      <section className="relative z-10 pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-center">
        {/* Top Playful Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-studio-surface border-2 border-amber-500/40 text-xs font-display font-extrabold text-studio-text mb-8 shadow-pop hover:border-amber-400 transition-all">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="tracking-wide">AUTONOMOUS FILM PRODUCTION & LOCATION SCOUTING</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px] font-black border border-amber-500/30">
            AI AGENT
          </span>
        </div>

        {/* Hero Display Headline */}
        <div className="relative inline-block mb-6">
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-studio-text leading-[1.08]">
            TURN A SCREENPLAY INTO A <br className="hidden sm:inline" />
            <span className="inline-block relative my-1">
              <span className="relative z-10 px-5 py-1.5 rounded-2xl bg-[#8B5CF6] text-white border-2 border-studio-border shadow-pop mx-1">
                PRODUCTION
              </span>
            </span>
            <span className="inline-block relative my-1">
              <span className="relative z-10 px-5 py-1.5 rounded-2xl bg-amber-500 text-[#0F172A] border-2 border-studio-border shadow-pop mx-1 font-black">
                PLAN.
              </span>
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-studio-muted max-w-2xl mx-auto leading-relaxed mb-10 font-sans font-medium">
          An autonomous AI production scout that breaks down screenplay scenes into live Parallel web venue research, 6-dimension explainable scoring, 8K VFX concept stills, Lyria 3 audio cues, and instant call sheets.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-16">
          <Link
            to="/new"
            className="btn-candy w-full sm:w-auto !py-3.5 !px-7 text-xs font-display font-black tracking-wider uppercase group shadow-pop"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>START A NEW PRODUCTION</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={handleLoadDemo}
            disabled={isCreatingDemo}
            className="btn-candy-yellow w-full sm:w-auto !py-3.5 !px-6 text-xs font-display font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-pop hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlayCircle className="w-4 h-4 text-[#1E293B]" />
            <span>{isCreatingDemo ? 'SEEDING DEMO...' : 'EXPLORE "CIPHER ZERO" DEMO'}</span>
          </button>
        </div>

        {/* 5-Stage Agentic Pipeline Ribbon */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-left">
          {/* Step 1 */}
          <div className="bg-studio-surface p-4 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1 transition-transform">
            <span className="px-2 py-0.5 text-[10px] font-display font-black uppercase tracking-wider rounded-md bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 text-[#8B5CF6] dark:text-[#A78BFA] border border-studio-border inline-block mb-2 shadow-pop-xs">
              01. EXTRACT
            </span>
            <p className="text-sm font-display font-bold text-studio-text">Gemini 3.1 Flash</p>
            <p className="text-xs text-studio-muted mt-0.5 font-medium">Physical requirements</p>
          </div>

          {/* Step 2 */}
          <div className="bg-studio-surface p-4 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1 transition-transform">
            <span className="px-2 py-0.5 text-[10px] font-display font-black uppercase tracking-wider rounded-md bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] dark:text-[#FBBF24] border border-studio-border inline-block mb-2 shadow-pop-xs">
              02. LIVE WEB
            </span>
            <p className="text-sm font-display font-bold text-studio-text">Parallel Search</p>
            <p className="text-xs text-studio-muted mt-0.5 font-medium">Real venues & permits</p>
          </div>

          {/* Step 3 */}
          <div className="bg-studio-surface p-4 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1 transition-transform">
            <span className="px-2 py-0.5 text-[10px] font-display font-black uppercase tracking-wider rounded-md bg-[#FCE7F3] dark:bg-[#F472B6]/30 text-[#F472B6] border border-studio-border inline-block mb-2 shadow-pop-xs">
              03. EVALUATE
            </span>
            <p className="text-sm font-display font-bold text-studio-text">6-Metric Rubric</p>
            <p className="text-xs text-studio-muted mt-0.5 font-medium">100-pt explainable score</p>
          </div>

          {/* Step 4 */}
          <div className="bg-studio-surface p-4 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1 transition-transform">
            <span className="px-2 py-0.5 text-[10px] font-display font-black uppercase tracking-wider rounded-md bg-[#D1FAE5] dark:bg-emerald-950/40 text-[#059669] dark:text-[#34D399] border border-studio-border inline-block mb-2 shadow-pop-xs">
              04. MULTIMODAL
            </span>
            <p className="text-sm font-display font-bold text-studio-text">VFX & Lyria 3</p>
            <p className="text-xs text-studio-muted mt-0.5 font-medium">Storyboards & scores</p>
          </div>

          {/* Step 5 */}
          <div className="bg-studio-surface p-4 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1 transition-transform col-span-2 sm:col-span-1">
            <span className="px-2 py-0.5 text-[10px] font-display font-black uppercase tracking-wider rounded-md bg-[#E0F2FE] dark:bg-sky-950/40 text-[#0284C7] dark:text-sky-300 border border-studio-border inline-block mb-2 shadow-pop-xs">
              05. SCHEDULE
            </span>
            <p className="text-sm font-display font-bold text-studio-text">Call Sheets & PDF</p>
            <p className="text-xs text-studio-muted mt-0.5 font-medium">Day-by-day shoots</p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full py-16 border-t-2 border-studio-border/20">
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1 rounded-full bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 border-2 border-studio-border text-xs font-display font-bold text-[#8B5CF6] dark:text-[#A78BFA] mb-3 shadow-pop-xs">
            AUTONOMOUS CINEMA INTELLIGENCE
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-studio-text tracking-tight">
            Engineered for High-Stakes Film & Commercial Productions
          </h2>
          <p className="text-sm text-studio-muted mt-2 font-medium">
            A deterministic, multi-agent AI framework combining real-time web research, acoustic sound design, and logistics planning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-studio-surface p-7 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1.5 transition-all relative pt-9">
            <div className="absolute -top-6 left-6 pop-icon-badge bg-amber-400">
              <Search className="w-6 h-6 text-[#1E293B]" />
            </div>
            <h3 className="text-lg font-bold text-studio-text mb-2 font-display">Real Parallel Search Tool</h3>
            <p className="text-xs sm:text-sm text-studio-muted leading-relaxed font-sans font-medium">
              Calls Parallel's official Python SDK at runtime with multi-query research strategies to ground candidate recommendations with authentic URLs and quoted excerpts.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-studio-surface p-7 rounded-2xl border-2 border-studio-border shadow-pop-pink hover:-translate-y-1.5 transition-all relative pt-9">
            <div className="absolute -top-6 left-6 pop-icon-badge bg-[#EC4899]">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-studio-text mb-2 font-display">Explainable 6-Metric Scoring</h3>
            <p className="text-xs sm:text-sm text-studio-muted leading-relaxed font-sans font-medium">
              Evaluates candidates on visual match (25 pts), spatial requirements (20 pts), accessibility (15 pts), lighting/time (15 pts), production practicality (15 pts), and safety (10 pts).
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-studio-surface p-7 rounded-2xl border-2 border-studio-border shadow-pop-yellow hover:-translate-y-1.5 transition-all relative pt-9">
            <div className="absolute -top-6 left-6 pop-icon-badge bg-[#34D399]">
              <Music className="w-6 h-6 text-[#1E293B]" />
            </div>
            <h3 className="text-lg font-bold text-studio-text mb-2 font-display">Acoustics & Visual Storyboards</h3>
            <p className="text-xs sm:text-sm text-studio-muted leading-relaxed font-sans font-medium">
              Generates 8K widescreen moodboards with Imagen 3 and synthesizes scene-synced audio cues and table-read dialogue in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t-2 border-studio-border bg-studio-surface text-center text-xs font-display font-bold text-studio-muted transition-colors duration-250">
        <p>StudioScout AI &bull; Autonomous Cinema Production Assistant &bull; Powered by Google Gemini & Parallel Search</p>
      </footer>
    </div>
  );
};
