"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSupabaseSession } from "../context/SupabaseContext";
import Toast from "../components/Toast";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null);
  const router = useRouter();
  const { session } = useSupabaseSession();

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setToast(error.message);
    } else {
      setToast("Account created! Check your email to confirm.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  // Redirect if already logged in
  if (session) {
    setToast("You are already logged in!");
    setTimeout(() => router.push("/browse"), 2000);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md w-80 text-center">
          <h2 className="text-2xl mb-4 font-bold">Redirecting...</h2>
        </div>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl mb-4 font-bold text-center">Sign Up</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />

        <input
          type="password"
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Sign Up
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link href="/login">
            <span className="text-blue-500 hover:underline">Log in</span>
          </Link>
        </p>

        {toast && (
          <Toast message={toast} onClose={() => setToast(null)} />
        )}
      </form>
    </div>
  );
}
