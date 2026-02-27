import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { firebaseApp } from '../firebase/config';
import { IAllowedEmailRepository } from '@/domain/user/IAllowedEmailRepository';
import { AllowedEmail } from '@/domain/user/AllowedEmail';

const db = getFirestore(firebaseApp);
const allowedEmailsCol = collection(db, 'allowedEmails');

function toAllowedEmail(id: string, data: DocumentData): AllowedEmail {
  return {
    email: id,
    addedBy: data.addedBy,
    addedAt:
      data.addedAt instanceof Timestamp ? data.addedAt.toDate() : new Date(),
  };
}

export function createFirestoreAllowedEmailRepository(): IAllowedEmailRepository {
  return {
    async findAll() {
      try {
        const snapshot = await getDocs(allowedEmailsCol);
        return snapshot.docs.map((d) => toAllowedEmail(d.id, d.data()));
      } catch (error) {
        console.error('Failed to findAll allowedEmails:', error);
        throw error;
      }
    },

    async exists(email) {
      try {
        const snapshot = await getDoc(
          doc(allowedEmailsCol, email.toLowerCase().trim()),
        );
        return snapshot.exists();
      } catch (error) {
        console.error('Failed to check allowedEmail existence:', error);
        throw error;
      }
    },

    async add(allowedEmail) {
      try {
        await setDoc(doc(allowedEmailsCol, allowedEmail.email), {
          addedBy: allowedEmail.addedBy,
          addedAt: Timestamp.fromDate(allowedEmail.addedAt),
        });
      } catch (error) {
        console.error('Failed to add allowedEmail:', error);
        throw error;
      }
    },

    async remove(email) {
      try {
        await deleteDoc(doc(allowedEmailsCol, email.toLowerCase().trim()));
      } catch (error) {
        console.error('Failed to remove allowedEmail:', error);
        throw error;
      }
    },

    subscribeAll(callback) {
      return onSnapshot(allowedEmailsCol, (snapshot) => {
        const emails = snapshot.docs.map((d) => toAllowedEmail(d.id, d.data()));
        callback(emails);
      });
    },
  };
}

export const allowedEmailRepository: IAllowedEmailRepository =
  createFirestoreAllowedEmailRepository();
