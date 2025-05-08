// pages/account.js
"use client";

import { useEffect, useState } from "react";
import { useSupabaseSession } from "../context/SupabaseContext";
import { supabase } from "../lib/supabaseClient";
import Toast from "../components/Toast";

export default function AccountPage() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("username, bio, avatar_url")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        if (data) {
          setUsername(data.username || "");
          setBio(data.bio || "");
          setAvatar(data.avatar_url || "");
        }
      } catch (err) {
        setToast("Failed to fetch profile.");
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const updates = {
        id: session.user.id,
        username,
        bio,
        avatar_url: avatar || null,
      };

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;

      setToast("Profile updated successfully!");
    } catch (err) {
      setToast("Failed to save profile.");
      console.error("Failed to save profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  if (sessionLoading) return <p>Loading session...</p>;
  if (!session) return <p>Please log in to access your account.</p>;

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>

      <label className="block mb-2">Profile Picture</label>
      {avatar ? (
        <img src={avatar} alt="Avatar" className="w-32 h-32 rounded-full mb-4" />
      ) : (
        <p>No image</p>
      )}

      <input type="file" accept="image/*" onChange={handleAvatarChange} className="mb-4" />

      <label className="block mb-2">Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2">Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
