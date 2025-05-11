"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSupabaseSession } from "@/context/SupabaseContext";
import LoginPrompt from "@/components/LoginPrompt";
import Link from "next/link";

export default function ResultsPage() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { imageUrl } = router.query;

  useEffect(() => {
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      try {
        // First, generate the embedding for the uploaded sock
        const embeddingRes = await fetch("/api/process-sock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });

        const { embedding } = await embeddingRes.json();
        if (!embedding) throw new Error("Failed to generate embedding.");

        // Fetch matching socks using the optimized API route
        const matchRes = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embedding }),
        });

        const { matches } = await matchRes.json();
        setMatches(matches || []);
      } catch (err) {
        console.error("Error loading matches:", err);
        setError("Failed to load matches.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [imageUrl]);

  const buySock = async (sockId) => {
    if (!session || !session.user) {
      alert("You must be logged in to buy this sock.");
      return;
    }

    try {
      const response = await fetch("/api/buy-sock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sockId,
          buyerId: session.user.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Sock purchased successfully!");
        router.push(`/socks/${sockId}`);
      } else {
        alert(data.error || "Failed to purchase sock.");
      }
    } catch (err) {
      console.error("Error purchasing sock:", err);
      alert("Failed to complete purchase. Please try again.");
    }
  };

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
        <div className="mb-4">
          <div className="border p-4 rounded shadow bg-white inline-block">
            <img
              src={imageUrl}
              alt="Uploaded Sock"
              className="w-48 mx-auto mb-4 rounded"
            />
            <p className="font-bold">Your Uploaded Sock</p>
          </div>
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {matches.map((match, index) => (
            <div
              key={index}
              className={`border p-4 rounded shadow bg-white hover:shadow-md transition ${
                match.sold ? "opacity-50" : ""
              }`}
            >
              <img
                src={match.image_url || match.imageUrl}
                alt={`Match ${index + 1}`}
                className="w-32 mx-auto rounded mb-2"
              />
              <p className="font-bold">SockRank: {(match.similarity * 100).toFixed(2)}%</p>
              <p className="text-sm">Sell Price: ${match.price_sell || "Make an Offer"}</p>
              <p className="text-sm">Buy Offer: ${match.buy_offer || "None"}</p>

              <div className="mt-2">
                <Link href={`/socks/${match.id}`}>
                  <button className="mt-2 bg-blue-500 text-white px-4 py-1 rounded w-full">
                    View Details
                  </button>
                </Link>

                {session ? (
                  match.sold ? (
                    <button
                      className="mt-2 bg-gray-400 text-white px-4 py-1 rounded w-full cursor-not-allowed"
                      disabled
                    >
                      Sold
                    </button>
                  ) : match.price_sell ? (
                    <button
                      onClick={() => buySock(match.id)}
                      className="mt-2 bg-green-500 text-white px-4 py-1 rounded w-full"
                    >
                      Buy for ${match.price_sell}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/socks/${match.id}`)}
                      className="mt-2 bg-yellow-500 text-white px-4 py-1 rounded w-full"
                    >
                      Make an Offer
                    </button>
                  )
                ) : (
                  <LoginPrompt action="buy this sock" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No available socks found.</p>
      )}

      <div className="mt-8">
        <Link href="/upload">
          <button className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">
            Upload Another Sock
          </button>
        </Link>
      </div>
    </div>
  );
}
