import { IncomingForm } from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import * as tf from "@tensorflow/tfjs-node";
import path from "path";


export const config = { api: { bodyParser: false } };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const embeddingsFile = path.join(process.cwd(), "data/sock_embeddings.json");

async function getEmbedding(filePath) {
  const imageBuffer = fs.readFileSync(filePath);
  const imageTensor = tf.node.decodeImage(imageBuffer, 3)
    .resizeBilinear([224, 224])
    .expandDims(0)
    .toFloat()
    .div(255.0);

  const model = await tf.loadGraphModel(
    "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v2_1.0_224/model.json"
  );

  const embedding = model.predict(imageTensor).flatten();
  const array = await embedding.array();
  tf.dispose([imageTensor, embedding]);
  return array;
}

function saveEmbedding(imageUrl, embedding) {
  const existing = fs.existsSync(embeddingsFile)
    ? JSON.parse(fs.readFileSync(embeddingsFile, "utf8"))
    : [];

  const alreadyExists = existing.some(entry => entry.imageUrl === imageUrl);

  if (!alreadyExists) {
    existing.push({ imageUrl, embedding });
    fs.writeFileSync(embeddingsFile, JSON.stringify(existing, null, 2));
    console.log("✅ Saved new embedding.");
  } else {
    console.log("⚠️ Duplicate image — embedding already exists, not saving again.");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    console.log("Fields:", fields);
    console.log("Files:", files);

    if (err) {
      console.error("Formidable Error:", err);
      return res.status(500).json({ error: "File upload error" });
    }

    if (!files.image || files.image.length === 0) {
      console.log("No image received in request.");
      return res.status(400).json({ error: "No image provided" });
    }

    // ✅ Extract the first file object correctly
    const file = files.image[0];
    const filePath = file.filepath;

    console.log("Processing file at:", filePath);

    try {
      // ✅ Upload file to Cloudinary
     const uploadedImage = await cloudinary.uploader.upload(filePath, {
  folder: "sockmatch",
  width: 800,
  quality: "auto",
  fetch_format: "auto",
});

const embedding = await getEmbedding(filePath);
saveEmbedding(uploadedImage.secure_url, embedding);

console.log("Upload successful:", uploadedImage.secure_url);
return res.status(200).json({ imageUrl: uploadedImage.secure_url });

    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      return res.status(500).json({ error: "Failed to upload to Cloudinary", details: error.message });
    }
  });
}
