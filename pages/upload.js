// /pages/upload.js
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import OptimizedImage from "@/components/OptimizedImage";

export default function UploadPage() {
  const [sockImage, setSockImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState("");
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSockImage(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!sockImage) {
      setToast("Please choose an image.");
      return;
    }

    try {
      setLoading(true);
      const file = document.querySelector("#sock-file").files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "sockmatch_socks");

      const res = await fetch("https://api.cloudinary.com/v1_1/dilhl61st/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.secure_url) throw new Error("Failed to upload image.");

      const { error } = await supabase.from("socks").insert({
        image_url: data.secure_url,
        price_sell: price ? parseFloat(price) : null,
      });

      if (error) throw error;

      setToast("Sock uploaded successfully!");
      setTimeout(() => {
        router.push(`/results?imageUrl=${data.secure_url}`);
      }, 1000);
    } catch (err) {
      setToast("Failed to upload sock.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Your Sock</h1>
      
      <input 
        type="file" 
        id="sock-file" 
        accept="image/*" 
        onChange={handleImageChange} 
        className="mb-4"
      />

      {sockImage && (
        <OptimizedImage 
          src={sockImage} 
          alt="Sock Preview" 
          width={200} 
          height={200} 
          className="rounded-md mb-4"
        />
      )}

      <input 
        type="number" 
        placeholder="Set Price (Optional)" 
        value={price} 
        onChange={(e) => setPrice(e.target.value)} 
        className="mb-4 p-2 border rounded w-full"
      />

      <button 
        onClick={handleUpload} 
        disabled={loading} 
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload Sock"}
      </button>

      {toast && <div className="mt-4 text-red-500">{toast}</div>}
    </div>
  );
}
