"use client";
export const dynamic = "force-dynamic";

import { useSupabaseSession } from "../context/SupabaseContext";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import SockCard from "@/components/SockCard";

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

      {imageUrl && <img src={imageUrl} alt="Uploaded Sock" className="w-48 mx-auto rounded-lg border mb-6" />}

      {user && loading ? (
        <p className="text-blue-500 text-lg">Finding matches for you...</p>
      ) : error ? (
        <p className="text-red-500 text-lg">{error}</p>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {matches.map((match, index) => (
  <SockCard key={index} sock={match} />
))}

        </div>
      ) : (
        <p className="text-gray-500 text-lg mt-6">No matching socks found yet. Try uploading another sock!</p>
      )}

      <div className="mt-8">
        <a href="/upload" className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">Upload Another Sock</a>
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
