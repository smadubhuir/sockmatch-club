"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSupabaseSession } from "../context/SupabaseContext";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { session } = useSupabaseSession();

  const handleSignup = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email to confirm your account!");
      router.push("/login"); // after signup, send them to login
    }
  };

  if (session) {
    router.push("/browse");
    return null; // optional: or show "already logged in"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg

