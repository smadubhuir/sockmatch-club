// Updated /pages/upload.js
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session } = useSupabaseSession();

  const handleUpload = async () => {
    if (!file) return;
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
      await axios.post("/api/save-sock", {
        imageUrl,
        embedding,
        userId: session?.user?.id,
      });

      // Route to match page with image URL
      router.push(`/upload?imageUrl=${encodeURIComponent(imageUrl)}`);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Upload a Sock</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload Sock"}
      </button>
    </div>
  );
}
