// src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyDK4tj5jUV6LZBDkzxh0pGMMYgEd576MLk",
  authDomain: "silverlining-bb196.firebaseapp.com",
  projectId: "silverlining-bb196",
  storageBucket: "silverlining-bb196.firebasestorage.app",
  messagingSenderId: "101500409173",
  appId: "1:101500409173:web:68be3c51d23a701389cbdc",
};

console.log("Firebase initialization check:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

// Initialize Firebase only if it hasn't been initialized already
let app;
if (!getApps().length) {
  console.log("Initializing new Firebase instance");
  app = initializeApp(firebaseConfig);
} else {
  console.log("Using existing Firebase instance");
  app = getApps()[0];
}

// Initialize Firestore
const db = getFirestore(app);

export { db };
