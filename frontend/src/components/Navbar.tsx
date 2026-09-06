import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clapperboard, Sparkles, ChevronDown, Menu, X, Sun, Moon, Laptop } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

/** Single-icon compact cycle button: light → system → dark → light */
const MobileThemeCycleButton: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const next = theme === 'light' ? 'system' : theme === 'system' ? 'dark' : 'light';
  const Icon = theme === 'light' ? Sun : theme === 'system' ? Laptop : Moon;
  const label = theme === 'light' ? 'Switch to System theme' : theme === 'system' ? 'Switch to Dark theme' : 'Switch to Light theme';
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className="touch-target min-w-[44px] min-h-[44px] p-2.5 rounded-wobbly bg-studio-surface border-2 border-studio-border shadow-sketch-xs text-studio-text hover:bg-studio-hover transition-all active:scale-95 flex items-center justify-center shrink-0"
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, setIsAuthModalOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-studio-bg border-b-[2.5px] border-studio-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Link to="/" className="flex items-center gap-3 group min-w-0">
            {/* Hand-Drawn Clapperboard Frame */}
            <div className="w-11 h-11 rounded-wobbly bg-studio-surface border-[2.5px] border-studio-border text-studio-text flex items-center justify-center shadow-sketch-xs group-hover:scale-105 group-hover:rotate-[-2deg] transition-all shrink-0">
              <Clapperboard className="w-5 h-5 text-studio-red" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-2xl tracking-tight text-studio-text">
                  STUDIO<span className="text-studio-red font-black">SCOUT</span>
                </span>
                <span className="px-2 py-0.5 text-[11px] font-display font-black uppercase rounded-wobbly bg-studio-yellow text-slate-900 border-[1.5px] border-studio-border shadow-sketch-xs">
                  AI
                </span>
              </div>
              <span className="text-[11px] font-hand font-bold tracking-wider text-studio-muted hidden sm:block uppercase">
                Autonomous Film Production OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2.5 pl-4 border-l-2 border-dashed border-studio-border/40">
            <Link
              to="/dashboard"
              className={`min-h-[44px] flex items-center px-4 py-2 rounded-wobbly text-sm font-hand font-bold uppercase tracking-wider transition-all ${
                isActive('/dashboard')
                  ? 'text-slate-950 bg-studio-yellow border-2 border-studio-border shadow-sketch-xs -rotate-1'
                  : 'text-studio-secondary hover:text-studio-text hover:bg-studio-surface border-2 border-transparent hover:border-studio-border hover:shadow-sketch-xs'
              }`}
            >
              Control Center
            </Link>
            <Link
              to="/new"
              className={`min-h-[44px] flex items-center px-4 py-2 rounded-wobbly text-sm font-hand font-bold uppercase tracking-wider transition-all ${
                isActive('/new')
                  ? 'text-white bg-studio-red border-2 border-studio-border shadow-sketch-xs rotate-1'
                  : 'text-studio-secondary hover:text-studio-text hover:bg-studio-surface border-2 border-transparent hover:border-studio-border hover:shadow-sketch-xs'
              }`}
            >
              New Ingestion
            </Link>
          </nav>
        </div>

        {/* Desktop Telemetry, Theme Toggle & Actions */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Auth Profile Trigger */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-wobbly bg-studio-surface text-studio-text border-2 border-studio-border shadow-sketch-xs hover:shadow-sketch hover:-translate-y-0.5 transition-all text-xs font-hand font-bold cursor-pointer"
            title="Switch Studio Crew Profile / Sign In"
          >
            <span className="text-base">{user.avatar}</span>
            <span className="font-bold">{user.name.split(' ')[0]}</span>
            <span className="px-1.5 py-0.2 rounded-wobbly bg-studio-muted text-studio-text text-[11px] font-bold border border-studio-border/30">
              {user.role}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-studio-secondary" />
          </button>

          {/* Primary Action Button */}
          <Link
            to="/new"
            className="btn-sketch !px-4 !py-2.5 text-sm shrink-0 font-bold"
          >
            <Sparkles className="w-4 h-4 text-studio-yellow" />
            <span>Launch Scout</span>
          </Link>
        </div>

        {/* Mobile: compact theme cycle icon + hamburger only */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          <MobileThemeCycleButton />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="touch-target min-w-[44px] min-h-[44px] p-2.5 rounded-wobbly bg-studio-surface border-2 border-studio-border shadow-sketch-xs text-studio-text hover:bg-studio-hover transition-transform active:scale-95 flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-dashed border-studio-border bg-studio-surface px-5 py-6 space-y-4 shadow-sketch-lg animate-pop-in">
          <div className="flex flex-col gap-2.5">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 min-h-[44px] rounded-wobbly text-base font-hand font-bold border-2 border-studio-border transition-all ${
                isActive('/dashboard') ? 'bg-studio-yellow text-slate-950 shadow-sketch-xs' : 'bg-studio-bg text-studio-text'
              }`}
            >
              <span>Control Center</span>
              <span className="text-xs text-studio-secondary font-mono">&rarr;</span>
            </Link>

            <Link
              to="/new"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 min-h-[44px] rounded-wobbly text-base font-hand font-bold border-2 border-studio-border transition-all ${
                isActive('/new') ? 'bg-studio-red text-white shadow-sketch-xs' : 'bg-studio-bg text-studio-text'
              }`}
            >
              <span>New Screenplay Ingestion</span>
              <Sparkles className="w-4 h-4 text-studio-yellow" />
            </Link>
          </div>

          {/* Theme toggle in drawer — full 3-way control */}
          <div className="pt-3 border-t-2 border-dashed border-studio-border/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-hand font-bold uppercase tracking-wider text-studio-muted">Theme</span>
              <ThemeToggle />
            </div>
          </div>

          <div className="pt-3 border-t-2 border-dashed border-studio-border/40 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-wobbly bg-studio-bg border-2 border-studio-border text-xs font-hand font-bold text-studio-text shadow-sketch-xs"
            >
              <span>{user.avatar}</span>
              <span>{user.name} ({user.role})</span>
              <ChevronDown className="w-3.5 h-3.5 text-studio-secondary" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
