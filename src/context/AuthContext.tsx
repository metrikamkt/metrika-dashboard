import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export interface ProfileData {
  displayName: string;
  photoURL: string | null;
  phone: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<ProfileData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>(null!);

function profileKey(uid: string) {
  return `metrika_profile_${uid}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const saved = localStorage.getItem(profileKey(u.uid));
        if (saved) {
          setProfile(JSON.parse(saved));
        } else {
          const initial: ProfileData = {
            displayName: u.displayName ?? '',
            photoURL: u.photoURL,
            phone: '',
            role: '',
          };
          setProfile(initial);
          localStorage.setItem(profileKey(u.uid), JSON.stringify(initial));
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (data: Partial<ProfileData>) => {
    if (!auth.currentUser || !user) return;

    if (data.displayName !== undefined) {
      await updateProfile(auth.currentUser, { displayName: data.displayName });
    }

    const newProfile: ProfileData = { ...profile!, ...data };
    setProfile(newProfile);
    localStorage.setItem(profileKey(user.uid), JSON.stringify(newProfile));
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
