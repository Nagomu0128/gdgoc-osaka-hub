import * as admin from 'firebase-admin';

function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getAdminFirestore() {
  return getAdminApp().firestore();
}

export function getAdminAuth() {
  return getAdminApp().auth();
}
