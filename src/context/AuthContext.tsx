import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { Professor } from '@/domain/entities/Professor';
import { FirebaseAuthService } from '@/infrastructure/auth/FirebaseAuthService';
import { FirebaseProfessorRepository } from '@/infrastructure/repositories/FirebaseProfessorRepository';

interface AuthContextValue {
  firebaseUser: User | null;
  professor: Professor | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  completeRegistration: (professor: Professor) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const authService = FirebaseAuthService.getInstance();
const professorRepo = new FirebaseProfessorRepository();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return authService.subscribeToAuthState(async (user) => {
      setIsLoading(true);
      setFirebaseUser(user);
      if (user) {
        const profile = await professorRepo.findById(user.uid);
        setProfessor(profile);
      } else {
        setProfessor(null);
      }
      setIsLoading(false);
    });
  }, []);

  const signOut = async () => {
    await authService.signOut();
  };

  const completeRegistration = (prof: Professor) => {
    setProfessor(prof);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, professor, isLoading, signOut, completeRegistration }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
