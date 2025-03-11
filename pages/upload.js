import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function UploadSock() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [color, setColor] = useState("");
    const [pattern, setPattern] = useState("");
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

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

        try {
            const formData = new FormData();
            formData.append("image", image);
            formData.append("name", name);
            formData.append("price", price);
            formData.append("color", color);
            formData.append("pattern", pattern);
            formData.append("description", description);
            
            const response = await axios.post("/api/upload", formData, {
    headers: {
        "Content-Type": "multipart/form-data",
    },
});
            
            if (response.data.imageUrl) {
                router.push(`/match?imageUrl=${encodeURIComponent(response.data.imageUrl)}`);
            } else {
                alert("Upload failed: " + response.data.error);
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
                <input type="file" accept="image/*" onChange={handleImageChange} required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer" />
                {preview && (
                    <div className="mb-2 flex justify-center">
                        <img src={preview} alt="Sock Preview" className="border shadow-md rounded-md" style={{ width: "300px", height: "300px", objectFit: "contain" }} />
                    </div>
                )}
                <div className="space-y-2">
                    <input type="text" placeholder="Sock Name (Optional)" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300" />
                    <input type="number" placeholder="Price ($) (Optional)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300" />
                    <input type="text" placeholder="Color (Optional)" value={color} onChange={(e) => setColor(e.target.value)} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300" />
                    <input type="text" placeholder="Pattern (Optional)" value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300" />
                    <textarea placeholder="Sock Description (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300" />
                </div>
                <button type="submit" disabled={uploading} className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 transition">
                    {uploading ? "Uploading..." : "Upload Sock"}
                </button>
            </form>
        </div>
    );
}
