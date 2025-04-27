"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSupabaseSession } from "../context/SupabaseContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { session } = useSupabaseSession();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push("/browse");
    }
  };

  if (session) {
    router.push("/browse");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl mb-4 font-bold text-center">Log In</h2>

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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Log In
        </button>

        <p className="text-sm text-center mt-4">
          Don't have an account?{" "}
          <Link href="/signup">
            <a className="text-blue-500 hover:underline">Sign up</a>
          </Link>
        </p>
      </form>
    </div>
  );
}
