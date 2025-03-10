import { IncomingForm } from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Needed for reading file paths

export const config = { api: { bodyParser: false } };

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dilhl61st",
  api_key: "369811978667215",
  api_secret: "bX0nw-F2j_Yj0HdzWF3zXwq-MQM", // Ensure this is correct!
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable Parse Error:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }

    console.log("Parsed Form Fields:", fields);
    console.log("Parsed Form Files:", files);

    const file = files.image?.[0] || files.image; // Handle both array and object cases

    if (!file) {
      console.error("No image found in request.");
      return res.status(400).json({ error: "No image provided" });
    }

    console.log("Uploading file from path:", file.filepath || file.path);

    try {
      const filePath = file.filepath || file.path; // Ensure correct file reference
      if (!filePath) throw new Error("Invalid file path");

      // Upload image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: "sockmatch",
        use_filename: true,
        unique_filename: false,
        resource_type: "image",
      });

      res.status(200).json({ message: "Sock uploaded!", imageUrl: uploadResult.secure_url });
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
}
