import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Zap,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { useAuth, PRESET_PROFILES, UserProfile } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { user, loginAs, customLogin, isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  const [tab, setTab] = useState<'quick' | 'custom'>('quick');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('Director');
  const [studio, setStudio] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    customLogin(name, email, role, studio);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsAuthModalOpen(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-pop-in text-left">
      <div className="sketch-card w-full max-w-lg rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* Header */}
        <div className="p-5 bg-studio-bg border-b-2 border-studio-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-wobbly bg-studio-surface border-2 border-studio-border flex items-center justify-center shadow-sketch-xs text-xl">
              🎬
            </div>
            <div>
              <h3 className="text-xl font-display font-extrabold text-studio-text">
                Production Crew Profile
              </h3>
              <p className="text-xs font-hand font-bold text-studio-secondary">
                Active Seat: <span className="text-studio-text font-black">{user.name} ({user.role})</span>
              </p>
            </div>
          </div>

          {/* Close button touch target >= 44x44px */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="touch-target min-w-[44px] min-h-[44px] rounded-wobbly bg-studio-surface text-studio-text border-2 border-studio-border flex items-center justify-center shadow-sketch-xs hover:bg-studio-red hover:text-white transition-all cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher - >=44px touch targets */}
        <div className="p-3 bg-studio-bg border-b-2 border-dashed border-studio-border/30 flex items-center gap-2">
          <button
            onClick={() => setTab('quick')}
            className={`flex-1 min-h-[44px] py-2 rounded-wobbly text-sm font-hand font-bold flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
              tab === 'quick'
                ? 'bg-studio-yellow text-slate-950 border-studio-border shadow-sketch-xs'
                : 'bg-studio-surface text-studio-muted border-studio-border/30 hover:bg-studio-hover'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Crew Role Presets</span>
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`flex-1 min-h-[44px] py-2 rounded-wobbly text-sm font-hand font-bold flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
              tab === 'custom'
                ? 'bg-studio-red text-white border-studio-border shadow-sketch-xs'
                : 'bg-studio-surface text-studio-muted border-studio-border/30 hover:bg-studio-hover'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Custom Sign In</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {tab === 'quick' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-wobbly bg-amber-50 dark:bg-amber-950/40 border border-studio-border text-xs font-hand font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 shadow-sketch-xs">
                <ShieldCheck className="w-4 h-4 text-studio-yellow shrink-0" />
                <span>
                  <strong>Crew Viewpoints:</strong> Switch between department heads to preview custom workflow and role perspectives.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_PROFILES.map((p) => {
                  const isCurrent = user.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        loginAs(p.id);
                        setIsAuthModalOpen(false);
                      }}
                      className={`min-h-[52px] p-3 rounded-wobbly text-left border-2 flex items-center gap-3 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-studio-yellow text-slate-950 border-studio-border shadow-sketch-xs scale-[1.02]'
                          : 'bg-studio-bg border-studio-border hover:bg-studio-hover'
                      }`}
                    >
                      <span className="text-2xl">{p.avatar}</span>
                      <div className="min-w-0 flex-1">
                        <span className="font-display font-bold text-sm block truncate">{p.name}</span>
                        <span className="text-xs font-hand font-bold text-studio-secondary block">{p.role} &bull; {p.studio}</span>
                      </div>
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {isSuccess && (
                <div className="p-3 rounded-wobbly bg-emerald-100 dark:bg-emerald-950/60 border-2 border-studio-border text-xs font-hand font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Greta Gerwig"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@studio.film"
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Crew Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                    className="input"
                  >
                    <option value="Director">Director</option>
                    <option value="Location Scout">Location Scout</option>
                    <option value="Line Producer">Line Producer</option>
                    <option value="Cinematographer">Cinematographer (DP)</option>
                    <option value="Production Designer">Production Designer</option>
                    <option value="Film Student">Film Student</option>
                  </select>
                </div>
                <div>
                  <label className="label">Studio / Production Co.</label>
                  <input
                    type="text"
                    value={studio}
                    onChange={(e) => setStudio(e.target.value)}
                    placeholder="Independent Pictures"
                    className="input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-sketch min-h-[44px] !py-3 text-sm font-hand font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>Save Profile &amp; Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
