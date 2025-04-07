"use client";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import * as tf from "@tensorflow/tfjs";

let mobilenetModel;

async function loadMobilenet() {
  if (!mobilenetModel) {
    await tf.loadGraphModel(
  "https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/classification/4/default/1",
  { fromTFHub: true }
)
  }
  return mobilenetModel;
}

export async function getEmbeddingFromFile(file) {
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageBitmap, 0, 0, 224, 224);

  const imageTensor = tf.browser.fromPixels(canvas)
    .expandDims(0)
    .toFloat()
    .div(255.0);

  const model = await loadMobilenet();
  const embedding = model.predict(imageTensor).flatten();
  const array = await embedding.array();

  tf.dispose([imageTensor, embedding]);
  return array;
}

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a file.");
      return;
    }

    setStatus("Generating embedding...");
    const embedding = await getEmbeddingFromFile(file);

    const formData = new FormData();
    formData.append("image", file);

    setStatus("Uploading image to Cloudinary...");
    const uploadRes = await axios.post("/api/upload", formData);
    const imageUrl = uploadRes.data.imageUrl;

    setStatus("Saving to Supabase...");
    await axios.post("/api/save-sock", {
      imageUrl,
      embedding,
    });

    setStatus("✅ Sock uploaded and saved!");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <nav className="mb-4">
        <Link href="/" legacyBehavior><a className="text-blue-600">Back to Home</a></Link>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Upload a Sock</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Upload
      </button>
      {status && <p className="mt-4 text-gray-700">{status}</p>}
    </div>
  );
}
