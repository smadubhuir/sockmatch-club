"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSupabaseSession } from "@/context/SupabaseContext";
import LoginPrompt from "@/components/LoginPrompt";

export default function ResultsPage() {
  const { session, loading: sessionLoading } = useSupabaseSession(); // Use loading from context
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { imageUrl } = router.query;

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure client-side

    const data = localStorage.getItem("sockUpload");
    if (!data) {
      setLoading(false);
      return;
    }

    try {
      const { imageUrl, matches } = JSON.parse(data);
      setMatches(matches || []);
    } catch (err) {
      console.error("Error parsing sockUpload data:", err);
      setError("Could not load matches.");
    } finally {
      setLoading(false);
    }
  }, []);

  if (sessionLoading || loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Your Sock Matches</h1>
        <p className="text-blue-500">Loading, please wait...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Your Sock Matches</h1>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Uploaded Sock"
          className="w-48 mx-auto mb-4 rounded border"
        />
      )}

      {error && <p className="text-red-500">{error}</p>}

      {matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {matches.map((match, index) => (
            <div key={index} className="border p-4 rounded shadow">
              <img
                src={match.image_url || match.imageUrl}
                alt={`Match ${index + 1}`}
                className="w-32 mx-auto rounded"
              />
              <p className="font-bold mt-2">
                SockRank: {(match.similarity * 100).toFixed(2)}%
              </p>
              {session ? (
                <button className="mt-2 bg-blue-500 text-white px-4 py-1 rounded">
                  Claim this sock
                </button>
              ) : (
                <LoginPrompt action="claim this sock" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No matches found.</p>
      )}
    </div>
  );
}
