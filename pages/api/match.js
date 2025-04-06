const fs = require("fs");
const path = require("path");

const embeddingsFilePath = path.join(process.cwd(), "data", "sock_embeddings.json");

// Simple cosine similarity function
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
    const { embedding, threshold = 0.7 } = req.body;

    if (!embedding || !Array.isArray(embedding)) {
      return res.status(400).json({ error: "Missing or invalid embedding" });
    }

    const data = fs.readFileSync(embeddingsFilePath, "utf8");
    const storedEmbeddings = JSON.parse(data);

    const matches = storedEmbeddings
      .map(sock => ({
        imageUrl: sock.imageUrl,
        similarity: cosineSimilarity(embedding, sock.embedding),
      }))
      .filter(match => match.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6);

    res.status(200).json({ matches });
  } catch (error) {
    console.error("Error processing match request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
