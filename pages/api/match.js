import fs from "fs";
import path from "path";
import * as tf from "@tensorflow/tfjs-node";
import axios from "axios";

const embeddingsFilePath = path.join(process.cwd(), "data/sock_embeddings.json");

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

  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Missing imageUrl" });
  }

  try {
    // Load stored embeddings
    let storedEmbeddings = [];
    if (fs.existsSync(embeddingsFilePath)) {
      const data = fs.readFileSync(embeddingsFilePath, "utf8");
      storedEmbeddings = JSON.parse(data);
    }

    // Get embedding from query sock
    const queryEmbedding = await getEmbeddingFromUrl(imageUrl);

    // Compute similarity for each stored sock
    const matches = storedEmbeddings.map(sock => ({
      imageUrl: sock.imageUrl,
      similarity: cosineSimilarity(queryEmbedding, sock.embedding),
    }));

    // Sort by similarity and return top 6
    const topMatches = matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6);

    return res.status(200).json({ matches: topMatches });
  } catch (err) {
    console.error("Error processing match request:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import tf from '@tensorflow/tfjs-node';
import cosineSimilarity from '../../utils/cosineSimilarity';

const embeddingsFilePath = path.join(process.cwd(), 'data', 'sock_embeddings.json');
const pipelineScript = path.join(process.cwd(), 'lib/imageProcessing/sock_pipeline.py');
const embeddingOutput = path.join(process.cwd(), 'lib/imageProcessing/embeddings/query_embedding.json');

function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        let { embedding, imageUrl, threshold = 0.7 } = req.body;
        
        if (!embedding && !imageUrl) {
            return res.status(400).json({ error: 'Missing embedding or image URL' });
        }
        
        if (!embedding && imageUrl) {
            console.log('Generating embedding for query sock...');
            const command = `source \"${process.cwd()}/sockmatch-venv/bin/activate\" && python \"${pipelineScript}\" --input \"${imageUrl}\" --output \"${embeddingOutput}\"`;
            await execPromise(command);
            embedding = JSON.parse(fs.readFileSync(embeddingOutput, 'utf8')).embedding;
        }

        const data = fs.readFileSync(embeddingsFilePath, 'utf8');
        const storedEmbeddings = JSON.parse(data);

        const matches = storedEmbeddings.map(sock => {
            return {
                id: sock.id,
                imageUrl: sock.imageUrl,
                similarity: cosineSimilarity(embedding, sock.embedding)
            };
        }).filter(match => match.similarity >= threshold)
          .sort((a, b) => b.similarity - a.similarity);

        res.status(200).json({ matches: matches.slice(0, 3) });
    } catch (error) {
        console.error('Error processing match request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
