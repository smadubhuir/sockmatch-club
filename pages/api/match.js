import { supabase } from "@/lib/supabaseAdmin";

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
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

    const { data: socks, error } = await supabase
      .from("socks")
      .select("image_url, embedding, price");

    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch socks" });
    }

    const scoredMatches = socks
      .filter((sock) => sock.image_url !== imageUrl)
      .map((sock) => ({
        imageUrl: sock.image_url,
        similarity: cosineSimilarity(embedding, sock.embedding),
      }));

    const matches = scoredMatches
      .filter((match) => match.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6);

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
