import admin from 'firebase-admin';
if (!admin.apps.length) {
admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "cheerchampion-de837",
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  })
}
export const firebaseAdmin = admin;