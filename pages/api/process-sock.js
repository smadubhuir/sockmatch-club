import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

// Utility function to wrap exec in a Promise
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(stderr || stdout || error);
      else resolve(stdout);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imageUrl } = req.body;

  try {
    const projectRoot = process.cwd();
    const pipelineScript = path.join(projectRoot, 'lib', 'imageProcessing', 'sock_pipeline.py');
    const embeddingOutput = path.join(projectRoot, 'lib', 'imageProcessing', 'embeddings', 'api_embedding.json');

    // Ensure embeddings directory exists
    const embeddingsDir = path.dirname(embeddingOutput);
    if (!fs.existsSync(embeddingsDir)) {
      fs.mkdirSync(embeddingsDir, { recursive: true });
    }

    // Activate virtual environment and execute Python script
    const command = `
      source "${path.join(projectRoot, 'sockmatch-venv/bin/activate')}" && \
      python "${pipelineScript}" --input "${imageUrl}" --output "${embeddingOutput}"
    `;

    await execPromise(command);

    // Read embedding data
    const embeddingData = JSON.parse(fs.readFileSync(embeddingOutput, 'utf8'));

    // Respond with embedding data
    res.status(200).json({ embedding: embeddingData.embedding });

  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}
