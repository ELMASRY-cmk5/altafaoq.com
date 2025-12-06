// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBtS52bC8UEZ4EG4qK3tk7jV7iF1bPRTx8",
  authDomain: "altafaouq.firebaseapp.com",
  projectId: "altafaouq",
  storageBucket: "altafaouq.firebasestorage.app",
  messagingSenderId: "125346827754",
  appId: "1:125346827754:web:4286d194fa05094fe4b693",
  measurementId: "G-PNQS7VTSHT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
