"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useSupabaseSession } from "../context/SupabaseContext";
import { getEmbeddingFromFile, loadMobilenet } from "@/lib/mobilenet";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [sellPrice, setSellPrice] = useState("");
  const [buyOffer, setBuyOffer] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session } = useSupabaseSession();

  // Preload MobileNet on page load
  useEffect(() => {
    loadMobilenet().catch(console.error);
  }, []);

  const handleUpload = async () => {
  if (!file || !sellPrice || !buyOffer) {
    alert("Please complete all fields.");
    return;
  }

  setLoading(true);

  try {
    // Step 1: Upload image to Cloudinary
    const formData = new FormData();
    formData.append("image", file);
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const { imageUrl } = await uploadRes.json();

    // Step 2: Generate embedding from uploaded image
    const embedding = await getEmbeddingFromFile(file);

    // Step 3: Save sock record in Supabase
    const payload = {
      imageUrl,
      embedding,
      userId: session?.user?.id || null,
      price: parseFloat(sellPrice),
      buy_offer: parseFloat(buyOffer),
    };

    await axios.post("/api/save-sock", payload, {
      headers: { "Content-Type": "application/json" },
    });

    // Step 4: Get top matches via pgvector-based RPC
    const matchRes = await fetch("/api/get-socks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embedding }),
    });
    const { matches } = await matchRes.json();

    // Step 5: Store everything for use in results page
    localStorage.setItem(
      "sockUpload",
      JSON.stringify({ ...payload, matches })
    );

    // Step 6: Redirect to results
    router.push(`/results?imageUrl=${encodeURIComponent(imageUrl)}`);
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-6">Upload Your Sock</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold">Choose your sock image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            If someone wants to buy this sock, how much would you sell it for? (USD)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            placeholder="e.g., 5.00"
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            If you found a match for this sock, how much would you pay for it? (USD)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={buyOffer}
            onChange={(e) => setBuyOffer(e.target.value)}
            placeholder="e.g., 3.00"
            className="w-full border rounded p-2"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Uploading Sock..." : "Upload Sock"}
        </button>
      </div>
    </div>
  );
}
