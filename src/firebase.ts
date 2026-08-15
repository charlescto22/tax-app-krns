import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyDL6CBC34OHJjR68aYqYrHcYCeFbkzC9Kg",
  authDomain: "tax-app-c410d.firebaseapp.com",
  databaseURL: "https://tax-app-c410d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tax-app-c410d",
  storageBucket: "tax-app-c410d.firebasestorage.app",
  messagingSenderId: "636009845468",
  appId: "1:636009845468:web:209566bcdb8ea49aceda19",
  measurementId: "G-JNQQ3KHRMZ",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

/** Google / Workspace OAuth — always show the account chooser. */
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");
googleProvider.setCustomParameters({
  prompt: "select_account",
  // Allow personal Gmail and Google Workspace accounts on the chooser.
  access_type: "online",
});
