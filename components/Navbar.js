// components/Navbar.js
"use client";

import Link from "next/link";
import { useSupabaseSession } from "@/context/SupabaseContext";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Toast from "@/components/Toast";

export default function Navbar() {
  const { session } = useSupabaseSession();
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);
  const [toast, setToast] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (session?.user?.avatar_url) {
      setAvatar(session.user.avatar_url);
    } else {
      setAvatar(null);
    }
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setToast("Signed out!");
    setDropdownOpen(false);
    setTimeout(() => router.push("/"), 1500);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-gray-200 p-4 border-b border-black flex justify-between items-center">
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

      <div className="flex items-center space-x-4 relative">
        {session ? (
          <div ref={dropdownRef} className="relative">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm">{session.user.email}</span>
              )}
            </div>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded shadow-lg p-2 space-y-2 w-40 z-50">
                <Link href="/account" className="block text-sm hover:underline" onClick={() => setDropdownOpen(false)}>
                  My Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-red-500 text-sm hover:underline w-full text-left"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link href="/login">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                Log In
              </button>
            </Link>
            <Link href="/signup">
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </nav>
  );
}
