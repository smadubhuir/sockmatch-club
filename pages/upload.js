import { useState } from "react";

export default function UploadSock() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please upload an image.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("name", name || "");
    formData.append("price", price || "");
    formData.append("color", color || "");
    formData.append("pattern", pattern || "");
    formData.append("description", description || "");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Sock uploaded successfully!");
        setImageUrl(data.imageUrl);
        setPreview(null);
        setImage(null);
        setName("");
        setPrice("");
        setColor("");
        setPattern("");
        setDescription("");
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-semibold mb-4 text-center">Upload a Sock</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-gray-700 font-medium">Sock Image</label>
        <input
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          required
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-500 file:text-white
                     hover:file:bg-blue-600 cursor-pointer"
        />

        {preview && (
          <div className="mb-2 flex justify-center">
            <img
              src={preview}
              alt="Sock Preview"
              style={{ width: "300px", height: "300px", objectFit: "contain" }}
              className="border shadow-md rounded-md"
            />
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Sock Name (Optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="number"
            placeholder="Price ($) (Optional)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Color (Optional)"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Pattern (Optional)"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          <textarea
            placeholder="Sock Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Upload Button */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 transition"
        >
          {uploading ? "Uploading..." : "Upload Sock"}
        </button>
      </form>

      {/* Display Uploaded Image */}
      {imageUrl && (
        <div className="mt-4 p-4 bg-gray-100 border rounded-md">
          <p className="text-sm text-gray-600 font-medium">Uploaded Image:</p>
          <img
            src={imageUrl}
            alt="Uploaded Sock"
            className="w-full h-40 object-contain border mt-2 rounded-md"
          />
          <p className="text-xs text-gray-500 break-words">{imageUrl}</p>
        </div>
      )}
    </div>
  );
}
