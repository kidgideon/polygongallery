// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaeGC7v0Boxx6n5pBxFsoNAgQ0_fktaHo",
  authDomain: "polygongallery.firebaseapp.com",
  projectId: "polygongallery",
  storageBucket: "polygongallery.appspot.app",
  messagingSenderId: "388000716895",
  appId: "1:388000716895:web:10cde04a4d0a788b96e3ea",
};

// Prevent re-initialization during hot reload in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
