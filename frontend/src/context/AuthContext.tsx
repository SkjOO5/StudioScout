import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Director' | 'Location Scout' | 'Line Producer' | 'Cinematographer' | 'Production Designer' | 'Film Student';
  studio: string;
  avatar: string;
  tier: 'Studio Enterprise' | 'Pro Scout' | 'Indie Creator';
}

export const PRESET_PROFILES: UserProfile[] = [
  {
    id: 'director-nolan',
    name: 'Christopher Vance',
    email: 'vance@syncopystudios.com',
    role: 'Director',
    studio: 'Syncopy Film Unit',
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
  {
    id: 'cinematographer-kai',
    name: 'Kai Takahashi',
    email: 'kai.dp@tokyocine.jp',
    role: 'Cinematographer',
    studio: 'Aperture Vision Works',
    avatar: '🎥',
    tier: 'Pro Scout',
  },
  {
    id: 'designer-elena',
    name: 'Elena Rostova',
    email: 'elena@artdept.film',
    role: 'Production Designer',
    studio: 'Atelier Set Design',
    avatar: '📐',
    tier: 'Indie Creator',
  },
  {
    id: 'student-sam',
    name: 'Sam Chen',
    email: 'sam.chen@nyu.edu',
    role: 'Film Student',
    studio: 'Tisch Undergraduate Film',
    avatar: '🎞️',
    tier: 'Indie Creator',
  },
];

interface AuthContextType {
  user: UserProfile;
  loginAs: (profileOrId: string | UserProfile) => void;
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
        const parsed = JSON.parse(saved);
        // Ensure parsed profile isn't the legacy judge profile
        if (parsed && parsed.id !== 'judge-google') {
          return parsed;
        }
      } catch (e) {
        // Fallback
      }
    }
    // Default to Director profile
    return PRESET_PROFILES[0];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('studioscout_user', JSON.stringify(user));
  }, [user]);

  const loginAs = (profileOrId: string | UserProfile) => {
    if (typeof profileOrId === 'string') {
      const found = PRESET_PROFILES.find((p) => p.id === profileOrId);
      if (found) setUser(found);
    } else {
      setUser(profileOrId);
    }
    setIsAuthModalOpen(false);
  };

  const customLogin = (name: string, email: string, role: UserProfile['role'], studio: string) => {
    const customUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name || 'Studio Filmmaker',
      email: email || 'filmmaker@studio.ai',
      role: role || 'Director',
      studio: studio || 'Independent Production Unit',
      avatar: role === 'Director' ? '🎬' : role === 'Location Scout' ? '📍' : role === 'Cinematographer' ? '🎥' : role === 'Production Designer' ? '📐' : '✨',
      tier: 'Pro Scout',
    };
    setUser(customUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
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
