// /pages/api/process-sock.js
import * as tf from "@tensorflow/tfjs-node";
import mobilenet from "@tensorflow-models/mobilenet";
import { createCanvas, loadImage } from "canvas";

// Fast In-Memory Embedding Generation
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required." });
  }

  try {
    // Load the image and resize it
    const image = await loadImage(imageUrl);
    const canvas = createCanvas(224, 224);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, 224, 224);

    // Load MobileNet Model
    const model = await mobilenet.load();
    const tensor = tf.browser.fromPixels(canvas)
      .resizeBilinear([224, 224])
      .div(255.0) // Normalize
      .expandDims(0);

    // Generate Embedding
    const embedding = model.infer(tensor, "conv_preds").arraySync()[0];

    // Respond with the embedding
    res.status(200).json({ embedding });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process image." });
  }
}
