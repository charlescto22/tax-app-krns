import { useState } from "react";
import { Button } from "./ui/button";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export function AdminSeeder() {
  const [loading, setLoading] = useState(false);

  const handleSeedAdmin = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first!");
      return;
    }

    if (!confirm(`Make ${user.email} the Super Admin?`)) return;

    setLoading(true);
    try {
      // Create/Overwrite the user document for the currently logged-in user
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: "Super Administrator",
        role: "administrator", // <--- This is the magic key!
        createdAt: new Date().toISOString(),
        status: "active"
      });
      alert("Success! You are now an Administrator in Firestore.");
    } catch (e) {
      console.error(e);
      alert("Failed to seed admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white shadow-lg rounded-lg border border-yellow-400 z-50">
      <p className="text-xs text-gray-500 mb-2">Developer Tool</p>
      <Button 
        size="sm" 
        onClick={handleSeedAdmin} 
        disabled={loading}
        className="bg-yellow-500 hover:bg-yellow-600 text-black"
      >
        Make Me Admin
      </Button>
    </div>
  );
}