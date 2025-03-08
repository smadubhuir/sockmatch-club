import { useState } from "react";

export default function UploadSock() {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [description, setDescription] = useState("");  // New state for description
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !name || !price || !color || !pattern || !description) {
      alert("Please fill out all fields and upload an image.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("color", color);
    formData.append("pattern", pattern);
    formData.append("description", description); // Include description

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Sock uploaded successfully!");
        setImage(null);
        setName("");
        setPrice("");
        setColor("");
        setPattern("");
        setDescription("");  // Reset description field
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md">
      <h1 className="text-xl font-bold mb-4">Upload a Sock</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleImageChange} className="mb-2" />
        <input type="text" placeholder="Sock Name" value={name} onChange={(e) => setName(e.target.value)} className="block w-full p-2 border mb-2" />
        <input type="number" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} className="block w-full p-2 border mb-2" />
        <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} className="block w-full p-2 border mb-2" />
        <input type="text" placeholder="Pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} className="block w-full p-2 border mb-2" />
        <textarea placeholder="Sock Description" value={description} onChange={(e) => setDescription(e.target.value)} className="block w-full p-2 border mb-2"></textarea>
        <button type="submit" disabled={uploading} className="bg-blue-500 text-white px-4 py-2">
          {uploading ? "Uploading..." : "Upload Sock"}
        </button>
      </form>
    </div>
  );
}
