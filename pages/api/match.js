import { supabase } from "../../lib/supabaseAdmin";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

let model;
async function loadMobilenet() {
  if (!model) {
    model = await mobilenet.load();
  }
  return model;
}

export async function getEmbeddingFromFile(file) {
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageBitmap, 0, 0, 224, 224);

  const imageTensor = tf.browser.fromPixels(canvas);

  const model = await loadMobilenet();
  const embedding = model.infer(imageTensor.expandDims(0), true);
  const array = await embedding.flatten().array();

  tf.dispose([imageTensor, embedding]);
  return array;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { embedding, imageUrl, threshold = 0.7 } = req.body;

    if (!embedding || !Array.isArray(embedding)) {
      return res.status(400).json({ error: "Missing or invalid embedding" });
    }

    // Fetch all socks from Supabase
    const { data: socks, error } = await supabase
      .from("socks")
      .select("image_url, embedding");

    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch socks" });
    }

    const scoredMatches = socks
  .filter((sock) => sock.image_url !== imageUrl)  // 🚫 exclude uploaded image
  .map((sock) => ({
    imageUrl: sock.image_url,
    similarity: cosineSimilarity(embedding, sock.embedding),
  }));

    const matches = scoredMatches
      .filter((match) => match.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6);

    // If no matches pass the threshold, return top 1 as fallback
    if (matches.length === 0 && scoredMatches.length > 0) {
      const bestFallback = scoredMatches.sort((a, b) => b.similarity - a.similarity)[0];
      return res.status(200).json({ matches: [bestFallback] });
    }

    return res.status(200).json({ matches });
  } catch (error) {
    console.error("Error processing match request:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
