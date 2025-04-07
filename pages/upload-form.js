"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/upload?imageUrl=${encodeURIComponent(data.imageUrl)}`);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setError("Upload error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
      <Link href="/" className="text-blue-600 underline text-sm">← Back to Home</Link>
      <h1 className="text-3xl font-bold">Upload Your Sock</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="border p-2"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload and Match"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </main>
  );
}
