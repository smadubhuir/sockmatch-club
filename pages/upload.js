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
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session } = useSupabaseSession();

  const handleUpload = async () => {
    if (!file || !price) {
      alert("Please select a sock and set a price!");
      return;
    }
    if (!session?.user?.id) {
      alert("You must be signed in to upload a sock.");
      router.push("/login");
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

      // Save to Supabase
      await axios.post(
        "/api/save-sock",
        {
          imageUrl,
          embedding,
          userId: session.user.id,
          price: parseFloat(price), // 👈 ensure price is a number
        },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      // Route to browse page (or match page if you prefer)
      router.push("/browse");
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
          <label className="block mb-2 font-semibold">How much would you like to sell it for? (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price (e.g., 5.00)"
            className="w-full border rounded p-2"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file || !price}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Uploading Sock..." : "Upload Sock"}
        </button>
      </div>
    </div>
  );
}
