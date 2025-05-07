"use client";

import { useSupabaseSession } from "@/context/SupabaseContext";
import { useRouter } from "next/router";

export default function LoginPrompt({ action = "continue", className = "" }) {
  const { session, supabase } = useSupabaseSession();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: prompt("Enter your email to log in:")
      });
      if (error) throw error;
      alert("Check your email for a login link!");
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  if (session) return null;

  return (
    <div className={`bg-yellow-100 border border-yellow-300 p-4 rounded text-sm ${className}`}>
      <p className="mb-2">
        Want to {action}? {" "}
        <button
          onClick={handleLogin}
          className="text-blue-600 underline font-medium hover:text-blue-800"
        >
          Log in or sign up
        </button>{" "}
        to unlock full access.
      </p>
    </div>
  );
}

