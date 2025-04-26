"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSupabaseSession } from "../context/SupabaseContext";
import { useRouter } from "next/router";

export default function MySocks() {
  const { session } = useSupabaseSession();
  const router = useRouter();
  const [socks, setSocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const handleDelete = async (sockId) => {
  const confirmed = window.confirm("Are you sure you want to delete this sock?");
  if (!confirmed) return;

  const { error } = await supabase
    .from("socks")
    .delete()
    .eq("id", sockId);

  if (error) {
    console.error("Error deleting sock:", error);
    alert("Failed to delete sock.");
  } else {
    // After deleting, refresh the local list
    setSocks((prevSocks) => prevSocks.filter((sock) => sock.id !== sockId));
  }
};


  useEffect(() => {
    if (session === null) {
      router.push("/login");
    }

    const fetchSocks = async () => {
      const { data, error } = await supabase
        .from("socks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching socks:", error);
      } else {
        setSocks(data);
      }

      setLoading(false);
    };

    if (session?.user?.id) {
      fetchSocks();
    }
  }, [session, router]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">My Uploaded Socks</h1>

      {socks.length === 0 ? (
        <p className="text-center">You haven't uploaded any socks yet!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socks.map((sock) => (
            <div key={sock.id} className="border p-4 rounded shadow">
              <img
                src={sock.image_url}
                alt="Sock"
                className="w-full h-48 object-cover rounded mb-4"
              />
              {/* Optionally show more info later */}
              <p>Uploaded on: {new Date(sock.created_at).toLocaleDateString()}</p>
              <button
    onClick={() => handleDelete(sock.id)}
    className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
  >
    Delete Sock
  </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

