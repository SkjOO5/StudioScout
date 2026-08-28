import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Film, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Calendar, 
  RefreshCw, 
  ArrowRight, 
  Layers, 
  PlayCircle,
  Clock,
  Compass,
  Zap,
  CheckCircle2,
  Terminal,
  Activity,
  Star,
  Clapperboard,
  Flame,
  Palette
} from 'lucide-react';
import { api } from '../lib/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);

  const handleLoadDemo = async () => {
    try {
      setIsCreatingDemo(true);
      // Fast path: call instant SQLite demo seeder
      const res = await api.seedDemo();
      if (res && res.project_id) {
        navigate(`/workspace/${res.project_id}`);
        return;
      }
      navigate('/workspace/demo-neon-shadows');
    } catch (err) {
      console.error('Failed to seed demo project', err);
      // Fallback
      navigate('/dashboard');
    } finally {
      setIsCreatingDemo(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex flex-col justify-between overflow-hidden bg-studio-bg transition-colors duration-250">
      {/* Decorative Geometric Confetti & Shapes */}
      <div className="absolute top-12 left-8 w-16 h-16 rounded-full bg-[#FBBF24] border-2 border-studio-border shadow-pop -rotate-12 hidden lg:flex items-center justify-center font-display font-bold text-xs pointer-events-none animate-float-slow">
        <Star className="w-8 h-8 text-[#1E293B] fill-[#FBBF24]" />
      </div>
      <div className="absolute top-48 right-12 w-20 h-20 rounded-2xl bg-[#F472B6] border-2 border-studio-border shadow-pop rotate-12 hidden lg:flex items-center justify-center pointer-events-none animate-wiggle">
        <Clapperboard className="w-10 h-10 text-[#1E293B]" />
      </div>
      <div className="absolute bottom-32 left-16 w-14 h-14 rounded-full bg-[#34D399] border-2 border-studio-border shadow-pop rotate-6 hidden lg:flex items-center justify-center pointer-events-none">
        <Zap className="w-7 h-7 text-[#1E293B] fill-[#34D399]" />
      </div>
      <div className="absolute bottom-20 right-20 w-16 h-16 rounded-blob bg-[#8B5CF6] border-2 border-studio-border shadow-pop -rotate-6 hidden lg:flex items-center justify-center pointer-events-none text-white font-display font-black text-xs">
        24 FPS
      </div>

      {/* Main Hero Section */}
      <section className="relative z-10 pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-center">
        {/* Top Playful Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#FBBF24] border-2 border-studio-border text-xs font-display font-extrabold text-[#1E293B] mb-8 shadow-pop -rotate-1 hover:rotate-0 transition-transform">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B]"></span>
          <span>GOOGLE CLOUD AGENTIC CINEMA &bull; PARALLEL TRACK 2026</span>
          <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6] text-white text-[10px] font-black">
            AI AGENT
          </span>
        </div>

        {/* Hero Display Headline */}
        <div className="relative inline-block mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-[#DDD6FE] dark:bg-[#8B5CF6]/20 -rotate-1 -z-10 transform scale-105 border-2 border-dashed border-[#8B5CF6]/40 hidden sm:block"></div>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-studio-text leading-[1.08]">
            TURN A SCREENPLAY INTO A <br className="hidden sm:inline" />
            <span className="inline-block relative">
              <span className="relative z-10 px-4 py-1 rounded-2xl bg-[#8B5CF6] text-white border-2 border-studio-border shadow-pop mx-1">
                PRODUCTION
              </span>
            </span>
            <span className="inline-block relative">
              <span className="relative z-10 px-4 py-1 rounded-2xl bg-[#F472B6] text-white border-2 border-studio-border shadow-pop mx-1">
                PLAN.
              </span>
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-studio-muted max-w-2xl mx-auto leading-relaxed mb-10 font-sans font-medium">
          An autonomous AI production scout that turns screenplay scenes into live Parallel web research, explainable location intelligence, VFX moodboards, and actionable call sheets.
        </p>

        {/* Candy Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 max-w-lg mx-auto mb-16">
          <Link
            to="/new"
            className="btn-candy w-full sm:w-auto !py-4 !px-8 text-sm group"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>START A NEW PRODUCTION</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={handleLoadDemo}
            disabled={isCreatingDemo}
            className="btn-candy-yellow w-full sm:w-auto !py-4 !px-7 text-sm font-bold flex items-center justify-center gap-2 shadow-pop hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlayCircle className="w-5 h-5 text-[#1E293B]" />
            <span>{isCreatingDemo ? 'SEEDING DEMO...' : 'EXPLORE DEMO ("NEON SHADOWS")'}</span>
          </button>
        </div>

        {/* 5-Stage Agentic Pipeline Ribbon as Colorful Sticker Steps */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-left">
          {/* Step 1 */}
          <div className="bg-studio-surface p-4 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1 transition-transform">
            <span className="px-2 py-0.5 text-[10px] font-display font-black uppercase tracking-wider rounded-md bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 text-[#8B5CF6] dark:text-[#A78BFA] border border-studio-border inline-block mb-2 shadow-pop-xs">
              01. EXTRACT
            </span>
            <p className="text-sm font-display font-bold text-studio-text">Gemini Parser</p>
            <p className="text-xs text-studio-muted mt-0.5 font-medium">Physical requirements</p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FEF3C7] dark:bg-amber-950/30 p-4 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1 transition-transform">
            <span className="px-2 py-0.5 text-[10px] font-display font-black uppercase tracking-wider rounded-md bg-[#FBBF24] text-[#1E293B] border border-studio-border inline-block mb-2 shadow-pop-xs">
              02. LIVE WEB
            </span>
            <p className="text-sm font-display font-bold text-[#1E293B] dark:text-amber-300">Parallel Search</p>
            <p className="text-xs text-[#64748B] dark:text-amber-400/80 mt-0.5 font-medium">Real venues & permits</p>
          </div>

          {/* Step 3 */}
          <div className="bg-studio-surface p-4 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1 transition-transform">
            <span className="px-2 py-0.5 text-[10px] font-display font-black uppercase tracking-wider rounded-md bg-[#FCE7F3] dark:bg-[#F472B6]/30 text-[#F472B6] border border-studio-border inline-block mb-2 shadow-pop-xs">
              03. EVALUATE
            </span>
            <p className="text-sm font-display font-bold text-studio-text">6-Metric Rubric</p>
            <p className="text-xs text-studio-muted mt-0.5 font-medium">100-pt explainable scoring</p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#D1FAE5] dark:bg-emerald-950/30 p-4 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1 transition-transform">
            <span className="px-2 py-0.5 text-[10px] font-display font-black uppercase tracking-wider rounded-md bg-[#34D399] text-[#1E293B] border border-studio-border inline-block mb-2 shadow-pop-xs">
              04. SCHEDULE
            </span>
            <p className="text-sm font-display font-bold text-[#1E293B] dark:text-emerald-300">Call Sheets</p>
            <p className="text-xs text-[#64748B] dark:text-emerald-400/80 mt-0.5 font-medium">Day-by-day shoot blocks</p>
          </div>

          {/* Step 5 */}
          <div className="bg-[#E0F2FE] dark:bg-sky-950/30 p-4 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1 transition-transform col-span-2 sm:col-span-1">
            <span className="px-2 py-0.5 text-[10px] font-display font-black uppercase tracking-wider rounded-md bg-[#38BDF8] text-[#1E293B] border border-studio-border inline-block mb-2 shadow-pop-xs">
              05. ADAPT
            </span>
            <p className="text-sm font-display font-bold text-[#1E293B] dark:text-sky-300">Auto Re-plan</p>
            <p className="text-xs text-[#64748B] dark:text-sky-400/80 mt-0.5 font-medium">Adapts to venue shifts</p>
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full py-16 border-t-2 border-studio-border/20">
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1 rounded-full bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 border-2 border-studio-border text-xs font-display font-bold text-[#8B5CF6] dark:text-[#A78BFA] mb-3 shadow-pop-xs">
            WHY STUDIOSCOUT AI?
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-studio-text tracking-tight">
            Cinematic Intelligence Built for Real Film Crews
          </h2>
          <p className="text-sm text-studio-muted mt-2 font-medium">
            No generic chatbots. A purpose-built, deterministic media & entertainment autonomous engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-studio-surface p-7 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1.5 transition-all relative pt-9">
            <div className="absolute -top-6 left-6 pop-icon-badge bg-[#FBBF24]">
              <Search className="w-6 h-6 text-[#1E293B]" />
            </div>
            <h3 className="text-lg font-bold text-studio-text mb-2 font-display">Real Parallel Search Tool</h3>
            <p className="text-xs sm:text-sm text-studio-muted leading-relaxed font-sans font-medium">
              Calls Parallel's official Python SDK at runtime with multi-query research strategies to ground candidate recommendations with authentic URLs and quoted excerpts.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-studio-surface p-7 rounded-2xl border-2 border-studio-border shadow-pop-pink hover:-translate-y-1.5 transition-all relative pt-9">
            <div className="absolute -top-6 left-6 pop-icon-badge bg-[#F472B6]">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-studio-text mb-2 font-display">Explainable 6-Metric Scoring</h3>
            <p className="text-xs sm:text-sm text-studio-muted leading-relaxed font-sans font-medium">
              Evaluates candidates on visual match (25 pts), spatial requirements (20 pts), accessibility (15 pts), lighting/time (15 pts), production practicality (15 pts), and safety (10 pts).
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-studio-surface p-7 rounded-2xl border-2 border-studio-border shadow-pop-yellow hover:-translate-y-1.5 transition-all relative pt-9">
            <div className="absolute -top-6 left-6 pop-icon-badge bg-[#34D399]">
              <RefreshCw className="w-6 h-6 text-[#1E293B]" />
            </div>
            <h3 className="text-lg font-bold text-studio-text mb-2 font-display">Autonomous Re-planning</h3>
            <p className="text-xs sm:text-sm text-studio-muted leading-relaxed font-sans font-medium">
              When production constraints shift (e.g. venue blackout, rain forecast, permit delay), the agent automatically invalidates affected scenes, queries Parallel for alternatives, and reschedules.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t-2 border-studio-border bg-studio-surface text-center text-xs font-display font-bold text-studio-muted transition-colors duration-250">
        <p>StudioScout AI &bull; Google Cloud Agentic Cinema Hackathon 2026 &bull; Powered by Google Gemini & Parallel Search</p>
      </footer>
    </div>
  );
};
