import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBkvEy222eTor2-Hyi8YVXghMgErheuQt0",
  authDomain: "sockmatch-club.firebaseapp.com",
  projectId: "sockmatch-club",
  storageBucket: "sockmatch-club.appspot.com",
  messagingSenderId: "380449120440",
  appId: "1:380449120440:web:c88b1da1f8a9eeb14b144d",
  measurementId: "G-5SVP7T6LG7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
