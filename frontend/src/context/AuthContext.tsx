import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Director' | 'Location Scout' | 'Line Producer' | 'Hackathon Judge' | 'Cinematographer';
  studio: string;
  avatar: string;
  tier: 'Studio Enterprise' | 'Pro Scout' | 'Judge Access';
}

export const PRESET_PROFILES: UserProfile[] = [
  {
    id: 'judge-google',
    name: 'Hackathon Judge',
    email: 'judge@agentic-cinema.devpost.com',
    role: 'Hackathon Judge',
    studio: 'Google Cloud & Parallel Cinema Lab',
    avatar: '⚡',
    tier: 'Judge Access',
  },
  {
    id: 'director-nolan',
    name: 'Christopher Nolan',
    email: 'nolan@syncopy.hollywood.com',
    role: 'Director',
    studio: 'Syncopy Films / Warner Bros',
    avatar: '🎬',
    tier: 'Studio Enterprise',
  },
  {
    id: 'scout-alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@scoutpro.studio',
    role: 'Location Scout',
    studio: 'Paramount Production Unit',
    avatar: '📍',
    tier: 'Pro Scout',
  },
  {
    id: 'producer-priya',
    name: 'Priya Sharma',
    email: 'priya.sharma@mumbaicinema.in',
    role: 'Line Producer',
    studio: 'Mumbai Neo-Noir Studios',
    avatar: '💼',
    tier: 'Studio Enterprise',
  },
];

interface AuthContextType {
  user: UserProfile;
  loginAs: (profile: UserProfile) => void;
  customLogin: (name: string, email: string, role: UserProfile['role'], studio: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('studioscout_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Default to Hackathon Judge for instant evaluation
    return PRESET_PROFILES[0];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('studioscout_user', JSON.stringify(user));
  }, [user]);

  const loginAs = (profile: UserProfile) => {
    setUser(profile);
    setIsAuthModalOpen(false);
  };

  const customLogin = (name: string, email: string, role: UserProfile['role'], studio: string) => {
    const customUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name || 'Studio Filmmaker',
      email: email || 'filmmaker@studio.ai',
      role: role || 'Director',
      studio: studio || 'Independent Production Unit',
      avatar: role === 'Director' ? '🎬' : role === 'Location Scout' ? '📍' : '✨',
      tier: 'Pro Scout',
    };
    setUser(customUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    // Reset to default judge access
    setUser(PRESET_PROFILES[0]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAs,
        customLogin,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
