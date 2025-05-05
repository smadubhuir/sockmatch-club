"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import axios from "axios";
import { useSupabaseSession } from "../context/SupabaseContext";

let model;
async function loadMobilenet() {
  if (!model) {
    model = await mobilenet.load();
  }
  return model;
}

async function getEmbeddingFromFile(file) {
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

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [sellPrice, setSellPrice] = useState("");
  const [buyOffer, setBuyOffer] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session } = useSupabaseSession();

  const handleUpload = async () => {
    if (!file || !sellPrice || !buyOffer) {
      alert("Please complete all fields.");
      return;
    }

    setLoading(true);

    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("image", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const { imageUrl } = await uploadRes.json();

      // Generate embedding
      const embedding = await getEmbeddingFromFile(file);

      // Save to Supabase — allow anonymous
      const payload = {
        imageUrl,
        embedding,
        userId: session?.user?.id || null,
        price: parseFloat(sellPrice),
        offer: parseFloat(buyOffer),
      };

      await axios.post("/api/save-sock", payload, {
        headers: { "Content-Type": "application/json" }
      });

      // Optional: store for later re-claiming
      localStorage.setItem("sockUpload", JSON.stringify(payload));

      // Redirect to match results
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
