"use client";

import Link from "next/link";
import { useSupabaseSession } from "../context/SupabaseContext";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";
import Toast from "../components/Toast";

export default function Navbar() {
  const { session } = useSupabaseSession();
  const [toast, setToast] = useState(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setToast("Signed out!");
    setTimeout(() => (window.location.href = "/"), 1500);
  };

  return (
    <nav className="bg-gray-200 p-4 border-b border-black">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/">
            <a className="font-bold text-lg hover:underline">SockMatch.Club</a>
          </Link>
          <Link href="/browse">
            <a className="hover:underline">Browse Socks</a>
          </Link>
          {session && (
            <Link href="/my-socks">
              <a className="hover:underline">My Socks</a>
            </Link>
          )}
          <Link href="/upload">
            <a className="hover:underline">Upload Sock</a>
          </Link>
        </div>

        <div className="flex space-x-2 items-center">
          {session ? (
            <div className="relative group flex items-center space-x-2">
              {session.user.avatar_url ? (
                <img
                  src={session.user.avatar_url}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-sm cursor-pointer">{session.user.email}</span>
              )}
              <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded shadow-lg p-2 space-y-2 hidden group-hover:block">
                <Link href="/account">
                  <a className="block text-sm hover:underline">My Account</a>
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
              <a className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                Log In
              </a>
            </Link>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </nav>
  );
}
