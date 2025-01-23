// import * as admin from 'firebase-admin';
// import * as dotenv from 'dotenv';

// dotenv.config();

// if (
//   !process.env.FIREBASE_PROJECT_ID ||
//   !process.env.FIREBASE_CLIENT_EMAIL ||
//   !process.env.FIREBASE_PRIVATE_KEY ||
//   !process.env.FIREBASE_DATABASE_URL
// ) {
//   throw new Error('Firebase environment variables are not set correctly.');
// }

// admin.initializeApp({
//   credential: admin.credential.cert({
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//     privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//   }),
//   databaseURL: process.env.FIREBASE_DATABASE_URL,
// });

// export const firestore = admin.firestore();
