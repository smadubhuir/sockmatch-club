// context/SupabaseContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Create the Supabase context
const SupabaseContext = createContext();

// Supabase Provider Component
export const SupabaseProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return; // Prevents running on server side

    const initializeSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Avoid flickering by showing a loading state
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <SupabaseContext.Provider value={{ session, supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};

// Hook to access Supabase context
export const useSupabaseSession = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabaseSession must be used inside a SupabaseProvider");
  }
  return context;
};
