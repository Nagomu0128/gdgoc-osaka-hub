import * as admin from 'firebase-admin';
import { auth } from 'firebase-functions/v2';

export const onUserCreate = auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;
  if (!email) return;

  const db = admin.firestore();

  try {
    const isAllowed = await db.collection('allowedEmails').doc(email).get();
    if (!isAllowed.exists) {
      // 許可されていないユーザーは削除
      await admin.auth().deleteUser(uid);
      return;
    }

    const now = admin.firestore.Timestamp.now();
    await db.collection('users').doc(uid).set(
      {
        uid,
        email,
        displayName: displayName ?? '',
        photoURL: photoURL ?? null,
        isAdmin: false,
        calendarConnected: false,
        calendarTokens: null,
        createdAt: now,
        lastLoginAt: now,
      },
      { merge: true },
    );
  } catch (error) {
    console.error('onUserCreate failed:', error);
    throw error;
  }
});
