import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  ShieldCheck,
  ArrowRight,
  PlayCircle,
  Music,
  Compass,
  FileSpreadsheet
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
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden bg-studio-bg transition-colors duration-200">
      {/* Hand-Drawn Hero Section */}
      <section className="relative z-10 pt-10 pb-14 md:pt-18 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-center">
        {/* Top Playful Sticky Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 min-h-[44px] rounded-wobbly bg-studio-surface border-2 border-studio-border text-sm font-hand font-bold text-studio-text mb-8 shadow-sketch hover:rotate-1 transition-all">
          <span className="w-2.5 h-2.5 rounded-full bg-studio-red animate-ping" />
          <span className="tracking-wide">AUTONOMOUS FILM PRODUCTION & LOCATION SCOUT</span>
          <span className="px-2 py-0.5 rounded-wobbly bg-studio-yellow text-slate-900 text-xs font-black border border-studio-border shadow-sketch-xs">
            STUDIO OS
          </span>
        </div>

        {/* Hero Felt-Tip Marker Display Headline */}
        <div className="relative inline-block mb-6 max-w-4xl mx-auto">
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-studio-text leading-[1.12]">
            Turn a screenplay into a <br className="hidden sm:inline" />
            <span className="inline-block relative my-1 transform -rotate-1">
              <span className="relative z-10 px-5 py-1.5 rounded-wobbly-md bg-studio-red text-white border-[2.5px] border-studio-border shadow-sketch mx-1">
                PRODUCTION
              </span>
            </span>
            <span className="inline-block relative my-1 transform rotate-1">
              <span className="relative z-10 px-5 py-1.5 rounded-wobbly-md bg-studio-yellow text-slate-950 border-[2.5px] border-studio-border shadow-sketch mx-1 font-black">
                PLAN.
              </span>
            </span>
          </h1>
        </div>

        {/* Hand-Written Subtitle */}
        <p className="text-lg sm:text-xl text-studio-secondary max-w-2xl mx-auto leading-relaxed mb-10 font-hand font-normal">
          An autonomous AI production scout that breaks down screenplay scenes into live Parallel web venue research, 6-dimension explainable scoring, 8K VFX concept stills, Lyria 3 audio cues, and instant call sheets.
        </p>

        {/* Tactile Action Buttons with Hand-Drawn Arrow */}
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-16">
          {/* Hand-Drawn Decorative Arrow pointing to CTA */}
          <div className="hidden lg:block absolute -left-28 top-3 text-studio-red transform -rotate-12 pointer-events-none">
            <svg width="90" height="50" viewBox="0 0 90 50" fill="none" className="stroke-current">
              <path d="M5 40 Q 40 45, 65 15" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
              <path d="M55 10 L 68 14 L 64 27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-display font-bold text-xs block -mt-2">Start here!</span>
          </div>

          <Link
            to="/new"
            className="btn-sketch w-full sm:w-auto !py-3.5 !px-8 text-base font-hand font-bold tracking-wide group"
          >
            <Sparkles className="w-5 h-5 text-studio-yellow group-hover:rotate-12 transition-transform" />
            <span>START A NEW PRODUCTION</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={handleLoadDemo}
            disabled={isCreatingDemo}
            className="btn-sketch-yellow w-full sm:w-auto !py-3.5 !px-7 text-base font-hand font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-5 h-5 text-slate-900" />
            <span>{isCreatingDemo ? 'LOADING SAMPLE PRODUCTION...' : 'LOAD SAMPLE SCREENPLAY ("CIPHER ZERO")'}</span>
          </button>
        </div>

        {/* 5-Stage Agentic Pipeline Cards (Paper cards with tape strips) */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 text-left pt-4">
          {/* Step 1 */}
          <div className="sketch-card sketch-tape p-4 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch hover:-translate-y-1 transition-all">
            <span className="px-2 py-0.5 text-xs font-display font-black uppercase rounded-wobbly bg-studio-muted text-studio-text border border-studio-border inline-block mb-2 shadow-sketch-xs">
              01. EXTRACT
            </span>
            <p className="text-base font-display font-bold text-studio-text">Gemini 3.1 Flash</p>
            <p className="text-sm text-studio-secondary mt-0.5 font-hand font-normal">Physical scene requirements</p>
          </div>

          {/* Step 2 */}
          <div className="sketch-card sketch-tape p-4 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch hover:-translate-y-1 transition-all">
            <span className="px-2 py-0.5 text-xs font-display font-black uppercase rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border inline-block mb-2 shadow-sketch-xs">
              02. LIVE WEB
            </span>
            <p className="text-base font-display font-bold text-studio-text">Parallel Search</p>
            <p className="text-sm text-studio-secondary mt-0.5 font-hand font-normal">Real venues & permits</p>
          </div>

          {/* Step 3 */}
          <div className="sketch-card sketch-tape p-4 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch hover:-translate-y-1 transition-all">
            <span className="px-2 py-0.5 text-xs font-display font-black uppercase rounded-wobbly bg-studio-red text-white border border-studio-border inline-block mb-2 shadow-sketch-xs">
              03. EVALUATE
            </span>
            <p className="text-base font-display font-bold text-studio-text">6-Metric Rubric</p>
            <p className="text-sm text-studio-secondary mt-0.5 font-hand font-normal">100-pt explainable score</p>
          </div>

          {/* Step 4 */}
          <div className="sketch-card sketch-tape p-4 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch hover:-translate-y-1 transition-all">
            <span className="px-2 py-0.5 text-xs font-display font-black uppercase rounded-wobbly bg-emerald-400 text-slate-950 border border-studio-border inline-block mb-2 shadow-sketch-xs">
              04. MULTIMODAL
            </span>
            <p className="text-base font-display font-bold text-studio-text">VFX & Lyria 3</p>
            <p className="text-sm text-studio-secondary mt-0.5 font-hand font-normal">Storyboards & audio cues</p>
          </div>

          {/* Step 5 */}
          <div className="sketch-card sketch-tape p-4 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch hover:-translate-y-1 transition-all col-span-2 sm:col-span-1">
            <span className="px-2 py-0.5 text-xs font-display font-black uppercase rounded-wobbly bg-sky-300 text-slate-950 border border-studio-border inline-block mb-2 shadow-sketch-xs">
              05. SCHEDULE
            </span>
            <p className="text-base font-display font-bold text-studio-text">Call Sheets & PDF</p>
            <p className="text-sm text-studio-secondary mt-0.5 font-hand font-normal">Day-by-day shooting order</p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid (Cards with Thumbtack Pins) */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full py-16 border-t-2 border-dashed border-studio-border/30">
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1 rounded-wobbly bg-studio-yellow text-slate-950 border-2 border-studio-border text-xs font-display font-bold mb-3 shadow-sketch-xs">
            AUTONOMOUS CINEMA INTELLIGENCE
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-studio-text tracking-tight">
            Engineered for High-Stakes Film & Commercial Productions
          </h2>
          <p className="text-base text-studio-secondary mt-2 font-hand">
            A deterministic, multi-agent AI framework combining real-time web research, acoustic sound design, and logistics planning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="sketch-card sketch-pin p-7 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch hover:-translate-y-1 transition-all text-left">
            <div className="w-11 h-11 rounded-wobbly bg-studio-yellow border-2 border-studio-border flex items-center justify-center shadow-sketch-xs mb-4">
              <Search className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="text-xl font-display font-bold text-studio-text mb-2">Real Parallel Search Tool</h3>
            <p className="text-base text-studio-secondary leading-relaxed font-hand">
              Calls Parallel's official Python SDK at runtime with multi-query research strategies to ground candidate recommendations with authentic URLs and quoted excerpts.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="sketch-card sketch-pin p-7 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch-red hover:-translate-y-1 transition-all text-left">
            <div className="w-11 h-11 rounded-wobbly bg-studio-red border-2 border-studio-border flex items-center justify-center shadow-sketch-xs mb-4">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display font-bold text-studio-text mb-2">Explainable 6-Metric Scoring</h3>
            <p className="text-base text-studio-secondary leading-relaxed font-hand">
              Evaluates candidates on visual match (25 pts), spatial requirements (20 pts), accessibility (15 pts), lighting/time (15 pts), production practicality (15 pts), and safety (10 pts).
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="sketch-card sketch-pin p-7 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch-yellow hover:-translate-y-1 transition-all text-left">
            <div className="w-11 h-11 rounded-wobbly bg-emerald-400 border-2 border-studio-border flex items-center justify-center shadow-sketch-xs mb-4">
              <Music className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="text-xl font-display font-bold text-studio-text mb-2">Acoustics & Visual Storyboards</h3>
            <p className="text-base text-studio-secondary leading-relaxed font-hand">
              Generates 8K widescreen moodboards with Imagen 3 and synthesizes scene-synced audio cues and table-read dialogue in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Hand-Drawn Footer */}
      <footer className="relative z-10 py-8 border-t-2 border-studio-border bg-studio-surface text-center text-sm font-hand font-bold text-studio-muted transition-colors duration-200">
        <p>StudioScout AI &bull; Autonomous Cinema Production Assistant &bull; Powered by Google Gemini &amp; Parallel Search</p>
      </footer>
    </div>
  );
};
