import { IncomingForm } from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable Error:", err);
      return res.status(500).json({ error: "File upload error" });
    }

    const file = files.image?.[0];
    if (!file) {
      return res.status(400).json({ error: "No image provided" });
    }

    try {
      const uploadedImage = await cloudinary.uploader.upload(file.filepath, {
        folder: "sockmatch",
        width: 800,
        quality: "auto",
        fetch_format: "auto",
      });

      console.log("✅ Upload successful:", uploadedImage.secure_url);
      return res.status(200).json({ imageUrl: uploadedImage.secure_url });
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      return res.status(500).json({ error: "Failed to upload to Cloudinary", details: error.message });
    }
  });
}
