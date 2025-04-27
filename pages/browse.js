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
    <div className="p-8 max-w-6xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">Find Your Sock Match</h1>

      {imageUrl && (
        <div className="mb-6">
          <img src={imageUrl} alt="Uploaded Sock" className="w-48 mx-auto rounded-lg border" />
        </div>
      )}

      {!user && (
        <div className="text-red-600 font-bold">
          Please <a href="/login" className="underline">sign in</a> to view matches.
        </div>
      )}

      {user && loading && (
        <p className="text-blue-500 text-lg">Finding matches for you...</p>
      )}

      {user && error && (
        <p className="text-red-500 text-lg">{error}</p>
      )}

      {user && !loading && matches.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {matches.map((match, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition">
              <img src={match.imageUrl} alt={`Match ${index + 1}`} className="w-32 mx-auto rounded" />
              <div className="mt-4">
                <p className="font-semibold">SockRank: {(match.similarity * 100).toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && !loading && matches.length === 0 && (
        <p className="text-gray-500 text-lg mt-6">No matching socks found yet. Try uploading another sock!</p>
      )}

      <div className="mt-8">
        <a
          href="/upload"
          className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Upload Another Sock
        </a>
      </div>
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
