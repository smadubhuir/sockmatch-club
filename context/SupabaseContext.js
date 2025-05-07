"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Create the Supabase context
const SupabaseContext = createContext();

// Supabase Provider Component
export const SupabaseProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state to avoid flicker

  useEffect(() => {
    if (typeof window === "undefined") return; // Client-side guard

    const initializeSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false); // Only stops loading after session is checked
      }
    };

    initializeSession();

    // Set up session listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription?.unsubscribe();
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ session, supabase, loading }}>
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
