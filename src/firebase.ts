import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// YOUR CONFIGURATION (Paste your actual keys here)
const firebaseConfig = {
  apiKey: "AIzaSyDL6CBC34OHJjR68aYqYrHcYCeFbkzC9Kg",
  authDomain: "tax-app-c410d.firebaseapp.com",
  databaseURL: "https://tax-app-c410d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tax-app-c410d",
  storageBucket: "tax-app-c410d.firebasestorage.app",
  messagingSenderId: "636009845468",
  appId: "1:636009845468:web:209566bcdb8ea49aceda19",
  measurementId: "G-JNQQ3KHRMZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firestore Database Connection
// (We use getFirestore because we are using Cloud Firestore)
export const db = getFirestore(app);

// Export Auth (for future use)
export const auth = getAuth(app);