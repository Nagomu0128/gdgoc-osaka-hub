import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { firebaseApp } from './config';

export const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeAuthState(
  callback: (user: FirebaseUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}
