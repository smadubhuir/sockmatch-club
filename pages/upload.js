"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import OptimizedImage from "@/components/OptimizedImage";

export default function UploadPage() {
  const [sockImage, setSockImage] = useState(null);
  const [loading, setLoading] = useState(false);
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
      formData.append("upload_preset", "sockmatch_socks"); // Use the dedicated Cloudinary preset
      formData.append("folder", "sockmatch/socks"); // Ensure images go to the right folder

      const res = await fetch("https://api.cloudinary.com/v1_1/dilhl61st/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Cloudinary Upload Error: ${data.error?.message || "Unknown error"}`);
      }

      if (data.secure_url) {
        // Fetch the authenticated user correctly
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setToast("You must be logged in to upload.");
          return;
        }

        // Save the image URL to Supabase (or any other metadata)
        const { error } = await supabase.from("socks").insert({
          image_url: data.secure_url,
          user_id: user.id,
        });

        if (error) throw error;

        setToast("Sock uploaded successfully!");
        setTimeout(() => router.push("/browse"), 1500);
      } else {
        throw new Error("Failed to upload image.");
      }
    } catch (err) {
      setToast("Failed to upload sock.");
      console.error("Upload Error:", err);
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
