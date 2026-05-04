import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

export interface ProfileData {
  displayName: string;
  photoURL: string | null;
  phone: string;
  role: string;
}

const ADMIN_EMAIL = 'arthur.haag2511@gmail.com';
const ACCESS_DOC = doc(db, 'metrika', 'access');

interface AuthContextValue {
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
  isAdmin: boolean;
  hasAccess: boolean;
  allowedEmails: string[];
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<ProfileData>) => Promise<void>;
  addAllowedEmail: (email: string) => Promise<void>;
  removeAllowedEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>(null!);

function profileKey(uid: string) {
  return `metrika_profile_${uid}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const hasAccess = isAdmin || allowedEmails.includes(user?.email ?? '');

  // Listen to allowed emails list in Firestore
  useEffect(() => {
    const unsub = onSnapshot(ACCESS_DOC, (snap) => {
      if (snap.exists()) {
        setAllowedEmails(snap.data().emails ?? []);
      }
    });
    return unsub;
  }, []);

  // Listen to auth state
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

  const addAllowedEmail = useCallback(async (email: string) => {
    if (!isAdmin) return;
    await setDoc(ACCESS_DOC, { emails: arrayUnion(email) }, { merge: true });
  }, [isAdmin]);

  const removeAllowedEmail = useCallback(async (email: string) => {
    if (!isAdmin) return;
    await setDoc(ACCESS_DOC, { emails: arrayRemove(email) }, { merge: true });
  }, [isAdmin]);

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isAdmin, hasAccess, allowedEmails,
      signInWithGoogle, logout, updateUserProfile,
      addAllowedEmail, removeAllowedEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
