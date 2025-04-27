"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSupabaseSession } from "../context/SupabaseContext";
import Toast from "../components/Toast"; // <-- add this

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null); // <-- add this
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
      setToast("Logged in successfully!");
      setTimeout(() => router.push("/browse"), 1500);
    }
  };

  if (session) {
    router.push("/browse");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {toast && <Toast message={toast} />}
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
        {/* form content */}
