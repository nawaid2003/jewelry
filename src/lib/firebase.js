import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBm56H69WFygqkLu0IkcJXtVdzLs_hX-VU",
  authDomain: "silverlining-57ac0.firebaseapp.com",
  projectId: "silverlining-57ac0",
  storageBucket: "silverlining-57ac0.firebasestorage.app",
  messagingSenderId: "811862935791",
  appId: "1:811862935791:web:09d47cfcb57d5d4741f31a",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
