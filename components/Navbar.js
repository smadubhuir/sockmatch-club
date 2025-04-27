"use client";

import Link from "next/link";
import { useSupabaseSession } from "../context/SupabaseContext";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react"; // add
import Toast from "../components/Toast"; // add

const [toast, setToast] = useState(null); // add

const handleSignOut = async () => {
  await supabase.auth.signOut();
  setToast("Signed out!");
  setTimeout(() => (window.location.href = "/"), 1500);
};

{toast && <Toast message={toast} />} // inside return()

export default function Navbar() {
  const { session } = useSupabaseSession();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // Refresh to homepage after sign out
  };

  return (
    <nav className="bg-gray-200 p-4 border-b border-black">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/">
            <a className="font-bold text-lg">SockMatch.Club</a>
          </Link>
          <Link href="/browse">
            <a>Browse Socks</a>
          </Link>
        </div>

        <div className="flex space-x-2 items-center">
          {session ? (
            <>
              <span className="text-sm">Signed in as {session.user.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login">
              <a className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                Log In
              </a>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
