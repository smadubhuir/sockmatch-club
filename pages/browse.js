"use client";

import { useSupabaseSession } from "../context/SupabaseContext";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function BrowsePage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { imageUrl } = router.query;
  const handleBuySock = async (sock) => {
  try {
    const res = await axios.post("/api/checkout-session", {
      price: sock.price,
      sockImageUrl: sock.imageUrl,
    });

    const { sessionId } = res.data;

    const stripe = await (await import("@stripe/stripe-js")).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    await stripe.redirectToCheckout({ sessionId });
  } catch (err) {
    console.error("Error starting checkout:", err);
    alert("Failed to start checkout.");
  }
};


  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (!imageUrl || !user) return;
    fetchImageAndMatch(imageUrl);
  }, [imageUrl, user]);

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

      {!user && (
        <div className="text-red-600 font-bold">
          Please <a href="/login" className="underline">sign in</a> to view matches.
        </div>
      )}

      {user && loading && <p className="text-blue-500">Finding matches...</p>}
      {user && error && <p className="text-red-500">{error}</p>}

      {user && !loading && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {matches.slice(0, 10).map((match, index) => (
  <div key={index} className="border p-4 rounded shadow flex flex-col items-center">
    <img
      src={match.imageUrl}
      alt={`Match ${index + 1}`}
      className="w-32 mx-auto rounded mb-2"
    />

    <p className="font-bold mt-2">
      SockRank: {(match.similarity * 100).toFixed(2)}%
    </p>

    {/* Show price if available */}
    {match.price ? (
      <div className="mt-2 text-green-700 font-semibold">
        ${match.price.toFixed(2)}
      </div>
    ) : (
      <div className="mt-2 text-gray-400 text-sm">
        No price set
      </div>
    )}

    {/* Show buy button only if price exists */}
    {match.price && (
      <button
        onClick={() => handleBuySock(match)}
        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm"
      >
        Buy Sock
      </button>
    )}
  </div>
))}

        </div>
      )}

      {user && !loading && matches.length === 0 && <p className="text-gray-500">No matches found.</p>}

      {user && !loading && matches.length > 0 && (
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

async function loadMobilenet() {
  const mobilenet = await import("@tensorflow-models/mobilenet");
  const tf = await import("@tensorflow/tfjs");
  return mobilenet.load();
}

async function getEmbeddingFromFile(file) {
  const tf = await import("@tensorflow/tfjs");
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageBitmap, 0, 0, 224, 224);
  const imageTensor = tf.browser.fromPixels(canvas);
  const model = await loadMobilenet();
  const embedding = model.infer(imageTensor.expandDims(0), true);
  const array = await embedding.flatten().array();
  tf.dispose([imageTensor, embedding]);
  return array;
}
