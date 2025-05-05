"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { getEmbeddingFromFile, loadMobilenet } from "@/lib/mobilenet";

export default function ResultsPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { imageUrl } = router.query;

  useEffect(() => {
    loadMobilenet(); // Preload
  }, []);

  useEffect(() => {
    if (!imageUrl) return;
    fetchImageAndMatch(imageUrl);
  }, [imageUrl]);

  const fetchImageAndMatch = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "sock.jpg", { type: blob.type });

      const embedding = await getEmbeddingFromFile(file);

      const matchResponse = await axios.post("/api/match", {
        embedding,
        imageUrl,
        threshold: 0.7,
      });

      setMatches(matchResponse.data.matches);
    } catch (err) {
      console.error("Matching error:", err);
      setError("Could not find matches.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Your Sock Matches</h1>
      {imageUrl && <img src={imageUrl} alt="Uploaded Sock" className="w-48 mx-auto mb-4 rounded border" />}

      {loading && <p className="text-blue-500">Finding matches...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {matches.slice(0, 10).map((match, index) => (
            <div key={index} className="border p-4 rounded shadow">
              <img src={match.imageUrl} alt={`Match ${index + 1}`} className="w-32 mx-auto rounded" />
              <p className="font-bold mt-2">SockRank: {(match.similarity * 100).toFixed(2)}%</p>
            </div>
          ))}
        </div>
      )}

      {!loading && matches.length === 0 && <p className="text-gray-500">No matches found.</p>}

      {!loading && matches.length > 0 && (
        <div className="mt-8">
          <a
            href="/browse"
            className="inline-block bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
          >
            Browse More Socks
          </a>
        </div>
      )}
    </div>
  );
}
