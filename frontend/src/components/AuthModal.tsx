import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  UserPlus, 
  LogIn 
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-studio-surface w-full max-w-lg rounded-2xl border-2 border-studio-border shadow-pop-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-250">
        {/* Header */}
        <div className="p-5 bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 border-b-2 border-studio-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-studio-surface border-2 border-studio-border flex items-center justify-center shadow-pop-xs text-xl">
              🎬
            </div>
            <div>
              <h3 className="text-lg font-display font-extrabold text-studio-text">
                Studio Identity & Access Control
              </h3>
              <p className="text-xs font-bold text-studio-muted">
                Current Session: <span className="text-[#7C3AED] dark:text-[#A78BFA] font-black">{user.name} ({user.role})</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-studio-surface text-studio-text border-2 border-studio-border flex items-center justify-center shadow-pop-xs hover:bg-[#FEE2E2] dark:hover:bg-red-950/40 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-studio-bg border-b-2 border-studio-border flex items-center gap-2">
          <button
            onClick={() => setTab('quick')}
            className={`flex-1 py-2 rounded-xl text-xs font-display font-black flex items-center justify-center gap-2 border-2 transition-all ${
              tab === 'quick'
                ? 'bg-[#FBBF24] text-[#1E293B] border-studio-border shadow-pop-xs'
                : 'bg-studio-surface text-studio-muted border-studio-border/30 hover:bg-studio-hover'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Studio Roles</span>
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`flex-1 py-2 rounded-xl text-xs font-display font-black flex items-center justify-center gap-2 border-2 transition-all ${
              tab === 'custom'
                ? 'bg-[#8B5CF6] text-white border-studio-border shadow-pop-xs'
                : 'bg-studio-surface text-studio-muted border-studio-border/30 hover:bg-studio-hover'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Custom Sign In / Sign Up</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {tab === 'quick' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#FEF3C7] dark:bg-amber-950/40 border border-studio-border text-xs font-medium text-[#92400E] dark:text-amber-200 flex items-center gap-2 shadow-pop-xs">
                <ShieldCheck className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24] shrink-0" />
                <span>
                  <strong>Instant Demo Access:</strong> Switch between simulated production crew members with 1-click.
                </span>
              </div>

              <div className="space-y-2.5">
                {PRESET_PROFILES.map((p) => {
                  const isCurrent = user.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => loginAs(p)}
                      className={`w-full p-3.5 rounded-xl border-2 transition-all flex items-center justify-between text-left group ${
                        isCurrent
                          ? 'bg-[#EDE9FE] dark:bg-[#8B5CF6]/20 border-[#7C3AED] shadow-pop'
                          : 'bg-studio-surface border-studio-border shadow-pop-xs hover:-translate-y-0.5 hover:shadow-pop hover:bg-studio-hover'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-studio-surface border-2 border-studio-border flex items-center justify-center text-xl shadow-pop-xs group-hover:scale-105 transition-transform">
                          {p.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-display font-extrabold text-studio-text">
                              {p.name}
                            </h4>
                            <span className="text-[10px] font-display font-black px-2 py-0.2 rounded-full bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 text-[#7C3AED] dark:text-[#A78BFA] border border-studio-border">
                              {p.role}
                            </span>
                          </div>
                          <p className="text-xs text-studio-muted font-medium flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-[#8B5CF6] dark:text-[#A78BFA]" />
                            {p.studio}
                          </p>
                        </div>
                      </div>

                      {isCurrent ? (
                        <div className="flex items-center gap-1 text-xs font-display font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                          <CheckCircle2 className="w-4 h-4 fill-[#7C3AED] text-white" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <span className="text-xs font-display font-bold text-studio-muted group-hover:text-studio-text flex items-center gap-1">
                          <span>Select</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Google Sign-in simulation button */}
              <div className="pt-2">
                <button
                  onClick={() => loginAs(PRESET_PROFILES[0])}
                  className="w-full py-3 px-4 rounded-xl bg-studio-surface border-2 border-studio-border shadow-pop text-xs font-display font-black text-studio-text flex items-center justify-center gap-2 hover:bg-studio-hover transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign In with Google Cloud Workspace</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-display font-black text-studio-text block mb-1">
                  Full Name / Studio Alias
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Greta Gerwig"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface focus:shadow-pop-xs"
                />
              </div>

              <div>
                <label className="text-xs font-display font-black text-studio-text block mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="producer@warnerbros.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface focus:shadow-pop-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-display font-black text-studio-text block mb-1">
                    Production Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface"
                  >
                    <option value="Director">Director</option>
                    <option value="Location Scout">Location Scout</option>
                    <option value="Line Producer">Line Producer</option>
                    <option value="Cinematographer">Cinematographer</option>
                    <option value="Hackathon Judge">Hackathon Judge</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-display font-black text-studio-text block mb-1">
                    Studio / Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A24 / Universal"
                    value={studio}
                    onChange={(e) => setStudio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface focus:shadow-pop-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-candy w-full !py-3 text-xs font-display font-black flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSuccess ? 'AUTHENTICATING...' : 'ENTER STUDIOSCOUT LAB'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
