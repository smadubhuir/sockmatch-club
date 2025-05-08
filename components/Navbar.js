"use client";

import Link from "next/link";
import { useSupabaseSession } from "../context/SupabaseContext";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Toast from "../components/Toast";

export default function Navbar() {
  const { session } = useSupabaseSession();
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);
  const [toast, setToast] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", session.user.id)
            .single();

          if (error) throw error;
          setAvatar(data?.avatar_url || "/default-avatar.png");
        } catch (error) {
          console.error("Failed to fetch avatar:", error);
        }
      }
    };

    fetchProfile();
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setToast("Signed out!");
    setTimeout(() => router.push("/"), 1500);
  };

  return (
    <nav className="bg-gray-200 p-4 border-b border-black flex justify-between items-center">
      <div className="flex space-x-4">
        <Link href="/" className="font-bold text-lg hover:underline">SockMatch.Club</Link>
        <Link href="/browse" className="hover:underline">Browse Socks</Link>
        {session && <Link href="/my-socks" className="hover:underline">My Socks</Link>}
        <Link href="/upload" className="hover:underline">Upload Sock</Link>
      </div>

      <div className="relative">
        {session ? (
          <div className="flex items-center space-x-4">
            <Image src={avatar} alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="text-sm">Account</button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded shadow-lg p-2 space-y-2">
                <Link href="/account" className="block text-sm hover:underline">My Account</Link>
                <button onClick={handleSignOut} className="text-red-500 text-sm hover:underline">Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">Log In</button>
          </Link>
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </nav>
  );
}
