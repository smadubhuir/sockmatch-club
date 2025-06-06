import fs from "fs";
import path from "path";
import axios from "axios";

const embeddingsFilePath = path.join(process.cwd(), "data", "sock_embeddings.json");

// Cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Load and cache MobileNet model
let model;
async function loadModel() {
  if (!model) {
    model = await tf.loadGraphModel(
      "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v2_1.0_224/model.json"
    );
  }
  return model;
}

// Convert image URL to embedding vector
async function getEmbeddingFromUrl(imageUrl) {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const imageBuffer = Buffer.from(response.data, "binary");
  const imageTensor = tf.node.decodeImage(imageBuffer, 3)
    .resizeBilinear([224, 224])
    .expandDims(0)
    .toFloat()
    .div(255.0);

  const model = await loadModel();
  const embedding = model.predict(imageTensor);
  const flattened = embedding.flatten();
  const embeddingArray = await flattened.array();
  tf.dispose([imageTensor, embedding, flattened]);
  return embeddingArray;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageUrl, threshold = 0.7 } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Missing imageUrl" });
  }

  try {
    let storedEmbeddings = [];
    if (fs.existsSync(embeddingsFilePath)) {
      const data = fs.readFileSync(embeddingsFilePath, "utf8");
      storedEmbeddings = JSON.parse(data);
    }

    const queryEmbedding = await getEmbeddingFromUrl(imageUrl);

    const matches = storedEmbeddings
      .map(sock => ({
        imageUrl: sock.imageUrl,
        similarity: cosineSimilarity(queryEmbedding, sock.embedding),
      }))
      .filter(match => match.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6);

    res.status(200).json({ matches });
  } catch (err) {
    console.error("Error processing match request:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
