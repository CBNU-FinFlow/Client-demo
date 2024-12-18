import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APP_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_APP_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_APP_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_APP_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_APP_FB_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_FB_API_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };
