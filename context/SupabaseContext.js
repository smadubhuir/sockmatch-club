"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const SupabaseContext = createContext();

export const SupabaseProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ session }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseSession = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabaseSession must be used inside a SupabaseProvider");
  }
  return context;
};
