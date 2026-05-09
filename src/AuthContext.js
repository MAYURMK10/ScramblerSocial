import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, isLive } from './firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async () => {
    if (!isLive) {
      alert("Running in Demo Mode. Update .env.local with real Firebase keys and restart the server to enable login.");
      setUser({ displayName: "Guest Rider", uid: "demo" });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn("Login popup was closed before completion.");
      } else {
        console.error("Authentication error:", error);
        alert("Failed to login. Please try again.");
      }
    }
  };

  const logout = () => {
    if (!isLive) {
      setUser(null);
      return;
    }
    return signOut(auth);
  };

  useEffect(() => {
    if (!isLive) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
