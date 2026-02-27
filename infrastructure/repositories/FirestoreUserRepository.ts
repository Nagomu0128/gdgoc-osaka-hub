import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  DocumentData,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseApp } from '../firebase/config';
import { IUserRepository } from '@/domain/user/IUserRepository';
import { User, CalendarTokens } from '@/domain/user/User';

const db = getFirestore(firebaseApp);
const usersCol = collection(db, 'users');

function toUser(uid: string, data: DocumentData): User {
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL ?? null,
    isAdmin: data.isAdmin ?? false,
    calendarConnected: data.calendarConnected ?? false,
    calendarTokens: data.calendarTokens
      ? {
          accessToken: data.calendarTokens.accessToken,
          refreshToken: data.calendarTokens.refreshToken,
          expiresAt:
            data.calendarTokens.expiresAt instanceof Timestamp
              ? data.calendarTokens.expiresAt.toDate()
              : new Date(data.calendarTokens.expiresAt),
        }
      : null,
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    lastLoginAt:
      data.lastLoginAt instanceof Timestamp
        ? data.lastLoginAt.toDate()
        : new Date(),
  };
}

function toFirestore(user: User) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAdmin: user.isAdmin,
    calendarConnected: user.calendarConnected,
    calendarTokens: user.calendarTokens
      ? {
          accessToken: user.calendarTokens.accessToken,
          refreshToken: user.calendarTokens.refreshToken,
          expiresAt: Timestamp.fromDate(user.calendarTokens.expiresAt),
        }
      : null,
    createdAt: Timestamp.fromDate(user.createdAt),
    lastLoginAt: Timestamp.fromDate(user.lastLoginAt),
  };
}

export function createFirestoreUserRepository(): IUserRepository {
  return {
    async findById(uid) {
      try {
        const snapshot = await getDoc(doc(usersCol, uid));
        if (!snapshot.exists()) return null;
        return toUser(snapshot.id, snapshot.data());
      } catch (error) {
        console.error('Failed to findById user:', error);
        throw error;
      }
    },

    async findAll() {
      try {
        const snapshot = await getDocs(usersCol);
        return snapshot.docs.map((d) => toUser(d.id, d.data()));
      } catch (error) {
        console.error('Failed to findAll users:', error);
        throw error;
      }
    },

    async save(user) {
      try {
        await setDoc(doc(usersCol, user.uid), toFirestore(user), { merge: true });
      } catch (error) {
        console.error('Failed to save user:', error);
        throw error;
      }
    },

    async updateLastLogin(uid) {
      try {
        await updateDoc(doc(usersCol, uid), { lastLoginAt: serverTimestamp() });
      } catch (error) {
        console.error('Failed to updateLastLogin:', error);
        throw error;
      }
    },

    async updateCalendarTokens(uid, tokens) {
      try {
        await updateDoc(doc(usersCol, uid), {
          calendarConnected: tokens !== null,
          calendarTokens: tokens
            ? {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: Timestamp.fromDate(tokens.expiresAt),
              }
            : null,
        });
      } catch (error) {
        console.error('Failed to updateCalendarTokens:', error);
        throw error;
      }
    },

    subscribeById(uid, callback) {
      return onSnapshot(doc(usersCol, uid), (snapshot) => {
        if (!snapshot.exists()) {
          callback(null);
          return;
        }
        callback(toUser(snapshot.id, snapshot.data()));
      });
    },
  };
}

export const userRepository: IUserRepository = createFirestoreUserRepository();
