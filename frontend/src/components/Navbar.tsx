import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Sparkles, Terminal, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import { HealthStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, setIsAuthModalOpen } = useAuth();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [timecode, setTimecode] = useState('');

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch(() => setHealth(null));

    // Live studio timecode generator (HH:MM:SS:FF)
    const interval = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const f = String(Math.floor((now.getMilliseconds() / 1000) * 24)).padStart(2, '0');
      setTimecode(`${h}:${m}:${s}:${f}`);
    }, 41);

    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-studio-bg/95 border-b-2 border-studio-border backdrop-blur-md transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-5">
          <Link to="/" className="flex items-center gap-3.5 group">
            {/* Holographic Aperture Icon Badge */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#38BDF8] p-[2px] shadow-pop transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
              <div className="w-full h-full rounded-[14px] bg-[#0F172A] flex items-center justify-center relative overflow-hidden">
                {/* Background glow sweep */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/30 via-transparent to-[#38BDF8]/40 opacity-80" />
                <Sparkles className="w-5 h-5 text-[#38BDF8] absolute top-1 right-1 opacity-60 animate-pulse" />
                <Film className="w-5 h-5 text-white relative z-10 drop-shadow-md" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl tracking-tight text-studio-text">
                  Studio<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#F472B6] to-[#38BDF8]">Scout</span>
                </span>
                <span className="px-2 py-0.5 text-[9px] font-display font-black uppercase tracking-wider rounded-full bg-[#10B981]/15 text-[#059669] dark:text-[#34D399] border border-[#10B981]/40 flex items-center gap-1 shadow-pop-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                  <span>AI OS</span>
                </span>
              </div>
              <span className="text-[9px] font-display font-black text-studio-muted hidden sm:flex items-center gap-1.5 tracking-wider uppercase">
                <span className="w-1 h-1 rounded-full bg-[#8B5CF6]" />
                AUTONOMOUS PRODUCTION & SCOUTING OS
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 pl-4 border-l-2 border-studio-border/30">
            <Link
              to="/dashboard"
              className={`px-4 py-1.5 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all ${
                isActive('/dashboard')
                  ? 'text-[#1E293B] bg-[#FBBF24] border-2 border-studio-border shadow-pop-xs'
                  : 'text-studio-muted hover:text-studio-text hover:bg-studio-surface hover:border-2 hover:border-studio-border hover:shadow-pop-xs'
              }`}
            >
              Control Center
            </Link>
            <Link
              to="/new"
              className={`px-4 py-1.5 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all ${
                isActive('/new')
                  ? 'text-[#1E293B] bg-[#F472B6] border-2 border-studio-border shadow-pop-xs'
                  : 'text-studio-muted hover:text-studio-text hover:bg-studio-surface hover:border-2 hover:border-studio-border hover:shadow-pop-xs'
              }`}
            >
              New Ingestion
            </Link>
          </nav>
        </div>

        {/* Live Telemetry, Theme Toggle & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Studio Timecode Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-studio-surface border-2 border-studio-border shadow-pop-xs text-xs font-mono text-studio-text">
            <Terminal className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="font-bold">{timecode || '00:00:00:00'}</span>
            <span className="text-[9px] font-bold text-[#F472B6]">24FPS</span>
          </div>

          {/* AI Providers Sticker */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-studio-surface border-2 border-studio-border shadow-pop-xs text-xs font-display font-bold">
            <div className="flex items-center gap-1.5 text-[#8B5CF6]">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></span>
              <span>Gemini 3.1</span>
            </div>
            <span className="text-studio-dim font-bold">&bull;</span>
            <div className="flex items-center gap-1.5 text-[#D97706] dark:text-[#FBBF24]">
              <span className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse"></span>
              <span>Parallel</span>
            </div>
          </div>

          {/* User Auth Profile Trigger */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-studio-surface text-studio-text border-2 border-studio-border shadow-pop-xs hover:shadow-pop hover:-translate-y-0.5 transition-all text-xs font-display font-black"
            title="Switch Studio Crew Profile / Sign In"
          >
            <span className="text-sm">{user.avatar}</span>
            <span className="hidden md:inline font-bold">{user.name.split(' ')[0]}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#DDD6FE] text-[#7C3AED] text-[10px] hidden sm:inline">
              {user.role}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-studio-muted" />
          </button>

          {/* Primary Action Button */}
          <Link
            to="/new"
            className="btn-candy !px-4 !py-2 text-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Launch Scout</span>
          </Link>
        </div>
      </div>
    </header>
  );
};


