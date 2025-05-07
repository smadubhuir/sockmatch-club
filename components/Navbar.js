"use client";

import Link from "next/link";
import { useSupabaseSession } from "../context/SupabaseContext";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Toast from "../components/Toast";

export default function Navbar() {
  const { session } = useSupabaseSession();
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);
  const [toast, setToast] = useState(null);

  // Load avatar dynamically from session or default to email
  useEffect(() => {
    if (session?.user?.avatar_url) {
      setAvatar(session.user.avatar_url);
    } else {
      setAvatar(null); // Ensure reset if user has no avatar
    }
  }, [session]);

  // Sign out handler with proper routing
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setToast("Signed out!");
    setTimeout(() => router.push("/"), 1500);
  };

  return (
    <nav className="bg-gray-200 p-4 border-b border-black">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/" className="font-bold text-lg hover:underline">
            SockMatch.Club
          </Link>
          <Link href="/browse" className="hover:underline">
            Browse Socks
          </Link>
          {session && (
            <Link href="/my-socks" className="hover:underline">
              My Socks
            </Link>
          )}
          <Link href="/upload" className="hover:underline">
            Upload Sock
          </Link>
        </div>

        <div className="flex space-x-2 items-center">
          {session ? (
            <div className="relative group">
              <div className="flex items-center space-x-2 cursor-pointer group">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm cursor-pointer hover:underline">
                    {session.user.email}
                  </span>
                )}
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded shadow-lg p-2 space-y-2 hidden group-hover:block">
                <Link href="/account" className="block text-sm hover:underline">
                  My Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-red-500 text-sm hover:underline"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                Log In
              </button>
            </Link>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </nav>
  );
}
