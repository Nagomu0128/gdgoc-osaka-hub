'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { subscribeAuthState, signOut } from '@/infrastructure/firebase/auth';
import { authenticateUseCase } from '@/application/auth/authenticateUseCase';
import { userRepository } from '@/infrastructure/repositories/FirestoreUserRepository';
import { allowedEmailRepository } from '@/infrastructure/repositories/FirestoreAllowedEmailRepository';
import { User } from '@/domain/user/User';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  retryAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    appUser: null,
    isAdmin: false,
    loading: true,
    authError: null,
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeAuthState(async (firebaseUser) => {
      if (!firebaseUser || !firebaseUser.email) {
        setState({ firebaseUser: null, appUser: null, isAdmin: false, loading: false, authError: null });
        return;
      }

      // Firebase Auth は成功している — loading を解除しつつ Firestore チェックを試みる
      setState((prev) => ({ ...prev, loading: true, authError: null }));

      try {
        const { user, isAllowed } = await authenticateUseCase(
          userRepository,
          allowedEmailRepository,
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName ?? '',
            photoURL: firebaseUser.photoURL,
          },
        );

        if (!isAllowed) {
          await signOut();
          setState({ firebaseUser: null, appUser: null, isAdmin: false, loading: false, authError: null });
          return;
        }

        setState({
          firebaseUser,
          appUser: user,
          isAdmin: user.isAdmin,
          loading: false,
          authError: null,
        });
      } catch (error) {
        // Firestore エラー（rules未デプロイ・ネットワーク等）でも Firebase Auth ユーザーは保持する
        // firebaseUser を null にすると /login へリダイレクトされてしまうため
        const message = error instanceof Error ? error.message : String(error);
        console.error('[AuthContext] Firestore check failed:', message);
        setState({
          firebaseUser,      // ← Firebase Auth は成功しているので保持
          appUser: null,
          isAdmin: false,
          loading: false,
          authError: message,
        });
      }
    });

    return unsubscribe;
  }, [retryCount]);

  function retryAuth() {
    setState((prev) => ({ ...prev, loading: true, authError: null }));
    setRetryCount((c) => c + 1);
  }

  return (
    <AuthContext.Provider value={{ ...state, signOut, retryAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
