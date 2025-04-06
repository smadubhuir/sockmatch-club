"use client";
import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

function Navbar() {
  return (
    <nav className="bg-gray-200 p-4 border-b border-black">
      <div className="flex justify-between">
        <Link href="/" legacyBehavior><a className="font-bold text-lg">SockMatch.Club</a>
        </Link>
        <Link href="/browse" legacyBehavior><a>Browse Socks</a>
        </Link>
      </div>
    </nav>
  );
}

export default function MatchSock() {
    const [matches, setMatches] = useState([]);
    const [fallbackMatches, setFallbackMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { imageUrl } = router.query;

    useEffect(() => {
        if (imageUrl) {
            fetchMatches(imageUrl);
        }
        fetchFallbackMatches(); // Load fallback socks
    }, [imageUrl]);

    const fetchMatches = async (imageUrl) => {
        setLoading(true);
        setError(null);
        setMatches([]);
        
        try {
            const response = await axios.post("/api/match", { imageUrl });
            
            let sortedMatches = response.data.matches
                .map((match) => ({
                    ...match,
                    sockRank: (match.similarity * 100).toFixed(2),
                }))
                .sort((a, b) => b.sockRank - a.sockRank) // Sort by highest similarity
                .slice(0, 6); // Take top 6
            
            setMatches(sortedMatches);
        } catch (error) {
            setError(error.message || "Matching failed.");
        }
        setLoading(false);
    };

    const fetchFallbackMatches = async () => {
        try {
            const response = await axios.get("/api/get-socks");
            const randomSocks = response.data.socks.sort(() => 0.5 - Math.random()).slice(0, 6);
            setFallbackMatches(randomSocks);
        } catch (error) {
            console.error("Failed to load fallback socks:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-xl font-bold">Find a Matching Sock</h1>
                {imageUrl && (
                    <div className="text-center mt-4">
                        <h2 className="text-lg font-bold">YOUR SOCK</h2>
                        <img src={imageUrl} alt="Your Sock" className="w-48 mx-auto border-2 border-black rounded-md mt-2" />
                    </div>
                )}
                {loading && <p className="text-blue-500 mt-4">Finding matches...</p>}
                {error && <p className="text-red-500 mt-4">{error}</p>}
                {matches.length > 0 ? (
                    <div className="mt-6">
                        <h2 className="text-lg font-bold mt-6 border-t pt-4">Top 6 Sock Matches</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4">
                            {matches.map((match, index) => (
                                <div key={index} className="p-4 border rounded-md text-center shadow-md">
                                    <img src={match.imageUrl} alt={`Match ${index + 1}`} className="w-32 mx-auto rounded-md shadow-md" />
                                    <p className="text-sm mt-2 font-bold">SockRank: {match.sockRank}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    !loading && fallbackMatches.length > 0 ? (
                        <div className="mt-6">
                            <h2 className="text-lg font-bold mt-6 border-t pt-4">Suggested Socks</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4">
                                {fallbackMatches.map((sock, index) => (
                                    <div key={index} className="p-4 border rounded-md text-center shadow-md">
                                        <img src={sock.imageUrl} alt={`Sock ${index + 1}`} className="w-32 mx-auto rounded-md shadow-md" />
                                        <p className="text-sm mt-2 font-bold">Potential Match!</p><p className="text-gray-600 text-xs">SockRank: {(sock.similarity * 100).toFixed(2)}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-4">No matches found.</p>
                    )
                )}
            </div>
        </div>
    );
}
