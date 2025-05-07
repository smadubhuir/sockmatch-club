"use client";

import { useEffect, useState } from "react";
import { useSupabaseSession } from "../context/SupabaseContext";
import axios from "axios";
import Link from "next/link";

export default function MySocksPage() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const [socks, setSocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchMySocks = async () => {
      try {
        const { data } = await axios.get(`/api/list-socks?user=${session.user.id}`);
        setSocks(data.socks);
      } catch (err) {
        console.error("Failed to fetch socks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMySocks();
  }, [session]);

  if (sessionLoading) return <p>Loading session...</p>;
  if (!session) return <p>Please log in to see your socks.</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Uploaded Socks</h1>

      {loading ? (
        <p>Loading your socks...</p>
      ) : socks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {socks.map((sock, index) => (
            <div key={index} className="border p-4 rounded shadow">
              <img src={sock.image_url} alt="Sock" className="w-32 mx-auto" />
              <p>{sock.name || "Unnamed Sock"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No socks uploaded yet.</p>
      )}

      <Link href="/upload" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
        Upload a New Sock
      </Link>
    </div>
  );
}

