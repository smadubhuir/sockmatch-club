"use client"; 
import Link from "next/link";
import { useSupabaseSession } from "../context/SupabaseContext";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const { session } = useSupabaseSession();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
        <div>
          {session ? (
            <div className="flex items-center space-x-2">
              <span>Signed in as {session.user.email}</span>
              <button 
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login">
              <a className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded">
                Log in
              </a>
            </Link>
            <Link href="/my-socks">
  <a>My Socks</a>
</Link>

          )}
        </div>
      </div>
    </nav>
  );
}
